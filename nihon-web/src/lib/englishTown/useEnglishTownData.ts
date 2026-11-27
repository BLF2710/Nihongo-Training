import { useEffect, useState } from "react";
import { fetchGamification } from "../../api/gamification";
import type { Gamification } from "../../api/gamification";
import { fetchMistakes } from "../../api/mistakes";
import { fetchSrsSummary } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import { useEnglishCourseLevel } from "../courseLevel";
import { useDailyGoal } from "../dailyGoal";
import { englishNextStep, englishUnitsOfLevel } from "../englishDashboard";
import type { EnglishNextStep } from "../englishDashboard";
import { useInboxSummary } from "../inbox";
import type { EnglishTownData } from "./townNews";

const earnedToday = (gamification: Gamification, source: Gamification["today"]["activities"][number]["source"]) =>
  gamification.today.activities.some(activity => activity.source === source && activity.earned > 0);

/** The next lesson or unit test, as the knight names it; nothing when no lesson is open. */
function nextStepOf(step: EnglishNextStep): EnglishTownData["nextStep"] {
  if (step.kind === "lesson") return { title: step.lesson.title, href: step.href };
  if (step.kind === "assessment") return { title: `the Unit ${step.unit.number} test`, href: step.href };
  return null;
}

type Fetched = Pick<EnglishTownData, "cards" | "nextStep" | "today" | "streak" | "openMistakes">;
const NOTHING_YET: Fetched = { cards: null, nextStep: null, today: null, streak: null, openMistakes: null };
/** The requests made per visit: the course, the flashcards, today's XP and the mistake notebook. */
const REQUESTS = 4;

/** Everything the townsfolk talk about, fetched once per visit (and again when the level changes). Each part fails
 *  on its own and then stays null: a townsperson without their data still greets the learner. */
export function useEnglishTownData(): { data: EnglishTownData; isLoading: boolean } {
  const level = useEnglishCourseLevel();
  const goal = useDailyGoal();
  const inbox = useInboxSummary();
  const [fetched, setFetched] = useState<Fetched>(NOTHING_YET);
  const [settled, setSettled] = useState({ level, count: 0 });
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (part: Partial<Fetched>) => { if (!signal.aborted) setFetched(current => ({ ...current, ...part })); };
    const settle = () => { if (!signal.aborted) setSettled(current => current.level === level ? { level, count: current.count + 1 } : { level, count: 1 }); };
    fetchUnits(signal).then(units => update({ nextStep: nextStepOf(englishNextStep(englishUnitsOfLevel(units, level))) }))
      .catch(() => { /* the knight greets without a next step */ }).finally(settle);
    fetchSrsSummary(signal, "english").then(cards => update({ cards: { dueTotal: cards.dueTotal, reviewedToday: cards.reviewedToday, total: cards.total } }))
      .catch(() => { /* the flashcards stay unknown */ }).finally(settle);
    fetchGamification(signal).then(gamification => update({
      streak: gamification.streak.current,
      today: { hasFinishedLesson: earnedToday(gamification, "lesson_completion"), hasPractised: earnedToday(gamification, "practice") },
    })).catch(() => { /* today's errands and the streak stay unknown */ }).finally(settle);
    fetchMistakes("open", "english", signal).then(notebook => update({ openMistakes: notebook.counts.open })).catch(() => { /* see above */ }).finally(settle);
    return () => controller.abort();
  }, [level]);
  const data: EnglishTownData = {
    ...fetched,
    goal: goal && goal !== "error" ? { minutesToday: goal.minutesToday, goalMinutes: goal.goalMinutes, isGoalMet: goal.isGoalMet } : null,
    inbox: inbox ? { messages: inbox.direct + inbox.support, friendRequests: inbox.friendRequests ?? 0 } : null,
  };
  return { data, isLoading: settled.level !== level || settled.count < REQUESTS };
}
