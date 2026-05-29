import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { notifyGuardianUnresponsive } from "@/lib/notification/service";
import { today } from "@/lib/utils";

// GET /api/cron/notify-guardians
// Vercel Cron: 매일 15:00 KST (= 06:00 UTC)
// 오늘 무응답 + 위험도 high 이상 → 보호자 자동 알림
// notification_flow.md 섹션 3 기반
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const todayDate = today();

  // 1. 오늘 무응답 + high/critical 대상자 조회
  const { data: noResponders } = await supabase
    .from("daily_responses")
    .select(`
      client_id,
      clients!inner(
        id, name, risk_level,
        assigned_worker_id,
        assigned_worker:users!clients_assigned_worker_id_fkey(name, phone)
      )
    `)
    .eq("response_date", todayDate)
    .eq("status", "sent")  // 발송했지만 응답 없음
    .in("clients.risk_level", ["critical", "high"]);

  if (!noResponders || noResponders.length === 0) {
    return NextResponse.json({ notified: 0, message: "No unresponsive high-risk clients" });
  }

  let notified = 0;
  let skipped = 0;

  for (const row of noResponders) {
    const client = row.clients as unknown as {
      id: string;
      name: string;
      risk_level: string;
      assigned_worker: { name: string; phone: string } | null;
    };
    if (!client) continue;

    // 2. 보호자 조회
    const { data: guardians } = await supabase
      .from("guardians")
      .select("guardian_id, primary")
      .eq("client_id", client.id)
      .eq("primary", true)
      .limit(1);

    if (!guardians || guardians.length === 0) continue;

    const guardianId = guardians[0].guardian_id;
    const worker = client.assigned_worker;

    // 3. 알림 발송 (내부에서 24h 중복 방지 자동 처리)
    const result = await notifyGuardianUnresponsive(
      guardianId,
      client.id,
      client.name,
      worker?.name ?? "담당 복지사",
      worker?.phone ?? ""
    );

    if (result.skipped) {
      skipped++;
    } else {
      notified++;
    }
  }

  return NextResponse.json({
    date: todayDate,
    total: noResponders.length,
    notified,
    skipped,
  });
}
