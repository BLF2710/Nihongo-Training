import lessons from "../../../shared/course/lessons.json";
import units from "../../../shared/course/units.json";
import type { N5Lesson } from "./japaneseN5Lessons";

// Content added by scripts/import-course.mjs. A unit is shown only once the importer has published it
// (all six lessons and its assessment are present), matching what the API serves.
export type ImportedUnit = { id: string; level: string; number: number; sequence: number; title: string; titleJp: string; description: string; lessonIds: string[]; published: boolean };

export const IMPORTED_UNITS = (units as unknown as ImportedUnit[]).filter(unit => unit.published).sort((a, b) => a.sequence - b.sequence);
export const IMPORTED_LESSONS = (lessons as unknown as N5Lesson[]).filter(lesson => IMPORTED_UNITS.some(unit => unit.id === lesson.unitId));
