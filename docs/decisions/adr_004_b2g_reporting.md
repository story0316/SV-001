# ADR-004: B2G 보고서 형식 및 내보내기 전략

# Document Metadata
- Document ID: ADR-004
- Title: B2G Reporting Format & Export Strategy
- Owner: CTO
- Created At: 2026-05-29 KST
- Last Updated At: 2026-05-29 KST
- Current Version: v1.0
- Status: Accepted
- Related Files: feature_dashboard.md, phase_plan.md, system_architecture.md

---

## Context

지자체(B2G) 제출을 위한 월간 복지 활동 보고서가 필요하다.
요구 사항:
1. 담당 복지사 실적 집계
2. 대상자별 응답률 및 위험도 현황
3. 기관 전체 KPI 요약
4. 지자체가 읽을 수 있는 형식으로 내보내기

## Decision

**CSV 내보내기 (PDF 대신)**

| 옵션 | 장점 | 단점 | 결정 |
|------|------|------|------|
| PDF (puppeteer) | 가독성 높음 | 300KB+ 번들 증가, Vercel 제한 | ❌ |
| Excel (xlsx lib) | 스프레드시트 직접 열기 | 250KB 번들 | ❌ (Phase 6 검토) |
| CSV | 표준 지원, 번들 0 | 서식 없음 | ✅ |
| Google Sheets API | 직접 연동 | OAuth 설정 복잡 | ❌ (Phase 6 검토) |

**이유:**
- Vercel Functions 메모리 제한 (1GB) 및 번들 크기 제약
- CSV는 한국 지자체 시스템(HWP/Excel 혼재)에서 범용 지원
- UTF-8 BOM 포함 → Excel에서 한글 깨짐 없이 직접 열기 가능
- 추후 Excel 변환은 클라이언트 사이드 라이브러리로 분리 가능

## Consequences

**긍정적:**
- 서버 번들 0 증가
- 빠른 내보내기 (< 500ms)
- 모든 브라우저에서 직접 다운로드

**부정적:**
- 서식 없음 (정부 공문 양식 불일치)
- Phase 6에서 PDF/Excel 변환 추가 예정

## 구현 위치

- API: `GET /api/welfare/report/export?orgId&year&month&format=csv`
- UI: `/report/monthly` 페이지 → `⬇ CSV` 버튼
- 월간 집계: `GET /api/welfare/report/monthly?orgId&year&month`

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v1.0 | 2026-05-29 | Dev | Phase 5: CSV 내보내기 전략 결정 | B2G 보고서 즉시 제출 가능 |
