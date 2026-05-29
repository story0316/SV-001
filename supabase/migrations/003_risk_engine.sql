-- Phase 4: AI Risk Engine DB 확장

-- clients 테이블: 위험 요인 캐시 + 인지 오류율 컬럼 추가
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS last_risk_factors TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS cognition_error_rate FLOAT DEFAULT 0 CHECK (cognition_error_rate >= 0 AND cognition_error_rate <= 1);

-- risk_events: anomaly_score 컬럼 추가 (이상징후 점수 기록)
ALTER TABLE risk_events
  ADD COLUMN IF NOT EXISTS anomaly_score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS addressed_at TIMESTAMPTZ;

-- risk_events: high 레벨도 기록할 수 있도록 (기존에 critical만 기록했음)
-- (risk_level 컬럼은 이미 risk_level_enum 타입이므로 그대로 사용)

-- 인덱스: 복지사별 미처리 위험 이벤트 조회 최적화
CREATE INDEX IF NOT EXISTS idx_risk_events_addressed
  ON risk_events(is_addressed, detected_at DESC);

-- cognition_responses: 대상자별 최근 오류율 집계 뷰
CREATE OR REPLACE VIEW client_cognition_summary AS
SELECT
  client_id,
  COUNT(*) AS total_questions,
  SUM(CASE WHEN is_correct THEN 0 ELSE 1 END) AS wrong_count,
  ROUND(
    SUM(CASE WHEN is_correct THEN 0 ELSE 1 END)::NUMERIC / NULLIF(COUNT(*), 0),
    2
  ) AS error_rate,
  MAX(answered_at) AS last_answered_at
FROM cognition_responses
WHERE answered_at >= NOW() - INTERVAL '30 days'
GROUP BY client_id;

-- 위험도 이력 테이블 (Phase 4: 점수 변화 추적)
CREATE TABLE IF NOT EXISTS risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  scored_at DATE NOT NULL DEFAULT CURRENT_DATE,
  risk_score INT NOT NULL,
  risk_level risk_level_enum NOT NULL,
  no_response_days INT DEFAULT 0,
  anomaly_score INT DEFAULT 0,
  factors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, scored_at)
);

CREATE INDEX IF NOT EXISTS idx_risk_score_history_client
  ON risk_score_history(client_id, scored_at DESC);

-- RLS
ALTER TABLE risk_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers read own clients history" ON risk_score_history
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE assigned_worker_id = auth.uid()
    )
  );
