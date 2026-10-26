import { pool } from "../config/db";
import type { Queryable } from "../db/transaction";

export type NotificationKind = "friend_request" | "friend_accepted" | "support_reply" | "achievement";
// History older than this is removed when new notifications arrive.
const KEEP_DAYS = 180;

export async function insertNotification(db: Queryable, notification: { userId: number; kind: NotificationKind; actorId?: number | null; data?: Record<string, unknown> }) {
  await db.query("INSERT INTO notifications (user_id, kind, actor_id, data) VALUES ($1, $2, $3, $4)",
    [notification.userId, notification.kind, notification.actorId ?? null, JSON.stringify(notification.data ?? {})]);
  await db.query("DELETE FROM notifications WHERE user_id = $1 AND created_at < NOW() - make_interval(days => $2)", [notification.userId, KEEP_DAYS]);
}

/** For events that happen outside a transaction. */
export const insertNotificationNow = (notification: Parameters<typeof insertNotification>[1]) => insertNotification(pool, notification);

/** A withdrawn friend request no longer belongs in the receiver's history. */
export async function deleteFriendRequestNotifications(db: Queryable, userId: number, actorId: number) {
  await db.query("DELETE FROM notifications WHERE user_id = $1 AND actor_id = $2 AND kind = 'friend_request'", [userId, actorId]);
}

/** Answering a friend request (either way) counts as having seen its notification. */
export async function readFriendRequestNotifications(db: Queryable, userId: number, actorId: number) {
  await db.query("UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND actor_id = $2 AND kind = 'friend_request' AND read_at IS NULL", [userId, actorId]);
}

/** Newest first; `before` pages back through older notifications by id. */
export async function listNotifications(userId: number, limit: number, before?: number) {
  const result = await pool.query(
    `SELECT n.id, n.kind, n.data, n.created_at, n.read_at, u.username AS actor_username, COALESCE(p.display_name, u.username) AS actor_name
       FROM notifications n LEFT JOIN users u ON u.id = n.actor_id LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE n.user_id = $1 AND ($3::bigint IS NULL OR n.id < $3)
      ORDER BY n.id DESC LIMIT $2`, [userId, limit, before ?? null]);
  return result.rows as { id: string; kind: NotificationKind; data: Record<string, unknown>; created_at: Date; read_at: Date | null; actor_username: string | null; actor_name: string | null }[];
}

export async function countUnreadNotifications(userId: number): Promise<number> {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read_at IS NULL", [userId]);
  return result.rows[0].count;
}

/** Marks the given notifications (or all of them) as read. */
export async function markNotificationsRead(userId: number, ids: number[] | null) {
  await pool.query("UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL AND ($2::bigint[] IS NULL OR id = ANY($2::bigint[]))", [userId, ids]);
}
