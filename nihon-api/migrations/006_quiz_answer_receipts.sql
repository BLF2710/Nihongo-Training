-- One receipt per user/submission protects restored Kana answers from double counting.
CREATE TABLE IF NOT EXISTS quiz_answer_receipts (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL,
  character_type TEXT NOT NULL CHECK (character_type IN ('hiragana', 'katakana')),
  kana_id INTEGER NOT NULL,
  answer TEXT NOT NULL,
  response JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, submission_id)
);
