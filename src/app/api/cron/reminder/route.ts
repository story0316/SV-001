import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { today } from "@/lib/utils";

// GET /api/cron/reminder
// Vercel Cron: 매일 12:00 KST (= 03:00 UTC)
// 오전 안부에 응답 안 한 사람에게 리마인더 발송
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const todayDate = today();

  // 오늘 아직 응답 안 한 대상자 조회
  const { data: noResponders } = await supabase
    .from("daily_responses")
    .select("client_id, clients(name, kakao_id)")
    .eq("response_date", todayDate)
    .eq("status", "sent") // sent = 발송했지만 응답 없음
    .not("clients.kakao_id", "is", null);

  console.log(`[Reminder] ${noResponders?.length ?? 0}명에게 리마인더 발송`);

  // TODO: 실제 KakaoTalk 리마인더 발송
  // 무응답 상태 업데이트

  return NextResponse.json({
    date: todayDate,
    reminders: noResponders?.length ?? 0,
  });
}
