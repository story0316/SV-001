import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { analyzeAnomalies } from "@/lib/risk/anomaly";
import { calculateRiskScore, countNoResponseDays, detectPatternDeviation } from "@/lib/risk/calculator";

// GET /api/welfare/anomaly?clientId=uuid
// 개별 대상자 AI 이상징후 분석 리포트
export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });

  const supabase = createServerClient();

  const [clientRes, responsesRes] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, age, risk_score, risk_level, cognition_error_rate, last_response_time")
      .eq("id", clientId)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("daily_responses")
      .select("*")
      .eq("client_id", clientId)
      .order("response_date", { ascending: false })
      .limit(60), // 60일 이상징후 분석
  ]);

  if (!clientRes.data) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const client = clientRes.data;
  const responses = responsesRes.data ?? [];

  const anomaly = analyzeAnomalies(responses, client.age ?? 70);
  const noResponseDays = countNoResponseDays(responses);
  const patternDeviation = detectPatternDeviation(responses);

  const risk = calculateRiskScore({
    noResponseDays,
    responsePatternDeviation: patternDeviation,
    cognitionErrorRate: client.cognition_error_rate ?? 0,
    previousRiskHistory: client.risk_level === "critical",
    age: client.age,
    responses,
  });

  // 응답률 계산
  const responded = responses.filter((r) => r.status === "responded").length;
  const responseRate = responses.length > 0 ? Math.round((responded / responses.length) * 100) : 0;

  // 평균 응답 시각 (HH:MM)
  const respondedWithTime = responses.filter((r) => r.responded_at);
  let avgResponseTime: string | undefined;
  if (respondedWithTime.length > 0) {
    const avgHour =
      respondedWithTime.reduce((sum, r) => sum + new Date(r.responded_at!).getHours(), 0) /
      respondedWithTime.length;
    const avgMin =
      respondedWithTime.reduce((sum, r) => sum + new Date(r.responded_at!).getMinutes(), 0) /
      respondedWithTime.length;
    avgResponseTime = `${String(Math.round(avgHour)).padStart(2, "0")}:${String(Math.round(avgMin)).padStart(2, "0")}`;
  }

  return NextResponse.json({
    clientId,
    clientName: client.name,
    age: client.age,
    analyzedDays: responses.length,
    responseRate: `${responseRate}%`,
    avgResponseTime,
    currentRisk: {
      score: risk.score,
      level: risk.level,
      factors: risk.factors,
    },
    anomaly: {
      score: anomaly.anomalyScore,
      factors: anomaly.anomalyFactors,
      timeShift: anomaly.timeShift,
      streakBreak: anomaly.streakBreak,
      weekendBehaviorChange: anomaly.weekendBehaviorChange,
      seasonalFactor: anomaly.seasonalFactor,
      ageFactor: anomaly.ageFactor,
    },
    analyzedAt: new Date().toISOString(),
  });
}
