import { DailyResponse, RiskLevel } from "@/types";
import { analyzeAnomalies } from "./anomaly";

export interface RiskInput {
  noResponseDays: number;
  responsePatternDeviation: boolean;
  cognitionErrorRate: number; // 0~1
  previousRiskHistory: boolean;
  age?: number;
  responses?: DailyResponse[]; // anomaly 분석용
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: string[];
  anomalyScore: number;
}

// notification_flow.md 기반 위험도 계산 (Phase 4: 이상징후 통합)
// score = 무응답(최대50) + 패턴변화(25) + 인지오류(20) + 이력(15) + 이상징후(최대40, but total capped at 100)
export function calculateRiskScore(input: RiskInput): RiskResult {
  let score = 0;
  const factors: string[] = [];

  // 무응답 일수 (연속, 최대 50점)
  const noResponseScore = Math.min(input.noResponseDays * 10, 50);
  if (noResponseScore > 0) {
    score += noResponseScore;
    factors.push(`${input.noResponseDays}일 연속 무응답`);
  }

  // 응답 패턴 변화 (최대 25점)
  if (input.responsePatternDeviation) {
    score += 25;
    factors.push("응답 패턴 변화 감지");
  }

  // 인지 체크 오류율 (최대 20점)
  const cognitionScore = Math.round(input.cognitionErrorRate * 20);
  if (cognitionScore > 10) {
    score += cognitionScore;
    factors.push(`인지 체크 오류율 ${Math.round(input.cognitionErrorRate * 100)}%`);
  }

  // 과거 위험 이력 (최대 15점)
  if (input.previousRiskHistory) {
    score += 15;
    factors.push("과거 위험 이력 있음");
  }

  // 이상징후 분석 (Phase 4)
  let anomalyScore = 0;
  if (input.responses && input.responses.length >= 5) {
    const anomaly = analyzeAnomalies(input.responses, input.age ?? 70);
    anomalyScore = anomaly.anomalyScore;
    score += anomalyScore;
    factors.push(...anomaly.anomalyFactors);
  }

  const clampedScore = Math.min(score, 100);

  return {
    score: clampedScore,
    level: scoreToLevel(clampedScore),
    factors: factors.slice(0, 4), // 최대 4개 요인
    anomalyScore,
  };
}

export function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "safe";
}

// 연속 무응답 일수 계산 (응답한 날 이후 중단)
export function countNoResponseDays(responses: DailyResponse[]): number {
  const sorted = [...responses].sort(
    (a, b) => new Date(b.response_date).getTime() - new Date(a.response_date).getTime()
  );
  let count = 0;
  for (const r of sorted) {
    if (r.status !== "responded") count++;
    else break;
  }
  return count;
}

// 패턴 편차 감지: 최근 3일 평균 응답 시각 vs 전체 평균 (3시간 이상 차이)
export function detectPatternDeviation(responses: DailyResponse[]): boolean {
  const responded = responses.filter((r) => r.status === "responded" && r.responded_at);
  if (responded.length < 5) return false;

  const hours = responded.map((r) => new Date(r.responded_at!).getHours());
  const avg = hours.reduce((a, b) => a + b, 0) / hours.length;
  const recent = hours.slice(-3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  return Math.abs(recentAvg - avg) >= 3;
}
