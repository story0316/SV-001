import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { timeAgo, today } from "@/lib/utils";
import { ParentStatus } from "@/types";

// GET /api/guardian/status?clientId=uuid
// 보호자 앱 G01: 부모 오늘 상태 조회
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // 1. 대상자 정보 조회
  const { data: client, error } = await supabase
    .from("clients")
    .select(
      `
      id, name, age, risk_level, risk_score,
      last_response_date, last_response_time,
      assigned_worker:users!clients_assigned_worker_id_fkey(name, phone)
    `
    )
    .eq("id", clientId)
    .is("deleted_at", null)
    .single();

  if (error || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // 2. 오늘 응답 여부 확인
  const { data: todayResponse } = await supabase
    .from("daily_responses")
    .select("status, responded_at")
    .eq("client_id", clientId)
    .eq("response_date", today())
    .single();

  const todayResponded =
    todayResponse?.status === "responded";

  // 3. 상태 매핑 (보호자에게는 단순화)
  const displayStatus =
    client.risk_level === "critical" || client.risk_level === "high"
      ? "danger"
      : client.risk_level === "medium"
        ? "warning"
        : "normal";

  const workerRaw = client.assigned_worker as unknown;
  type WorkerShape = { name?: string; phone?: string } | null;
  const worker = workerRaw as WorkerShape;

  const parentStatus: ParentStatus = {
    name: client.name,
    age: client.age,
    status: displayStatus,
    lastResponseTime: client.last_response_time ?? undefined,
    lastResponseAgo: client.last_response_time
      ? timeAgo(client.last_response_time)
      : undefined,
    todayResponded,
    assignedWorker: worker
      ? { name: worker.name ?? "", phone: worker.phone ?? "" }
      : undefined,
  };

  return NextResponse.json(parentStatus);
}
