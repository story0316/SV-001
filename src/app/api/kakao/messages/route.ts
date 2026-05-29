import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  KAKAO_BUTTONS,
  buildThankYouMessage,
  parseButtonResponse,
} from "@/lib/kakao/bot";
import {
  calculateRiskScore,
  countNoResponseDays,
  detectPatternDeviation,
} from "@/lib/risk/calculator";
import { KakaoWebhookPayload } from "@/lib/kakao/types";
import { today } from "@/lib/utils";

// POST /api/kakao/messages
// KakaoTalk 봇 웹훅: 사용자 버튼 응답 수신
export async function POST(request: NextRequest) {
  try {
    const payload: KakaoWebhookPayload = await request.json();
    const { userId, buttonKey } = parseButtonResponse(payload);

    if (
      buttonKey !== KAKAO_BUTTONS.YES_ATE &&
      buttonKey !== KAKAO_BUTTONS.NOT_YET
    ) {
      // 인식 불가 버튼 → 기본 응답
      return NextResponse.json({
        version: "2.0",
        template: { outputs: [{ simpleText: { text: "네, 확인했습니다 😊" } }] },
      });
    }

    const supabase = createServerClient();
    const responseValue = buttonKey === KAKAO_BUTTONS.YES_ATE ? "yes" : "no";

    // 1. KakaoTalk userId로 고령층 Client 조회
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, risk_score")
      .eq("kakao_id", userId)
      .single();

    if (clientError || !client) {
      console.error("[Kakao Webhook] Client not found:", userId);
      return NextResponse.json(buildThankYouMessage(responseValue));
    }

    // 2. 오늘 응답 레코드 업데이트
    const todayDate = today();
    await supabase
      .from("daily_responses")
      .upsert(
        {
          client_id: client.id,
          response_date: todayDate,
          responded_at: new Date().toISOString(),
          response_value: responseValue,
          status: "responded",
        },
        { onConflict: "client_id,response_date" }
      );

    // 3. 최근 14일 응답 기록 조회 → 위험도 재계산
    const { data: recentResponses } = await supabase
      .from("daily_responses")
      .select("*")
      .eq("client_id", client.id)
      .order("response_date", { ascending: false })
      .limit(14);

    if (recentResponses) {
      const noResponseDays = countNoResponseDays(recentResponses);
      const patternDeviation = detectPatternDeviation(recentResponses);
      const { score, level } = calculateRiskScore({
        noResponseDays,
        responsePatternDeviation: patternDeviation,
        cognitionErrorRate: 0,
        previousRiskHistory: false,
      });

      // 4. 위험도 업데이트
      await supabase
        .from("clients")
        .update({
          risk_score: score,
          risk_level: level,
          last_response_date: todayDate,
          last_response_time: new Date().toISOString(),
        })
        .eq("id", client.id);
    }

    // 5. 감사 메시지 반환 (KakaoTalk에 자동 표시)
    return NextResponse.json(buildThankYouMessage(responseValue));
  } catch (error) {
    console.error("[Kakao Webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Kakao 서버 검증용 GET
export async function GET() {
  return NextResponse.json({ status: "ok", service: "SilverCare Kakao Bot" });
}
