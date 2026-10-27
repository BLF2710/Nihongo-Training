import { pool } from "../config/db";
import { BLOCKED_EITHER_WAY_SQL } from "./learner-block.repository";

export type FeedItemKind = "lessons" | "unit" | "achievement";
export type FeedRow = {
  username: string; display_name: string; kind: FeedItemKind; ref: string; count: number; at: Date;
  achievement_title: string | null; cheered: boolean;
};

// Friends of $1 who share their activity: not private, share_activity on, and no block either way.
const SHARING_FRIENDS_SQL = `
  SELECT u.id FROM friendships f
    JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.addressee_id ELSE f.requester_id END
    JOIN user_profiles p ON p.user_id = u.id
   WHERE f.status = 'accepted' AND (f.requester_id = $1 OR f.addressee_id = $1) AND u.status = 'active'
     AND p.profile_visibility <> 'private' AND p.share_activity AND NOT ${BLOCKED_EITHER_WAY_SQL("$1", "u.id")}`;

/**
 * Friends' recent milestones, newest first: lessons completed (one item per friend per day of theirs), units passed
 * and achievements earned. `cheered` says whether $1 already cheered that item.
 */
export async function listFeedRows(userId: number, days: number, limit: number): Promise<FeedRow[]> {
  const result = await pool.query(
    `WITH sharing AS (${SHARING_FRIENDS_SQL}),
     items AS (
       SELECT l.user_id, 'lessons' AS kind, to_char((l.completed_at AT TIME ZONE COALESCE(p.time_zone, 'UTC'))::date, 'YYYY-MM-DD') AS ref,
              COUNT(*)::int AS count, MAX(l.completed_at) AS at
         FROM lesson_progress l JOIN sharing s ON s.id = l.user_id JOIN user_profiles p ON p.user_id = l.user_id
        WHERE l.completed_at > NOW() - make_interval(days => $2) GROUP BY l.user_id, 3
       UNION ALL
       SELECT a.user_id, 'unit', a.assessment_id, 1, a.passed_at FROM user_assessment_progress a JOIN sharing s ON s.id = a.user_id
        WHERE a.passed_at > NOW() - make_interval(days => $2)
       UNION ALL
       SELECT ua.user_id, 'achievement', ua.achievement_id, 1, ua.earned_at FROM user_achievements ua JOIN sharing s ON s.id = ua.user_id
        WHERE ua.earned_at > NOW() - make_interval(days => $2)
     )
     SELECT u.username, COALESCE(p.display_name, u.username) AS display_name, i.kind, i.ref, i.count, i.at, ach.title AS achievement_title,
            EXISTS (SELECT 1 FROM notifications n WHERE n.actor_id = $1 AND n.user_id = i.user_id AND n.kind = 'cheer'
                     AND n.data->>'item' = i.kind || ':' || i.ref) AS cheered
       FROM items i JOIN users u ON u.id = i.user_id LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN achievements ach ON i.kind = 'achievement' AND ach.id = i.ref
      ORDER BY i.at DESC LIMIT $3`, [userId, days, limit]);
  return result.rows;
}

/** Active days (YYYY-MM-DD) of these learners within the last `days` days. */
export async function listActivityDays(userIds: number[], days: number): Promise<Map<number, string[]>> {
  const result = await pool.query(
    "SELECT user_id, to_char(day, 'YYYY-MM-DD') AS day FROM activity_days WHERE user_id = ANY($1::int[]) AND day > CURRENT_DATE - $2::int",
    [userIds, days]);
  const byUser = new Map<number, string[]>(userIds.map(id => [id, []]));
  for (const row of result.rows) byUser.get(row.user_id)?.push(row.day);
  return byUser;
}

/** Today's date (YYYY-MM-DD) in the learner's time zone. */
export async function findLocalToday(userId: number): Promise<string> {
  const result = await pool.query(
    "SELECT to_char((NOW() AT TIME ZONE COALESCE((SELECT time_zone FROM user_profiles WHERE user_id = $1), 'UTC'))::date, 'YYYY-MM-DD') AS today", [userId]);
  return result.rows[0].today;
}

/** Which of these learners chose to show "studying now" and reported study time within the last `seconds`. */
export async function findStudyingNow(userIds: number[], seconds: number): Promise<Set<number>> {
  const result = await pool.query(
    `SELECT DISTINCT s.user_id FROM study_time s JOIN user_profiles p ON p.user_id = s.user_id
      WHERE s.user_id = ANY($1::int[]) AND p.show_studying_now AND s.last_credited_at > NOW() - make_interval(secs => $2)`, [userIds, seconds]);
  return new Set(result.rows.map(row => row.user_id as number));
}

/** Nudges or cheers sent from one learner to another within the last `hours` (optionally for one feed item). */
export async function countEncouragements(senderId: number, recipientId: number, kind: "nudge" | "cheer", hours: number, item?: string): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications
      WHERE actor_id = $1 AND user_id = $2 AND kind = $3 AND created_at > NOW() - make_interval(hours => $4) AND ($5::text IS NULL OR data->>'item' = $5)`,
    [senderId, recipientId, kind, hours, item ?? null]);
  return result.rows[0].count;
}
