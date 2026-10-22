import { UNITS } from "../data/units";
import {
  assessmentResults, countActiveLearners, countLessonCompletions, countUnitProgress, dailyActiveLearners, practiceVolume,
} from "../repositories/analytics.repository";
import { findLesson } from "./lesson.service";

const DAILY_WINDOW = 14;
const levelOf = (unitId: string) => /^japanese-(n[1-5])-/.exec(unitId)?.[1].toUpperCase() ?? "";

/**
 * The admin overview's learning analytics: who is active, how far learners get through each unit,
 * where they stop (the biggest drop between one lesson and the next) and how assessments go.
 */
export async function getLearningAnalytics() {
  const units = UNITS.filter(unit => !unit.isPlaceholder);
  const [active, daily, completions, unitProgress, assessments, practice] = await Promise.all([
    countActiveLearners(), dailyActiveLearners(DAILY_WINDOW), countLessonCompletions(),
    countUnitProgress(units.map(unit => ({ id: unit.id, lessonIds: unit.lessonIds }))), assessmentResults(), practiceVolume(),
  ]);

  const funnel = units.map(unit => {
    const progress = unitProgress.get(unit.id) ?? { started: 0, finishedLessons: 0 };
    const results = (unit.assessmentId && assessments.get(unit.assessmentId)) || { attempted: 0, passed: 0, averageBest: 0 };
    return {
      unitId: unit.id, level: levelOf(unit.id), number: unit.number, title: unit.title,
      started: progress.started, finishedLessons: progress.finishedLessons,
      assessment: { ...results, passRate: results.attempted ? Math.round(results.passed * 100 / results.attempted) : null },
    };
  });

  // A drop-off is learners who completed one lesson but not the next one in the same unit.
  const dropOffs = units.flatMap(unit => unit.lessonIds.slice(1).map((lessonId, index) => {
    const previousId = unit.lessonIds[index];
    const before = completions.get(previousId) ?? 0, after = completions.get(lessonId) ?? 0;
    return {
      unitId: unit.id, level: levelOf(unit.id), unitNumber: unit.number,
      from: { id: previousId, title: findLesson(previousId)?.title ?? previousId, completed: before },
      to: { id: lessonId, title: findLesson(lessonId)?.title ?? lessonId, completed: after },
      lost: Math.max(0, before - after),
    };
  })).filter(item => item.lost > 0).sort((a, b) => b.lost - a.lost || a.unitId.localeCompare(b.unitId)).slice(0, 6);

  return {
    generatedAt: new Date().toISOString(),
    learners: { total: active.learners, newLast30Days: active.new_30d, activeToday: active.active_1d, activeLast7Days: active.active_7d, activeLast30Days: active.active_30d },
    dailyActive: daily,
    funnel,
    dropOffs,
    practice,
  };
}
