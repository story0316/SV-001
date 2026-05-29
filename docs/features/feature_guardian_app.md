# Feature: 보호자 알림 시스템

# Document Metadata
- Document ID: FEATURE-GUARDIAN-002
- Title: Guardian Notification System
- Owner: Product Lead
- Created At: 2026-05-29 19:00 KST
- Last Updated At: 2026-05-29 19:00 KST
- Current Version: v0.1
- Status: In Progress
- Related Files:
  - notification_flow.md
  - feature_elder_chat.md
- Related APIs:
  - POST /api/notify/guardian
  - GET /api/cron/notify-guardians
- Related DB Tables: notifications, guardians

---

## 1. 알림 트리거 조건

```
오늘 무응답 (status=sent, 응답 없음)
+ 위험도 high/critical
+ 최근 24h 내 알림 미발송
= 보호자 자동 알림 발송
```

## 2. 알림 흐름

```
매일 15:00 KST
  Cron → /api/cron/notify-guardians
    → 무응답 + high/critical 조회
    → 보호자 조회 (primary guardian)
    → 24h 중복 체크
    → Push 발송
    → notifications 기록
```

## 3. 복지사 수동 발송

```
W04 NotifyModal
  → POST /api/notify/guardian (isDraft=true)
  → AI 초안 자동 생성
  → 복지사 검토/수정
  → POST /api/notify/guardian (message=...)
  → 발송 + 기록
```

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 19:00 | Dev | Phase 2 implementation | Auto-notify guardians on unresponsive events |
