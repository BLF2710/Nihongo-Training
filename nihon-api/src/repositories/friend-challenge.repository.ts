import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import { AVATAR_PATH_SQL } from "./avatar.repository";
import { BLOCKED_EITHER_WAY_SQL } from "./learner-block.repository";

export type ChallengeMetric = "xp" | "lessons";
export type ChallengeStatus = "pending" | "active" | "declined" | "cancelled" | "finished";
export type ChallengeRow = {
  id: number; challenger_id: number; opponent_id: number; metric: ChallengeMetric; days: number; status: ChallengeStatus;
  created_at: Date; starts_at: Date | null; ends_at: Date | null; challenger_score: number | null; opponent_score: number | null;
};
export type ChallengeListRow = ChallengeRow & {
  challenger_username: string; challenger_name: string; challenger_avatar: string | null; opponent_username: string; opponent_name: string; opponent_avatar: string | null;
  live_challenger_score: number; live_opponent_score: number;
};

const COLUMNS = "c.id, c.challenger_id, c.opponent_id, c.metric, c.days, c.status, c.created_at, c.starts_at, c.ends_at, c.challenger_score, c.opponent_score";

// A learner's score in a running or finished challenge `c`, counted between its start and its end (or now).
const SCORE_SQL = (userColumn: string) => `CASE WHEN c.starts_at IS NULL THEN 0
  WHEN c.metric = 'xp' THEN COALESCE((SELECT SUM(x.amount) FROM xp_events x WHERE x.user_id = ${userColumn}
    AND x.created_at >= c.starts_at AND x.created_at < LEAST(c.ends_at, NOW())), 0)
  ELSE (SELECT COUNT(*) FROM lesson_progress l WHERE l.user_id = ${userColumn} AND l.completed_at >= c.starts_at AND l.completed_at < LEAST(c.ends_at, NOW()))
  END::int`;

export async function insertChallenge(db: Queryable, challenge: { challengerId: number; opponentId: number; metric: ChallengeMetric; days: number }): Promise<number> {
  const result = await db.query(
    "INSERT INTO friend_challenges (challenger_id, opponent_id, metric, days, status) VALUES ($1, $2, $3, $4, 'pending') RETURNING id",
    [challenge.challengerId, challenge.opponentId, challenge.metric, challenge.days]);
  return result.rows[0].id;
}

/** The pair's pending or running challenge, if any. */
export async function findOpenChallenge(db: Queryable, a: number, b: number): Promise<ChallengeRow | undefined> {
  const result = await db.query(
    `SELECT ${COLUMNS} FROM friend_challenges c WHERE c.status IN ('pending', 'active')
        AND LEAST(c.challenger_id, c.opponent_id) = LEAST($1::int, $2::int) AND GREATEST(c.challenger_id, c.opponent_id) = GREATEST($1::int, $2::int)`, [a, b]);
  return result.rows[0];
}

export async function countOpenChallenges(userId: number): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*)::int AS count FROM friend_challenges WHERE status IN ('pending', 'active') AND (challenger_id = $1 OR opponent_id = $1)", [userId]);
  return result.rows[0].count;
}

export async function lockChallenge(db: Queryable, id: number): Promise<ChallengeRow | undefined> {
  const result = await db.query(`SELECT ${COLUMNS} FROM friend_challenges c WHERE c.id = $1 FOR UPDATE`, [id]);
  return result.rows[0];
}

export async function startChallenge(db: Queryable, id: number) {
  await db.query("UPDATE friend_challenges SET status = 'active', starts_at = NOW(), ends_at = NOW() + make_interval(days => days) WHERE id = $1", [id]);
}

export async function closeChallenge(db: Queryable, id: number, status: "declined" | "cancelled") {
  await db.query("UPDATE friend_challenges SET status = $2 WHERE id = $1", [id, status]);
}

/** Running challenges whose time is up, locked so only one request finishes each of them. */
export async function lockEndedChallenges(db: Queryable, userId: number): Promise<{ id: number; challenger_id: number; opponent_id: number; metric: ChallengeMetric; challenger_score: number; opponent_score: number }[]> {
  const result = await db.query(
    `SELECT c.id, c.challenger_id, c.opponent_id, c.metric, ${SCORE_SQL("c.challenger_id")} AS challenger_score, ${SCORE_SQL("c.opponent_id")} AS opponent_score
       FROM friend_challenges c
      WHERE c.status = 'active' AND c.ends_at <= NOW() AND (c.challenger_id = $1 OR c.opponent_id = $1)
      FOR UPDATE SKIP LOCKED`, [userId]);
  return result.rows;
}

export async function finishChallenge(db: Queryable, id: number, challengerScore: number, opponentScore: number) {
  await db.query("UPDATE friend_challenges SET status = 'finished', challenger_score = $2, opponent_score = $3 WHERE id = $1 AND status = 'active'",
    [id, challengerScore, opponentScore]);
}

/** Open challenges and those finished in the last `days` days, with both names and the scores so far. */
export async function listChallenges(userId: number, days: number): Promise<ChallengeListRow[]> {
  const result = await pool.query(
    `SELECT ${COLUMNS}, a.username AS challenger_username, COALESCE(ap.display_name, a.username) AS challenger_name, ${AVATAR_PATH_SQL("a.id")} AS challenger_avatar,
            b.username AS opponent_username, COALESCE(bp.display_name, b.username) AS opponent_name, ${AVATAR_PATH_SQL("b.id")} AS opponent_avatar,
            ${SCORE_SQL("c.challenger_id")} AS live_challenger_score, ${SCORE_SQL("c.opponent_id")} AS live_opponent_score
       FROM friend_challenges c
       JOIN users a ON a.id = c.challenger_id LEFT JOIN user_profiles ap ON ap.user_id = a.id
       JOIN users b ON b.id = c.opponent_id LEFT JOIN user_profiles bp ON bp.user_id = b.id
      WHERE (c.challenger_id = $1 OR c.opponent_id = $1) AND a.status = 'active' AND b.status = 'active'
        AND NOT ${BLOCKED_EITHER_WAY_SQL("c.challenger_id", "c.opponent_id")}
        AND (c.status IN ('pending', 'active') OR (c.status = 'finished' AND c.ends_at > NOW() - make_interval(days => $2)))
      ORDER BY (c.status = 'pending') DESC, (c.status = 'active') DESC, COALESCE(c.ends_at, c.created_at) DESC`, [userId, days]);
  return result.rows;
}

/** Cancels the pair's pending or running challenge (when they stop being friends or one blocks the other). */
export async function cancelOpenChallenges(db: Queryable, a: number, b: number) {
  await db.query(
    `UPDATE friend_challenges SET status = 'cancelled' WHERE status IN ('pending', 'active')
        AND LEAST(challenger_id, opponent_id) = LEAST($1::int, $2::int) AND GREATEST(challenger_id, opponent_id) = GREATEST($1::int, $2::int)`, [a, b]);
}
