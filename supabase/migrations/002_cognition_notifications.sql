-- =============================================================
-- Phase 2: 인지 체크 + 보호자 알림
-- =============================================================

-- 인지 체크 응답 기록
CREATE TABLE cognition_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id),
  question_id TEXT NOT NULL,
  question_type TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cognition_client ON cognition_responses(client_id, answered_at DESC);

-- 인지 오류율 컬럼 추가 (clients 테이블 확장)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cognition_error_rate NUMERIC(4,3) DEFAULT 0;

-- RLS: 복지사는 자신의 담당 대상자 인지 기록만 접근
ALTER TABLE cognition_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY worker_read_cognition
  ON cognition_responses FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE assigned_worker_id = auth.uid()
    )
  );
