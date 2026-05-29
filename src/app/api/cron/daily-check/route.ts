import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { buildDailyCheckMessage } from "@/lib/kakao/bot";
import { today } from "@/lib/utils";

// GET /api/cron/daily-check
// Vercel Cron: 매일 09:00 KST (= 00:00 UTC) 실행
// 모든 고령층에게 일일 안부 메시지 발송 + daily_responses 레코드 생성
export async function GET(request: NextRequest) {
  // Vercel Cron 인증 (보안)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const todayDate = today();

  // 1. 오늘 발송 대상 조회 (kakao_id가 있는 모든 활성 대상자)
  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, name, kakao_id")
    .not("kakao_id", "is", null)
    .is("deleted_at", null);

  if (error) {
    console.error("[DailyCheck Cron] DB error:", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const client of clients ?? []) {
    try {
      // 2. daily_responses 레코드 생성 (이미 있으면 무시)
      await supabase.from("daily_responses").upsert(
        {
          client_id: client.id,
          response_date: todayDate,
          sent_at: new Date().toISOString(),
          status: "sent",
        },
        { onConflict: "client_id,response_date", ignoreDuplicates: true }
      );

      // 3. KakaoTalk 메시지 발송
      // 실제 KakaoTalk API 연동 시 여기서 호출
      // 현재는 봇 응답 형식만 생성 (웹훅 기반 봇은 직접 발송 지원 시)
      const _message = buildDailyCheckMessage(client.name);
      // TODO: await sendKakaoMessage(client.kakao_id, _message);

      console.log(`[DailyCheck] Sent to ${client.name} (${client.id})`);
      success++;
    } catch (err) {
      console.error(`[DailyCheck] Failed for ${client.name}:`, err);
      errors.push(`${client.name}: ${String(err)}`);
      failed++;
    }
  }

  return NextResponse.json({
    date: todayDate,
    total: (clients ?? []).length,
    success,
    failed,
    errors: errors.slice(0, 5), // 처음 5개만 반환
  });
}
