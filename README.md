# 실버 케어 플랫폼 — Silver Care

> AI Native 문서 기반(MD-Driven) 개발 방식으로 구축하는 **실제 운영 가능한 복지 SaaS**

---

## 🎯 프로젝트 개요

### 핵심 목표
- **독거노인의 고독사 조기 감지** → 이상징후 감지 시 즉시 조치
- **복지사 관리 효율 극대화** → 업무 시간 50% 단축
- **보호자의 심리적 안정** → "부모 안전한지만" 빠르게 확인
- **B2G 확장성** → 1개 지자체 → 100개 지자체

### 혁신
```
기존 패러다임:     사용자 → 앱 설치 → 기능 탐색 → 기능 사용 (실패율 70%)
우리의 패러다임:   일상 흐름 → 서비스 끼어듦 → 최소 응답 → 완료 (성공률 80%)

"고령층이 새로운 앱을 배우지 않는다.
 고령층의 일상(카카오톡)이 서비스를 통한다."
```

---

## 📁 문서 구조

모든 개발은 **MD(Markdown) 중심**으로 진행됩니다. 코드보다 문서가 우선입니다.

```
docs/
├── /product                    ← 제품 정의
│   ├── product_vision.md       (핵심 명제 + 5대 철학)
│   ├── user_personas.md        (Persona A/B/C 심층 분석)
│   └── ux_principles.md        (설계 원칙 + WCAG 준수)
│
├── /architecture               ← 기술 설계
│   ├── system_architecture.md  (전체 다이어그램 + 컴포넌트)
│   ├── api_design.md           (REST API 정의)
│   ├── db_schema.md            (DB 테이블 + RLS)
│   └── notification_flow.md    (알림 의사결정 엔진)
│
├── /planning                   ← 개발 계획
│   ├── roadmap.md              (전체 로드맵)
│   ├── phase_plan.md           (5 Phase 계획)
│   └── sprint_tasks.md         (Sprint 단위 분업)
│
├── /decisions                  ← 기술 의사결정
│   ├── adr_001_stack_selection.md  (Next.js + Supabase)
│   ├── adr_002_kakao_strategy.md   (KakaoTalk 우선)
│   └── adr_003_phase_division.md   (5 Phase 분리)
│
└── /features                   ← 기능별 상세 (Phase마다 추가)
    ├── feature_elder_chat.md
    ├── feature_guardian_app.md
    ├── feature_dashboard.md
    ├── feature_risk_engine.md
    └── feature_reporting.md
```

---

## 🚀 Quick Start

### Phase 0: MD Framework ✅ (완료)

**생성된 파일**:
- ✅ product_vision.md
- ✅ user_personas.md
- ✅ ux_principles.md
- ✅ system_architecture.md
- ✅ api_design.md
- ✅ db_schema.md
- ✅ notification_flow.md
- ✅ adr_001_stack_selection.md
- ✅ phase_plan.md

**특징**: 모든 파일에 Metadata + Change Log 포함

### Phase 1: KakaoTalk MVP (다음 1주)

**목표**: 고령층 일일 안부 + 보호자 상태 확인

**시작 방법**:
```bash
# 1. phase_1_kakao_mvp.md 상세 계획 작성
# 2. Next.js 프로젝트 초기화
# 3. Supabase 데이터베이스 생성
# 4. KakaoTalk Bot 등록
# 5. 고령층 5명 테스트 시작
```

---

## 📚 핵심 원칙

### 1. MD-Driven Development
```
코드 < 문서

문서가 Single Source of Truth이다.
코드가 문서와 충돌하면 → 코드 수정
```

### 2. 문서 버전 관리
```
모든 MD 파일 필수:
  - Document Metadata (ID, 버전, 상태)
  - Change Log (언제 누가 무엇을 변경했는가)
  - Related References (파일 간 상호 참조)

상태:
  Draft → In Progress → Stable → Deprecated
```

### 3. Phase 기반 개발
```
한 번에 1 Phase만 개발
각 Phase는:
  - Goal / Scope / Out of Scope
  - Success Criteria
  - Technical Risks
  - 완료 기준 (Definition of Done)
```

### 4. AI 친화적 Context 관리
```
세션이 길어질 때:
  1. 최신 Stable 문서 우선 참조
  2. Deprecated 문서 제외
  3. Change Log 기반 핵심 변경사항 요약
  4. 토큰 최소화
```

---

## 🛠 기술 스택

