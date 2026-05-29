# 개발 Phase 계획

# Document Metadata
- Document ID: PLANNING-PHASE-009
- Title: Development Phase Plan (Roadmap)
- Owner: Product Manager
- Created At: 2026-05-29 17:40 KST
- Last Updated At: 2026-05-29 17:40 KST
- Current Version: v0.1
- Status: In Progress
- Related Files: product_vision.md, adr_001_stack_selection.md
- Primary Goal: Define 5-phase roadmap with dependencies
- Non-Goals: Detailed sprint planning (do per-phase)
- Success Metrics: All phases follow MD-Driven protocol

---

## 0. Phase 0: MD Framework 구축 (현재 진행중)

**목표**: 모든 설계 문서 초기 작성 완료

**결과물**:
- [ ] product_vision.md ✅
- [ ] user_personas.md ✅
- [ ] ux_principles.md ✅
- [ ] system_architecture.md ✅
- [ ] api_design.md ✅
- [ ] db_schema.md ✅
- [ ] notification_flow.md ✅
- [ ] adr_001_stack_selection.md ✅
- [ ] phase_plan.md ✅
- [ ] 모든 파일 Metadata + Change Log ✅

**기간**: 1시간 (토큰 최적화 + 인공지능)

**Success Criteria**:
- ✅ 9개 파일 완성
- ✅ 상호 참조 완벽
- ✅ Phase 1 코드 시작 가능한 수준

**다음**: Phase 1 시작 가능

---

## 1. Phase 1: KakaoTalk MVP (1주)

### 목표
> 고령층이 실제 사용 가능한 일일 안부 응답 시스템 + 보호자 상태 확인

### 스코프 포함
```
✅ KakaoTalk 채널 일일 안부 메시지 발송
✅ 고령층 버튼 응답 수집
✅ 응답 DB 저장
✅ 응답 완료 메시지 발송
✅ 기본 위험도 계산 (응답 여부만)
✅ 보호자 모바일 웹: 부모 상태 확인
✅ 응답 패턴 7일 도트
```

### 스코프 제외
```
❌ 인지 체크 미니게임 (Phase 2)
❌ 복지사 Dashboard (Phase 3)
❌ 위험 탐지 알고리즘 고도화 (Phase 4)
❌ B2G 리포팅 (Phase 5)
❌ 앱 설치 (웹만)
❌ 위치 기반 기능
```

### 필수 화면
```
Elder (KakaoTalk):
  K01: 일일 안부 메시지
  K03: 응답 완료 확인

Guardian (Mobile Web):
  G01: 홈 대시보드 (상태 + 7일 패턴)
  G02: 위험 알림 상세 (TBD in Phase 3)
```

### 필수 API
```
POST /api/kakao/messages        → 응답 수신
GET /api/guardian/status        → 상태 조회
GET /api/guardian/history       → 패턴 조회
```

### DB 변경
```
✅ users (역할: elder, guardian)
✅ clients (관리 대상자)
✅ daily_responses (일일 응답)
✅ guardians (보호자 관계)
```

### Success Criteria
```
✅ 실제 고령층 5명 이상 테스트 완료
✅ 응답률 ≥ 80% (3일 연속)
✅ 보호자 앱에서 실시간 상태 반영
✅ 오류율 < 5% (데이터 정합성)
```

### 위험 요소
```
- KakaoTalk API 할당량 초과 (모니터링)
- 고령층 UX 테스트 부족 (주 1회 테스트 필수)
- Supabase Realtime 지연 (최적화 필요)
```

### 결과 문서
```
phase_1_kakao_mvp.md (상세 설명)
├── Tech Implementation Details
├── Testing Plan
├── Real User Feedback
└── Next Phase Readiness Check
```

---

## 2. Phase 2: 보호자 알림 시스템 (1주)

### 목표
> 무응답 감지 → 보호자 자동 알림 → 심리적 안정감

### Phase 1 위에 추가
```
✅ 무응답 감지 알고리즘 (24h, 48h, 72h)
✅ 보호자에게 자동 알림 (PUSH + KakaoTalk)
✅ 알림 초안 자동 생성
✅ 알림 발송 이력 추적
✅ 인지 체크 미니게임 (K02 추가)
✅ 기본 위험 탐지 (n8n 자동화)
```

### 필수 화면
```
Guardian:
  G02: 위험 알림 상세

Elder:
  K02: 인지 체크 미니게임
```

### DB 변경
```
✅ risk_events (위험 탐지 기록)
✅ notifications (알림 발송 기록)
```

### Success Criteria
```
✅ 무응답 감지 정확도 ≥ 95%
✅ 알림 배달 시간 < 5분
✅ 보호자 앱 실시간 업데이트 < 2초
```

---

## 3. Phase 3: 복지사 Dashboard (2주)

### 목표
> 위험 우선순위 확인 → 빠른 조치 → 자동 기록

### Phase 1~2 위에 추가
```
✅ Today Dashboard (위험 우선순위)
✅ 대상자 상세 페이지
✅ 빠른 기록 입력 (팝업)
✅ 보호자 알림 발송 UI
✅ 위험 탐지 센터
✅ 일간 보고서 생성 (자동 초안)
✅ 모바일 + 웹 동시 지원
```

