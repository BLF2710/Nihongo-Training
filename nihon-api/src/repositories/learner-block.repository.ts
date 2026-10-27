import { pool } from "../config/db";

export type BlockedLearnerRow = { username: string; display_name: string; blocked_at: Date };

/** Learners this learner has blocked, newest first. */
export async function listBlockedLearners(userId: number): Promise<BlockedLearnerRow[]> {
  const result = await pool.query(
    `SELECT u.username, COALESCE(p.display_name, u.username) AS display_name, b.created_at AS blocked_at
       FROM user_blocks b JOIN users u ON u.id = b.blocked_id LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE b.blocker_id = $1 ORDER BY b.created_at DESC`, [userId]);
  return result.rows;
}

export const BLOCKED_EITHER_WAY_SQL = (a: string, b: string) =>
  `EXISTS (SELECT 1 FROM user_blocks ub WHERE (ub.blocker_id = ${a} AND ub.blocked_id = ${b}) OR (ub.blocker_id = ${b} AND ub.blocked_id = ${a}))`;
