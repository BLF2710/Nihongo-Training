import type { EnglishLesson } from "../../../shared/course/english/schema.ts";

// English lesson content published from the admin area. The site receives it at start-up (lib/startupLessonEdits.ts),
// before the English course is loaded, and the course applies it as it loads (data/englishCourse.ts), so the English
// course itself stays out of the start-up code.

export const ENGLISH_EDITABLE_FIELDS = ["title", "titleVi", "objectives", "vocabulary", "grammar", "examples", "dialogue", "practice", "challenge"] as const;
/** The part of an English lesson that can be edited in the admin area. */
export type EditableEnglishLesson = Pick<EnglishLesson, typeof ENGLISH_EDITABLE_FIELDS[number]>;

const published = new Map<string, EditableEnglishLesson>();

/** Keeps the published English edits for the course to apply when it loads. Call once, before the English pages load. */
export function receivePublishedEnglishEdits(edits: Readonly<Record<string, EditableEnglishLesson>>) {
  for (const [lessonId, content] of Object.entries(edits)) published.set(lessonId, content);
}

/** A lesson with an edit's fields in place of its own; its place in the course (id, unit, number) is kept. */
export const withEnglishEdit = (lesson: EnglishLesson, edit: EditableEnglishLesson | undefined): EnglishLesson =>
  edit ? { ...lesson, ...edit } : lesson;

/** A lesson as learners see it: with its published edit, if it has one. */
export const withPublishedEnglishEdit = (lesson: EnglishLesson): EnglishLesson => withEnglishEdit(lesson, published.get(lesson.id));

/** The editable part of a lesson, as it is in the course files. */
export function editableEnglishLesson(lesson: EnglishLesson): EditableEnglishLesson {
  const { title, titleVi, objectives, vocabulary, grammar, examples, dialogue, practice, challenge } = lesson;
  return { title, titleVi, objectives, vocabulary, grammar, examples, dialogue, practice, challenge };
}
