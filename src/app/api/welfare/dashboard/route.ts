import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { timeAgo, today } from "@/lib/utils";
import { ClientCard, PendingTask, TodayDashboard } from "@/types";

// GET /api/welfare/dashboard?workerId=uuid
// 복지사 Today 대시보드 — 위험도 우선순위 정렬
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");

  if (!workerId) {
    return NextResponse.json({ error: "workerId required" }, { status: 400 });
  }

  const supabase = createServerClient();
  const todayDate = today();

  // 1. 담당 복지사 정보
  const { data: worker } = await supabase
    .from("users")
    .select("name")
    .eq("id", workerId)
    .single();

  // 2. 담당 대상자 전체 — 위험도 내림차순
  const { data: clients, error } = await supabase
    .from("clients")
    .select(`
      id, name, age, district, address,
      risk_score, risk_level,
      last_response_date, last_response_time
    `)
    .eq("assigned_worker_id", workerId)
    .is("deleted_at", null)
    .order("risk_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // 3. 오늘 연락 시도 횟수 조회
  const clientIds = (clients ?? []).map((c) => c.id);
  const { data: todayContacts } = await supabase
    .from("contact_logs")
    .select("client_id")
    .in("client_id", clientIds)
    .gte("contact_date", `${todayDate}T00:00:00Z`);

  const contactCountMap = new Map<string, number>();
  (todayContacts ?? []).forEach((c) => {
    contactCountMap.set(c.client_id, (contactCountMap.get(c.client_id) ?? 0) + 1);
  });

  // 4. 미완료 태스크 조회 (어제 이전 미작성 기록)
  const { data: pendingRecords } = await supabase
    .from("contact_logs")
    .select("id, client_id, clients(name), contact_date")
    .in("client_id", clientIds)
    .is("result", null) // result 없는 기록 = 미완료
    .lt("contact_date", `${todayDate}T00:00:00Z`)
    .limit(5);

  const pendingTasks: PendingTask[] = (pendingRecords ?? []).map((r) => {
    const clientName = (r.clients as unknown as { name?: string } | null)?.name ?? "알 수 없음";
    return {
      id: r.id,
      clientId: r.client_id,
      clientName,
      type: "record_missing",
      description: `${clientName} — 기록 미작성`,
      dueDate: r.contact_date,
    };
  });

  // 5. 클라이언트 카드 변환 + 그룹화
  const toCard = (c: typeof clients[0]): ClientCard => ({
    id: c.id,
    name: c.name,
    age: c.age,
    district: c.district ?? c.address ?? "미입력",
    riskLevel: c.risk_level,
    riskScore: c.risk_score,
    riskReasons: buildRiskReasons(c),
    lastResponseAgo: c.last_response_time ? timeAgo(c.last_response_time) : undefined,
    contactAttempts: contactCountMap.get(c.id) ?? 0,
  });

  const critical = (clients ?? []).filter((c) => c.risk_level === "critical").map(toCard);
  const high = (clients ?? []).filter((c) => c.risk_level === "high").map(toCard);
  const completedToday = (todayContacts ?? []).length;

  const dashboard: TodayDashboard = {
    date: todayDate,
    workerName: worker?.name ?? "복지사",
    critical,
    high,
    pendingTasks,
    completedToday,
    totalAssigned: (clients ?? []).length,
  };

  return NextResponse.json(dashboard);
}

function buildRiskReasons(client: {
  last_response_date?: string | null;
  risk_score: number;
}): string[] {
  const reasons: string[] = [];
  if (client.last_response_date) {
    const days = Math.floor(
      (Date.now() - new Date(client.last_response_date).getTime()) / 86400000
    );
    if (days >= 1) reasons.push(`${days}일 연속 무응답`);
  }
  if (client.risk_score >= 60) reasons.push("패턴 이상 감지");
  if (client.risk_score >= 80) reasons.push("즉시 확인 필요");
  return reasons.slice(0, 3);
}
