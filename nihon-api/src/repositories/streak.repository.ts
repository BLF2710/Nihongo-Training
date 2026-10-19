import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

// A learner's "day" is the calendar date in their own time zone (user_profiles.time_zone).
const zoneOf = "COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = g.user_id), 'UTC')";
const today = `(NOW() AT TIME ZONE ${zoneOf})::date`;
const lastDay = `(g.last_activity_at AT TIME ZONE ${zoneOf})::date`;

/**
 * The streak as it stands now. The stored count only changes when the learner is active, so a streak whose last
 * active day is before yesterday has already ended and reads as 0. Use inside a query that names user_gamification `g`.
 */
export const EFFECTIVE_STREAK_SQL = `CASE WHEN g.last_activity_at IS NOT NULL AND ${lastDay} >= ${today} - 1 THEN g.current_streak ELSE 0 END`;
export const ACTIVE_TODAY_SQL = `COALESCE(${lastDay} = ${today}, FALSE)`;

/**
 * Counts today as an active day: the first activity of a day extends yesterday's streak by one or starts a new
 * streak of 1; further activity on the same day changes nothing.
 */
export async function recordActivity(db: Queryable, userId: number): Promise<{ currentStreak: number; longestStreak: number } | undefined> {
  const next = `CASE WHEN g.last_activity_at IS NOT NULL AND ${lastDay} = ${today} THEN GREATEST(g.current_streak, 1)
                     WHEN g.last_activity_at IS NOT NULL AND ${lastDay} = ${today} - 1 THEN g.current_streak + 1
                     ELSE 1 END`;
  const result = await db.query(
    `UPDATE user_gamification g SET current_streak = ${next}, longest_streak = GREATEST(g.longest_streak, ${next}),
            last_activity_at = NOW(), updated_at = NOW()
      WHERE g.user_id = $1 RETURNING current_streak, longest_streak`, [userId]);
  const row = result.rows[0];
  return row && { currentStreak: Number(row.current_streak), longestStreak: Number(row.longest_streak) };
}

export async function getEffectiveStreak(userId: number): Promise<number> {
  const result = await pool.query(`SELECT ${EFFECTIVE_STREAK_SQL} AS streak FROM user_gamification g WHERE g.user_id = $1`, [userId]);
  return Number(result.rows[0]?.streak ?? 0);
}

/** True when PostgreSQL knows the time zone name, so day calculations can never fail on it. */
export async function isKnownTimeZone(zone: string): Promise<boolean> {
  const result = await pool.query("SELECT 1 FROM pg_timezone_names WHERE name = $1", [zone]);
  return Boolean(result.rowCount);
}

export async function setTimeZone(userId: number, zone: string) {
  await pool.query("UPDATE user_profiles SET time_zone = $2 WHERE user_id = $1", [userId, zone]);
}
