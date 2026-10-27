import { UNITS } from "../data/units";
import { withTransaction } from "../db/transaction";
import { listEarnedAchievements } from "../repositories/achievement.repository";
import { blockState } from "../repositories/conversation.repository";
import {
  countFriends, countIncomingPending, countOutgoingPending, countRecentRequests, deleteFriendship, findFriendship, findLearnerById,
  findLearnerByUsername, findPair, findPairNow, findPublicProfile, leaderboardRows, listConnections, listPassedAssessments, lockPair, savePendingRequest, setFriendshipStatus,
} from "../repositories/friendship.repository";
import type { FriendshipRow, LearnerRow } from "../repositories/friendship.repository";
import { cancelOpenChallenges } from "../repositories/friend-challenge.repository";
import { findLocalToday, findStudyingNow, listActivityDays } from "../repositories/friend-activity.repository";
import { deleteFriendRequestNotifications, insertNotification, readFriendRequestNotifications } from "../repositories/notification.repository";
import { friendStreak } from "../social/friendStreak";
import { HttpError } from "../utils/http-error";
import { USERNAME_PATTERN } from "../utils/validation";
import { idParam } from "./conversation-format";
import { getLevelFromXP, getRankFromXP } from "./progression.service";
import { publish } from "./realtime.service";
import type { RealtimeEvent } from "./realtime.service";

const REQUESTS_PER_HOUR = 20;
const MAX_PENDING_SENT = 50;
const MAX_FRIENDS = 500;
// After a request is declined, the same learner can ask again after this long.
const DECLINE_COOL_DOWN_MS = 24 * 60 * 60 * 1000;
// Long enough to cover any friend streak shown; activity_days goes back this far.
const STREAK_LOOKBACK_DAYS = 400;
// Study time is reported about once a minute while a learner is on a learning page.
const STUDYING_NOW_SECONDS = 3 * 60;

export type FriendshipState = "self" | "friends" | "outgoing" | "incoming" | "none";
export type Notice = [number, RealtimeEvent];

export const person = (learner: { username: string; display_name: string }) => ({ username: learner.username, displayName: learner.display_name });
export const updated = (userId: number): Notice => [userId, { type: "friends", reason: "updated" }];
export const bell = (userId: number): Notice => [userId, { type: "notifications" }];

/** Friends are for learner accounts; the support team is reached through Help & support. */
export async function requireLearner(userId: number): Promise<LearnerRow> {
  const me = await findLearnerById(userId);
  if (!me || me.status !== "active" || me.role !== "learner") throw new HttpError(403, "Friends are available to learner accounts.");
  return me;
}

/** Another active learner by exact username. Learners who blocked each other are not found, so nothing is revealed. */
export async function findOther(userId: number, username: unknown): Promise<LearnerRow> {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username.trim())) throw new HttpError(400, "Enter a username (3–30 letters, numbers or underscores).");
  const other = await findLearnerByUsername(username.trim());
  if (!other || other.status !== "active" || other.role !== "learner") throw new HttpError(404, "No learner has that username.");
  if (other.id !== userId) {
    const blocks = await blockState(userId, other.id);
    if (blocks.blockedMe || blocks.blockedByMe) throw new HttpError(404, "No learner has that username.");
  }
  return other;
}

function stateOf(row: FriendshipRow | undefined, userId: number): { state: FriendshipState; requestId?: number } {
  if (!row || row.status === "declined") return { state: "none" };
  if (row.status === "accepted") return { state: "friends" };
  return { state: row.requester_id === userId ? "outgoing" : "incoming", requestId: row.id };
}

// Changes run in a transaction that locks the pair, and live notifications go out only after it commits.
export async function change<T>(work: (notices: Notice[], client: Parameters<Parameters<typeof withTransaction>[0]>[0]) => Promise<T>): Promise<T> {
  const notices: Notice[] = [];
  const result = await withTransaction(client => work(notices, client));
  for (const [userId, event] of notices) publish(userId, event);
  return result;
}

/**
 * Sends a friend request by exact username. If that learner already asked you, this accepts their request instead.
 * Sending the same request twice changes nothing.
 */
