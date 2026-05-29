import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { RiskEvent } from "@/types";

// GET /api/welfare/risk-center?workerId=uuid&limit=50
export async function GET(request: NextRequest) {
  const workerId = request.nextUrl.searchParams.get("workerId");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50");

  if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("risk_events")
    .select(`
      id, client_id, detected_at, risk_score, risk_level, risk_factors, is_addressed,
      client:clients!risk_events_client_id_fkey(name, age, assigned_worker_id)
    `)
    .eq("clients.assigned_worker_id", workerId)
    .order("detected_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });

  const events: RiskEvent[] = (data ?? []).map((e) => {
    const c = e.client as unknown as { name?: string; age?: number } | null;
    return {
      id: e.id,
      clientId: e.client_id,
      clientName: c?.name ?? "알 수 없음",
      clientAge: c?.age ?? 0,
      detectedAt: e.detected_at,
      riskScore: e.risk_score,
      riskLevel: e.risk_level,
      riskFactors: e.risk_factors ?? [],
      isAddressed: e.is_addressed ?? false,
    };
  });

  return NextResponse.json(events);
}

// PATCH /api/welfare/risk-center — 위험 이벤트 처리 완료
export async function PATCH(request: NextRequest) {
  const { eventId } = await request.json();
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });

  const supabase = createServerClient();
  const { error } = await supabase
    .from("risk_events")
    .update({ is_addressed: true })
    .eq("id", eventId);

  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
