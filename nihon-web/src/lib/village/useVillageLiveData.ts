import { useEffect, useState } from "react";
import { fetchGamification } from "../../api/gamification";
import type { Gamification } from "../../api/gamification";
import { fetchMistakes } from "../../api/mistakes";
import { fetchSrsSummary } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import { inLevel, useCourseLevel } from "../courseLevel";
import { useDailyGoal } from "../dailyGoal";
import { useInboxSummary } from "../inbox";
import { nextCourseStep } from "../islandMap";
import { syncDeck } from "../srsDeck";
import type { VillageLiveData } from "./villageNews";

const earnedToday = (gamification: Gamification, source: Gamification["today"]["activities"][number]["source"]) =>
  gamification.today.activities.some(activity => activity.source === source && activity.earned > 0);

type Fetched = Pick<VillageLiveData, "reviews" | "nextStep" | "today" | "streak" | "openMistakes">;
const NOTHING_YET: Fetched = { reviews: null, nextStep: null, today: null, streak: null, openMistakes: null };
/** The requests made per visit: the course (then the review deck), today's XP, and the mistake notebook. */
const REQUESTS = 3;

/** Everything the villagers talk about, fetched once per visit. Each part fails on its own (and then stays null):
 *  a villager without their data still greets the learner and points to their page. */
export function useVillageLiveData(): { data: VillageLiveData; isLoading: boolean } {
  const level = useCourseLevel();
  const goal = useDailyGoal();
  const inbox = useInboxSummary();
  const [fetched, setFetched] = useState<Fetched>(NOTHING_YET);
  const [settled, setSettled] = useState({ level, count: 0 });
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const update = (part: Partial<Fetched>) => { if (!signal.aborted) setFetched(current => ({ ...current, ...part })); };
    const settle = () => { if (!signal.aborted) setSettled(current => current.level === level ? { level, count: current.count + 1 } : { level, count: 1 }); };
    fetchUnits(signal).then(async units => {
      update({ nextStep: nextCourseStep(units.filter(inLevel(level))) });
      // Newly completed lessons add their words and kanji to the deck before the count is read (as the dashboard does).
      await syncDeck(units).catch(() => 0);
      const reviews = await fetchSrsSummary(signal);
      update({ reviews: { dueTotal: reviews.dueTotal, reviewedToday: reviews.reviewedToday, total: reviews.total } });
    }).catch(() => { /* the lesson and review parts stay unknown */ }).finally(settle);
    fetchGamification(signal).then(gamification => update({
      streak: gamification.streak.current,
      today: { hasFinishedLesson: earnedToday(gamification, "lesson_completion"), hasPractised: earnedToday(gamification, "practice") },
    })).catch(() => { /* today's errands and the streak stay unknown */ }).finally(settle);
    fetchMistakes("open", signal).then(notebook => update({ openMistakes: notebook.counts.open })).catch(() => { /* see above */ }).finally(settle);
    return () => controller.abort();
  }, [level]);
  const data: VillageLiveData = {
    ...fetched,
    goal: goal && goal !== "error" ? { minutesToday: goal.minutesToday, goalMinutes: goal.goalMinutes, isGoalMet: goal.isGoalMet } : null,
    inbox: inbox ? { messages: inbox.direct + inbox.support, friendRequests: inbox.friendRequests ?? 0 } : null,
  };
  return { data, isLoading: settled.level !== level || settled.count < REQUESTS };
}