export async function sendFriendRequest(userId: number, username: unknown) {
  const me = await requireLearner(userId);
  const other = await findOther(userId, username);
  if (other.id === userId) throw new HttpError(400, "You can't add yourself as a friend.");
  return change(async (notices, client) => {
    await lockPair(client, userId, other.id);
    const row = await findPair(client, userId, other.id);
    const current = stateOf(row, userId);
    if (current.state === "friends" || current.state === "outgoing") return { ...current, person: person(other) };
    if (current.state === "incoming") {
      await setFriendshipStatus(client, row!.id, "accepted");
      await insertNotification(client, { userId: other.id, kind: "friend_accepted", actorId: userId });
      await readFriendRequestNotifications(client, userId, other.id);
      notices.push([other.id, { type: "friends", reason: "accepted", person: person(me) }], updated(userId), bell(other.id), bell(userId));
      return { state: "friends" as const, person: person(other) };
    }
    if (other.friend_requests === "nobody") throw new HttpError(403, `@${other.username} isn't accepting friend requests.`);
    if (row?.status === "declined" && row.requester_id === userId && row.responded_at && Date.now() - row.responded_at.getTime() < DECLINE_COOL_DOWN_MS) {
      throw new HttpError(429, `You can send @${other.username} another request tomorrow.`);
    }
    if (await countRecentRequests(userId, 3600) >= REQUESTS_PER_HOUR) throw new HttpError(429, "You've sent a lot of friend requests. Try again in an hour.");
    if (await countOutgoingPending(userId) >= MAX_PENDING_SENT) throw new HttpError(429, `You have ${MAX_PENDING_SENT} requests waiting for an answer. Cancel some before sending more.`);
    if (await countFriends(userId) >= MAX_FRIENDS) throw new HttpError(409, `You can have up to ${MAX_FRIENDS} friends.`);
    const requestId = await savePendingRequest(client, userId, other.id, row?.id);
    await insertNotification(client, { userId: other.id, kind: "friend_request", actorId: userId });
    notices.push([other.id, { type: "friends", reason: "request", person: person(me) }], updated(userId), bell(other.id));
    return { state: "outgoing" as const, requestId, person: person(other) };
  });
}

/** Accepts or declines a request you received. The sender is not told about a decline; it simply leaves their list. */
export async function respondToFriendRequest(userId: number, requestId: unknown, accept: unknown) {
  if (typeof accept !== "boolean") throw new HttpError(400, "Say whether to accept or decline.");
  const me = await requireLearner(userId);
  const id = idParam(requestId, "Friend request");
  return change(async (notices, client) => {
    const row = await findFriendship(client, id);
    if (!row || row.status !== "pending" || row.addressee_id !== userId) throw new HttpError(404, "Friend request not found.");
    const sender = await findLearnerById(row.requester_id);
    if (!sender || sender.status !== "active") throw new HttpError(404, "Friend request not found.");
    if (accept && await countFriends(userId) >= MAX_FRIENDS) throw new HttpError(409, `You can have up to ${MAX_FRIENDS} friends.`);
    await setFriendshipStatus(client, id, accept ? "accepted" : "declined");
    await readFriendRequestNotifications(client, userId, sender.id);
    if (accept) { await insertNotification(client, { userId: sender.id, kind: "friend_accepted", actorId: userId }); notices.push(bell(sender.id)); }
    notices.push(bell(userId), accept ? [sender.id, { type: "friends", reason: "accepted", person: person(me) }] : updated(sender.id), updated(userId));
    return { state: accept ? "friends" as const : "none" as const, person: person(sender) };
  });
}

/** Withdraws a request you sent that has not been answered. */
export async function cancelFriendRequest(userId: number, requestId: unknown) {
  await requireLearner(userId);
  const id = idParam(requestId, "Friend request");
  return change(async (notices, client) => {
    const row = await findFriendship(client, id);
    if (!row || row.status !== "pending" || row.requester_id !== userId) throw new HttpError(404, "Friend request not found.");
    await deleteFriendship(client, id);
    await deleteFriendRequestNotifications(client, row.addressee_id, userId);
    notices.push(updated(row.addressee_id), updated(userId), bell(row.addressee_id));
    return { state: "none" as const };
  });
}

export async function removeFriend(userId: number, username: unknown) {
  await requireLearner(userId);
  const other = await findOther(userId, username);
  return change(async (notices, client) => {
    await lockPair(client, userId, other.id);
    const row = await findPair(client, userId, other.id);
    if (row?.status !== "accepted") throw new HttpError(404, `You aren't friends with @${other.username}.`);
    await deleteFriendship(client, row.id);
    await cancelOpenChallenges(client, userId, other.id);
    notices.push(updated(other.id), updated(userId));
    return { state: "none" as const };
  });
}

/** Friend streaks (days in a row both studied) and which friends are studying now (only those who chose to show it). */
async function getFriendExtras(userId: number, friendIds: number[]) {
  if (friendIds.length === 0) return { streaks: new Map<number, number>(), studyingNow: new Set<number>() };
  const [days, today, studyingNow] = await Promise.all([
    listActivityDays([userId, ...friendIds], STREAK_LOOKBACK_DAYS), findLocalToday(userId), findStudyingNow(friendIds, STUDYING_NOW_SECONDS),
  ]);
  const mine = days.get(userId) ?? [];
  return { streaks: new Map(friendIds.map(id => [id, friendStreak(mine, days.get(id) ?? [], today)])), studyingNow };
}

