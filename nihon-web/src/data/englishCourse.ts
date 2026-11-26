import lessons from "../../../shared/course/english/lessons.json";
import units from "../../../shared/course/english/units.json";
import type { EnglishLesson, EnglishUnit } from "../../../shared/course/english/schema.ts";
import { withPublishedEnglishEdit } from "./englishLessonEdits";

// The English course's lessons and units, written by scripts/import-english-course.ts, which validates every lesson
// against shared/course/english/schema.ts before writing them. Read only by the English pages (their own chunk).
/** The lessons as they are in the course files, before any edit published from the admin area. */
export const ENGLISH_COURSE_FILE_LESSONS = lessons as unknown as readonly EnglishLesson[];
/** The lessons as learners see them. */
export const ENGLISH_LESSONS: readonly EnglishLesson[] = ENGLISH_COURSE_FILE_LESSONS.map(withPublishedEnglishEdit);
export const ENGLISH_UNITS = units as unknown as readonly EnglishUnit[];
