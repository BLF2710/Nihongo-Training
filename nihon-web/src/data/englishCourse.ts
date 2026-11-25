import lessons from "../../../shared/course/english/lessons.json";
import type { EnglishLesson } from "../../../shared/course/english/schema.ts";

// The English course's lessons, written by scripts/import-english-course.ts, which validates every lesson against
// shared/course/english/schema.ts before writing them. Read only by the English lesson page (its own chunk).
export const ENGLISH_LESSONS = lessons as unknown as readonly EnglishLesson[];
