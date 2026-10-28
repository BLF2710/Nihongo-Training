import { withTransaction } from "../db/transaction";
import {
  closeChallenge, countOpenChallenges, findOpenChallenge, finishChallenge, insertChallenge, listChallenges as listChallengeRows, lockChallenge,
  lockEndedChallenges, startChallenge,
} from "../repositories/friend-challenge.repository";
import type { ChallengeListRow, ChallengeMetric } from "../repositories/friend-challenge.repository";
import { findPairNow, lockPair } from "../repositories/friendship.repository";
import { insertNotification } from "../repositories/notification.repository";
import { challengeOutcome } from "../social/challengeOutcome";
import { HttpError } from "../utils/http-error";
import { idParam } from "./conversation-format";
import { bell, change, findOther, person, requireLearner, updated } from "./friend.service";

const METRICS: readonly ChallengeMetric[] = ["xp", "lessons"];
const DURATIONS_IN_DAYS: readonly number[] = [3, 7];
const MAX_OPEN_CHALLENGES = 10;
// Finished challenges stay on the list this long.
const FINISHED_SHOWN_DAYS = 7;

const isMetric = (value: unknown): value is ChallengeMetric => typeof value === "string" && (METRICS as readonly string[]).includes(value);

/** Challenges a friend: who earns more XP, or completes more lessons, in 3 or 7 days from when they accept. */
export async function createChallenge(userId: number, input: { username?: unknown; metric?: unknown; days?: unknown }) {
  if (!isMetric(input.metric)) throw new HttpError(400, "Choose XP or lessons.");
  if (typeof input.days !== "number" || !DURATIONS_IN_DAYS.includes(input.days)) throw new HttpError(400, "Choose 3 or 7 days.");
  const { metric, days } = input;
  await requireLearner(userId);
  const friend = await findOther(userId, input.username);
  if (friend.id === userId || (await findPairNow(userId, friend.id))?.status !== "accepted") throw new HttpError(404, "You can only challenge your friends.");
  if (await countOpenChallenges(userId) >= MAX_OPEN_CHALLENGES) throw new HttpError(429, `You can have up to ${MAX_OPEN_CHALLENGES} open challenges.`);
  return change(async (notices, client) => {
    await lockPair(client, userId, friend.id);
    if (await findOpenChallenge(client, userId, friend.id)) throw new HttpError(409, `You already have a challenge with @${friend.username}.`);
    const id = await insertChallenge(client, { challengerId: userId, opponentId: friend.id, metric, days });
    await insertNotification(client, { userId: friend.id, kind: "challenge", actorId: userId, data: { event: "invited", metric, days } });
    notices.push(bell(friend.id), updated(friend.id), updated(userId));
    return { id, status: "pending" as const };
  });
}

/** Accepts (the challenge starts now) or declines a challenge you received. */
export async function respondToChallenge(userId: number, challengeId: unknown, accept: unknown) {
  if (typeof accept !== "boolean") throw new HttpError(400, "Say whether to accept or decline.");
  await requireLearner(userId);
  const id = idParam(challengeId, "Challenge");
  return change(async (notices, client) => {
    const challenge = await lockChallenge(client, id);
    if (!challenge || challenge.opponent_id !== userId || challenge.status !== "pending") throw new HttpError(404, "Challenge not found.");
    if (accept) await startChallenge(client, id);
    else await closeChallenge(client, id, "declined");
    await insertNotification(client, { userId: challenge.challenger_id, kind: "challenge", actorId: userId, data: { event: accept ? "accepted" : "declined", metric: challenge.metric, days: challenge.days } });
    notices.push(bell(challenge.challenger_id), updated(challenge.challenger_id), updated(userId));
    return { id, status: accept ? "active" as const : "declined" as const };
  });
}

/** Withdraws a challenge you sent that hasn't been answered. */
export async function cancelChallenge(userId: number, challengeId: unknown) {
  await requireLearner(userId);
  const id = idParam(challengeId, "Challenge");
  return change(async (notices, client) => {
    const challenge = await lockChallenge(client, id);
    if (!challenge || challenge.challenger_id !== userId || challenge.status !== "pending") throw new HttpError(404, "Challenge not found.");
    await closeChallenge(client, id, "cancelled");
    notices.push(updated(challenge.opponent_id), updated(userId));
    return { id, status: "cancelled" as const };
  });
}

/** Finishes this learner's challenges whose time is up and tells both sides the result. */
async function finishEndedChallenges(userId: number) {
  await change(async (notices, client) => {
    for (const ended of await lockEndedChallenges(client, userId)) {
      await finishChallenge(client, ended.id, ended.challenger_score, ended.opponent_score);
      const sides = [
        { userId: ended.challenger_id, otherId: ended.opponent_id, mine: ended.challenger_score, theirs: ended.opponent_score },
        { userId: ended.opponent_id, otherId: ended.challenger_id, mine: ended.opponent_score, theirs: ended.challenger_score },
      ];
      for (const side of sides) {
        await insertNotification(client, { userId: side.userId, kind: "challenge", actorId: side.otherId,
          data: { event: "finished", metric: ended.metric, outcome: challengeOutcome(side.mine, side.theirs), myScore: side.mine, theirScore: side.theirs } });
        notices.push(bell(side.userId), updated(side.userId));
      }
    }
  });
}

function toChallenge(row: ChallengeListRow, userId: number) {
  const isChallenger = row.challenger_id === userId;
  const finished = row.status === "finished";
  const [mine, theirs] = isChallenger
    ? [finished ? row.challenger_score : row.live_challenger_score, finished ? row.opponent_score : row.live_opponent_score]
    : [finished ? row.opponent_score : row.live_opponent_score, finished ? row.challenger_score : row.live_challenger_score];
  const myScore = Number(mine ?? 0), theirScore = Number(theirs ?? 0);
  return {
    id: row.id, metric: row.metric, days: row.days, status: row.status, sentByMe: isChallenger,
    friend: isChallenger
      ? { ...person({ username: row.opponent_username, display_name: row.opponent_name }), avatar: row.opponent_avatar }
      : { ...person({ username: row.challenger_username, display_name: row.challenger_name }), avatar: row.challenger_avatar },
    myScore, theirScore, createdAt: row.created_at, startsAt: row.starts_at, endsAt: row.ends_at,
    outcome: finished ? challengeOutcome(myScore, theirScore) : null,
  };
}

/** Challenges waiting for an answer, running, and finished in the last week, with the scores so far. */
export async function listChallenges(userId: number) {
  await requireLearner(userId);
  await finishEndedChallenges(userId);
  return { challenges: (await listChallengeRows(userId, FINISHED_SHOWN_DAYS)).map(row => toChallenge(row, userId)) };
}
