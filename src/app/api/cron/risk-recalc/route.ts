import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { calculateRiskScore, countNoResponseDays, detectPatternDeviation, scoreToLevel } from "@/lib/risk/calculator";
import { notifyWorkerRiskAlert } from "@/lib/notification/service";

// GET /api/cron/risk-recalc
// Vercel Cron: 매일 06:00 KST (= 21:00 UTC 전날)
// Phase 4: 이상징후 포함 전체 대상자 위험도 일괄 재계산 + 20점 급등 즉시 알림
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  // 활성 대상자 + 담당 복지사 정보 포함 조회
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, age, risk_score, risk_level, cognition_error_rate, assigned_worker_id")
    .is("deleted_at", null);

  let updated = 0;
  let escalated = 0;
  const immediateAlerts: string[] = [];

  for (const client of clients ?? []) {
    const { data: responses } = await supabase
      .from("daily_responses")
      .select("*")
      .eq("client_id", client.id)
      .order("response_date", { ascending: false })
      .limit(60); // Phase 4: 이상징후 분석을 위해 60일로 확장

    if (!responses) continue;

    const noResponseDays = countNoResponseDays(responses);
    const patternDeviation = detectPatternDeviation(responses);

    const { score, level, factors, anomalyScore } = calculateRiskScore({
      noResponseDays,
      responsePatternDeviation: patternDeviation,
      cognitionErrorRate: client.cognition_error_rate ?? 0,
      previousRiskHistory: client.risk_level === "critical",
      age: client.age,
      responses,
    });

    const prevScore = client.risk_score ?? 0;
    const prevLevel = client.risk_level;

    // 위험도 변경 시 DB 업데이트
    if (score !== prevScore || level !== prevLevel) {
      await supabase
        .from("clients")
        .update({
          risk_score: score,
          risk_level: level,
          last_risk_factors: factors, // Phase 4: 요인 저장
        })
        .eq("id", client.id);

      const levelOrder: Record<string, number> = { safe: 0, medium: 1, high: 2, critical: 3 };

      // high 이상 레벨 상승 시 risk_events 기록 (Phase 4: high도 포함)
      if (
        (level === "critical" || level === "high") &&
        levelOrder[level] > (levelOrder[prevLevel] ?? 0)
      ) {
        await supabase.from("risk_events").insert({
          client_id: client.id,
          risk_score: score,
          risk_level: level,
          risk_factors: factors,
          is_addressed: false,
        });
        escalated++;
      }

      // 20점 이상 급등: 담당 복지사 즉시 알림 (Phase 4)
      const scoreDelta = score - prevScore;
      if (scoreDelta >= 20 && client.assigned_worker_id && level !== "safe") {
        try {
          await notifyWorkerRiskAlert(
            client.assigned_worker_id,
            client.id,
            client.name,
            score,
            factors
          );
          immediateAlerts.push(client.name);
        } catch {
          // notification 실패는 cron 전체를 중단하지 않음
        }
      }

      updated++;
    }

    // Phase 4: 매일 risk_score_history에 스냅샷 기록 (변경 여부 무관)
    await supabase
      .from("risk_score_history")
      .upsert({
        client_id: client.id,
        scored_at: new Date().toISOString().split("T")[0],
        risk_score: score,
        risk_level: level,
        no_response_days: noResponseDays,
        anomaly_score: anomalyScore,
        factors,
      }, { onConflict: "client_id,scored_at" });
  }

  // unused import 방지
  void scoreToLevel;

  return NextResponse.json({
    total: clients?.length ?? 0,
    updated,
    escalated,
    immediateAlerts,
    processedAt: new Date().toISOString(),
  });
}
