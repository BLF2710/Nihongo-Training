import { LESSONS } from "../data/lessons";
import type { LessonDefinition } from "../data/lessons";
import { getXp } from "../repositories/gamification.repository";
import { isLessonCompleted } from "../repositories/lesson-progress.repository";
import { getLevelFromXP, getRankFromXP, RANK_THRESHOLDS } from "./progression.service";

export { LESSONS };
export type { LessonDefinition };

export const findLesson = (lessonId: unknown) => LESSONS.find(item => item.id === lessonId);

const rankIndex = (name: string) => RANK_THRESHOLDS.findIndex(item => item.name === name);

/** A lesson's own requirements: previous lesson, minimum level, and minimum rank. */
export function getLessonAccess(lesson: LessonDefinition, xp: number, previousLessonCompleted: boolean) {
  const reasons: string[] = [];
  if (lesson.previousLessonId && !previousLessonCompleted) reasons.push("Complete the previous lesson");
  if (lesson.minimumLevel && getLevelFromXP(xp) < lesson.minimumLevel) reasons.push(`Reach Level ${lesson.minimumLevel}`);
  if (lesson.minimumRank) {
    const requiredRankIndex = rankIndex(lesson.minimumRank);
    if (requiredRankIndex >= 0 && rankIndex(getRankFromXP(xp)) < requiredRankIndex) reasons.push(`Reach ${lesson.minimumRank}`);
  }
  return { allowed: reasons.length === 0, reasons };
}

export async function canUserAccessLesson(userId: number, lesson: LessonDefinition) {
  const xp = await getXp(userId);
  const previousLessonCompleted = lesson.previousLessonId ? await isLessonCompleted(userId, lesson.previousLessonId) : false;
  return getLessonAccess(lesson, xp, previousLessonCompleted);
}
