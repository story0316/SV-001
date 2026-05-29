import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  notifyGuardianUnresponsive,
  generateGuardianNotifyDraft,
} from "@/lib/notification/service";

// POST /api/notify/guardian
// 복지사가 보호자에게 알림 발송 (W04 모달에서 호출)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientId, guardianId, message, isDraft } = body;

  if (!clientId || !guardianId) {
    return NextResponse.json(
      { error: "clientId, guardianId required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // 클라이언트 + 담당 복지사 정보 조회
  const { data: client } = await supabase
    .from("clients")
    .select("name, assigned_worker:users!clients_assigned_worker_id_fkey(name, phone)")
    .eq("id", clientId)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const worker = client.assigned_worker as unknown as { name: string; phone: string } | null;

  // 초안 생성 요청 (복지사 검토용)
  if (isDraft) {
    const draft = generateGuardianNotifyDraft(
      client.name,
      worker?.name ?? "담당 복지사",
      worker?.phone ?? "",
      "unresponsive"
    );
    return NextResponse.json({ draft });
  }

  // 실제 발송
  const result = await notifyGuardianUnresponsive(
    guardianId,
    clientId,
    client.name,
    worker?.name ?? "담당 복지사",
    worker?.phone ?? ""
  );

  return NextResponse.json(result);
}