### 필수 화면
```
Welfare:
  W01: Today Dashboard (위험 우선순위)
  W02: 대상자 상세 페이지
  W03: 빠른 기록 입력 (모달)
  W04: 보호자 알림 발송 (모달)
  W05: 위험 탐지 센터
  W06: 일간 보고서
```

### 필수 API
```
GET /api/welfare/dashboard/today
GET /api/welfare/client/:clientId
POST /api/welfare/contact/:clientId
POST /api/welfare/guardian-notify
```

### DB 변경
```
✅ contact_logs (연락 기록)
✅ action_records (조치 기록)
```

### Success Criteria
```
✅ 대상자당 관리 시간 30분 → 15분 단축
✅ 기록 시간 0분 (팝업으로 30초)
✅ 위험 우선순위 정확도 ≥ 85%
✅ 실제 복지사 2명 이상 현장 테스트
```

---

## 4. Phase 4: 위험 탐지 엔진 고도화 (2주)

### 목표
> AI 기반 이상징후 자동 탐지 + False Positive 최소화

### Phase 3 위에 추가
```
✅ 복합 위험도 알고리즘 (다중 요인)
✅ 응답 패턴 분석 (시계열)
✅ 계절/날씨 요인 추가
✅ ML 기반 이상 탐지 (향후)
✅ 위험 탐지 센터 고도화
✅ False Positive 피드백 루프
```

### Success Criteria
```
✅ False Positive < 15%
✅ 위험 탐지 정확도 ≥ 85%
✅ 복지사 만족도 ≥ 4/5
```

---

## 5. Phase 5: B2G Reporting (2주)

### 목표
> 지자체 보고서 자동화 + 정책 지표 제공

### 포함
```
✅ 월간 통계 자동 생성
✅ 기관별 비교 분석
✅ 정책 지표 (고독사 감소율 등)
✅ PDF/Excel 내보내기
✅ Admin Dashboard
✅ 수정/재발송 가능한 워크플로우
```

### 화면
```
Admin:
  A01: B2G 통합 대시보드
  A02: 월간/년간 리포트
  A03: 기관별 현황
```

### Success Criteria
```
✅ 지자체에서 받을 수 있는 형식 확보
✅ 월간 리포트 자동 생성 시간 < 5분
✅ 1개 지자체 파일럿 진행
```

---

## 6. 전체 Dependencies 맵

```
Phase 0 (MD Framework)
     ↓
   ┌─┴─┐
   ▼   └─ Phase 1 (KakaoTalk MVP)
  Phase 2     ↓ 필요: K01, K03, G01
(Guardian)   └─ Phase 3 (Welfare Dashboard)
   ↓             ↓ 필요: W01~W06
   └─────────────┴─ Phase 4 (Risk Engine)
                    ↓
                 Phase 5 (B2G Reporting)
                    ↓
              전국 확대 (미래)
```

---

## 7. 각 Phase 완료 기준 (Definition of Done)

### Phase 결과물
```
각 Phase 완료 시:
  ✅ phase_X_detail.md 작성 (상세 사항)
  ✅ 모든 md 문서 Status = Stable
  ✅ 코드 구현 100% 완료
  ✅ 테스트 커버리지 ≥ 80%
  ✅ 실제 사용자 테스트 (1주 최소)
  ✅ 보안 감시 완료 (secret scan)
  ✅ 성능 테스트 통과
  ✅ 배포 확인 (Staging + 상태 점검)
```

### Phase 이전 기준
```
다음 Phase 시작 전:
  ✅ 이전 Phase md 재검토
  ✅ 변경사항 Deprecated 처리
  ✅ 새 Phase 세부 계획 작성
  ✅ 팀 동의 확보
```

---

## 8. 토큰 최적화 & MD-Driven 운영

### 매 Phase 마다:
```
1. 시작 전
   → phase_X_detail.md 작성 (한 번)
   → 문서 기반 코딩만 진행

2. 진행 중
   → Daily: Change Log 업데이트
   → Weekly: 문서와 코드 동기화 확인
   → MD 변경 → 코드 수정

3. 완료 후
   → Status: Stable로 변경
   → Related docs 버전 증가
   → 다음 Phase 계획 정리
```

---

## 9. Timeline Summary

```
Week 1:  Phase 0 (MD Framework) + Phase 1 Start
Week 2:  Phase 1  완료 + Phase 2 시작
Week 3:  Phase 2 완료 + Phase 3 시작
Week 4:  Phase 3 진행중
Week 5:  Phase 3 완료 + Phase 4 시작
Week 6:  Phase 4 진행중
Week 7:  Phase 4 완료 + Phase 5 시작
Week 8:  Phase 5 완료 + 최종 점검

총 8주 (약 2개월)
```

---

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 17:40 | PM | Initial phase roadmap | Guide all 5 phases |

---

## Related References
- See: `product_vision.md` (제품 전략)
- See: `system_architecture.md` (기술 구조)
