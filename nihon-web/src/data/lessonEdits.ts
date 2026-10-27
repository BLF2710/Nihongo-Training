import type { PublishedLessonEdits } from "../api/lessonEdits";
import { N5_LESSONS, type LessonBody, type LessonSummary } from "./japaneseN5Lessons";

// Lesson content published from the admin area replaces the built-in content. It is applied once, before the app's
// pages load, by changing the shared lesson objects in place, so every page derived from them shows the edit.
const SUMMARY_FIELDS = ["title", "titleJp", "vocabulary", "examples", "dialogue", "grammar", "reading"] as const;
const BODY_FIELDS = ["objectives", "concept", "practice", "challenge"] as const;

const bodyOverrides = new Map<string, LessonBody>();
const originals = new Map<string, Partial<LessonSummary>>();

// Object.fromEntries loses the key types; the entries are exactly the picked fields.
function pick<T extends object, K extends keyof T>(source: T, fields: readonly K[]): Pick<T, K> {
  return Object.fromEntries(fields.filter(field => source[field] !== undefined).map(field => [field, source[field]])) as Pick<T, K>;
}

/** Applies published edits to the lesson data. Call once, before the app's pages are imported. */
export function applyPublishedLessonEdits(edits: PublishedLessonEdits) {
  for (const [lessonId, content] of Object.entries(edits.lessons)) {
    const lesson = N5_LESSONS.find(item => item.id === lessonId);
    if (!lesson) continue;
    originals.set(lessonId, structuredClone(pick(lesson, SUMMARY_FIELDS)));
    Object.assign(lesson, pick(content, SUMMARY_FIELDS));
    bodyOverrides.set(lessonId, pick(content, BODY_FIELDS));
  }
}

/** The published lesson-page content of an edited lesson, if it has been edited. */
export const publishedLessonBody = (lessonId: string): LessonBody | undefined => bodyOverrides.get(lessonId);

/** A lesson's summary fields as they are in the course files, before any published edit. */
export function originalLessonSummary(lesson: LessonSummary): Partial<LessonSummary> {
  return originals.get(lesson.id) ?? pick(lesson, SUMMARY_FIELDS);
}
