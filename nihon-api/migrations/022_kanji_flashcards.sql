-- Each learner's own list of kanji to study as flashcards (added from a kanji's page).
CREATE TABLE IF NOT EXISTS kanji_flashcards (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kanji_id VARCHAR(40) NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kanji_id)
);
