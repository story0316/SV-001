import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { DailyReport } from "@/types";
import { today } from "@/lib/utils";

// GET /api/welfare/report?workerId=uuid&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const workerId = request.nextUrl.searchParams.get("workerId");
  const date = request.nextUrl.searchParams.get("date") ?? today();

  if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

  const supabase = createServerClient();

  const [workerRes, clientsRes, responsesRes, contactsRes, riskRes] = await Promise.all([
    supabase.from("users").select("name").eq("id", workerId).single(),

    supabase
      .from("clients")
      .select("id, name, risk_level")
      .eq("assigned_worker_id", workerId)
      .is("deleted_at", null),

    supabase
      .from("daily_responses")
      .select("client_id, status")
      .eq("response_date", date)
      .in(
        "client_id",
        (await supabase.from("clients").select("id").eq("assigned_worker_id", workerId).is("deleted_at", null)).data?.map((c) => c.id) ?? []
      ),

    supabase
      .from("contact_logs")
      .select(`
        id, client_id, contact_type, result, notes,
        client:clients!contact_logs_client_id_fkey(name),
        action_records(status, actions)
      `)
      .eq("worker_id", workerId)
      .gte("contact_date", `${date}T00:00:00`)
      .lte("contact_date", `${date}T23:59:59`),

    supabase
      .from("risk_events")
      .select("client_id, risk_level")
      .eq("is_addressed", false)
      .gte("detected_at", `${date}T00:00:00`),
  ]);

  const clients = clientsRes.data ?? [];
  const responses = responsesRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const totalClients = clients.length;

  const respondedIds = new Set(
    responses.filter((r) => r.status === "responded").map((r) => r.client_id)
  );
  const responded = respondedIds.size;

  const calls = contacts.filter((c) => c.contact_type === "call");
  const visits = contacts.filter((c) => c.contact_type === "visit");
  const callsMade = calls.length;
  const visitsCompleted = visits.filter((c) => c.result === "completed").length;

  // guardian notification count for today
  const { count: guardianNotified } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("type", "guardian_unresponsive")
    .gte("sent_at", `${date}T00:00:00`)
    .lte("sent_at", `${date}T23:59:59`);

  const riskDetected = (riskRes.data ?? []).length;

  // Issues = contacts with non-normal status
  const issues = contacts
    .filter((c) => {
      const ar = (c.action_records as unknown as Array<{ status?: string }> | null)?.[0];
      return ar?.status === "warning" || ar?.status === "danger";
    })
    .map((c) => {
      const ar = (c.action_records as unknown as Array<{ status?: string; actions?: string[] }> | null)?.[0];
      const clientName = (c.client as unknown as { name?: string } | null)?.name ?? "알 수 없음";
      return {
        clientId: c.client_id,
        clientName,
        description: ar?.status === "danger" ? "위험 상태 확인" : "주의 상태 확인",
        actionTaken: ar?.actions?.join(", ") ?? "확인 완료",
      };
    });

  // Handoff = unresolved critical/high clients
  const handoff = clients
    .filter((c) => c.risk_level === "critical" || c.risk_level === "high")
    .filter((c) => !respondedIds.has(c.id))
    .map((c) => `${c.name} (${c.risk_level === "critical" ? "즉시 조치" : "오늘 연락"})`)
    .slice(0, 10);

  const report: DailyReport = {
    date,
    workerName: workerRes.data?.name ?? "담당자",
    stats: {
      totalClients,
      responded,
      responseRate: totalClients > 0 ? `${Math.round((responded / totalClients) * 100)}%` : "0%",
      riskDetected,
      callsMade,
      visitsCompleted,
      guardianNotified: guardianNotified ?? 0,
    },
    issues,
    nextDayHandoff: handoff,
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(report);
}
