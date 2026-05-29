import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/welfare/report/monthly?orgId=uuid&year=2026&month=5
// B2G 월간 집계 보고서 — 기관 전체 집계
export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get("orgId");
  const year = parseInt(request.nextUrl.searchParams.get("year") ?? String(new Date().getFullYear()));
  const month = parseInt(request.nextUrl.searchParams.get("month") ?? String(new Date().getMonth() + 1));

  if (!orgId) return NextResponse.json({ error: "orgId required" }, { status: 400 });

  const supabase = createServerClient();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0).toISOString().split("T")[0]; // last day of month
  const startTs = `${startDate}T00:00:00`;
  const endTs = `${endDate}T23:59:59`;

  // 기관 소속 복지사 및 대상자 목록
  const [workersRes, clientsRes] = await Promise.all([
    supabase.from("users").select("id, name").eq("organization_id", orgId).eq("role", "welfare_worker"),
    supabase.from("clients").select("id, name, age, risk_level, assigned_worker_id").eq("organization_id", orgId).is("deleted_at", null),
  ]);

  const workers = workersRes.data ?? [];
  const clients = clientsRes.data ?? [];
  const clientIds = clients.map((c) => c.id);

  if (clientIds.length === 0) {
    return NextResponse.json(buildEmptyReport(orgId, year, month, workers.length));
  }

  // 병렬 집계 쿼리
  const [responsesRes, contactsRes, riskEventsRes, notifRes] = await Promise.all([
    supabase
      .from("daily_responses")
      .select("client_id, response_date, status")
      .in("client_id", clientIds)
      .gte("response_date", startDate)
      .lte("response_date", endDate),

    supabase
      .from("contact_logs")
      .select("id, client_id, contact_type, result, contact_date")
      .in("client_id", clientIds)
      .gte("contact_date", startTs)
      .lte("contact_date", endTs),

    supabase
      .from("risk_events")
      .select("id, client_id, risk_level, is_addressed, detected_at")
      .in("client_id", clientIds)
      .gte("detected_at", startTs)
      .lte("detected_at", endTs),

    supabase
      .from("notifications")
      .select("id, type, sent_at")
      .gte("sent_at", startTs)
      .lte("sent_at", endTs),
  ]);

  const responses = responsesRes.data ?? [];
  const contacts = contactsRes.data ?? [];
  const riskEvents = riskEventsRes.data ?? [];
  const notifications = notifRes.data ?? [];

  // 일별 응답률 계산 (월간 트렌드)
  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTrend: Array<{ date: string; responseRate: number; totalSent: number; totalResponded: number }> = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayResponses = responses.filter((r) => r.response_date === dateStr);
    const totalSent = dayResponses.length;
    const totalResponded = dayResponses.filter((r) => r.status === "responded").length;
    dailyTrend.push({
      date: dateStr,
      responseRate: totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0,
      totalSent,
      totalResponded,
    });
  }

  // 위험도 분포
  const riskDist = { critical: 0, high: 0, medium: 0, safe: 0 };
  for (const c of clients) {
    riskDist[c.risk_level as keyof typeof riskDist] = (riskDist[c.risk_level as keyof typeof riskDist] ?? 0) + 1;
  }

  // 연락 통계
  const callsMade = contacts.filter((c) => c.contact_type === "call").length;
  const visitsCompleted = contacts.filter((c) => c.contact_type === "visit" && c.result === "completed").length;
  const unreachable = contacts.filter((c) => c.result === "unreachable").length;

  // 위험 이벤트 통계
  const criticalEvents = riskEvents.filter((e) => e.risk_level === "critical").length;
  const highEvents = riskEvents.filter((e) => e.risk_level === "high").length;
  const resolvedEvents = riskEvents.filter((e) => e.is_addressed).length;
  const resolutionRate = riskEvents.length > 0 ? Math.round((resolvedEvents / riskEvents.length) * 100) : 100;

  // 전체 응답률
  const totalSentAll = responses.length;
  const totalRespondedAll = responses.filter((r) => r.status === "responded").length;
  const overallResponseRate = totalSentAll > 0 ? Math.round((totalRespondedAll / totalSentAll) * 100) : 0;

  // 복지사별 실적
  const workerStats = workers.map((w) => {
    const myClients = clients.filter((c) => c.assigned_worker_id === w.id);
    const myClientIds = new Set(myClients.map((c) => c.id));
    const myContacts = contacts.filter((c) => myClientIds.has(c.client_id));
    const myResponses = responses.filter((r) => myClientIds.has(r.client_id));
    const myResponded = myResponses.filter((r) => r.status === "responded").length;
    return {
      workerId: w.id,
      workerName: w.name,
      assignedClients: myClients.length,
      contactsMade: myContacts.length,
      responseRate: myResponses.length > 0 ? Math.round((myResponded / myResponses.length) * 100) : 0,
    };
  });

  return NextResponse.json({
    orgId,
    year,
    month,
    period: `${startDate} ~ ${endDate}`,
    generatedAt: new Date().toISOString(),
    summary: {
      totalClients: clients.length,
      totalWorkers: workers.length,
      overallResponseRate: `${overallResponseRate}%`,
      totalContacts: contacts.length,
      callsMade,
      visitsCompleted,
      unreachable,
      guardianNotifications: notifications.filter((n) => n.type === "guardian_unresponsive").length,
      riskEventsDetected: riskEvents.length,
      criticalEvents,
      highEvents,
      resolutionRate: `${resolutionRate}%`,
    },
    riskDistribution: riskDist,
    dailyTrend,
    workerStats,
  });
}

function buildEmptyReport(orgId: string, year: number, month: number, totalWorkers: number) {
  return {
    orgId, year, month,
    period: `${year}-${String(month).padStart(2, "0")}-01 ~ ${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`,
    generatedAt: new Date().toISOString(),
    summary: { totalClients: 0, totalWorkers, overallResponseRate: "0%", totalContacts: 0, callsMade: 0, visitsCompleted: 0, unreachable: 0, guardianNotifications: 0, riskEventsDetected: 0, criticalEvents: 0, highEvents: 0, resolutionRate: "100%" },
    riskDistribution: { critical: 0, high: 0, medium: 0, safe: 0 },
    dailyTrend: [],
    workerStats: [],
  };
}