/**
 * Friends, requests received and requests sent. Friends with a private profile show no level, streaks or
 * "studying now".
 */
export async function listFriends(userId: number) {
  await requireLearner(userId);
  const rows = await listConnections(userId);
  const sharing = rows.filter(row => row.status === "accepted" && row.profile_visibility !== "private").map(row => row.user_id);
  const extras = await getFriendExtras(userId, sharing);
  const who = (row: (typeof rows)[number]) => ({ username: row.username, displayName: row.display_name });
  return {
    friends: rows.filter(row => row.status === "accepted").map(row => ({
      ...who(row), since: row.responded_at ?? row.created_at,
      progress: row.profile_visibility === "private" ? null : {
        level: getLevelFromXP(Number(row.xp ?? 0)), currentStreak: Number(row.current_streak), activeToday: Boolean(row.active_today),
        friendStreak: extras.streaks.get(row.user_id) ?? 0, studyingNow: extras.studyingNow.has(row.user_id),
      },
    })).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    incoming: rows.filter(row => row.status === "pending" && !row.sent).map(row => ({ id: row.id, ...who(row), sentAt: row.created_at })),
    outgoing: rows.filter(row => row.status === "pending" && row.sent).map(row => ({ id: row.id, ...who(row), sentAt: row.created_at })),
  };
}

export const countFriendRequests = (userId: number) => countIncomingPending(userId);

/**
 * The learner and friends who share their progress, with XP and lessons from the last 7 days and the current
 * streak. The page chooses the ranking; friends with a private profile are only counted, never shown.
 */
export async function getLeaderboard(userId: number) {
  await requireLearner(userId);
  const rows = await leaderboardRows(userId);
  const to = new Date();
  return {
    period: { from: new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000), to },
    entries: rows.filter(row => !row.hidden).map(row => ({
      username: row.username, displayName: row.display_name, self: row.id === userId,
      weeklyXp: Number(row.weekly_xp), weeklyLessons: Number(row.weekly_lessons), currentStreak: Number(row.current_streak), activeToday: Boolean(row.active_today),
    })),
    hidden: rows.filter(row => row.hidden).length,
  };
}

/**
 * A learner's profile as the viewer may see it. Name, username and the friend button are always shown; the rest
 * follows the owner's visibility: private (only them), friends (their friends) or public (any signed-in learner).
 */
export async function getPublicProfile(viewerId: number, username: unknown) {
  await requireLearner(viewerId);
  const owner = await findOther(viewerId, username);
  const self = owner.id === viewerId;
  const { state, requestId } = self ? { state: "self" as const, requestId: undefined } : stateOf(await findPairNow(viewerId, owner.id), viewerId);
  const visible = self || owner.profile_visibility === "public" || (owner.profile_visibility === "friends" && state === "friends");
  const base = {
    username: owner.username, displayName: owner.display_name, joinedAt: owner.created_at, visibility: owner.profile_visibility,
    friendship: { state, ...(requestId ? { requestId } : {}) },
    canRequest: state === "none" && owner.friend_requests === "everyone",
    visible,
  };
  if (!visible) return base;
  const [details, achievements, passed, friends, extras] = await Promise.all([
    findPublicProfile(owner.id), listEarnedAchievements(owner.id), listPassedAssessments(owner.id), countFriends(owner.id),
    state === "friends" ? getFriendExtras(viewerId, [owner.id]) : null,
  ]);
  const xp = Number(details?.xp ?? 0);
  const passedUnits = UNITS.filter(unit => !unit.isPlaceholder && unit.assessmentId && passed.includes(unit.assessmentId));
  const latest = passedUnits[passedUnits.length - 1];
  return {
    ...base,
    profile: {
      bio: details?.bio ?? "", learningLanguage: details?.learning_language ?? null, nativeLanguage: details?.native_language ?? null, learningGoal: details?.learning_goal ?? null,
      xp, level: getLevelFromXP(xp), rank: getRankFromXP(xp),
      currentStreak: Number(details?.current_streak ?? 0), longestStreak: Number(details?.longest_streak ?? 0), activeToday: Boolean(details?.active_today),
      lessonsCompleted: Number(details?.lessons_completed ?? 0), unitsPassed: passedUnits.length,
      latestUnit: latest ? { level: /^japanese-(n[1-5])-/.exec(latest.id)?.[1].toUpperCase() ?? "", number: latest.number, title: latest.title } : null,
      achievements: achievements.map(item => ({ id: item.id, title: item.title, description: item.description, earnedAt: item.earned_at })),
      friends,
      friendStreak: extras?.streaks.get(owner.id) ?? null,
    },
  };
}
