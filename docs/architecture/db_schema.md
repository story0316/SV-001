# 데이터베이스 스키마

# Document Metadata
- Document ID: ARCH-DB-006
- Title: Database Schema
- Owner: Database Architect
- Created At: 2026-05-29 17:25 KST
- Last Updated At: 2026-05-29 17:25 KST
- Current Version: v0.1
- Status: In Progress
- Related Files: system_architecture.md, api_design.md
- Primary Goal: Define all database tables and relationships
- Non-Goals: SQL implementation (Supabase migrations)

---

## 1. Core Tables

### users
```
id (UUID, PK)
role: 'elder' | 'welfare_worker' | 'guardian' | 'admin'
email: string
phone: string (encrypted)
name: string
age: integer
district: string (encrypted, 동 단위만)
kakao_id: string (nullable, elder only)
organization_id: UUID (FK)
created_at: timestamp
updated_at: timestamp
deleted_at: timestamp (soft delete)
```

### clients (관리 대상자)
```
id (UUID, PK)
name: string
age: integer
phone: string (encrypted)
address: string (동 단위만)
organization_id: UUID (FK)
assigned_worker_id: UUID (FK to users)
risk_score: integer (0-100, 역정규화)
risk_level: 'critical' | 'high' | 'medium' | 'safe'
last_response_date: date
last_response_time: timestamp
created_at: timestamp
updated_at: timestamp
deleted_at: timestamp
```

### daily_responses (일일 응답)
```
id (UUID, PK)
client_id: UUID (FK)
response_date: date
sent_at: timestamp
delivered_at: timestamp (nullable)
read_at: timestamp (nullable)
responded_at: timestamp (nullable)
response_value: 'yes' | 'no' (nullable)
timeout_at: timestamp (nullable)
created_at: timestamp
updated_at: timestamp
```

### contact_logs (연락 기록)
```
id (UUID, PK)
client_id: UUID (FK)
worker_id: UUID (FK)
contact_type: 'phone' | 'visit' | 'auto_message'
contact_date: timestamp
result: 'completed' | 'missed' | 'rejected' | 'unreachable'
duration_minutes: integer (nullable)
notes: text (nullable)
voice_memo_url: string (nullable)
created_at: timestamp
updated_at: timestamp
```

### action_records (조치 기록)
```
id (UUID, PK)
contact_log_id: UUID (FK)
status: 'normal' | 'warning' | 'danger'
actions: text[] (array of actions)
next_contact_scheduled: timestamp
created_at: timestamp
updated_at: timestamp
```

### risk_events (위험 탐지)
```
id (UUID, PK)
client_id: UUID (FK)
detected_at: timestamp
risk_score: integer (0-100)
risk_level: 'critical' | 'high' | 'medium' | 'safe'
risk_factors: text[] (배열)
is_addressed: boolean (조치 완료 여부)
addressed_at: timestamp (nullable)
created_at: timestamp
```

### notifications (알림 발송 기록)
```
id (UUID, PK)
recipient_id: UUID (FK to users)
client_id: UUID (FK)
type: 'unresponsive' | 'risk_alert' | 'action_needed'
channel: 'push' | 'email' | 'sms' | 'kakao'
message: text
sent_at: timestamp
read_at: timestamp (nullable)
is_auto_generated: boolean
created_at: timestamp
```

### guardians (보호자-고령층 관계)
```
id (UUID, PK)
guardian_id: UUID (FK to users, role='guardian')
client_id: UUID (FK)
relationship: 'son' | 'daughter' | 'other'
primary: boolean (주 연락자 여부)
created_at: timestamp
```

---

## 2. Indices

### Performance Critical
```
clients(risk_level, risk_score)       → 대시보드 정렬
clients(organization_id, risk_level)  → 조직별 필터
daily_responses(client_id, response_date)
contact_logs(client_id, contact_date DESC)
risk_events(client_id, detected_at DESC)
notifications(recipient_id, sent_at DESC)
guardians(guardian_id, client_id)
```

---

## 3. Soft Delete Policy

모든 테이블에 `deleted_at: timestamp (nullable)` 필드 포함.

```sql
-- 모든 SELECT는 자동으로 deleted_at IS NULL 필터링
-- RLS 정책에서 구현
```

---

## 4. Row Level Security (RLS)

### 복지사
```
users 테이블:
  - 자신의 레코드만 SELECT 가능

clients:
  - assigned_worker_id = current_user_id 인 레코드만 접근

contact_logs, action_records, risk_events:
  - 자신이 담당하는 client 관련 기록만 접근
```

### 보호자
```
clients:
  - 자신의 부모(guardians 테이블 참고) 레코드만 조회 가능
  - UPDATE 불가

daily_responses:
  - 자신의 부모 응답만 조회 가능
```

### 관리자
```
- 모든 테이블 접근 가능
- 통계/리포트 생성 권한
```

---

## 5. Audit Trail

모든 테이블에 자동으로:
```
created_at: timestamp
updated_at: timestamp (자동 갱신)
```

변경 이력 추적을 위해 향후:
```
audit_logs 테이블 추가
  - table_name
  - record_id
  - action (INSERT | UPDATE | DELETE)
  - changed_fields: jsonb
  - actor_id
  - timestamp
```

---

## Change Log

| Version | Date | Author | Changes | Expected Impact |
|---|---|---|---|---|
| v0.1 | 2026-05-29 17:25 | DB Arch | Initial schema design | Implement in Supabase |

---

## Related References
- See: `api_design.md` (API와 매핑)
- See: `system_architecture.md` (전체 구조)
