import { pool } from "../config/db";
import { awardXP } from "./xp.service";

const definitions = ["first_steps", "week_warrior", "vocabulary_starter", "japanese_beginner", "perfect_score"] as const;
export async function evaluateAchievements(userId: number) {
  const progress = await pool.query(`SELECT COUNT(*)::int AS lessons, COALESCE(MAX(challenge_score), 0)::int AS best_score,
    BOOL_OR(lesson_id = 'japanese-n5-unit-1-hello') AS completed_n5_unit_1 FROM lesson_progress WHERE user_id=$1`, [userId]);
  const game = await pool.query("SELECT current_streak FROM user_gamification WHERE user_id=$1", [userId]);
  // Vocabulary has no persisted vocabulary-item model yet; it remains unavailable until that existing curriculum data exists.
  const checks: Record<string, boolean> = { first_steps: progress.rows[0].lessons > 0, japanese_beginner: progress.rows[0].completed_n5_unit_1 === true, perfect_score: progress.rows[0].best_score === 100, week_warrior: Number(game.rows[0]?.current_streak) >= 7, vocabulary_starter: false };
  const newlyEarned: string[] = [];
  for (const id of definitions) if (checks[id]) {
    const earned = await pool.query("INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING achievement_id", [userId, id]);
    if (earned.rowCount) { const reward = await pool.query("SELECT xp_reward FROM achievements WHERE id=$1", [id]); await awardXP(userId, Number(reward.rows[0].xp_reward), "achievement", id); newlyEarned.push(id); }
  }
  return newlyEarned;
}
