# Feature: KakaoTalk 일일 안부 (Elder Chat)

# Document Metadata
- Document ID: FEATURE-ELDER-001
- Title: KakaoTalk Daily Check-in Feature
- Owner: Product Lead
- Created At: 2026-05-29 18:00 KST
- Last Updated At: 2026-05-29 18:00 KST
- Current Version: v0.1
- Status: In Progress
- Related Files:
  - system_architecture.md
  - notification_flow.md
  - api_design.md
- Related APIs: POST /api/kakao/messages, GET /api/cron/daily-check
- Related DB Tables: clients, daily_responses

---

## 1. 기능 개요

고령층이 카카오톡을 통해 일일 안부에 응답하는 핵심 기능.

**목표**: 5초 안에 응답 완료 (버튼 2개만 제공)

---

## 2. 메시지 흐름

```
[매일 09:00]
  Cron → /api/cron/daily-check
    → clients 테이블에서 kakao_id 있는 전체 조회
    → daily_responses 레코드 생성 (status=sent)
    → KakaoTalk 메시지 발송

[사용자 응답]
  고령층 버튼 탭
    → KakaoTalk Bot Webhook
    → POST /api/kakao/messages
    → daily_responses 업데이트 (status=responded)
    → clients 위험도 재계산
    → 감사 메시지 반환

[무응답 12:00]
  Cron → /api/cron/reminder
    → 리마인더 메시지 발송
```

---

## 3. 구현 파일

- `src/app/api/kakao/messages/route.ts` — 웹훅 수신
- `src/app/api/cron/daily-check/route.ts` — 일일 발송
- `src/app/api/cron/reminder/route.ts` — 리마인더
- `src/lib/kakao/bot.ts` — 메시지 빌더
- `src/lib/kakao/types.ts` — 타입 정의
- `src/lib/risk/calculator.ts` — 위험도 계산

---

## 4. 예외 처리

| 케이스 | 처리 방식 |
|-------|---------|
| 잘못 눌렀을 때 | buildCorrectionMessage 발송 |
| 카카오 ID 미등록 | 감사 메시지만 반환 (DB 저장 안 함) |
| API 오류 | 500 반환, 로그 기록 |
| 무응답 24h | risk_events 기록 + 복지사 알림 (Phase 2) |

---

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 18:00 | Dev | Phase 1 implementation | Enable daily check flow |
