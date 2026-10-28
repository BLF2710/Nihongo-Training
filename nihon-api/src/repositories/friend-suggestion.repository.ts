import { pool } from "../config/db";
import { AVATAR_PATH_SQL } from "./avatar.repository";
import { BLOCKED_EITHER_WAY_SQL } from "./learner-block.repository";

export type SuggestionRow = { username: string; display_name: string; avatar: string | null; mutual_friends: number; same_level: boolean; course_level: string | null };

// The course level a learner is working on: the level of the lesson they completed most recently.
const COURSE_LEVEL_SQL = (userId: string) => `(SELECT UPPER(SUBSTRING(l.lesson_id FROM '^japanese-(n[1-5])-')) FROM lesson_progress l
  WHERE l.user_id = ${userId} ORDER BY l.completed_at DESC LIMIT 1)`;

const FRIENDS_OF_SQL = (userId: string) => `SELECT CASE WHEN f.requester_id = ${userId} THEN f.addressee_id ELSE f.requester_id END AS id
  FROM friendships f WHERE f.status = 'accepted' AND (f.requester_id = ${userId} OR f.addressee_id = ${userId})`;

/**
 * Learners who opted in to suggestions, accept friend requests and have nothing to do with $1 yet (no request,
 * friendship or block either way), and who are friends of $1's friends or work on the same course level.
 */
export async function listSuggestionRows(userId: number, limit: number): Promise<SuggestionRow[]> {
  const result = await pool.query(
    `WITH mine AS (${FRIENDS_OF_SQL("$1")}), my_level AS (SELECT ${COURSE_LEVEL_SQL("$1")} AS level),
     candidates AS (
       SELECT u.id, u.username, COALESCE(p.display_name, u.username) AS display_name, ${COURSE_LEVEL_SQL("u.id")} AS course_level,
              (SELECT COUNT(*)::int FROM (${FRIENDS_OF_SQL("u.id")}) theirs WHERE theirs.id IN (SELECT id FROM mine)) AS mutual_friends,
              g.last_activity_at
         FROM users u JOIN user_profiles p ON p.user_id = u.id LEFT JOIN user_gamification g ON g.user_id = u.id
        WHERE u.id <> $1 AND u.status = 'active' AND u.role = 'learner' AND p.suggest_me AND p.friend_requests = 'everyone'
          AND NOT EXISTS (SELECT 1 FROM friendships f WHERE LEAST(f.requester_id, f.addressee_id) = LEAST($1::int, u.id) AND GREATEST(f.requester_id, f.addressee_id) = GREATEST($1::int, u.id))
          AND NOT ${BLOCKED_EITHER_WAY_SQL("$1", "u.id")}
     )
     SELECT c.username, c.display_name, ${AVATAR_PATH_SQL("c.id")} AS avatar, c.mutual_friends, (c.course_level IS NOT NULL AND c.course_level = m.level) AS same_level, c.course_level
       FROM candidates c CROSS JOIN my_level m
      WHERE c.mutual_friends > 0 OR (c.course_level IS NOT NULL AND c.course_level = m.level)
      ORDER BY c.mutual_friends DESC, (c.course_level = m.level) DESC, c.last_activity_at DESC NULLS LAST
      LIMIT $2`, [userId, limit]);
  return result.rows;
}
