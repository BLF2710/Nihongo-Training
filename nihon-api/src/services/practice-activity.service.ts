import { withTransaction } from "../db/transaction";
import { countRecentPracticeSessions, insertPracticeSession } from "../repositories/practice-session.repository";
import type { PracticeKind } from "../repositories/practice-session.repository";
import { recordActivity } from "../repositories/streak.repository";
import { HttpError } from "../utils/http-error";
import type { ActivitySource } from "../gamification/xpRules";
import { rewardActivity } from "./gamification.service";

// Listening, speaking, reading, mock exams and Particle Drop are graded in the browser, so the browser reports a
// finished session. Only finished work counts: a listening, speaking or Particle Drop round needs most of its questions answered.
const MIN_ANSWERED: Record<PracticeKind, number> = { listening: 5, speaking: 5, reading: 1, "mock-exam": 1, particles: 5 };
const KINDS = Object.keys(MIN_ANSWERED) as PracticeKind[];
// A mock exam and a Particle Drop round cover a course level (N5); the other kinds practise one unit.
const LEVEL_KINDS: ReadonlySet<PracticeKind> = new Set(["mock-exam", "particles"]);
// The XP a session earns. A mock exam reported here was already rewarded when the server graded it.
const REWARD_SOURCE: Record<PracticeKind, ActivitySource | null> = { listening: "practice", speaking: "practice", reading: "practice", "mock-exam": null, particles: "game" };
const MAX_ANSWERED = 200;
const SESSIONS_PER_HOUR = 60;
const UNIT_SCOPE = /^japanese-n[1-5]-unit-\d{1,2}$/;
const LEVEL_SCOPE = /^N[1-5]$/;

const isKind = (value: unknown): value is PracticeKind => KINDS.some(kind => kind === value);
const whole = (value: unknown) => typeof value === "number" && Number.isInteger(value) ? value : NaN;

/** Saves a finished practice session and counts today toward the learner's streak. */
export async function recordPracticeSession(userId: number, input: { kind?: unknown; scope?: unknown; answered?: unknown; correct?: unknown }) {
  const { kind, scope } = input;
  const answered = whole(input.answered), correct = whole(input.correct);
  if (!isKind(kind)) throw new HttpError(400, "Unknown practice kind.");
  const scopeOk = typeof scope === "string" && (LEVEL_KINDS.has(kind) ? LEVEL_SCOPE.test(scope) : UNIT_SCOPE.test(scope));
  if (!scopeOk) throw new HttpError(400, LEVEL_KINDS.has(kind) ? "Give the level, such as N5." : "Give the unit practised.");
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
