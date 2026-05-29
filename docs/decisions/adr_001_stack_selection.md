# ADR-001: Tech Stack 선택

# Document Metadata
- Document ID: ADR-001
- Title: Architecture Decision Record - Tech Stack Selection
- Owner: CTO
- Created At: 2026-05-29 17:35 KST
- Last Updated At: 2026-05-29 17:35 KST
- Current Version: v1.0
- Status: Accepted
- Related Files: system_architecture.md, adr_002_kakao_strategy.md
- Primary Goal: Document and justify tech stack choices
- Non-Goals: Deep technical implementation details

---

## Status
**ACCEPTED** — Phase 0 기준

---

## Context

### 요구사항
- MVP 2~4주 내 구축 가능
- 개발자 1~2명
- 고령층 + 복지사 + 보호자 3개 UI
- 카카오톡 통합 필수
- 실시간 알림 필요
- B2G 확장성 필수

### 제약사항
- 예산 제한
- 시간 제약
- 노코드/로우코드 지향
- 운영 경험 필요 (새로운 인프라 피하기)

---

## Decision

### Frontend
```
✅ CHOSEN: Next.js 14 + TypeScript + Tailwind + shadcn/ui

대안:
  - React SPA: Too complex for small team
  - Vue: Smaller ecosystem
  - Svelte: Less ecosystem support
  - Flutter: Too much for MVP
```

**이유**:
- Zero Config로 빠른 시작 (Vercel 배포 1클릭)
- Server Component로 복잡도 감소
- 이미 검증된 UI 컴포넌트 라이브러리 (shadcn/ui)
- TypeScript 기본 지원 (엔버그 감소)

### Backend / Database
```
✅ CHOSEN: Supabase (PostgreSQL + Auth + Realtime)

대안:
  - Firebase: Locked-in platform
  - Node.js + Express: Too much ops overhead
  - AWS: Too complex setup
  - Prisma ORM: Over-engineered for MVP
```

**이유**:
- PostgreSQL 기반 (표준, 마이그레이션 쉬움)
- Realtime 기본 지원 (WebSocket 자체 구현 불필요)
- RLS (Row Level Security) 기본 지원 (권한 관리 간단)
- 무료 플랜으로 MVP 전체 운영 가능
- Vercel 통합 최고 (환경변수, 배포 1초)
- 한국 기업도 많이 사용 (커뮤니티 규모)

### KakaoTalk 봇
```
✅ CHOSEN: Kakao Developers API (REST)

대안:
  - Line Bot API: Korea-unfriendly
  - Telegram Bot: Not popular with elderly
```

**이유**:
- 한국에서 고령층의 유일한 메시징 플랫폼
- REST API 매우 간단
- 문서화 잘 됨
- SDK 풍부 (Node.js, Python)

### 푸시 알림
```
✅ CHOSEN: Firebase Cloud Messaging (FCM)

대안:
  - One Signal: Proprietary
  - Braze: Expensive
  - APNs + FCM separate: Too complex
```

**이유**:
- 무료 (Firebase)
- iOS + Android 통합
- Supabase와의 비공식 통합 가능
- 한국 LTE 최적화

### 배포
```
✅ CHOSEN: Vercel (프론트) + Supabase (백)

배포 전략:
  - Next.js → Vercel (무료)
  - Database → Supabase (무료)
  - CI/CD → GitHub Actions (무료)
  - Monitoring → Sentry (무료 플랜)
```

**이유**:
- 최소 클릭으로 배포 가능
- 자동 스케일링
- 글로벌 CDN
- 한국 인프라 지원

---

## Consequences

### 긍정적 영향 ✅
- 매우 빠른 개발 속도 (50% 시간 단축)
- 최소 운영 비용
- 표준 기술 (개발자 교체 용이)
- 나중에 마이그레이션 가능 (표준 PostgreSQL)
- 확장성 매우 좋음 (B2G까지 동일 스택)

### 부담 ⚠️
- Supabase 종속성 (PostgreSQL은 표준이지만)
- RLS의 정확한 설정 필요 (보안 중요)
- Realtime 과부하 가능성 (나중에 Redis 추가)
- Kakao API 변경 리스크 (모니터링 필요)

### 트레이드오프
```
Speed vs Control:
  ✅ 속도 선택 (MVP 단계)
  → 나중에 필요시 자체 구현으로 대체 가능

Cost vs Features:
  ✅ 최소 비용 선택
  → 무료 플랜으로 수천 명 관리 가능

Complexity vs Flexibility:
  ✅ 단순함 선택
  → 확장 시 복잡해질 예정 (정상)
```

---

## Alternatives Considered

### 1. Firebase + React

**장점**: Google 백엔드 신뢰도
**단점**:
  - Firestore는 RLS 강력하지 않음
  - PostgreSQL 마이그레이션 어려움
  - 비용이 커질 수 있음
  - "Google이 데이터 볼 수 있음" 우려 (B2G 정책)

**결론**: ❌ 정책 리스크 높음

### 2. Node.js + MySQL

**장점**: 전체 통제
**단점**:
  - DevOps 부담 높음
  - Realtime 자체 구현 필요
  - 개발 속도 느림 (3배)
  - RLS 자체 구현 필요

**결론**: ❌ MVP 단계에는 오버엔지니어링

### 3. Flask + React

**장점**: Python 개발자 친화
**단점**:
  - 한국에서 주류 아님
  - DevOps 복잡 (Docker)
  - 배포 어려움

**결론**: ❌ 한국 생태계 약함

---

## Implementation Plan

1. **Phase 0** (완료 예정)
   - [ ] Supabase 프로젝트 생성
   - [ ] DB 스키마 구현
   - [ ] RLS 정책 설정

2. **Phase 1**
   - [ ] Next.js 프로젝트 초기화
   - [ ] KakaoTalk Bot API 연동
   - [ ] 기본 CRUD 구현

3. **Phase 2+**
   - Firebase FCM 연동
   - Realtime 구독 구현
   - 배포 파이프라인 설정

---

## Monitoring & Revision

### 재검토 기준

```
위험 신호:
  - Supabase 성능 저하 (응답 > 1s)
  - RLS 오류 증가 (보안 위반)
  - 비용 급상승 (월 $1000 이상)
  - 팀 개발 속도 저하 (예상 대비 50% 이하)

재검토 주기:
  - Phase 1 완료 후 (2주)
  - Phase 2 완료 후 (4주)
  - 월간 1회 (비용/성능 검토)

변경 기준:
  - Supabase → 자체 PostgreSQL (비용 문제 시)
  - Next.js → 다른 프레임워크 (매우 낮은 확률)
```

---

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v1.0 | 2026-05-29 17:35 | CTO | Initial decision accepted | Define tech stack for all phases |

---

## Related References
- See: `adr_002_kakao_strategy.md` (KakaoTalk 전략)
- See: `adr_003_phase_division.md` (Phase 기반 접근)
- See: `system_architecture.md` (아키텍처)
