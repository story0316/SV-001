# 시스템 아키텍처

# Document Metadata
- Document ID: ARCH-SYSTEM-004
- Title: System Architecture
- Owner: CTO
- Created At: 2026-05-29 17:15 KST
- Last Updated At: 2026-05-29 17:15 KST
- Current Version: v0.1
- Status: In Progress
- Related Files:
  - api_design.md
  - db_schema.md
  - notification_flow.md
  - adr_001_stack_selection.md
- Primary Goal: Define overall system structure and data flow
- Non-Goals: Detailed code implementation
- Success Metrics: All components mapped and dependencies clear

---

## 1. 기술 스택 (확정)

### Frontend
```
Framework:  Next.js 14
Language:   TypeScript
Styling:    Tailwind CSS + shadcn/ui
State:      Server State (URL + Supabase)
Testing:    Jest + Playwright
Deploy:     Vercel
```

### Backend
```
Database:   Supabase (PostgreSQL)
Auth:       Supabase Auth
Realtime:   Supabase Realtime
Storage:    Supabase Storage
API:        REST + GraphQL (Supabase)
```

### Communication
```
KakaoTalk Bot:   Kakao Developers API
Push Notify:     Firebase Cloud Messaging
Email:           SendGrid
SMS:             NAVER Sens (선택)
```

### DevOps
```
Version Control: Git (GitHub)
CI/CD:          GitHub Actions
Monitoring:     Sentry + Datadog
Logging:        CloudWatch + Datadog
```

---

## 2. 전체 시스템 다이어그램

```
┌────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                            │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│  KakaoTalk API   │ Firebase Cloud   │  SendGrid        │  NAVER Sens   │
│  (고령층 채널)   │  Messaging       │  (이메일)        │  (SMS)         │
└────────┬─────────┴────────┬─────────┴────────┬─────────┴───────┬──────┘
         │                  │                  │                 │
         ▼                  ▼                  ▼                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY & LOGIC LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐   │
│  │  KakaoTalk Bot  │  │ Notification    │  │ Risk Detection     │   │
│  │  Handler        │  │ Service         │  │ Engine (n8n)       │   │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───────────┘   │
│           │                    │                    │                │
│           └────────────────────┼────────────────────┘                │
│                                ▼                                     │
│                    ┌─────────────────────────┐                      │
│                    │  Supabase REST API      │                      │
│                    │  + Realtime (WebSocket) │                      │
│                    └────────────┬────────────┘                      │
└───────────────────────────────────┼──────────────────────────────────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │   DATABASE LAYER (PostgreSQL)    │
                    │                                  │
                    │  ┌────────────────────────────┐ │
                    │  │ users (고령층/복지사)       │ │
                    │  │ clients (관리 대상자)        │ │
                    │  │ daily_responses (응답 기록)  │ │
                    │  │ contact_logs (연락 기록)     │ │
                    │  │ risk_events (위험 탐지)      │ │
                    │  │ action_records (조치 기록)   │ │
                    │  │ notifications (알림)         │ │
                    │  │ guardians (보호자)           │ │
                    │  └────────────────────────────┘ │
                    └────────────────────────────────┘
                                    ▲
                    ┌───────────────┼─────────────────┐
                    │               │                 │
         ┌──────────▼──────┐  ┌────▼─────────┐  ┌───▼────────────┐
         │  Elder Web      │  │  Guardian    │  │ Welfare        │
         │  (KakaoTalk)    │  │  Web/App     │  │ Dashboard      │
         │                 │  │  (Mobile)    │  │ (Web)          │
         │ - 일일 안부     │  │              │  │                │
         │ - 인지 체크     │  │ - 상태 확인  │  │ - 위험 리스트  │
         │ - 완료 확인     │  │ - 알림       │  │ - 상세 페이지  │
         └─────────────────┘  │ - 담당자연락 │  │ - 기록 입력    │
                              └──────────────┘  │ - 보고서       │
                                               └────────────────┘
```

---

## 3. 각 컴포넌트 설명

### 3-1. Frontend Layer

#### KakaoTalk Channel (Elder Interface)
```
역할: 70~85세 사용자의 주요 접점
기술: KakaoTalk Bot API (Kakao Developers)
상호작용:
  - Bot이 메시지 발송 (일일 정시)
  - 사용자가 버튼 탭
  - 응답 저장 → DB 저장
  - 감사 메시지 자동 발송

특징:
  - 앱 설치 불필요
  - 이미 익숙한 인터페이스
  - 오프라인 메시지 저장 가능
```

