import { pool } from "../config/db";

/** The challengers the learner has beaten, first win first. */
export async function listChallengerWins(userId: number): Promise<string[]> {
  const result = await pool.query("SELECT challenger_id FROM wild_challenger_wins WHERE user_id = $1 ORDER BY won_at, challenger_id", [userId]);
  return result.rows.map(row => row.challenger_id);
}

/** Records a win; true when it is the learner's first against this challenger. */
export async function addChallengerWin(userId: number, challengerId: string): Promise<boolean> {
  const result = await pool.query("INSERT INTO wild_challenger_wins (user_id, challenger_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, challengerId]);
  return result.rowCount === 1;
}
