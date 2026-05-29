import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  calculateRiskScore,
  countNoResponseDays,
  detectPatternDeviation,
} from "@/lib/risk/calculator";
import { notifyWorkerRiskAlert } from "@/lib/notification/service";
import { ContactRecordForm } from "@/types";

// POST /api/welfare/contact
// 복지사 빠른 기록 저장 (W03 모달)
// 통화 종료 직후 30초 내 완료 목표
export async function POST(request: NextRequest) {
  const body: ContactRecordForm & { workerId: string } = await request.json();
  const { clientId, workerId, result, status, actions, note, nextContactDays } = body;

  if (!clientId || !workerId) {
    return NextResponse.json({ error: "clientId, workerId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // 1. contact_logs 저장
  const { data: contactLog, error: logError } = await supabase
    .from("contact_logs")
    .insert({
      client_id: clientId,
      worker_id: workerId,
      contact_type: "phone",
      contact_date: new Date().toISOString(),
      result,
      notes: note ?? null,
    })
    .select()
    .single();

  if (logError) {
    return NextResponse.json({ error: "Failed to save contact log" }, { status: 500 });
  }

  // 2. action_records 저장
  const nextContact = new Date();
  nextContact.setDate(nextContact.getDate() + (nextContactDays ?? 1));

  await supabase.from("action_records").insert({
    contact_log_id: contactLog.id,
    status,
    actions: actions ?? [],
    next_contact_scheduled: nextContact.toISOString(),
  });

  // 3. 위험도 재계산 (통화 완료 시)
  if (result === "completed") {
    const { data: responses } = await supabase
      .from("daily_responses")
      .select("*")
      .eq("client_id", clientId)
      .order("response_date", { ascending: false })
      .limit(14);

    if (responses) {
      const { score, level, factors } = calculateRiskScore({
        noResponseDays: countNoResponseDays(responses),
        responsePatternDeviation: detectPatternDeviation(responses),
        cognitionErrorRate: 0,
        previousRiskHistory: false,
      });

      const { data: prevClient } = await supabase
        .from("clients")
        .select("risk_level, assigned_worker_id")
        .eq("id", clientId)
        .single();

      await supabase
        .from("clients")
        .update({ risk_score: score, risk_level: level })
        .eq("id", clientId);

      // 위험도 critical 진입 시 복지사에게 알림
      if (level === "critical" && prevClient?.risk_level !== "critical") {
        const { data: client } = await supabase
          .from("clients")
          .select("name")
          .eq("id", clientId)
          .single();
        await notifyWorkerRiskAlert(
          prevClient?.assigned_worker_id ?? workerId,
          clientId,
          client?.name ?? "대상자",
          score,
          factors
        );
      }
    }
  }

  return NextResponse.json({ success: true, contactLogId: contactLog.id });
}
