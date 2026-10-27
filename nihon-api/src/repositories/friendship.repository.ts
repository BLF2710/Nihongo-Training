import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";
import { ACTIVE_TODAY_SQL, EFFECTIVE_STREAK_SQL } from "./streak.repository";

export type FriendshipStatus = "pending" | "accepted" | "declined";
export type FriendshipRow = { id: number; requester_id: number; addressee_id: number; status: FriendshipStatus; created_at: Date; responded_at: Date | null };
export type LearnerRow = {
  id: number; username: string; display_name: string; role: string; status: string;
  profile_visibility: "private" | "friends" | "public"; friend_requests: "everyone" | "nobody"; created_at: Date;
};

const LEARNER_COLUMNS = `u.id, u.username, COALESCE(p.display_name, u.username) AS display_name, u.role, u.status,
  COALESCE(p.profile_visibility, 'private') AS profile_visibility, COALESCE(p.friend_requests, 'everyone') AS friend_requests, u.created_at`;

export async function findLearnerByUsername(username: string): Promise<LearnerRow | undefined> {
  const result = await pool.query(`SELECT ${LEARNER_COLUMNS} FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE LOWER(u.username) = LOWER($1)`, [username]);
  return result.rows[0];
}

export async function findLearnerById(id: number): Promise<LearnerRow | undefined> {
  const result = await pool.query(`SELECT ${LEARNER_COLUMNS} FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = $1`, [id]);
  return result.rows[0];
}

/** Serialises changes to one pair of learners for the rest of the transaction. */
export async function lockPair(db: Queryable, a: number, b: number) {
  await db.query("SELECT pg_advisory_xact_lock($1, $2)", [Math.min(a, b), Math.max(a, b)]);
}

export async function findPair(db: Queryable, a: number, b: number): Promise<FriendshipRow | undefined> {
  const result = await db.query(
    `SELECT id, requester_id, addressee_id, status, created_at, responded_at FROM friendships
      WHERE LEAST(requester_id, addressee_id) = LEAST($1::int, $2::int) AND GREATEST(requester_id, addressee_id) = GREATEST($1::int, $2::int)`, [a, b]);
  return result.rows[0];
}

/** The pair's row outside a transaction (reading only). */
export const findPairNow = (a: number, b: number) => findPair(pool, a, b);

export async function findFriendship(db: Queryable, id: number): Promise<FriendshipRow | undefined> {
  const result = await db.query("SELECT id, requester_id, addressee_id, status, created_at, responded_at FROM friendships WHERE id = $1 FOR UPDATE", [id]);
  return result.rows[0];
}

/** A new pending request, or an old declined row reused for a fresh request. */
export async function savePendingRequest(db: Queryable, requesterId: number, addresseeId: number, existingId?: number): Promise<number> {
  if (existingId) {
    await db.query("UPDATE friendships SET requester_id = $2, addressee_id = $3, status = 'pending', created_at = NOW(), responded_at = NULL WHERE id = $1", [existingId, requesterId, addresseeId]);
    return existingId;
  }
  const result = await db.query("INSERT INTO friendships (requester_id, addressee_id, status) VALUES ($1, $2, 'pending') RETURNING id", [requesterId, addresseeId]);
  return result.rows[0].id;
}

export async function setFriendshipStatus(db: Queryable, id: number, status: "accepted" | "declined") {
  await db.query("UPDATE friendships SET status = $2, responded_at = NOW() WHERE id = $1", [id, status]);
}

export async function deleteFriendship(db: Queryable, id: number) {
  await db.query("DELETE FROM friendships WHERE id = $1", [id]);
}

/** Removes any friendship or request between two learners (used when one blocks the other). Returns the row removed. */
export async function deletePair(db: Queryable, a: number, b: number): Promise<FriendshipRow | undefined> {
  const result = await db.query(
    `DELETE FROM friendships WHERE LEAST(requester_id, addressee_id) = LEAST($1::int, $2::int) AND GREATEST(requester_id, addressee_id) = GREATEST($1::int, $2::int)
     RETURNING id, requester_id, addressee_id, status, created_at, responded_at`, [a, b]);
  return result.rows[0];
}

export async function countRecentRequests(userId: number, seconds: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM friendships WHERE requester_id = $1 AND created_at > NOW() - make_interval(secs => $2)", [userId, seconds]);
  return result.rows[0].count;
}

export async function countOutgoingPending(userId: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM friendships WHERE requester_id = $1 AND status = 'pending'", [userId]);
  return result.rows[0].count;
}

