# ADR-005: 인증 전략 — Supabase Auth + @supabase/ssr

# Document Metadata
- Document ID: ADR-005
- Title: Authentication Strategy
- Owner: CTO
- Created At: 2026-05-29 KST
- Current Version: v1.0
- Status: Accepted
- Related Files: system_architecture.md, db_schema.md

---

## Context

Phase 1~5에서 WORKER_ID를 하드코딩하여 개발 진행. 운영 배포 전 실제 인증 시스템 필요.

요구 사항:
- 역할별 접근 제어 (welfare_worker / guardian / admin)
- SSR(Next.js App Router)에서 쿠키 기반 세션
- Middleware 레벨 라우트 보호
- 보호자: 본인 담당 부모만 조회 가능
- 복지사: 본인 담당 대상자만 조회 가능 (RLS)

## Decision

**Supabase Auth + @supabase/ssr (쿠키 기반 세션)**

| 옵션 | 이유 |
|------|------|
| Supabase Auth (채택) | 이미 Supabase 사용 중, 별도 Auth 서버 불필요 |
| NextAuth.js | 추가 설정 복잡, Supabase와 중복 |
| JWT 직접 구현 | 보안 리스크, 유지보수 부담 |
| Clerk | 유료, 번들 증가 |

## 구현 구조

```
로그인 (/login)
  → supabase.auth.signInWithPassword()
  → users 테이블 role 조회
  → welfare_worker → / → (welfare)/*
  → guardian       → / → (guardian)/*

Middleware (src/middleware.ts)
  → @supabase/ssr createServerClient
  → supabase.auth.getUser() — 세션 갱신
  → 비인증 → /login 리다이렉트

Route Groups:
  (welfare)/layout.tsx → WelfareAuthProvider
    → useWelfareUser() hook: id, name, orgId
  (guardian)/layout.tsx → GuardianAuthProvider
    → useGuardianUser() hook: id, clientId, clientName
```

## Consequences

**긍정적:**
- 미들웨어가 모든 페이지 요청 전 세션 갱신 처리
- 각 Route Group 레이아웃이 역할 검증 담당
- 페이지 컴포넌트는 인증 걱정 없이 useWelfareUser()/useGuardianUser()만 호출
- 서비스 역할 키(service_role)는 서버 API 라우트에서만 사용

**부정적:**
- 소셜 로그인 미지원 (추후 Supabase OAuth로 확장 가능)
- 모바일 앱 전환 시 토큰 방식 변경 필요 (현재 쿠키)

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v1.0 | 2026-05-29 | Dev | Phase 6: Auth 시스템 구현 | 하드코딩 ID 제거, 실제 운영 가능 |
