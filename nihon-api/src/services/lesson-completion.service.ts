import type { LessonDefinition } from "../data/lessons";
import { saveLessonScore } from "../repositories/lesson-progress.repository";
import { HttpError } from "../utils/http-error";
import { canAccessCourseLesson } from "./unit.service";
import { awardXP } from "./xp.service";

const LESSON_COMPLETION_XP = 50;
const PERFECT_CHALLENGE_XP = 25;

/** Saves a finished lesson and pays its XP; both rewards are granted at most once per lesson. */
export async function completeLesson(userId: number, lesson: LessonDefinition, submission: { challengeScore?: unknown }) {
  const access = await canAccessCourseLesson(userId, lesson);
  if (!access.allowed) throw new HttpError(403, "Lesson is locked", { reasons: access.reasons });
  const score = Number(submission.challengeScore);
  if (!Number.isInteger(score) || score < 0 || score > 100) throw new HttpError(400, "Challenge score must be between 0 and 100");
  await saveLessonScore(userId, lesson.id, score);
  const completion = await awardXP(userId, LESSON_COMPLETION_XP, "lesson_completion", lesson.id);
  const challenge = score === 100 ? await awardXP(userId, PERFECT_CHALLENGE_XP, "lesson_challenge", `${lesson.id}:perfect`) : null;
  return { completion, challenge };
}
