import { pool } from "../config/db";

export type GameScore = {
  gameType: string;
  score: number;
  accuracy: number;
  difficulty: string;
  timeTakenSeconds: number;
  sessionId: string | null;
};

/** Saves a finished game once per session; returns the new row ID, or null for a repeated session. */
export async function insertGameScore(userId: number, game: GameScore): Promise<number | null> {
  const result = await pool.query(
    `INSERT INTO user_game_scores
      (user_id, game_type, score, accuracy, difficulty, time_taken_seconds, session_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id, session_id) WHERE session_id IS NOT NULL DO NOTHING
     RETURNING id`,
    [userId, game.gameType, game.score, game.accuracy, game.difficulty, game.timeTakenSeconds, game.sessionId]
  );
  return (result.rowCount ?? 0) > 0 ? result.rows[0].id : null;
}

export async function gameScoresTableExists(): Promise<boolean> {
  const result = await pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'user_game_scores'
    )
  `);
  return result.rows[0].exists;
}

export async function getGameSummary(userId: number) {
  const result = await pool.query(
    `SELECT
      COUNT(*) AS total_games,
      COALESCE(SUM(score), 0) AS total_points,
      COALESCE(AVG(accuracy), 0) AS avg_accuracy,
      COALESCE(MAX(score), 0) AS best_score
    FROM user_game_scores
    WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

export async function listGameSummariesByType(userId: number) {
  const result = await pool.query(
    `SELECT
      game_type,
      COUNT(*) AS games_played,
      COALESCE(MAX(score), 0) AS high_score,
      COALESCE(AVG(accuracy), 0) AS avg_accuracy,
      COALESCE(SUM(score), 0) AS total_points
    FROM user_game_scores
    WHERE user_id = $1
    GROUP BY game_type
    ORDER BY game_type`,
    [userId]
  );
  return result.rows;
}

export async function listRecentGames(userId: number, limit: number) {
  const result = await pool.query(
    `SELECT
      game_type,
      score,
      accuracy,
      difficulty,
      time_taken_seconds,
      played_at
    FROM user_game_scores
    WHERE user_id = $1
    ORDER BY played_at DESC
    LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}