export async function countFriends(userId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM friendships f JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
      WHERE f.status = 'accepted' AND (f.requester_id = $1 OR f.addressee_id = $1) AND u.status = 'active'`, [userId]);
  return result.rows[0].count;
}

export async function countIncomingPending(userId: number): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM friendships f JOIN users u ON u.id = f.requester_id
      WHERE f.addressee_id = $1 AND f.status = 'pending' AND u.status = 'active'`, [userId]);
  return result.rows[0].count;
}

/**
 * Everyone connected to the learner: friends, requests received and requests sent, with the other learner's name.
 * Friends' level and streak are included; the service hides them for friends whose profile is private.
 */
export async function listConnections(userId: number) {
  const result = await pool.query(
    `SELECT f.id, f.status, f.created_at, f.responded_at, (f.requester_id = $1) AS sent,
            u.id AS user_id, u.username, COALESCE(p.display_name, u.username) AS display_name, COALESCE(p.profile_visibility, 'private') AS profile_visibility,
            g.xp, ${EFFECTIVE_STREAK_SQL} AS current_streak, ${ACTIVE_TODAY_SQL} AS active_today
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN user_gamification g ON g.user_id = u.id
      WHERE (f.requester_id = $1 OR f.addressee_id = $1) AND f.status IN ('pending', 'accepted') AND u.status = 'active'
      ORDER BY COALESCE(f.responded_at, f.created_at) DESC`, [userId]);
  return result.rows as {
    id: number; status: "pending" | "accepted"; created_at: Date; responded_at: Date | null; sent: boolean; user_id: number; username: string; display_name: string;
    profile_visibility: LearnerRow["profile_visibility"]; xp: number | null; current_streak: number; active_today: boolean;
  }[];
}

/** What another learner may see on a public profile (the service decides how much of it to show). */
export async function findPublicProfile(userId: number) {
  const result = await pool.query(
    `SELECT p.bio, p.learning_language, p.native_language, p.learning_goal, g.xp, g.longest_streak,
            ${EFFECTIVE_STREAK_SQL} AS current_streak, ${ACTIVE_TODAY_SQL} AS active_today,
            (SELECT COUNT(*)::int FROM lesson_progress WHERE user_id = $1) AS lessons_completed
       FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id LEFT JOIN user_gamification g ON g.user_id = u.id WHERE u.id = $1`, [userId]);
  return result.rows[0] as {
    bio: string | null; learning_language: string | null; native_language: string | null; learning_goal: string | null;
    xp: number | null; longest_streak: number | null; current_streak: number; active_today: boolean; lessons_completed: number;
  } | undefined;
}

/** Assessments the learner has passed (assessment ids). */
export async function listPassedAssessments(userId: number): Promise<string[]> {
  const result = await pool.query("SELECT assessment_id FROM user_assessment_progress WHERE user_id = $1 AND passed_at IS NOT NULL", [userId]);
  return result.rows.map(row => row.assessment_id as string);
}

/**
 * The learner and their friends for the leaderboard: XP and lessons from the last 7 days and the current streak.
 * Friends whose profile is private are left out (and counted separately); the learner is always included.
 */
export async function leaderboardRows(userId: number) {
  const result = await pool.query(
    `WITH circle AS (
       SELECT $1::int AS id
       UNION SELECT CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
         FROM friendships f WHERE f.status = 'accepted' AND (f.requester_id = $1 OR f.addressee_id = $1)
     )
     SELECT u.id, u.username, COALESCE(p.display_name, u.username) AS display_name,
            (u.id <> $1 AND COALESCE(p.profile_visibility, 'private') = 'private') AS hidden,
            COALESCE((SELECT SUM(x.amount) FROM xp_events x WHERE x.user_id = u.id AND x.created_at > NOW() - INTERVAL '7 days'), 0)::int AS weekly_xp,
            (SELECT COUNT(*) FROM lesson_progress l WHERE l.user_id = u.id AND l.completed_at > NOW() - INTERVAL '7 days')::int AS weekly_lessons,
            ${EFFECTIVE_STREAK_SQL} AS current_streak, ${ACTIVE_TODAY_SQL} AS active_today
       FROM circle c JOIN users u ON u.id = c.id AND u.status = 'active'
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN user_gamification g ON g.user_id = u.id`, [userId]);
  return result.rows as { id: number; username: string; display_name: string; hidden: boolean; weekly_xp: number; weekly_lessons: number; current_streak: number; active_today: boolean }[];
}
