import { withTransaction } from "../db/transaction";
import { countRecentPracticeSessions, insertPracticeSession } from "../repositories/practice-session.repository";
import type { PracticeKind } from "../repositories/practice-session.repository";
import { recordActivity } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";
import type { ActivitySource } from "../gamification/xpRules";
import { rewardActivity } from "./gamification.service";

// An English review round is graded answer by answer on the server (english-review.service), and the browser reports
// the finished round here, so it counts as a session like the others.
// Listening, speaking, reading, mock exams, Particle Drop, Island Errands and Kana Wilds battles are graded in the browser, so the
// browser reports a finished session. Only finished work counts: a listening, speaking or Particle Drop round needs most of its
// questions answered, an errand is reported once it is done (each asks a few replies), and a battle after a few readings.
const MIN_ANSWERED: Record<PracticeKind, number> = { listening: 5, speaking: 5, reading: 1, "mock-exam": 1, particles: 5, errands: 2, battle: 3, review: 5 };
const KINDS = Object.keys(MIN_ANSWERED) as PracticeKind[];
// A mock exam, a Particle Drop round, an errand and a battle cover a course level (N5); the other kinds practise one unit.
const LEVEL_KINDS: ReadonlySet<PracticeKind> = new Set(["mock-exam", "particles", "errands", "battle"]);
// The XP a session earns. A mock exam reported here was already rewarded when the server graded it.
const REWARD_SOURCE: Record<PracticeKind, ActivitySource | null> = { listening: "practice", speaking: "practice", reading: "practice", "mock-exam": null, particles: "game", errands: "game", battle: "game", review: "quiz" };
const MAX_ANSWERED = 200;
const SESSIONS_PER_HOUR = 60;
// A Japanese unit, an English unit, or a whole English level (`english-a2`), which English practice may cover at once.
const UNIT_SCOPE = /^(japanese-n[1-5]-unit-\d{1,2}|english-(a2|b1|b2|c1)(-unit-\d{1,2})?)$/;
const LEVEL_SCOPE = /^N[1-5]$/;
// The review here is the English one: its rounds cover an English unit or level.
const ENGLISH_SCOPE = /^english-(a2|b1|b2|c1)(-unit-\d{1,2})?$/;

const isKind = (value: unknown): value is PracticeKind => KINDS.some(kind => kind === value);
/** Whether `scope` names what a session of `kind` covers: a course level, or a unit (or, for English, a level). */
export function isPracticeScope(kind: PracticeKind, scope: unknown): boolean {
  if (typeof scope !== "string") return false;
  if (kind === "review") return ENGLISH_SCOPE.test(scope);
  return LEVEL_KINDS.has(kind) ? LEVEL_SCOPE.test(scope) : UNIT_SCOPE.test(scope);
}
const whole = (value: unknown) => typeof value === "number" && Number.isInteger(value) ? value : NaN;

/** Saves a finished practice session and counts today toward the learner's streak. */
export async function recordPracticeSession(userId: number, input: { kind?: unknown; scope?: unknown; answered?: unknown; correct?: unknown }) {
  const { kind, scope } = input;
  const answered = whole(input.answered), correct = whole(input.correct);
  if (!isKind(kind)) throw new HttpError(400, "Unknown practice kind.");
  if (!isPracticeScope(kind, scope)) throw new HttpError(400, LEVEL_KINDS.has(kind) ? "Give the level, such as N5." : "Give the unit practised.");
  if (!(answered >= MIN_ANSWERED[kind] && answered <= MAX_ANSWERED)) throw new HttpError(400, `A ${kind} session needs at least ${MIN_ANSWERED[kind]} answers.`);
  if (!(correct >= 0 && correct <= answered)) throw new HttpError(400, "Correct answers must be between 0 and the number answered.");
  if (await countRecentPracticeSessions(userId, 3600) >= SESSIONS_PER_HOUR) throw new HttpError(429, "Too many practice sessions in an hour. Please slow down.");
  const { sessionId, streak } = await withTransaction(async client => {
    const sessionId = await insertPracticeSession(client, { userId, kind, scope: scope as string, answered, correct });
    return { sessionId, streak: await recordActivity(client, userId) };
  });
  const source = REWARD_SOURCE[kind];
  const reward = source ? await rewardActivity(userId, source, `session:${sessionId}`) : null;
  return { recorded: true, currentStreak: streak?.currentStreak ?? 0, reward };
}
