-- Additive Kanji-only data; Kana, lesson, assessment and XP tables are unchanged.
CREATE TABLE IF NOT EXISTS kanji_catalog (
  id VARCHAR(32) PRIMARY KEY,
  character TEXT NOT NULL UNIQUE
);
INSERT INTO kanji_catalog (id, character) VALUES
('kanji-65e5', '日'),
('kanji-672c', '本'),
('kanji-4eba', '人'),
('kanji-6c34', '水'),
('kanji-7236', '父'),
('kanji-6bcd', '母'),
('kanji-5b66', '学'),
('kanji-751f', '生'),
('kanji-5148', '先'),
('kanji-98df', '食')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_kanji_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji_id VARCHAR(32) NOT NULL REFERENCES kanji_catalog(id),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count INTEGER NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  last_practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kanji_id)
);
CREATE TABLE IF NOT EXISTS kanji_practice_questions (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji_id VARCHAR(32) NOT NULL REFERENCES kanji_catalog(id),
  kind TEXT NOT NULL CHECK (kind IN ('meaning', 'reading', 'vocabulary')),
  options JSONB NOT NULL CHECK (jsonb_array_length(options) = 4),
  correct_index SMALLINT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  answer_index SMALLINT CHECK (answer_index BETWEEN 0 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  answered_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS kanji_practice_user_created ON kanji_practice_questions(user_id, created_at);
