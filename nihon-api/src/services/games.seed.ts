import { pool } from "../config/db";

export async function seedGameScoresTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_game_scores (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      game_type VARCHAR(50) NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      accuracy NUMERIC(5, 2) NOT NULL DEFAULT 0,
      difficulty VARCHAR(20) NOT NULL DEFAULT 'all',
      time_taken_seconds INTEGER NOT NULL DEFAULT 0,
      session_id VARCHAR(64),
      played_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

    ALTER TABLE user_game_scores
      ADD COLUMN IF NOT EXISTS session_id VARCHAR(64);

    CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON user_game_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON user_game_scores(game_type);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_game_scores_user_session
      ON user_game_scores(user_id, session_id)
      WHERE session_id IS NOT NULL;
  `);

  console.log("✅ user_game_scores table created/verified.");
}

// Auto-run on import
seedGameScoresTable().catch(console.error);