#### Guardian Web/App (Protector Interface)
```
역할: 40~60세 보호자의 모니터링
기술: Next.js + Tailwind + shadcn/ui
화면:
  - 부모 오늘 상태
  - 최근 7일 응답 패턴
  - 위험 알림 상세
  - 담당 복지사 정보

특징:
  - 모바일 웹 전용 (PWA 확장 가능)
  - 실시간 업데이트 (Supabase Realtime)
  - 푸시 알림 수신
```

#### Welfare Dashboard (Staff Interface)
```
역할: 복지사/지자체의 업무 시스템
기술: Next.js + 웹
화면:
  - Today Dashboard (위험 우선순위)
  - 대상자 상세 페이지
  - 빠른 기록 입력
  - 위험 탐지 센터
  - 일간 보고서 생성

특징:
  - 모바일 + 웹 동시 지원
  - 오프라인 모드 (로컬 저장)
  - 음성 입력 지원
```

---

### 3-2. Logic Layer

#### KakaoTalk Bot Handler
```
역할: 고령층 메시지 처리
구현: Supabase Edge Functions + Node.js
프로세스:
  1. 정시(오전 9시) 또는 리마인더 발송
  2. 사용자 응답 수신
  3. 응답 데이터 파싱
  4. daily_responses 테이블에 저장
  5. 위험도 재계산
  6. 감사 메시지 발송

상태 관리: 응답 상태 머신
  SENT → DELIVERED → READ → RESPONDED → (완료 or 타임아웃)
```

#### Notification Service
```
역할: 모든 알림 발송 (알림 엔진)
구현: Supabase Functions + 스케줄링
종류:
  1. 무응답 알림 (보호자)
  2. 위험도 상승 알림 (복지사)
  3. 조치 필요 알림 (복지사)
  4. 완료 알림 (복지사)

채널:
  - Push (Firebasecloud Messaging)
  - 이메일 (SendGrid)
  - SMS (NAVER Sens)
  - 카카오톡 (Kakao Developers)

정책: notification_flow.md 참고
```

#### Risk Detection Engine
```
역할: 위험도 자동 계산 및 탐지
구현: n8n (현재), 향후 ML로 고도화
알고리즘:
  위험도 = 무응답일수(×30%)
         + 응답패턴변화(×25%)
         + 인지체크이상(×20%)
         + 과거위험이력(×15%)
         + 계절/날씨요인(×10%)

분류:
  🔴 80+ : 즉시 조치 필요
  🟠 60-79: 오늘 중 연락
  🟡 40-59: 이번주 확인
  🟢 <40 : 정상 관찰

트리거:
  - 매일 06:00 전체 재계산
  - 응답 수신 후 즉시 재계산
  - 이상징후 감지 시 즉시 경고
```

---

### 3-3. Database Layer (Supabase PostgreSQL)

**핵심 테이블** (상세는 db_schema.md):
```
users              → 고령층 + 복지사 + 보호자 계정
clients            → 관리 대상자 (고령층)
daily_responses    → 일일 응답 기록
contact_logs       → 전화/방문 기록
risk_events        → 위험 탐지 기록
action_records     → 복지사 조치 기록
notifications      → 알림 발송 기록
guardians          → 보호자-고령층 관계
```

**실시간 기능**:
```
Supabase Realtime Subscriptions:
  - 새 위험 탐지 → 복지사 앱 즉시 반영
  - 응답 수신 → 보호자 앱 즉시 업데이트
  - 알림 발송 → 모든 클라이언트 동기화
```

---

## 4. 데이터 흐름 (Flow)

### Flow A: 고령층 일일 응답

