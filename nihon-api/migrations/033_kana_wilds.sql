-- Kana Wilds (docs/KANA-BATTLE.md): the hiragana a learner has collected, and finished battles as practice sessions.
-- A collection starts with the five vowels and one starter consonant (origin 'starter'); wild kana caught in battle
-- are added with origin 'caught'.
CREATE TABLE IF NOT EXISTS moji_collection (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kana_id INTEGER NOT NULL REFERENCES hiraganas(id),
  origin VARCHAR(10) NOT NULL CHECK (origin IN ('starter', 'caught')),
  caught_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, kana_id)
);

DO $$
DECLARE constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT con.conname FROM pg_constraint con
     WHERE con.conrelid = 'practice_sessions'::regclass AND con.contype = 'c' AND pg_get_constraintdef(con.oid) LIKE '%kind%'
  LOOP
    EXECUTE format('ALTER TABLE practice_sessions DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;
ALTER TABLE practice_sessions ADD CONSTRAINT practice_sessions_kind_check
  CHECK (kind IN ('listening', 'speaking', 'reading', 'mock-exam', 'particles', 'errands', 'battle'));
