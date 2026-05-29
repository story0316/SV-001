// KakaoTalk Bot API 타입 정의
// 참조: https://developers.kakao.com/docs/latest/ko/kakaotalk-channel/common

export interface KakaoWebhookPayload {
  userRequest: {
    user: {
      id: string;
      type: "botUserKey";
      properties: {
        botUserKey: string;
        plusfriendUserKey?: string;
        appUserId?: string;
      };
    };
    utterance: string; // 버튼 클릭 시 버튼 제목
    callbackUrl?: string;
    block: {
      id: string;
      name: string;
    };
    action?: {
      id: string;
      name: string;
      params: Record<string, string>;
      clientExtra?: Record<string, string>;
    };
  };
  bot: {
    id: string;
    name: string;
  };
  contexts: unknown[];
  action?: {
    name: string;
    clientExtra?: Record<string, string>;
    params?: Record<string, unknown>;
    id: string;
    detailParams?: Record<string, unknown>;
  };
}

// KakaoTalk 메시지 발송 요청
export interface KakaoMessageRequest {
  receiver_uuids: string[];
  template_object: KakaoTextTemplate | KakaoButtonTemplate;
}

// 텍스트 메시지
export interface KakaoTextTemplate {
  object_type: "text";
  text: string;
  link: {
    web_url?: string;
    mobile_web_url?: string;
  };
  button_title?: string;
}

// 버튼형 메시지 (안부 메시지에 사용)
export interface KakaoButtonTemplate {
  object_type: "feed";
  content: {
    title: string;
    description?: string;
    image_url?: string;
    link: {
      web_url?: string;
      mobile_web_url?: string;
    };
  };
  buttons?: Array<{
    title: string;
    link: {
      web_url?: string;
      mobile_web_url?: string;
    };
  }>;
}

// Bot 응답 형식
export interface KakaoBotResponse {
  version: "2.0";
  template: {
    outputs: Array<{
      simpleText?: { text: string };
      basicCard?: {
        title: string;
        description?: string;
        buttons?: Array<{
          action: "message" | "webLink";
          label: string;
          messageText?: string;
          webLinkUrl?: string;
        }>;
      };
    }>;
  };
}
