-- =============================================================
-- SilverCare Platform — Initial Schema
-- Phase 1: KakaoTalk MVP
-- 참조: docs/architecture/db_schema.md
-- =============================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- ENUMS
-- =============================================================

CREATE TYPE user_role AS ENUM ('elder', 'welfare_worker', 'guardian', 'admin');
CREATE TYPE risk_level AS ENUM ('critical', 'high', 'medium', 'safe');
CREATE TYPE response_status AS ENUM ('sent', 'delivered', 'read', 'responded', 'timeout');
CREATE TYPE contact_result AS ENUM ('completed', 'missed', 'rejected', 'unreachable');

-- =============================================================
-- TABLE: users (고령층 + 복지사 + 보호자)
-- =============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  email TEXT,
  phone TEXT, -- 암호화 저장 권장 (Supabase Vault)
  name TEXT NOT NULL,
  age INTEGER,
  district TEXT, -- 동(洞) 단위만 저장
  kakao_id TEXT, -- 고령층 카카오 ID
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- soft delete
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kakao_id ON users(kakao_id) WHERE kakao_id IS NOT NULL;

-- =============================================================
-- TABLE: clients (관리 대상자 — 고령층)
-- =============================================================

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT,
  address TEXT, -- 동(洞) 단위만
  kakao_id TEXT, -- KakaoTalk 연동용
  organization_id UUID,
  assigned_worker_id UUID REFERENCES users(id),
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level risk_level NOT NULL DEFAULT 'safe',
  last_response_date DATE,
  last_response_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_clients_risk ON clients(risk_level, risk_score DESC);
CREATE INDEX idx_clients_org ON clients(organization_id, risk_level);
CREATE INDEX idx_clients_kakao ON clients(kakao_id) WHERE kakao_id IS NOT NULL;
CREATE INDEX idx_clients_worker ON clients(assigned_worker_id);

-- =============================================================
-- TABLE: guardians (보호자 ↔ 고령층 관계)
-- =============================================================

CREATE TABLE guardians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guardian_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  relationship TEXT NOT NULL DEFAULT 'other', -- son/daughter/other
  "primary" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(guardian_id, client_id)
);

CREATE INDEX idx_guardians_guardian ON guardians(guardian_id);
CREATE INDEX idx_guardians_client ON guardians(client_id);

-- =============================================================
-- TABLE: daily_responses (일일 안부 응답)
-- =============================================================

CREATE TABLE daily_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  response_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_value TEXT, -- 'yes' | 'no'
  status response_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, response_date)
);

CREATE INDEX idx_daily_responses_client_date
  ON daily_responses(client_id, response_date DESC);

-- =============================================================
-- TABLE: contact_logs (복지사 연락 기록)
-- =============================================================

CREATE TABLE contact_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  worker_id UUID NOT NULL REFERENCES users(id),
  contact_type TEXT NOT NULL, -- 'phone' | 'visit' | 'auto_message'
  contact_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  result contact_result,
  duration_minutes INTEGER,
  notes TEXT,
  voice_memo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_logs_client ON contact_logs(client_id, contact_date DESC);

-- =============================================================
-- TABLE: action_records (복지사 조치 기록)
-- =============================================================

CREATE TABLE action_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_log_id UUID NOT NULL REFERENCES contact_logs(id),
  status TEXT NOT NULL, -- 'normal' | 'warning' | 'danger'
  actions TEXT[] NOT NULL DEFAULT '{}',
  next_contact_scheduled TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: risk_events (위험 탐지 기록)
-- =============================================================

CREATE TABLE risk_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  risk_score INTEGER NOT NULL,
  risk_level risk_level NOT NULL,
  risk_factors TEXT[] NOT NULL DEFAULT '{}',
  is_addressed BOOLEAN NOT NULL DEFAULT false,
  addressed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_events_client ON risk_events(client_id, detected_at DESC);

-- =============================================================
-- TABLE: notifications (알림 발송 기록)
-- =============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES users(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  type TEXT NOT NULL, -- 'unresponsive' | 'risk_alert' | 'action_needed'
  channel TEXT NOT NULL, -- 'push' | 'email' | 'sms' | 'kakao'
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  is_auto_generated BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, sent_at DESC);

-- =============================================================
-- FUNCTION: updated_at 자동 갱신 트리거
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_daily_responses
  BEFORE UPDATE ON daily_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_contact_logs
  BEFORE UPDATE ON contact_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_action_records
  BEFORE UPDATE ON action_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- 참조: docs/architecture/db_schema.md#4-row-level-security
-- =============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 보호자: 자신의 부모(clients)만 조회 가능
CREATE POLICY guardian_read_own_client
  ON clients FOR SELECT
  USING (
    id IN (
      SELECT client_id FROM guardians
      WHERE guardian_id = auth.uid()
    )
  );

-- 보호자: 부모의 응답 기록만 조회 가능
CREATE POLICY guardian_read_own_responses
  ON daily_responses FOR SELECT
  USING (
    client_id IN (
      SELECT client_id FROM guardians
      WHERE guardian_id = auth.uid()
    )
  );

-- 서버(service role)는 모든 접근 가능 (API route에서 사용)
-- SUPABASE_SERVICE_ROLE_KEY 사용 시 RLS 우회됨

-- =============================================================
-- SEED DATA (개발용 테스트 데이터)
-- =============================================================

-- 테스트 복지사
INSERT INTO users (id, role, name, email, phone, age, district)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'welfare_worker',
  '이민지',
  'worker@test.com',
  '010-1234-5678',
  34,
  '강서구'
);

-- 테스트 고령층 (김순자)
INSERT INTO clients (
  id, name, age, phone, address, kakao_id,
  assigned_worker_id, risk_score, risk_level
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  '김순자',
  78,
  '010-9999-8888',
  '강서구 화곡동',
  'kakao_test_01', -- 실제 운영 시 실제 카카오 ID로 교체
  'a0000000-0000-0000-0000-000000000001',
  45,
  'medium'
);

-- 테스트 보호자 (박성민)
INSERT INTO users (id, role, name, email, phone, age)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'guardian',
  '박성민',
  'guardian@test.com',
  '010-1111-2222',
  52
);

-- 보호자 ↔ 고령층 관계
INSERT INTO guardians (guardian_id, client_id, relationship, "primary")
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'son',
  true
);

-- 최근 7일 응답 기록 (테스트용)
INSERT INTO daily_responses (client_id, response_date, responded_at, response_value, status)
VALUES
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 6, NOW() - INTERVAL '6 days' + INTERVAL '9 hours 15 minutes', 'yes', 'responded'),
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 5, NOW() - INTERVAL '5 days' + INTERVAL '9 hours 22 minutes', 'yes', 'responded'),
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 4, NOW() - INTERVAL '4 days' + INTERVAL '9 hours 5 minutes',  'yes', 'responded'),
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 3, NULL, NULL, 'timeout'),
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 2, NOW() - INTERVAL '2 days' + INTERVAL '9 hours 30 minutes', 'yes', 'responded'),
  ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, NOW() - INTERVAL '1 day'  + INTERVAL '9 hours 10 minutes', 'yes', 'responded');
