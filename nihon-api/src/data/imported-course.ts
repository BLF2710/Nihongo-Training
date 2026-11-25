import importedLessons from "../../../shared/course/lessons.json";
import importedUnits from "../../../shared/course/units.json";
import importedEnglishLessons from "../../../shared/course/english/lessons.json";
import importedEnglishUnits from "../../../shared/course/english/units.json";
import importedAssessments from "./imported-assessments.json";
import importedEnglishAssessments from "./imported-english-assessments.json";
import type { LessonDefinition } from "./lessons";
import type { UnitAssessment } from "./unit-assessments";
import type { UnitDefinition } from "./units";

// Content added by the importers: scripts/import-course.mjs (Japanese) and scripts/import-english-course.ts
// (English). Only units an importer marked as published are served: for Japanese those with all six lessons and
// their assessment, in an unbroken chain after the built-in units; for English those whose source passed. Each
// course is its own chain: an English unit never waits on a Japanese one.
type ImportedUnit = { id: string; level: string; number: number; sequence: number; title: string; description: string; lessonIds: string[]; assessmentId: string; published: boolean };
type ImportedLesson = { id: string; slug: string; title: string; unitId: string };
type Course = { name: string; units: ImportedUnit[]; lessons: ImportedLesson[]; firstPreviousUnitId?: string };

const LAST_BUILT_IN_UNIT_ID = "japanese-n5-unit-3";
const liveUnitsOf = (units: unknown) => (units as ImportedUnit[]).filter(unit => unit.published).sort((a, b) => a.sequence - b.sequence);
const COURSES: Course[] = [
  { name: "Japanese", units: liveUnitsOf(importedUnits), lessons: importedLessons as unknown as ImportedLesson[], firstPreviousUnitId: LAST_BUILT_IN_UNIT_ID },
  { name: "English", units: liveUnitsOf(importedEnglishUnits), lessons: importedEnglishLessons as unknown as ImportedLesson[] },
];

function lessonsOf({ name, units, lessons }: Course): LessonDefinition[] {
  return units.flatMap(unit => unit.lessonIds.map((lessonId, index) => {
    const lesson = lessons.find(item => item.id === lessonId);
    if (!lesson) throw new Error(`${unit.id} lists ${lessonId}, which is not in the imported lessons`);
    return {
      id: lesson.id, slug: lesson.slug, title: lesson.title, unit: `${name} ${unit.level} Unit ${unit.number}`,
      ...(index > 0 ? { previousLessonId: unit.lessonIds[index - 1] } : {}),
    };
  }));
}

// Unit access is by completing the previous unit of the same course; level requirements are not set for imported units.
function unitsOf({ units, firstPreviousUnitId }: Course): UnitDefinition[] {
  return units.map((unit, index) => {
    const previousUnitId = units[index - 1]?.id ?? firstPreviousUnitId;
    return {
      id: unit.id, number: unit.number, title: unit.title, description: unit.description, requiredLevel: 1,
      ...(previousUnitId ? { previousUnitId } : {}),
      lessonIds: unit.lessonIds, assessmentId: unit.assessmentId,
    };
  });
}

export const IMPORTED_LESSONS: LessonDefinition[] = COURSES.flatMap(lessonsOf);
export const IMPORTED_UNITS: UnitDefinition[] = COURSES.flatMap(unitsOf);

const liveAssessmentIds = new Set(COURSES.flatMap(course => course.units.map(unit => unit.assessmentId)));
export const IMPORTED_ASSESSMENTS: UnitAssessment[] = [...importedAssessments, ...importedEnglishAssessments]
  .map(assessment => assessment as unknown as UnitAssessment)
  .filter(assessment => liveAssessmentIds.has(assessment.id));
