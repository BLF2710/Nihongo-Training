-- Speaking test results (GRADING.md). Recordings are never stored: only the transcript, scores and feedback.
CREATE TABLE IF NOT EXISTS speaking_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id VARCHAR(80) NOT NULL,
  course_level VARCHAR(4) NOT NULL CHECK (course_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  band SMALLINT NOT NULL CHECK (band BETWEEN 1 AND 4),
  met BOOLEAN NOT NULL,
  delivery_source VARCHAR(10) NOT NULL CHECK (delivery_source IN ('azure', 'browser')),
  transcript VARCHAR(4000) NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_speaking_attempts_user_task ON speaking_attempts (user_id, task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_speaking_attempts_user_time ON speaking_attempts (user_id, created_at);
