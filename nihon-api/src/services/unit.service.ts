import { pool } from "../config/db";
import { UNITS, UnitDefinition } from "../data/units";
import { UNIT_ASSESSMENTS } from "../data/unit-assessments";
import { getLevelFromXP } from "./progression.service";
import { LESSONS, LessonDefinition, canUserAccessLesson } from "./lesson.service";

// Completion is derived, never stored as a second copy of lesson progress.
export function getUnitProgress(unit: UnitDefinition, completedLessonIds: Set<string>, passedAssessmentIds: Set<string>) {
  if (unit.isPlaceholder) return { completedLessons: 0, totalLessons: 0, allLessonsCompleted: false, assessmentPassed: false, completed: false };
  const completedLessons = unit.lessonIds.filter(id => completedLessonIds.has(id)).length;
  const allLessonsCompleted = unit.lessonIds.length > 0 && completedLessons === unit.lessonIds.length;
  const assessmentPassed = !!unit.assessmentId && passedAssessmentIds.has(unit.assessmentId);
  return { completedLessons, totalLessons: unit.lessonIds.length, allLessonsCompleted, assessmentPassed, completed: allLessonsCompleted && assessmentPassed };
}

export function getUnitAccess(unit: UnitDefinition, level: number, completedUnitIds: Set<string>, definitions = UNITS) {
  const reasons: string[] = [];
  if (level < unit.requiredLevel) reasons.push(`Requires Level ${unit.requiredLevel}`);
  if (unit.previousUnitId && !completedUnitIds.has(unit.previousUnitId)) {
    const previous = definitions.find(item => item.id === unit.previousUnitId);
    reasons.push(previous ? `Complete Unit ${previous.number} first` : "Complete the previous unit first");
  }
  return { allowed: reasons.length === 0, reasons };
}

export async function getUserUnits(userId: number) {
  const [game, progress, assessments] = await Promise.all([
    pool.query("SELECT xp FROM user_gamification WHERE user_id=$1", [userId]),
    pool.query("SELECT lesson_id FROM lesson_progress WHERE user_id=$1", [userId]),
    pool.query("SELECT assessment_id, best_score, passed_at FROM user_assessment_progress WHERE user_id=$1", [userId]),
  ]);
  const level = getLevelFromXP(Number(game.rows[0]?.xp ?? 0));
  const completedIds = new Set<string>(progress.rows.map(row => row.lesson_id));
  const passedIds = new Set<string>(assessments.rows.filter(row => row.passed_at).map(row => row.assessment_id));
  const progressByUnit = new Map(UNITS.map(unit => [unit.id, getUnitProgress(unit, completedIds, passedIds)]));
  const completedUnitIds = new Set(UNITS.filter(unit => progressByUnit.get(unit.id)?.completed).map(unit => unit.id));
  return Promise.all(UNITS.map(async unit => {
    const progress = progressByUnit.get(unit.id)!;
    const access = getUnitAccess(unit, level, completedUnitIds);
    const assessment = UNIT_ASSESSMENTS.find(item => item.id === unit.assessmentId);
    if (!assessment && !unit.isPlaceholder) throw new Error(`Missing assessment for ${unit.id}`);
    const saved = assessments.rows.find(row => row.assessment_id === unit.assessmentId);
    const lessons = await Promise.all((unit.isPlaceholder ? [] : unit.lessonIds).map(async id => {
      const lesson = LESSONS.find(item => item.id === id);
      if (!lesson) throw new Error(`Missing lesson ${id}`);
      const lessonAccess = await canUserAccessLesson(userId, lesson);
      return { ...lesson, isPlaceholder: false, description: "", completed: completedIds.has(id), allowed: access.allowed && lessonAccess.allowed, reasons: [...access.reasons, ...lessonAccess.reasons] };
    }));
    return {
      ...unit, ...progress, ...access,
      lessons: unit.isPlaceholder ? (unit.placeholderLessons ?? []).map(lesson => ({ ...lesson, isPlaceholder: Boolean(lesson.isPlaceholder), slug: "", completed: false, allowed: false, reasons: [lesson.description] })) : lessons,
      assessmentUnlocked: !unit.isPlaceholder && !!assessment && access.allowed && progress.allLessonsCompleted,
      questionCount: assessment?.questions.length ?? 0, passPercent: assessment?.passPercent ?? null,
      bestScore: !unit.isPlaceholder && saved ? Number(saved.best_score) : null,
      bestCorrect: !unit.isPlaceholder && saved && assessment ? Math.round(Number(saved.best_score) * assessment.questions.length / 100) : null,
    };
  }));
}

// Adds unit availability above the existing lesson rules; Unit 1's rules are unchanged.
export async function canAccessCourseLesson(userId: number, lesson: LessonDefinition) {
  const unit = (await getUserUnits(userId)).find(item => item.lessonIds.includes(lesson.id));
  const access = unit?.lessons.find(item => item.id === lesson.id);
  return access ? { allowed: access.allowed, reasons: access.reasons } : canUserAccessLesson(userId, lesson);
}
