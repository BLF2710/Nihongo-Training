import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

// A learner's "day" is the calendar date in their own time zone, as for the streak.
const zone = "COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = $1), 'UTC')";
const today = `(NOW() AT TIME ZONE ${zone})::date`;
const MAX_SECONDS_PER_DAY = 86400;
/** Same as the column default in user_profiles. */
const DEFAULT_DAILY_GOAL_MINUTES = 10;

/**
 * When study time was last credited (on any day), with the database's current time so both come from one clock.
 * Locks the learner's latest row so parallel reports queue up.
 */
export async function findLastCredit(db: Queryable, userId: number): Promise<{ lastCreditedAt: Date | undefined; now: Date }> {
  const last = await db.query("SELECT last_credited_at FROM study_time WHERE user_id = $1 ORDER BY last_credited_at DESC LIMIT 1 FOR UPDATE", [userId]);
  const clock = await db.query("SELECT NOW() AS now");
  return { lastCreditedAt: last.rows[0]?.last_credited_at, now: clock.rows[0].now };
}

export async function addStudySeconds(db: Queryable, userId: number, seconds: number): Promise<number> {
  const result = await db.query(
    `INSERT INTO study_time (user_id, day, seconds, last_credited_at) VALUES ($1, ${today}, LEAST($2, ${MAX_SECONDS_PER_DAY}), NOW())
     ON CONFLICT (user_id, day) DO UPDATE SET seconds = LEAST(study_time.seconds + $2, ${MAX_SECONDS_PER_DAY}), last_credited_at = NOW()
     RETURNING seconds`, [userId, seconds]);
  return result.rows[0].seconds;
}

/** Marks a report as received without adding time, so the next report is measured from now. */
export async function touchLastCredited(db: Queryable, userId: number) {
  await db.query(`INSERT INTO study_time (user_id, day, last_credited_at) VALUES ($1, ${today}, NOW())
                  ON CONFLICT (user_id, day) DO UPDATE SET last_credited_at = NOW()`, [userId]);
}

export async function getSecondsToday(userId: number): Promise<number> {
  const result = await pool.query(`SELECT seconds FROM study_time WHERE user_id = $1 AND day = ${today}`, [userId]);
  return result.rows[0]?.seconds ?? 0;
}

/** Seconds per day for the last `days` days (learner's days, oldest first), including days without study. */
export async function listDailySeconds(userId: number, days: number): Promise<{ day: string; seconds: number }[]> {
  const result = await pool.query(
    `SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(s.seconds, 0)::int AS seconds
       FROM generate_series(0, $2::int - 1) AS offsets(n)
       CROSS JOIN LATERAL (SELECT ${today} - offsets.n AS day) d
       LEFT JOIN study_time s ON s.user_id = $1 AND s.day = d.day
      ORDER BY d.day`, [userId, days]);
  return result.rows;
}

/** The learner's daily goal in minutes (Settings). */
export async function getDailyGoalMinutes(userId: number): Promise<number> {
  const result = await pool.query("SELECT daily_goal FROM user_profiles WHERE user_id = $1", [userId]);
  return result.rows[0]?.daily_goal ?? DEFAULT_DAILY_GOAL_MINUTES;
}
