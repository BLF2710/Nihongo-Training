import { LESSON_BODY_LOADERS } from "virtual:course-lesson-bodies";
import { BUILT_IN_LESSONS, type LessonBody, type LessonSummary } from "./japaneseN5Lessons";
import { publishedLessonBody } from "./lessonEdits";

export class LessonBodyNotFoundError extends Error {
  constructor(lessonId: string) { super(`No lesson content was found for ${lessonId}.`); this.name = "LessonBodyNotFoundError"; }
}

function isLessonBody(value: unknown): value is LessonBody {
  if (typeof value !== "object" || value === null) return false;
  const { objectives, concept, practice, challenge } = value as Record<string, unknown>;
  return Array.isArray(objectives) && typeof concept === "object" && concept !== null && Array.isArray(practice) && Array.isArray(challenge);
}

/** The lesson-page part of a lesson as learners see it: a published edit if there is one, otherwise the original. */
export async function loadLessonBody(lesson: LessonSummary): Promise<LessonBody> {
  return publishedLessonBody(lesson.id) ?? loadOriginalLessonBody(lesson);
}

/** The lesson-page part as it is in the course files: in the bundle for Units 1–3, one chunk per unit for imported units. */
export async function loadOriginalLessonBody(lesson: LessonSummary): Promise<LessonBody> {
  const builtIn = BUILT_IN_LESSONS.find(item => item.id === lesson.id);
  if (builtIn) return { objectives: builtIn.objectives, concept: builtIn.concept, practice: builtIn.practice, challenge: builtIn.challenge };
  const loadUnit = lesson.unitId ? LESSON_BODY_LOADERS[lesson.unitId] : undefined;
  if (!loadUnit) throw new LessonBodyNotFoundError(lesson.id);
  const body = (await loadUnit()).default[lesson.id];
  if (!isLessonBody(body)) throw new LessonBodyNotFoundError(lesson.id);
  return body;
}
