import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export async function getXp(userId: number): Promise<number> {
  const result = await pool.query("SELECT xp FROM user_gamification WHERE user_id=$1", [userId]);
  return Number(result.rows[0]?.xp ?? 0);
}

export { getEffectiveStreak as getCurrentStreak } from "./streak.repository";

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

// A learner's day is the calendar date in their own time zone, as for streaks.
const LEARNER_ZONE = "COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = $1), 'UTC')";
const IS_LEARNER_TODAY = `(created_at AT TIME ZONE ${LEARNER_ZONE})::date = (NOW() AT TIME ZONE ${LEARNER_ZONE})::date`;

export async function sumXpToday(db: Queryable, userId: number, source: string): Promise<number> {
  const result = await db.query(`SELECT COALESCE(SUM(amount), 0)::int AS total FROM xp_events WHERE user_id = $1 AND source = $2 AND ${IS_LEARNER_TODAY}`, [userId, source]);
  return Number(result.rows[0].total);
}

export async function listXpTodayBySource(userId: number): Promise<{ source: string; earned: number }[]> {
  const result = await pool.query(`SELECT source, SUM(amount)::int AS earned FROM xp_events WHERE user_id = $1 AND ${IS_LEARNER_TODAY} GROUP BY source`, [userId]);
  return result.rows.map(row => ({ source: String(row.source), earned: Number(row.earned) }));
}

export async function getLearnerToday(userId: number): Promise<string> {
  const result = await pool.query(`SELECT to_char((NOW() AT TIME ZONE ${LEARNER_ZONE})::date, 'YYYY-MM-DD') AS today`, [userId]);
  return String(result.rows[0].today);
}

export async function listRecentXpEvents(userId: number, limit: number): Promise<{ source: string; amount: number; createdAt: Date }[]> {
  const result = await pool.query("SELECT source, amount, created_at FROM xp_events WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2", [userId, limit]);
  return result.rows.map(row => ({ source: String(row.source), amount: Number(row.amount), createdAt: row.created_at }));
}
