import { UNITS, UnitDefinition } from "../data/units";
import { UNIT_ASSESSMENTS } from "../data/unit-assessments";
import { listAssessmentProgress } from "../repositories/assessment.repository";
import { getXp } from "../repositories/gamification.repository";
import { listCompletedLessonIds } from "../repositories/lesson-progress.repository";
import { getLevelFromXP } from "./progression.service";
import { LessonDefinition, canUserAccessLesson, findLesson, getLessonAccess } from "./lesson.service";

type Access = { allowed: boolean; reasons: string[] };

// Completion is derived, never stored as a second copy of lesson progress.
export function getUnitProgress(unit: UnitDefinition, completedLessonIds: Set<string>, passedAssessmentIds: Set<string>) {
  if (unit.isPlaceholder) return { completedLessons: 0, totalLessons: 0, allLessonsCompleted: false, assessmentPassed: false, completed: false };
  const completedLessons = unit.lessonIds.filter(id => completedLessonIds.has(id)).length;
  const allLessonsCompleted = unit.lessonIds.length > 0 && completedLessons === unit.lessonIds.length;
  const assessmentPassed = !!unit.assessmentId && passedAssessmentIds.has(unit.assessmentId);
  return { completedLessons, totalLessons: unit.lessonIds.length, allLessonsCompleted, assessmentPassed, completed: allLessonsCompleted && assessmentPassed };
}

export function getUnitAccess(unit: UnitDefinition, level: number, completedUnitIds: Set<string>, definitions = UNITS): Access {
  const reasons: string[] = [];
  if (level < unit.requiredLevel) reasons.push(`Requires Level ${unit.requiredLevel}`);
  if (unit.previousUnitId && !completedUnitIds.has(unit.previousUnitId)) {
    const previous = definitions.find(item => item.id === unit.previousUnitId);
    reasons.push(previous ? `Complete Unit ${previous.number} first` : "Complete the previous unit first");
  }
  return { allowed: reasons.length === 0, reasons };
}

// A lesson is open only when both its unit and its own requirements allow it.
function describeLessons(unit: UnitDefinition, unitAccess: Access, xp: number, completedLessonIds: Set<string>) {
  return unit.lessonIds.map(id => {
    const lesson = findLesson(id);
    if (!lesson) throw new Error(`Missing lesson ${id}`);
    const lessonAccess = getLessonAccess(lesson, xp, !!lesson.previousLessonId && completedLessonIds.has(lesson.previousLessonId));
    return { ...lesson, isPlaceholder: false, description: "", completed: completedLessonIds.has(id), allowed: unitAccess.allowed && lessonAccess.allowed, reasons: [...unitAccess.reasons, ...lessonAccess.reasons] };
  });
}

function describePlaceholderLessons(unit: UnitDefinition) {
  return (unit.placeholderLessons ?? []).map(lesson => ({ ...lesson, isPlaceholder: Boolean(lesson.isPlaceholder), slug: "", completed: false, allowed: false, reasons: [lesson.description] }));
}

export async function getUserUnits(userId: number) {
  const [xp, completedLessons, assessments] = await Promise.all([
    getXp(userId),
    listCompletedLessonIds(userId),
    listAssessmentProgress(userId),
  ]);
  const level = getLevelFromXP(xp);
  const completedIds = new Set<string>(completedLessons);
  const passedIds = new Set<string>(assessments.filter(row => row.passed_at).map(row => row.assessment_id));
  const progressByUnit = new Map(UNITS.map(unit => [unit.id, getUnitProgress(unit, completedIds, passedIds)]));
  const completedUnitIds = new Set(UNITS.filter(unit => progressByUnit.get(unit.id)?.completed).map(unit => unit.id));
  return UNITS.map(unit => {
    const progress = progressByUnit.get(unit.id)!;
    const access = getUnitAccess(unit, level, completedUnitIds);
    const assessment = UNIT_ASSESSMENTS.find(item => item.id === unit.assessmentId);
    if (!assessment && !unit.isPlaceholder) throw new Error(`Missing assessment for ${unit.id}`);
    const saved = assessments.find(row => row.assessment_id === unit.assessmentId);
    return {
      ...unit, ...progress, ...access,
      lessons: unit.isPlaceholder ? describePlaceholderLessons(unit) : describeLessons(unit, access, xp, completedIds),
      assessmentUnlocked: !unit.isPlaceholder && !!assessment && access.allowed && progress.allLessonsCompleted,
      questionCount: assessment?.questions.length ?? 0, passPercent: assessment?.passPercent ?? null,
      bestScore: !unit.isPlaceholder && saved ? Number(saved.best_score) : null,
      bestCorrect: !unit.isPlaceholder && saved && assessment ? Math.round(Number(saved.best_score) * assessment.questions.length / 100) : null,
    };
  });
}

// Adds unit availability above the existing lesson rules; Unit 1's rules are unchanged.
export async function canAccessCourseLesson(userId: number, lesson: LessonDefinition): Promise<Access> {
  const unit = (await getUserUnits(userId)).find(item => item.lessonIds.includes(lesson.id));
  const access = unit?.lessons.find(item => item.id === lesson.id);
  return access ? { allowed: access.allowed, reasons: access.reasons } : canUserAccessLesson(userId, lesson);
}