| 계층 | 기술 | 선택 이유 |
|------|------|----------|
| Frontend | Next.js 14 + TypeScript + Tailwind | 빠른 개발, Vercel 배포 |
| Backend | Supabase (PostgreSQL) | Realtime, RLS, 무료 |
| 메시징 | KakaoTalk Bot API | 고령층 주요 플랫폼 |
| 알림 | Firebase Cloud Messaging | 무료, 크로스플랫폼 |
| 배포 | Vercel + Supabase | Zero config, 자동 확장 |
| 버전 관리 | GitHub + MD Docs | 문서 기반 추적 |

**상세**: `docs/decisions/adr_001_stack_selection.md`

---

## 📊 5 Phase Roadmap

```
Phase 0 (1시간)    → MD Framework 구축 ✅
Phase 1 (1주)      → KakaoTalk MVP (고령층 + 보호자)
Phase 2 (1주)      → 보호자 알림 시스템
Phase 3 (2주)      → 복지사 Dashboard
Phase 4 (2주)      → 위험 탐지 엔진 (AI)
Phase 5 (2주)      → B2G Reporting (지자체)

총 ~8주
```

**상세**: `docs/planning/phase_plan.md`

---

## 🎭 3가지 사용자 인터페이스

### LAYER 0: 고령층 (카카오톡)
```
"OO님, 오늘 식사 하셨나요? 😊"
[네 했어요]  [아직이에요]

→ 버튼 2개만, 5초 완료
```

### LAYER 1: 보호자 (모바일 웹)
```
✅ 어머니 김순자님 — 오늘 응답 완료
📊 최근 7일: ✅ ✅ ✅ ⚠️ ✅ ✅ ✅
📞 담당 복지사: 이민지 010-XXXX-XXXX

→ 3초 판단
```

### LAYER 2: 복지사 (웹)
```
🔴 즉시 조치 (2명)
  - 김순자 (3일 무응답)
  - 박명수 (패턴 이상)

🟠 오늘 연락 필요 (8명)
🟡 이번주 확인 (15명)

→ 위험 우선순위 자동 정렬, 원클릭 조치
```

---

## 🔒 보안 & 프라이버시

### 원칙
- **최소 데이터 저장**: 주민번호/의료정보 저장 금지
- **암호화**: 전화번호, 주소 암호화
- **감시 기록**: 모든 데이터 접근 Audit Log
- **Soft Delete**: 삭제가 아닌 soft delete만
- **역할 기반 접근**: RLS (Row Level Security)

### B2G 준비
- 지자체 정책 준수
- 정보보호 관리사 감시
- 정기적 보안 감사

**상세**: `docs/architecture/db_schema.md#5-row-level-security`

---

## 📈 성공 지표

### Persona A (고령층)
- 응답률 ≥ 80%
- 응답 시간 ≤ 5초
- 이탈률 < 5%

### Persona B (복지사)
- 관리 시간 30분 → 15분 (50% 단축)
- 기록 시간 0분 (자동)
- 위험 탐지 정확도 ≥ 85%

### Persona C (보호자)
- 알림 수신 후 응답 < 5분
- 과도한 알림 < 주 1회
- 안심도 점수 ≥ 8/10

---

## 🤝 기여 가이드

### 코드 작성 전: MD 먼저

```
Bad:  코드 작성 → 나중에 문서 작성
Good: 문서 작성 → 문서 기반 코드 작성
```

### MD 파일 수정 시: Change Log 필수

```markdown
# Change Log
| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.2 | 2026-05-30 | Developer | Added JWT auth | Improve security |
```

### 새 기능 추가 시: ADR 고려

```
새로운 기술 선택? → ADR 문서 작성
아키텍처 변경? → ADR 문서 작성
중요한 결정? → ADR 문서 작성
```

---

## 📞 문의

### 주요 연락처
- **CTO**: 설계 및 아키텍처
- **PM**: 요구사항 및 우선순위
- **Security**: 보안 및 규정 준수

---

## 📝 라이선스

MIT License (상세는 LICENSE 파일)

---

## 🗺 Next Steps

1. **Phase 1 준비**
   ```bash
   # 1. phase_1_kakao_mvp.md 상세 계획 작성
   # 2. Supabase 프로젝트 생성
   # 3. Next.js 프로젝트 초기화
   # 4. 첫 배포 (Vercel)
   ```

2. **고령층 테스트 모집**
   - 70~85세, 5명 이상
   - 카카오톡 사용 가능
   - 주 1회 피드백

3. **지자체 파일럿 준비**
   - Phase 3 완료 후
   - 1개 구청과 협력

---

**문서 마지막 업데이트**: 2026-05-29 17:40 KST  
**현재 상태**: Phase 0 완료, Phase 1 준비 중  
**다음 체크포인트**: Phase 1 완료 (1주)
