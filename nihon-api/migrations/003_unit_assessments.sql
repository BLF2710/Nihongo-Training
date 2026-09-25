-- Additive: lesson progress, XP events, and existing learning data remain intact.
CREATE TABLE IF NOT EXISTS user_assessment_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id VARCHAR(120) NOT NULL,
  best_score NUMERIC(5,2) NOT NULL CHECK (best_score BETWEEN 0 AND 100),
  last_score NUMERIC(5,2) NOT NULL CHECK (last_score BETWEEN 0 AND 100),
  passed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, assessment_id)
);
