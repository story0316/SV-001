import { KakaoBotResponse, KakaoWebhookPayload } from "./types";

// 버튼 키 상수
export const KAKAO_BUTTONS = {
  YES_ATE: "yes_ate",
  NOT_YET: "not_yet",
  COG_CORRECT: "cog_correct",
  COG_WRONG: "cog_wrong",
} as const;

export type KakaoButtonKey =
  (typeof KAKAO_BUTTONS)[keyof typeof KAKAO_BUTTONS];

// 웹훅 페이로드에서 버튼 키 추출
export function parseButtonResponse(payload: KakaoWebhookPayload): {
  userId: string;
  buttonKey: string;
} {
  const userId =
    payload.userRequest.user.properties.plusfriendUserKey ||
    payload.userRequest.user.id;

  // clientExtra에 버튼 키를 담아 전달하는 방식
  const buttonKey =
    payload.action?.clientExtra?.button_key ||
    payload.userRequest.action?.params?.button_key ||
    payload.userRequest.utterance;

  return { userId, buttonKey };
}

// ─────────────────────────────────────────
// 카카오톡 Bot 응답 메시지 빌더
// ─────────────────────────────────────────

// 일일 안부 메시지 (K01 화면)
// ux_principles.md: 버튼 2개, 큰 텍스트, 친근한 톤
export function buildDailyCheckMessage(name: string): KakaoBotResponse {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: `${name}님, 오늘 아침 식사는 하셨나요? 😊`,
            description: "버튼을 눌러 응답해주세요",
            buttons: [
              {
                action: "message",
                label: "✅ 네, 했어요",
                messageText: KAKAO_BUTTONS.YES_ATE,
              },
              {
                action: "message",
                label: "⏰ 아직 안 했어요",
                messageText: KAKAO_BUTTONS.NOT_YET,
              },
            ],
          },
        },
      ],
    },
  };
}

// 응답 완료 메시지 (K03 화면)
// ux_principles.md: 추가 버튼 없음, 정서적 안정감
export function buildThankYouMessage(
  responseValue: "yes" | "no"
): KakaoBotResponse {
  const text =
    responseValue === "yes"
      ? "오늘도 응답해주셔서 감사합니다 😊\n건강하고 행복한 하루 보내세요 🌸"
      : "아직 식사 전이시군요 😊\n든든히 드시고 즐거운 하루 보내세요 🌸";

  return {
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text } }],
    },
  };
}

// 리마인더 메시지 (무응답 2시간 후)
export function buildReminderMessage(name: string): KakaoBotResponse {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: `${name}님, 오늘 안부 확인이 아직 안 됐어요 😊`,
            description: "잠깐 시간 내주실 수 있으신가요?",
            buttons: [
              {
                action: "message",
                label: "✅ 네, 잘 있어요",
                messageText: KAKAO_BUTTONS.YES_ATE,
              },
              {
                action: "message",
                label: "⏰ 아직이에요",
                messageText: KAKAO_BUTTONS.NOT_YET,
              },
            ],
          },
        },
      ],
    },
  };
}

// 잘못 눌렀을 때 수정 메시지
// ux_principles.md: 오류 수정 가능해야 함, 죄책감 유발 금지
export function buildCorrectionMessage(name: string): KakaoBotResponse {
  return {
    version: "2.0",
    template: {
      outputs: [
        {
          basicCard: {
            title: `${name}님, 다시 선택하셔도 괜찮아요 😊`,
            description: "아래 버튼을 다시 눌러주세요",
            buttons: [
              {
                action: "message",
                label: "✅ 식사 했어요",
                messageText: KAKAO_BUTTONS.YES_ATE,
              },
              {
                action: "message",
                label: "⏰ 아직이에요",
                messageText: KAKAO_BUTTONS.NOT_YET,
              },
            ],
          },
        },
      ],
    },
  };
}
