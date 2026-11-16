-- Kana Wilds challengers (docs/WORLD.md milestone 3): the island cast the learner has beaten in a challenge. A win
-- opens the next wild path. Challenger ids are checked by the API (kana-wilds.service.ts), so adding one needs no
-- migration.
CREATE TABLE IF NOT EXISTS wild_challenger_wins (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenger_id VARCHAR(20) NOT NULL,
  won_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, challenger_id)
);
