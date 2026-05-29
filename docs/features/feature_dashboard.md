# Feature: 복지사 Dashboard

# Document Metadata
- Document ID: FEATURE-DASHBOARD-003
- Title: Welfare Worker Dashboard
- Owner: Product Lead
- Created At: 2026-05-29 19:00 KST
- Last Updated At: 2026-05-29 19:00 KST
- Current Version: v0.1
- Status: In Progress
- Related Files: feature_elder_chat.md, notification_flow.md
- Related APIs:
  - GET /api/welfare/dashboard
  - POST /api/welfare/contact
- Related DB Tables: clients, contact_logs, action_records

---

## 1. 화면 목록

| ID | 화면 | 구현 상태 |
|----|------|---------|
| W01 | Today Dashboard | ✅ Phase 2 완성 |
| W02 | 대상자 상세 | ✅ Phase 3 완성 |
| W03 | 빠른 기록 모달 | ✅ Phase 2 완성 |
| W04 | 보호자 알림 모달 | ✅ Phase 2 완성 |
| W05 | 위험 탐지 센터 | ✅ Phase 3 완성 |
| W06 | 일일 보고서 | ✅ Phase 3 완성 |
| W07 | B2G 월간 보고서 | ✅ Phase 5 완성 |

## 2. 우선순위 정렬 알고리즘

```
critical(80+) → high(60-79) → medium → safe
동점 시: 연속 무응답 일수 내림차순
```

## 3. 30초 기록 목표

```
RecordModal 단계:
  Step 1: 통화 결과 (버튼 4개 중 1개)  → 2초
  Step 2: 현재 상태 (버튼 3개 중 1개)  → 2초
  Step 3: 취한 조치 (체크박스)          → 5초
  메모: 선택사항                        → 10초
  다음 연락: 버튼 3개 중 1개            → 2초
  저장: 버튼 탭                         → 1초
  총계: ~22초 (목표 30초 이내 달성)
```

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 19:00 | Dev | Phase 2 dashboard basics | Enable worker daily workflow |
| v0.2 | 2026-05-29 | Dev | Phase 3: W02 detail, W05 risk center, W06 report | Complete E2E welfare worker flow |
| v0.3 | 2026-05-29 | Dev | Phase 5: W07 B2G monthly report + CSV export | 지자체 보고서 자동화 |
