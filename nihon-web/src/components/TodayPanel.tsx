import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMistakes } from "../api/mistakes";
import { fetchSrsSummary } from "../api/srs";
import type { SrsSummary } from "../api/srs";
import type { CourseUnit } from "../api/units";
import { useDailyGoal } from "../lib/dailyGoal";
import { syncDeck } from "../lib/srsDeck";

const SECONDS_PER_MINUTE = 60;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600";
const tile = `flex min-w-0 flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 ${focus}`;

/** Today at a glance: reviews due, the daily goal and mistakes to practise. Each part fails on its own. */
export default function TodayPanel({ units }: { units: CourseUnit[] | null }) {
  const goal = useDailyGoal();
  const [reviews, setReviews] = useState<SrsSummary | null | "error">(null);
  const [openMistakes, setOpenMistakes] = useState<number | null>(null);
  useEffect(() => {
    if (!units) return;
    const controller = new AbortController();
    // Newly completed lessons add their words and kanji before the count is shown.
    syncDeck(units).catch(() => 0).then(() => fetchSrsSummary(controller.signal)).then(setReviews)
      .catch(() => { if (!controller.signal.aborted) setReviews("error"); });
    return () => controller.abort();
  }, [units]);
  useEffect(() => {
    const controller = new AbortController();
    fetchMistakes("open", controller.signal).then(notebook => setOpenMistakes(notebook.counts.open)).catch(() => { /* the tile shows a dash */ });
    return () => controller.abort();
  }, []);

  const minutesLeft = goal && goal !== "error" ? Math.max(1, goal.goalMinutes - goal.minutesToday) : 0;
  const goalShare = goal && goal !== "error" ? Math.min(1, goal.secondsToday / (goal.goalMinutes * SECONDS_PER_MINUTE)) : 0;
  return <section aria-labelledby="today-goals-heading" className="mt-6">
    <h2 id="today-goals-heading" className="sr-only">Today</h2>
    <div className="grid gap-4 md:grid-cols-3">
      <Link to="/srs" className={tile}>
        <p className="text-sm font-semibold text-gray-500"><span aria-hidden="true">🗂️ </span>Daily review</p>
        <p className="mt-1 text-2xl font-black">{reviews === null ? "…" : reviews === "error" ? "—" : `${reviews.dueTotal} due today`}</p>
        <p className="mt-1 text-sm text-gray-500">{reviews === null || reviews === "error" ? "Words and kanji from your lessons." : reviews.total === 0 ? "Finish a lesson to start your deck." : reviews.dueTotal === 0 ? "All caught up ✓" : `${reviews.dueNow} to review · ${reviews.newToday} new`}</p>
        <span className="mt-auto pt-3 text-sm font-bold text-emerald-700">{reviews !== null && reviews !== "error" && reviews.dueTotal > 0 ? "Start review →" : "Open deck →"}</span>
      </Link>
      <div className={`${tile} hover:border-gray-200`}>
        <p className="text-sm font-semibold text-gray-500"><span aria-hidden="true">🎯 </span>Daily goal</p>
        {goal === null ? <p role="status" className="mt-1 text-2xl font-black">…</p> : goal === "error" ? <p className="mt-1 text-sm text-gray-500">Today's study time is unavailable.</p> : <>
          <p className="mt-1 text-2xl font-black">{goal.minutesToday} / {goal.goalMinutes} min</p>
          <progress aria-label="Study time toward today's goal" max={1} value={goalShare} className="mt-2 h-2 w-full accent-emerald-600" />
          <p className="mt-1 text-sm text-gray-500">{goal.isGoalMet ? "Goal reached today ✓" : `About ${minutesLeft} more ${minutesLeft === 1 ? "minute" : "minutes"} of lessons or practice.`}</p>
        </>}
        <Link to="/settings/learning" className={`mt-auto pt-3 text-sm font-bold text-emerald-700 ${focus}`}>Change goal →</Link>
      </div>
      <Link to="/mistakes" className={tile}>
        <p className="text-sm font-semibold text-gray-500"><span aria-hidden="true">📒 </span>Mistake notebook</p>
        <p className="mt-1 text-2xl font-black">{openMistakes === null ? "—" : `${openMistakes} to practise`}</p>
        <p className="mt-1 text-sm text-gray-500">{openMistakes === 0 ? "No mistakes waiting ✓" : "Wrong answers from lessons, reviews and tests."}</p>
        <span className="mt-auto pt-3 text-sm font-bold text-emerald-700">Open notebook →</span>
      </Link>
    </div>
  </section>;
}
