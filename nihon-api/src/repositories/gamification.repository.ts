import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export async function getXp(userId: number): Promise<number> {
  const result = await pool.query("SELECT xp FROM user_gamification WHERE user_id=$1", [userId]);
  return Number(result.rows[0]?.xp ?? 0);
}

export async function getCurrentStreak(userId: number): Promise<number> {
  const result = await pool.query("SELECT current_streak FROM user_gamification WHERE user_id=$1", [userId]);
  return Number(result.rows[0]?.current_streak);
}

/** Row-locks the user's XP for the surrounding transaction; null when the user has no gamification profile. */
export async function lockXp(userId: number, db: Queryable): Promise<number | null> {
  const result = await db.query("SELECT xp FROM user_gamification WHERE user_id=$1 FOR UPDATE", [userId]);
  return result.rows[0] ? Number(result.rows[0].xp) : null;
}

/** Records the event once per (user, source, reference); false when it was already recorded. */
export async function insertXpEvent(db: Queryable, userId: number, amount: number, source: string, referenceId: string): Promise<boolean> {
  const result = await db.query(
    "INSERT INTO xp_events (user_id, amount, source, reference_id) VALUES ($1,$2,$3,$4) ON CONFLICT (user_id,source,reference_id) DO NOTHING RETURNING id",
    [userId, amount, source, referenceId]
  );
  return Boolean(result.rowCount);
}

export async function addXp(db: Queryable, userId: number, amount: number): Promise<number> {
  const result = await db.query("UPDATE user_gamification SET xp=xp+$1, updated_at=NOW() WHERE user_id=$2 RETURNING xp", [amount, userId]);
  return Number(result.rows[0].xp);
}
