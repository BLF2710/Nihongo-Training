import { UNITS } from "../data/units";
import { insertNotificationNow } from "../repositories/notification.repository";
import { countEncouragements, findLocalToday, listActivityDays, listFeedRows } from "../repositories/friend-activity.repository";
import type { FeedRow } from "../repositories/friend-activity.repository";
import { findPairNow } from "../repositories/friendship.repository";
import type { LearnerRow } from "../repositories/friendship.repository";
import { HttpError } from "../utils/http-error";
import { bell, findOther, person, requireLearner } from "./friend.service";
import { publish } from "./realtime.service";

const FEED_DAYS = 14;
const FEED_LIMIT = 50;
// One nudge per friend per day.
const NUDGE_COOL_DOWN_HOURS = 20;

const unitOfAssessment = (assessmentId: string) => {
  const unit = UNITS.find(item => item.assessmentId === assessmentId);
  return unit ? { level: /^japanese-(n[1-5])-/.exec(unit.id)?.[1].toUpperCase() ?? "", number: unit.number, title: unit.title } : null;
};

function toFeedItem(row: FeedRow) {
  const base = { key: `${row.kind}:${row.ref}`, person: { ...person(row), avatar: row.avatar }, at: row.at, cheered: row.cheered };
  if (row.kind === "lessons") return { ...base, kind: "lessons" as const, lessons: row.count };
  if (row.kind === "unit") return { ...base, kind: "unit" as const, unit: unitOfAssessment(row.ref) };
  return { ...base, kind: "achievement" as const, achievement: { title: row.achievement_title ?? "an achievement" } };
}
type FeedItem = ReturnType<typeof toFeedItem>;

/** What a cheer was for, as the cheered friend reads it: "for completing 3 lessons". */
function cheerReason(item: FeedItem): string {
  if (item.kind === "lessons") return `completing ${item.lessons} lesson${item.lessons === 1 ? "" : "s"}`;
  if (item.kind === "unit") return item.unit ? `passing ${item.unit.level} Unit ${item.unit.number}` : "passing a unit";
  return `earning “${item.achievement.title}”`;
}

/** Friends' milestones from the last two weeks. Friends with a private profile or activity sharing off are left out. */
export async function getActivityFeed(userId: number) {
  await requireLearner(userId);
  return { items: (await listFeedRows(userId, FEED_DAYS, FEED_LIMIT)).map(toFeedItem), days: FEED_DAYS };
}

async function requireFriend(userId: number, username: unknown): Promise<LearnerRow> {
  const other = await findOther(userId, username);
  if (other.id === userId || (await findPairNow(userId, other.id))?.status !== "accepted") throw new HttpError(404, "You can only do this with your friends.");
  return other;
}

/** Cheers a friend on for one item of the activity feed (once per item). */
export async function cheerFriend(userId: number, username: unknown, itemKey: unknown) {
  await requireLearner(userId);
  const friend = await requireFriend(userId, username);
  const item = typeof itemKey === "string"
    ? (await listFeedRows(userId, FEED_DAYS, FEED_LIMIT)).map(toFeedItem).find(entry => entry.person.username === friend.username && entry.key === itemKey)
    : undefined;
  if (!item) throw new HttpError(404, "That activity is no longer in your feed.");
  if (item.cheered) throw new HttpError(409, "You already cheered this.");
  await insertNotificationNow({ userId: friend.id, kind: "cheer", actorId: userId, data: { item: item.key, reason: cheerReason(item) } });
  publish(...bell(friend.id));
  return { cheered: true };
}

/**
 * Reminds a friend to study, once a day. Friends who already studied today aren't nudged; for friends with a
 * private profile that isn't checked, so a nudge never reveals whether they studied.
 */
export async function nudgeFriend(userId: number, username: unknown) {
  await requireLearner(userId);
  const friend = await requireFriend(userId, username);
  if (friend.profile_visibility !== "private") {
    const today = await findLocalToday(friend.id);
    if ((await listActivityDays([friend.id], 2)).get(friend.id)?.includes(today)) throw new HttpError(409, `@${friend.username} has already studied today.`);
  }
  if (await countEncouragements(userId, friend.id, "nudge", NUDGE_COOL_DOWN_HOURS) > 0) throw new HttpError(429, `You already nudged @${friend.username} today.`);
  await insertNotificationNow({ userId: friend.id, kind: "nudge", actorId: userId });
  publish(...bell(friend.id));
  return { nudged: true };
}
