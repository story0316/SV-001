import { CognitionQuestion, KakaoBotResponse } from "@/lib/kakao/types";
import type { CognitionQuestion as CognitionQ } from "@/types";

// ─────────────────────────────────────────
// 인지 체크 미니게임 (K02)
// ux_principles.md: "검사처럼 느껴지면 안 된다. 게임/대화처럼."
// ─────────────────────────────────────────

const DAY_LABELS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const SEASON_MAP: Record<number, string> = { 12: "겨울", 1: "겨울", 2: "겨울", 3: "봄", 4: "봄", 5: "봄", 6: "여름", 7: "여름", 8: "여름", 9: "가을", 10: "가을", 11: "가을" };

// 오늘 날짜 기반 질문 동적 생성
export function generateDailyQuestion(): CognitionQ {
  const now = new Date();
  const dayIdx = now.getDay();
  const month = now.getMonth() + 1;

  // 주 3회: 요일 / 주 2회: 계절
  const useDay = (now.getDate() % 5) < 3;

  if (useDay) {
    // 요일 맞추기: 정답 + 인접 3개
    const options = generateDayOptions(dayIdx);
    return {
      id: `day_${now.toISOString().split("T")[0]}`,
      type: "day_of_week",
      question: "오늘이 무슨 요일인지 맞춰보실래요? 😊",
      options,
      correctIndex: options.indexOf(DAY_LABELS[dayIdx]),
    };
  } else {
    // 계절 맞추기
    const correctSeason = SEASON_MAP[month];
    const allSeasons = ["봄", "여름", "가을", "겨울"];
    const shuffled = [correctSeason, ...allSeasons.filter((s) => s !== correctSeason).slice(0, 3)].sort(() => Math.random() - 0.5);
    return {
      id: `season_${now.toISOString().split("T")[0]}`,
      type: "season",
      question: "지금이 어느 계절인가요? 🌸",
      options: shuffled,
      correctIndex: shuffled.indexOf(correctSeason),
    };
  }
}

function generateDayOptions(correctIdx: number): string[] {
  // 정답 포함 4개 요일 (연속된 날짜에서)
  const all = [0, 1, 2, 3, 4, 5, 6];
  const neighbors = [
    (correctIdx - 1 + 7) % 7,
    correctIdx,
    (correctIdx + 1) % 7,
    (correctIdx + 2) % 7,
  ];
  const extra = all.find((i) => !neighbors.includes(i)) ?? 0;
  const pool = [...neighbors.slice(0, 3), extra];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.map((i) => DAY_LABELS[i]);
}

// ─────────────────────────────────────────
// KakaoTalk 메시지 빌더 (인지 체크용)
// ─────────────────────────────────────────

export function buildCognitionMessage(name: string, question: CognitionQ): KakaoBotResponse {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: `${name}님, 오늘의 작은 퀴즈예요! 🎮`,
            description: question.question,
            buttons: question.options.map((opt, idx) => ({
              action: "message" as const,
              label: opt,
              messageText: `COG_${question.id}_${idx}`,
            })),
          },
        },
      ],
    },
  };
}

export function buildCognitionResultMessage(isCorrect: boolean): KakaoBotResponse {
  const text = isCorrect
    ? "맞아요! 훌륭하세요 🎉\n오늘도 건강하고 행복한 하루 보내세요 😊"
    : "아, 아쉽네요 😊 하지만 괜찮아요!\n오늘도 건강하고 행복한 하루 보내세요 🌸";

  return {
    version: "2.0",
    template: { outputs: [{ simpleText: { text } }] },
  };
}
