import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { timeAgo, getDayLabel, today } from "@/lib/utils";
import { ClientDetail, ContactLogItem, NoteItem, ResponseHistoryItem } from "@/types";

// GET /api/welfare/client?id=uuid
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const supabase = createServerClient();

  const [clientRes, responsesRes, contactsRes] = await Promise.all([
    supabase
      .from("clients")
      .select(`
        id, name, age, phone, address,
        risk_score, risk_level,
        last_response_time,
        assigned_worker:users!clients_assigned_worker_id_fkey(name, phone),
        guardians(
          relationship,
          guardian_user:users!guardians_guardian_id_fkey(name, phone)
        )
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("daily_responses")
      .select("response_date, status, responded_at, response_value")
      .eq("client_id", id)
      .order("response_date", { ascending: false })
      .limit(14),

    supabase
      .from("contact_logs")
      .select(`
        id, contact_date, contact_type, result, notes,
        worker:users!contact_logs_worker_id_fkey(name),
        action_records(status, actions, next_contact_scheduled)
      `)
      .eq("client_id", id)
      .order("contact_date", { ascending: false })
      .limit(20),
  ]);

  if (!clientRes.data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const c = clientRes.data;
  const todayStr = today();

  // 14일 응답 히스토리
  const respMap = new Map(
    (responsesRes.data ?? []).map((r) => [r.response_date, r])
  );
  const dateList: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateList.push(d.toISOString().split("T")[0]);
  }
  const responseHistory: ResponseHistoryItem[] = dateList.map((date) => {
    const r = respMap.get(date);
    return {
      date,
      dayLabel: date === todayStr ? "오늘" : getDayLabel(date),
      responded: r?.status === "responded",
      responseTime: r?.responded_at
        ? new Date(r.responded_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        : undefined,
      isToday: date === todayStr,
    };
  });

  // 연락 기록
  const contactLog: ContactLogItem[] = (contactsRes.data ?? []).map((cl) => {
    const ar = (cl.action_records as unknown as Array<{ status?: string; actions?: string[]; next_contact_scheduled?: string }>)?.[0];
    return {
      id: cl.id,
      date: cl.contact_date,
      workerName: (cl.worker as unknown as { name?: string } | null)?.name ?? "담당자",
      type: cl.contact_type,
      result: cl.result ?? undefined,
      status: ar?.status,
      actions: ar?.actions,
      note: cl.notes ?? undefined,
    };
  });

  // 최근 메모 (contact notes에서 추출)
  const notes: NoteItem[] = contactLog
    .filter((cl) => cl.note)
    .slice(0, 5)
    .map((cl) => ({
      id: cl.id,
      content: cl.note!,
      workerName: cl.workerName,
      createdAt: cl.date,
    }));

  const worker = c.assigned_worker as unknown as { name?: string; phone?: string } | null;
  const guardianRaw = (c.guardians as unknown as Array<{
    relationship?: string;
    guardian_user?: { name?: string; phone?: string } | null;
  }>)?.[0];

  const detail: ClientDetail = {
    id: c.id,
    name: c.name,
    age: c.age,
    phone: c.phone ?? undefined,
    address: c.address ?? undefined,
    riskScore: c.risk_score,
    riskLevel: c.risk_level,
    riskFactors: buildRiskFactors(c, responsesRes.data ?? []),
    assignedWorker: worker ? { name: worker.name ?? "", phone: worker.phone ?? "" } : undefined,
    guardian: guardianRaw?.guardian_user
      ? {
          name: guardianRaw.guardian_user.name ?? "",
          phone: guardianRaw.guardian_user.phone ?? "",
          relationship: guardianRaw.relationship ?? "other",
        }
      : undefined,
    responseHistory,
    contactLog,
    notes,
    nextContactScheduled: contactsRes.data?.[0]
      ? (contactsRes.data[0].action_records as unknown as Array<{ next_contact_scheduled?: string }>)?.[0]?.next_contact_scheduled
      : undefined,
  };

  return NextResponse.json(detail);
}

// POST /api/welfare/client — 메모 추가
export async function POST(request: NextRequest) {
  const { clientId, workerId, note } = await request.json();
  if (!clientId || !workerId || !note) {
    return NextResponse.json({ error: "clientId, workerId, note required" }, { status: 400 });
  }
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("contact_logs")
    .insert({ client_id: clientId, worker_id: workerId, contact_type: "note", contact_date: new Date().toISOString(), notes: note })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

type ResponseRow = { status?: string | null; responded_at?: string | null };
type ClientRow = { risk_score: number; last_response_time?: string | null };

function buildRiskFactors(client: ClientRow, responses: ResponseRow[]): string[] {
  const factors: string[] = [];
  const noResp = responses.filter((r) => r.status !== "responded").length;
  if (noResp > 0) factors.push(`최근 ${noResp}일 무응답`);
  if (client.risk_score >= 60) factors.push("응답 패턴 이상");
  if (client.risk_score >= 80) factors.push("즉시 확인 필요");
  if (client.last_response_time) {
    const ago = timeAgo(client.last_response_time);
    factors.push(`마지막 응답: ${ago}`);
  }
  return factors.slice(0, 3);
}