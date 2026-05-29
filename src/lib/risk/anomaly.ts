import { DailyResponse } from "@/types";

// ─── Seasonal Factor ───────────────────────────────────────────
// 겨울(12-2월) 고위험 계절: +5점, 여름(7-8월) 열사병 위험: +2점
export function calculateSeasonalFactor(date: Date = new Date()): number {
  const month = date.getMonth() + 1; // 1-12
  if (month === 12 || month === 1 || month === 2) return 5;
  if (month === 7 || month === 8) return 2;
  return 0;
}

// ─── Age Factor ────────────────────────────────────────────────
// 75세 이상부터 연령 보정: 75→0점, 80→5점, 85→10점, 90+→15점(max)
export function calculateAgeFactor(age: number): number {
  if (age < 75) return 0;
  return Math.min(Math.round((age - 75) * 1.5), 15);
}

// ─── Time Shift Detection ──────────────────────────────────────
// 최근 7일 평균 응답 시각이 과거 30일 평균 대비 3시간 이상 이동했으면 이상
export function detectTimeShift(responses: DailyResponse[]): {
  detected: boolean;
  shiftHours: number;
  baselineAvg: number;
  recentAvg: number;
} {
  const responded = [...responses]
    .filter((r) => r.status === "responded" && r.responded_at)
    .sort((a, b) => new Date(b.response_date).getTime() - new Date(a.response_date).getTime());

  if (responded.length < 8) return { detected: false, shiftHours: 0, baselineAvg: 0, recentAvg: 0 };

  const toHour = (r: DailyResponse) => new Date(r.responded_at!).getHours() + new Date(r.responded_at!).getMinutes() / 60;

  const recent = responded.slice(0, 7).map(toHour);
  const baseline = responded.slice(7).map(toHour);

  if (baseline.length === 0) return { detected: false, shiftHours: 0, baselineAvg: 0, recentAvg: 0 };

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const baselineAvg = baseline.reduce((a, b) => a + b, 0) / baseline.length;
  const shiftHours = Math.abs(recentAvg - baselineAvg);

  return {
    detected: shiftHours >= 3,
    shiftHours: Math.round(shiftHours * 10) / 10,
    baselineAvg: Math.round(baselineAvg * 10) / 10,
    recentAvg: Math.round(recentAvg * 10) / 10,
  };
}

// ─── Response Streak Break ─────────────────────────────────────
// 7일 이상 연속 응답하다가 갑자기 3일 이상 미응답 → 행동 변화
export function detectStreakBreak(responses: DailyResponse[]): boolean {
  const sorted = [...responses].sort(
    (a, b) => new Date(b.response_date).getTime() - new Date(a.response_date).getTime()
  );

  // 최근 N일 패턴 체크
  let recentNoResponse = 0;
  let priorStreak = 0;
  let hitResponse = false;

  for (const r of sorted) {
    if (!hitResponse) {
      if (r.status !== "responded") recentNoResponse++;
      else hitResponse = true;
    } else {
      if (r.status === "responded") priorStreak++;
      else break;
    }
  }

  return recentNoResponse >= 3 && priorStreak >= 7;
}

// ─── Weekend Behavior Change ───────────────────────────────────
// 최근 4주 주말 응답률 vs 직전 4주 주말 응답률 비교 (20%p 이상 하락)
export function detectWeekendBehaviorChange(responses: DailyResponse[]): boolean {
  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr).getDay();
    return d === 0 || d === 6;
  };

  const sorted = [...responses].sort(
    (a, b) => new Date(b.response_date).getTime() - new Date(a.response_date).getTime()
  );

  const weekends = sorted.filter((r) => isWeekend(r.response_date));
  if (weekends.length < 8) return false;

  const recentWE = weekends.slice(0, Math.floor(weekends.length / 2));
  const priorWE = weekends.slice(Math.floor(weekends.length / 2));

  const rate = (arr: DailyResponse[]) =>
    arr.filter((r) => r.status === "responded").length / arr.length;

  return rate(priorWE) - rate(recentWE) >= 0.2;
}

// ─── Composite Anomaly Score ───────────────────────────────────
export interface AnomalyResult {
  timeShift: ReturnType<typeof detectTimeShift>;
  streakBreak: boolean;
  weekendBehaviorChange: boolean;
  seasonalFactor: number;
  ageFactor: number;
  anomalyScore: number; // 0-100 추가 위험 점수
  anomalyFactors: string[];
}

export function analyzeAnomalies(
  responses: DailyResponse[],
  age: number,
  date?: Date
): AnomalyResult {
  const timeShift = detectTimeShift(responses);
  const streakBreak = detectStreakBreak(responses);
  const weekendBehaviorChange = detectWeekendBehaviorChange(responses);
  const seasonalFactor = calculateSeasonalFactor(date);
  const ageFactor = calculateAgeFactor(age);

  const anomalyFactors: string[] = [];
  let anomalyScore = 0;

  if (timeShift.detected) {
    anomalyScore += 20;
    anomalyFactors.push(`응답 시각 ${timeShift.shiftHours}시간 이동`);
  }
  if (streakBreak) {
    anomalyScore += 15;
    anomalyFactors.push("지속 응답 후 갑작스런 무응답");
  }
  if (weekendBehaviorChange) {
    anomalyScore += 10;
    anomalyFactors.push("주말 응답 패턴 변화");
  }
  if (seasonalFactor > 0) {
    anomalyScore += seasonalFactor;
    anomalyFactors.push(seasonalFactor >= 5 ? "겨울철 고위험 계절" : "여름철 열사병 주의");
  }
  if (ageFactor > 0) {
    anomalyScore += ageFactor;
    anomalyFactors.push(`고령(${age}세) 위험도 보정`);
  }

  return {
    timeShift,
    streakBreak,
    weekendBehaviorChange,
    seasonalFactor,
    ageFactor,
    anomalyScore: Math.min(anomalyScore, 40), // 이상징후는 최대 40점 기여
    anomalyFactors,
  };
}
