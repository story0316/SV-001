import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  calculateRiskScore,
  countNoResponseDays,
  detectPatternDeviation,
} from "@/lib/risk/calculator";

// GET /api/cron/risk-recalc
// Vercel Cron: 매일 06:00 KST (= 21:00 UTC 전날)
// 전체 대상자 위험도 일괄 재계산
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // 모든 활성 대상자 조회
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, risk_score, risk_level")
    .is("deleted_at", null);

  let updated = 0;
  let escalated = 0;

  for (const client of clients ?? []) {
    const { data: responses } = await supabase
      .from("daily_responses")
      .select("*")
      .eq("client_id", client.id)
      .order("response_date", { ascending: false })
      .limit(14);

    if (!responses) continue;

    const noResponseDays = countNoResponseDays(responses);
    const patternDeviation = detectPatternDeviation(responses);

    const { score, level, factors } = calculateRiskScore({
      noResponseDays,
      responsePatternDeviation: patternDeviation,
      cognitionErrorRate: 0,
      previousRiskHistory: client.risk_level === "critical",
    });

    // 위험도 변경 시 DB 업데이트
    if (score !== client.risk_score || level !== client.risk_level) {
      await supabase
        .from("clients")
        .update({ risk_score: score, risk_level: level })
        .eq("id", client.id);

      // 위험도 상승 시 risk_events 기록
      if (level === "critical" && client.risk_level !== "critical") {
        await supabase.from("risk_events").insert({
          client_id: client.id,
          risk_score: score,
          risk_level: level,
          risk_factors: factors,
        });
        escalated++;
      }

      updated++;
    }
  }

  return NextResponse.json({
    total: clients?.length ?? 0,
    updated,
    escalated,
  });
}
