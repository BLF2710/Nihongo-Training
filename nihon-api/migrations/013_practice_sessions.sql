-- Finished practice sessions that run in the browser: listening and speaking rounds, reading passages and
-- mock exams. Each one counts toward the daily streak, and the totals feed the admin analytics.
CREATE TABLE IF NOT EXISTS practice_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('listening', 'speaking', 'reading', 'mock-exam')),
  -- The unit (japanese-n5-unit-4) or level (N5) practised.
  scope VARCHAR(120) NOT NULL,
  answered SMALLINT NOT NULL CHECK (answered > 0),
  correct SMALLINT NOT NULL CHECK (correct >= 0 AND correct <= answered),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_kind ON practice_sessions(kind, created_at DESC);
