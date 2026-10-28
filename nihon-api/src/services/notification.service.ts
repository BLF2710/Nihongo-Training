import { countUnreadNotifications, insertNotificationNow, listNotifications, markNotificationsRead } from "../repositories/notification.repository";
import { HttpError } from "../utils/http-error";
import { publish } from "./realtime.service";

const PAGE = 20;
const MAX_PAGE = 50;

/** The learner's notification history, newest first, with the unread count. */
export async function getNotifications(userId: number, query: { before?: unknown; limit?: unknown }) {
  const before = query.before === undefined ? undefined : Number(query.before);
  if (before !== undefined && !(Number.isSafeInteger(before) && before > 0)) throw new HttpError(400, "Invalid page.");
  const limit = query.limit === undefined ? PAGE : Number(query.limit);
  if (!(Number.isInteger(limit) && limit >= 1 && limit <= MAX_PAGE)) throw new HttpError(400, `Ask for 1 to ${MAX_PAGE} notifications.`);
  const [rows, unread] = await Promise.all([listNotifications(userId, limit + 1, before), countUnreadNotifications(userId)]);
  return {
    notifications: rows.slice(0, limit).map(row => ({
      id: Number(row.id), kind: row.kind, createdAt: row.created_at, read: row.read_at !== null, data: row.data,
      actor: row.actor_username ? { username: row.actor_username, displayName: row.actor_name ?? row.actor_username } : null,
    })),
    hasMore: rows.length > limit,
    unread,
  };
}

/** Marks some notifications (by id) or all of them as read; the learner's other tabs update too. */
export async function readNotifications(userId: number, ids: unknown) {
  let list: number[] | null = null;
  if (ids !== undefined && ids !== null) {
    if (!Array.isArray(ids) || ids.length > 100 || !ids.every(id => Number.isSafeInteger(id) && id > 0)) throw new HttpError(400, "Give up to 100 notification ids.");
    list = ids as number[];
  }
  await markNotificationsRead(userId, list);
  publish(userId, { type: "notifications" });
  return { unread: await countUnreadNotifications(userId) };
}

/** Records an earned achievement (outside any transaction) and tells the learner's open tabs. */
export async function notifyAchievement(userId: number, achievement: { id: string; title: string }) {
  await insertNotificationNow({ userId, kind: "achievement", data: { achievementId: achievement.id, title: achievement.title } });
  publish(userId, { type: "notifications" });
}

/** Tells the learner they reached a new level (outside any transaction). */
export async function notifyLevelUp(userId: number, level: number) {
  await insertNotificationNow({ userId, kind: "level_up", data: { level } });
  publish(userId, { type: "notifications" });
}

export const countUnread = countUnreadNotifications;
