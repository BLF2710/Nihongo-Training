// What the English study dashboard (/dashboard for English learners) suggests: the next lesson or unit test of the
// chosen level, and a short plan for today. Pure: the page passes in the units and the day.

type DashboardLesson = { slug: string; title: string; isPlaceholder?: boolean; allowed: boolean; completed: boolean };
export type DashboardUnit = {
  id: string; number: number; title: string; isPlaceholder?: boolean; allowed: boolean; completed: boolean;
  completedLessons: number; totalLessons: number; assessmentUnlocked: boolean; assessmentPassed: boolean; lessons: readonly DashboardLesson[];
};

export type EnglishNextStep =
  | { kind: "lesson"; unit: DashboardUnit; lesson: DashboardLesson; href: string }
  | { kind: "assessment"; unit: DashboardUnit; href: string }
  | { kind: "level-complete"; href: string }
  | { kind: "nothing-open"; href: string };

export type PlanItem = { icon: string; title: string; detail: string; href: string };

const LEVELS_PAGE = "/levels?next=/dashboard";

/** The units of a level (`english-a2-unit-…`), without placeholders, in course order. */
export const englishUnitsOfLevel = <U extends DashboardUnit>(units: readonly U[], level: string): U[] =>
  units.filter(unit => unit.id.startsWith(`english-${level.toLowerCase()}-unit-`) && !unit.isPlaceholder);

/** The first open unit not yet complete: its unit test when every lesson is done, otherwise its next lesson. */
export function englishNextStep(units: readonly DashboardUnit[]): EnglishNextStep {
  const unit = units.find(item => item.allowed && !item.completed);
  if (!unit) return units.length && units.every(item => item.completed) ? { kind: "level-complete", href: LEVELS_PAGE } : { kind: "nothing-open", href: "/lessons" };
  if (unit.assessmentUnlocked && !unit.assessmentPassed) return { kind: "assessment", unit, href: `/quizzes/${unit.id}` };
  const lesson = unit.lessons.find(item => !item.isPlaceholder && item.allowed && !item.completed);
  return lesson ? { kind: "lesson", unit, lesson, href: `/lessons/english/${lesson.slug}` } : { kind: "nothing-open", href: `/lessons?unit=${unit.id}` };
}

/** The unit to review and practise: the one in progress, or else the last one opened. */
export const englishFocusUnit = <U extends DashboardUnit>(units: readonly U[]): U | undefined =>
  units.find(unit => unit.allowed && !unit.completed && unit.completedLessons > 0) ?? units.findLast(unit => unit.allowed && unit.completedLessons > 0);

/** A short, balanced plan: the next step, flashcards, a review and a skill (listening and speaking take turns by day). */
export function englishTodayPlan(step: EnglishNextStep, focus: DashboardUnit | undefined, cardsDue: number | null, day: number): PlanItem[] {
  const isListeningDay = day % 2 === 0;
  const next: PlanItem | null = step.kind === "lesson" ? { icon: "📖", title: step.lesson.title, detail: `Unit ${step.unit.number} · your next lesson`, href: step.href }
    : step.kind === "assessment" ? { icon: "📝", title: `Unit ${step.unit.number} test`, detail: "Every lesson is done: score 80% to complete the unit.", href: step.href }
    : null;
  const unitQuery = focus ? `?unit=${focus.id}` : "";
  return [
    next,
    cardsDue === null || cardsDue > 0 ? { icon: "🗂️", title: "Flashcards", detail: cardsDue ? `${cardsDue} ${cardsDue === 1 ? "card" : "cards"} ready` : "Words from your lessons", href: "/english/flashcards" } : null,
    focus ? { icon: "🔄", title: `Review Unit ${focus.number}`, detail: "Questions and words, ten at a time.", href: `/english/review${unitQuery}` } : null,
    focus ? (isListeningDay
      ? { icon: "🎧", title: "Listening", detail: `Unit ${focus.number}: hear it and choose.`, href: `/english/listening${unitQuery}` }
      : { icon: "🎤", title: "Speaking", detail: `Unit ${focus.number}: say it aloud.`, href: `/english/speaking${unitQuery}` }) : null,
  ].filter(item => item !== null);
}
