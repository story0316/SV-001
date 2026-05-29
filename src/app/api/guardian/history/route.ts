import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getDayLabel } from "@/lib/utils";
import { ResponseHistoryItem } from "@/types";

// GET /api/guardian/history?clientId=uuid&days=7
// 보호자 앱 G01: 최근 N일 응답 패턴 (도트 표시용)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const days = parseInt(searchParams.get("days") ?? "7", 10);

  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // 최근 N일 날짜 생성
  const dateList: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateList.push(d.toISOString().split("T")[0]);
  }

  // 응답 기록 조회
  const { data: responses } = await supabase
    .from("daily_responses")
    .select("response_date, status, responded_at")
    .eq("client_id", clientId)
    .in("response_date", dateList);

  const responseMap = new Map(
    (responses ?? []).map((r) => [r.response_date, r])
  );

  const todayStr = new Date().toISOString().split("T")[0];

  const history: ResponseHistoryItem[] = dateList.map((date) => {
    const record = responseMap.get(date);
    return {
      date,
      dayLabel: date === todayStr ? "오늘" : getDayLabel(date),
      responded: record?.status === "responded",
      responseTime: record?.responded_at
        ? new Date(record.responded_at).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : undefined,
      isToday: date === todayStr,
    };
  });

  return NextResponse.json({ history });
}
