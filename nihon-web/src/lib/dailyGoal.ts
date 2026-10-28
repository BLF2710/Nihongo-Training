import { useEffect, useState } from "react";
import { fetchTodayProgress } from "../api/activity";
import type { DailyGoalProgress } from "../api/activity";

const DAILY_GOAL_EVENT = "lingora:daily-goal";

/** Tells open views that today's study time changed (after a report was saved). */
export function announceDailyGoal(progress: DailyGoalProgress) {
  window.dispatchEvent(new CustomEvent<DailyGoalProgress>(DAILY_GOAL_EVENT, { detail: progress }));
}

/** Today's study time against the learner's goal: null while loading, "error" when it couldn't be loaded. */
export function useDailyGoal(): DailyGoalProgress | null | "error" {
  const [progress, setProgress] = useState<DailyGoalProgress | null | "error">(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchTodayProgress(controller.signal).then(setProgress).catch(() => { if (!controller.signal.aborted) setProgress("error"); });
    const onChange = (event: Event) => { if (event instanceof CustomEvent) setProgress(event.detail); };
    window.addEventListener(DAILY_GOAL_EVENT, onChange);
    return () => { controller.abort(); window.removeEventListener(DAILY_GOAL_EVENT, onChange); };
  }, []);
  return progress;
}
