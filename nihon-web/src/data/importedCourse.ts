import lessons from "../../../shared/course/lessons.json";
import units from "../../../shared/course/units.json";
import type { LessonSummary } from "./japaneseN5Lessons";

// Content added by scripts/import-course.mjs. A unit is shown only once the importer has published it
// (all six lessons and its assessment are present), matching what the API serves.
// In the web build lessons.json holds summaries only: the lesson-page fields are split off per unit
// (build-tools/courseLessonSplit.ts, read through lessonBodies.ts).
export type ImportedUnit = { id: string; level: string; number: number; sequence: number; title: string; titleJp: string; description: string; lessonIds: string[]; published: boolean };

export const IMPORTED_UNITS = (units as unknown as ImportedUnit[]).filter(unit => unit.published).sort((a, b) => a.sequence - b.sequence);
export const IMPORTED_LESSONS = (lessons as unknown as LessonSummary[]).filter(lesson => IMPORTED_UNITS.some(unit => unit.id === lesson.unitId));
