import { pool } from "../config/db";

export async function listEarnedAchievements(userId: number) {
  const result = await pool.query(
    "SELECT a.id, a.title, a.description, a.xp_reward, ua.earned_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=$1 ORDER BY ua.earned_at DESC",
    [userId]
  );
  return result.rows;
}

/** Grants the achievement once; false when the user already had it. */
export async function grantAchievement(userId: number, achievementId: string): Promise<boolean> {
  const result = await pool.query(
    "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING achievement_id",
    [userId, achievementId]
  );
  return Boolean(result.rowCount);
}

export async function getAchievementReward(achievementId: string): Promise<number> {
  const result = await pool.query("SELECT xp_reward FROM achievements WHERE id=$1", [achievementId]);
  return Number(result.rows[0].xp_reward);
}