```
1. 06:00 (자동 배치)
   └─ Risk Detection Engine: 오늘 발송 대상 결정

2. 09:00 (정시 발송)
   └─ KakaoTalk Bot: "오늘 아침 식사 하셨나요?" 메시지 발송
   └─ DB: daily_responses 생성 (status=SENT)

3. 09:15 (사용자 응답)
   └─ KakaoTalk API: 버튼 탭 수신
   └─ Bot Handler: 응답 파싱
   └─ DB: daily_responses 업데이트 (status=RESPONDED, timestamp=09:15)

4. 09:15 (즉시)
   └─ Risk Detection Engine: 위험도 재계산
   └─ 위험도 변화 감지 시 Notification Service 호출

5. 09:16 (자동)
   └─ KakaoTalk Bot: "감사해요" 메시지 발송
   └─ DB: 기록 자동 저장

6. 09:16 (자동)
   └─ Realtime Broadcast:
     ├─ Guardian App: "오늘 응답 완료 ✅" 표시
     └─ Welfare Dashboard: 위험도 업데이트
```

### Flow B: 복지사 조치 기록

```
1. 통화 종료 (복지사)
   └─ 대상자 상세 페이지에서 [기록하기] 탭

2. 팝업 모달 나타남
   ├─ 통화 결과 선택 (통화완료/부재중/거부)
   ├─ 현재 상태 선택 (정상/주의/위험)
   ├─ 취한 조치 선택 (안부/상담/방문 등)
   ├─ 메모 입력 (음성/텍스트)
   └─ 다음 연락 예정 (자동 제안)

3. [저장] 버튼
   └─ contact_logs 저장
   └─ action_records 저장
   └─ daily_responses 업데이트

4. 자동 처리
   ├─ AI 기반 보호자 알림 필요 여부 판단
   ├─ 필요 시 알림 초안 자동 생성
   └─ 복지사 검토 후 수동 발송

5. Realtime 업데이트
   ├─ Dashboard의 위험도 업데이트
   ├─ Guardian App에 "복지사 접촉 완료" 표시
   └─ 보고서 자동 집계
```

---

## 5. 보안 및 프라이버시

### 5-1. 인증 (Authentication)

```
복지사: Supabase Auth + Email/Password
        → 기관별 역할 기반 권한 (RBAC)

보호자: KakaoTalk 로그인 또는 이메일 + 링크
        → 자신의 부모 정보만 접근 가능

고령층: KakaoTalk 자동 인증
        → 기존 계정 기반
```

### 5-2. 권한 (Authorization)

```
고령층:
  - 자신의 응답 수정 불가 (기록 무결성)
  - 다른 사용자 정보 접근 불가

복지사:
  - 자신의 담당 대상자만 접근
  - 상위 역할(팀장/슈퍼바이저)의 감시 가능

보호자:
  - 자신의 부모 정보만 접근
  - 통화 기록, 의료 정보는 접근 불가

관리자:
  - 전체 통계 및 보고서 생성
  - 사용자 권한 관리
```

### 5-3. 데이터 보호

```
민감 정보:
  - 주민번호: 저장하지 않음 (사용 X)
  - 전화번호: 암호화 저장
  - 주소: 동(洞) 단위만 저장
  - 건강정보: MVP에서 저장하지 않음

Audit Log:
  - 모든 데이터 접근 기록
  - 변경 이력 추적
  - 삭제 불가 (soft delete만)
```

---

## 6. 확장성 고려사항

### 6-1 Scaling Strategy

```
현재 (MVP):
  - 1개 기관, 1명 복지사, 100명 고령층
  - Supabase 기본 플랜 (충분)

Phase 2:
  - 1개 기관, 10명 복지사, 1000명 고령층
  - Supabase Pro (필요 시)

Phase 3:
  - 10개 기관, 100명 복지사, 10,000명 고령층
  - 데이터베이스 샤딩 고려
  - CDN 추가 (이미지/정적 리소스)

Phase 4+:
  - 100개 기관+ (광역시/전국)
  - Supabase → PostgreSQL 자체 운영
  - API Gateway 추가
  - 캐싱 레이어 (Redis)
```

### 6-2 테넌트 격리

```
현재: 단일 테넌트
향후: 멀티 테넌트 아키텍처

RLS (Row Level Security) 적용:
  - 기관 ID 기반 자동 필터링
  - 복지사는 자신의 기관 데이터만 접근
  - 관리자도 권한 범위 내만 접근
```

---

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 17:15 | CTO | Initial system architecture | Define tech stack and component interactions |

---

## Related References
- See: `api_design.md` (API 엔드포인트)
- See: `db_schema.md` (데이터베이스 스키마)
- See: `notification_flow.md` (알림 로직)
- See: `adr_001_stack_selection.md` (기술 선택 근거)
