import importedLessons from "../../../shared/course/lessons.json";
import importedUnits from "../../../shared/course/units.json";
import importedAssessments from "./imported-assessments.json";
import type { LessonDefinition } from "./lessons";
import type { UnitAssessment } from "./unit-assessments";
import type { UnitDefinition } from "./units";

// Content added by scripts/import-course.mjs. Only units the importer marked as published are served:
// those with all six lessons and their assessment, in an unbroken chain after the built-in units.
type ImportedUnit = { id: string; level: string; number: number; sequence: number; title: string; description: string; lessonIds: string[]; assessmentId: string; published: boolean };
type ImportedLesson = { id: string; slug: string; title: string; unitId: string };

const LAST_BUILT_IN_UNIT_ID = "japanese-n5-unit-3";
const liveUnits = (importedUnits as unknown as ImportedUnit[]).filter(unit => unit.published).sort((a, b) => a.sequence - b.sequence);
const lessons = importedLessons as unknown as ImportedLesson[];

export const IMPORTED_LESSONS: LessonDefinition[] = liveUnits.flatMap(unit => unit.lessonIds.map((lessonId, index) => {
  const lesson = lessons.find(item => item.id === lessonId)!;
  return {
    id: lesson.id, slug: lesson.slug, title: lesson.title, unit: `Japanese ${unit.level} Unit ${unit.number}`,
    ...(index > 0 ? { previousLessonId: unit.lessonIds[index - 1] } : {}),
  };
}));

// Unit access is by completing the previous unit; level requirements are not set for imported units.
export const IMPORTED_UNITS: UnitDefinition[] = liveUnits.map((unit, index) => ({
  id: unit.id, number: unit.number, title: unit.title, description: unit.description, requiredLevel: 1,
  previousUnitId: liveUnits[index - 1]?.id ?? LAST_BUILT_IN_UNIT_ID,
  lessonIds: unit.lessonIds, assessmentId: unit.assessmentId,
}));

export const IMPORTED_ASSESSMENTS: UnitAssessment[] = (importedAssessments as unknown as UnitAssessment[])
  .filter(assessment => liveUnits.some(unit => unit.assessmentId === assessment.id));
