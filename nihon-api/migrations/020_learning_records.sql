-- Spaced repetition, the mistake notebook, saved mock exam results and daily study time.

-- One card per learner and item (a word from a completed lesson, or a kanji), scheduled with an SM-2 style algorithm.
CREATE TABLE IF NOT EXISTS srs_cards (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('vocabulary', 'kanji')),
  item_id VARCHAR(200) NOT NULL,
  ease NUMERIC(4, 2) NOT NULL DEFAULT 2.5 CHECK (ease BETWEEN 1.3 AND 3.5),
  interval_days NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  repetitions INTEGER NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  lapses INTEGER NOT NULL DEFAULT 0 CHECK (lapses >= 0),
  due_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, item_type, item_id)
);
CREATE INDEX IF NOT EXISTS idx_srs_cards_due ON srs_cards (user_id, due_at);

-- Every review, for statistics and the daily limit on new cards.
CREATE TABLE IF NOT EXISTS srs_reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  item_id VARCHAR(200) NOT NULL,
  grade VARCHAR(10) NOT NULL CHECK (grade IN ('again', 'hard', 'good', 'easy')),
  was_new BOOLEAN NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_user_time ON srs_reviews (user_id, reviewed_at);

-- Questions the learner got wrong, kept until answered correctly twice in a row.
CREATE TABLE IF NOT EXISTS mistakes (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source VARCHAR(20) NOT NULL CHECK (source IN ('lesson', 'review', 'assessment', 'mock_exam')),
  item_key VARCHAR(200) NOT NULL,
  -- What to show when practising: prompt, options, the correct answer, the learner's answer, an explanation.
  payload JSONB NOT NULL,
  wrong_count INTEGER NOT NULL DEFAULT 1 CHECK (wrong_count >= 1),
  correct_streak INTEGER NOT NULL DEFAULT 0 CHECK (correct_streak >= 0),
  first_wrong_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_wrong_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (user_id, item_key)
);
CREATE INDEX IF NOT EXISTS idx_mistakes_open ON mistakes (user_id, last_wrong_at DESC) WHERE resolved_at IS NULL;

-- Mock exam results, graded on the server.
CREATE TABLE IF NOT EXISTS mock_exam_results (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_level VARCHAR(4) NOT NULL CHECK (course_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  correct INTEGER NOT NULL CHECK (correct >= 0),
  total INTEGER NOT NULL CHECK (total > 0 AND correct <= total),
  percent SMALLINT NOT NULL CHECK (percent BETWEEN 0 AND 100),
  passed BOOLEAN NOT NULL,
  timed_out BOOLEAN NOT NULL DEFAULT FALSE,
  sections JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mock_exam_results_user ON mock_exam_results (user_id, course_level, created_at DESC);

-- Active study time per learner and day (the learner's own calendar day), for the daily goal.
CREATE TABLE IF NOT EXISTS study_time (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  seconds INTEGER NOT NULL DEFAULT 0 CHECK (seconds BETWEEN 0 AND 86400),
  last_credited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day)
);
