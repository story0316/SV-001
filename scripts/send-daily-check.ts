/**
 * 일일 안부 메시지 발송 스크립트
 *
 * 실행: npx ts-node scripts/send-daily-check.ts
 * 스케줄: 매일 오전 09:00 (n8n 또는 Vercel Cron)
 *
 * 역할:
 * 1. 오늘 발송 대상 고령층 목록 조회
 * 2. daily_responses 레코드 생성 (status=sent)
 * 3. 각 사용자에게 KakaoTalk 메시지 발송
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY!;

async function fetchActiveClients() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/clients?select=id,name,kakao_id&deleted_at=is.null&kakao_id=not.is.null`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );
  return res.json() as Promise<Array<{ id: string; name: string; kakao_id: string }>>;
}

async function createDailyResponseRecord(clientId: string, todayDate: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/daily_responses`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      client_id: clientId,
      response_date: todayDate,
      sent_at: new Date().toISOString(),
      status: "sent",
    }),
  });
}

async function sendKakaoMessage(kakaoUserId: string, name: string) {
  // KakaoTalk Bot API: 특정 사용자에게 메시지 발송
  // 실제 구현 시 Kakao Business Message API 사용
  const message = {
    receiver_uuids: [kakaoUserId],
    template_object: {
      object_type: "feed",
      content: {
        title: `${name}님, 오늘 아침 식사는 하셨나요? 😊`,
        description: "버튼을 눌러 응답해주세요",
        link: { web_url: process.env.NEXT_PUBLIC_APP_URL },
      },
      buttons: [
        {
          title: "✅ 네, 했어요",
          link: { web_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/kakao/quick?key=yes_ate&uid=${kakaoUserId}` },
        },
        {
          title: "⏰ 아직이에요",
          link: { web_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/kakao/quick?key=not_yet&uid=${kakaoUserId}` },
        },
      ],
    },
  };

  const res = await fetch("https://kapi.kakao.com/v2/api/talk/memo/default/send", {
    method: "POST",
    headers: {
      Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `template_object=${encodeURIComponent(JSON.stringify(message.template_object))}`,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[SendDailyCheck] Kakao send failed for ${kakaoUserId}:`, err);
  }
}

async function main() {
  const todayDate = new Date().toISOString().split("T")[0];
  console.log(`[SendDailyCheck] Starting for ${todayDate}`);

  const clients = await fetchActiveClients();
  console.log(`[SendDailyCheck] ${clients.length}명에게 발송 시작`);

  let success = 0;
  let failed = 0;

  for (const client of clients) {
    try {
      await createDailyResponseRecord(client.id, todayDate);
      await sendKakaoMessage(client.kakao_id, client.name);
      success++;
    } catch (err) {
      console.error(`[SendDailyCheck] Failed for ${client.name}:`, err);
      failed++;
    }

    // Rate limit 대응: 0.1초 간격
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`[SendDailyCheck] 완료 — 성공: ${success}, 실패: ${failed}`);
}

main().catch(console.error);
