import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import { fetchLearningOverview } from "../api/statistics";
import type { LearningOverview as Overview } from "../api/statistics";

const SECONDS_PER_MINUTE = 60;
const card = "min-w-0 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm";
const PRACTICE_LABELS: Record<string, string> = { listening: "Listening", speaking: "Speaking", reading: "Reading", "mock-exam": "Mock exams" };
const MISTAKE_LABELS = { lesson: "Lessons", review: "Reviews", assessment: "Assessments", mock_exam: "Mock exams" } as const;

const minutes = (seconds: number) => Math.round(seconds / SECONDS_PER_MINUTE);
const shortDay = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString([], { weekday: "short", day: "numeric" });

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-sm font-semibold text-gray-500">{label}</p>
    <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>{detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}</div>;
}

/** Bars for one measure per day or week, with the exact numbers on hover/focus and in a table. */
function BarChart({ title, rows, unit, goal }: { title: string; rows: { label: string; value: number }[]; unit: string; goal?: number }) {
  const max = Math.max(1, goal ?? 0, ...rows.map(row => row.value));
  return <figure className="mt-3">
    <div className="relative flex h-36 items-end gap-1 border-b border-gray-200" role="img" aria-label={`${title}: ${rows.map(row => `${row.label} ${row.value} ${unit}`).join(", ")}`}>
      {goal !== undefined && goal > 0 && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 border-t border-dashed border-gray-400" style={{ bottom: `${goal / max * 100}%` }}>
        <span className="absolute -top-2.5 left-0 rounded bg-white px-1 text-[11px] font-semibold text-gray-600">goal {goal} {unit}</span></div>}
      {rows.map(row => <div key={row.label} className="group relative flex h-full flex-1 items-end" tabIndex={0} aria-label={`${row.label}: ${row.value} ${unit}`}>
        <div className="w-full rounded-t bg-emerald-600" style={{ height: `${row.value / max * 100}%`, minHeight: row.value ? 3 : 0 }} />
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white group-hover:block group-focus:block">{row.label}: {row.value} {unit}</span>
      </div>)}
    </div>
    <div aria-hidden="true" className="mt-1 flex justify-between text-[11px] text-gray-500"><span>{rows[0]?.label}</span><span>{rows.at(-1)?.label}</span></div>
    <details className="mt-2 text-sm text-gray-600"><summary className="cursor-pointer font-semibold">Show as a table</summary>
      <table className="mt-2 w-full text-left"><thead><tr><th className="py-1">Date</th><th className="py-1 text-right">{unit}</th></tr></thead>
        <tbody>{rows.map(row => <tr key={row.label} className="border-t border-gray-100"><td className="py-1">{row.label}</td><td className="py-1 text-right tabular-nums">{row.value}</td></tr>)}</tbody></table></details>
  </figure>;
}

/** Study time, lessons, tests, kanji, reviews, mistakes and practice, from the server. */
export default function LearningOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchLearningOverview(controller.signal).then(data => { setOverview(data); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your learning statistics could not be loaded.")); });
    return () => controller.abort();
  }, [retry]);

  if (error) return <p role="alert" className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>;
  if (!overview) return <p role="status" className="mb-8 text-gray-500">Loading your learning statistics…</p>;
  const { studyTime, lessons, assessments, kanji, srs, mistakes, mockExams, practice, speaking } = overview;
  const remembered = srs.days.reduce((sum, day) => sum + day.remembered, 0), reviews = srs.days.reduce((sum, day) => sum + day.reviews, 0);

  return <section aria-labelledby="learning-heading" className="mb-12">
    <h2 id="learning-heading" className="text-2xl font-black text-gray-900">Your learning</h2>
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Study time, 14 days" value={`${minutes(studyTime.totalSeconds)} min`} detail={`Daily goal met on ${studyTime.daysGoalMet} ${studyTime.daysGoalMet === 1 ? "day" : "days"}`} />
      <Tile label="Lessons completed" value={String(lessons.completed)} detail={`${lessons.weeks.at(-1)?.lessons ?? 0} this week`} />
      <Tile label="Cards in review deck" value={String(srs.total)} detail={`${srs.mature} well learned · ${srs.dueTotal} due today`} />
      <Tile label="Mistakes to practise" value={String(mistakes.open)} detail={`${mistakes.resolved} cleared`} />
    </div>

    <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
      <div className={card}><h3 className="font-bold">Minutes studied per day</h3>
        <BarChart title="Minutes studied per day" unit="min" goal={studyTime.goalMinutes} rows={studyTime.days.map(day => ({ label: shortDay(day.day), value: minutes(day.seconds) }))} /></div>
      <div className={card}><h3 className="font-bold">Lessons completed per week</h3>
        <BarChart title="Lessons completed per week" unit="lessons" rows={lessons.weeks.map(week => ({ label: `Week of ${new Date(`${week.week}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}`, value: week.lessons }))} /></div>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-3">
      <div className={card}><h3 className="font-bold">Daily review</h3>
        <p className="mt-2 text-sm text-gray-600">{reviews ? `${reviews} reviews in 14 days, ${Math.round(remembered / reviews * 100)}% remembered.` : "No reviews yet."}</p>
        <p className="mt-1 text-sm text-gray-600">{srs.learned} of {srs.total} cards studied · {srs.newCards} new waiting</p>
        <Link to="/srs" className="mt-3 inline-block text-sm font-bold text-emerald-700">Open the daily review →</Link></div>
      <div className={card}><h3 className="font-bold">Kanji</h3>
        <p className="mt-2 text-sm text-gray-600">{kanji.mastered} mastered · {kanji.learning} learning · {kanji.untested} not practised yet</p>
        <progress aria-label="Kanji mastered" max={kanji.total || 1} value={kanji.mastered} className="mt-3 h-2 w-full accent-emerald-600" />
        <Link to="/learn/kanji/practice" className="mt-3 inline-block text-sm font-bold text-emerald-700">Kanji practice →</Link></div>
      <div className={card}><h3 className="font-bold">Mistakes by where they happened</h3>
        <ul className="mt-2 space-y-1 text-sm text-gray-600">{(Object.keys(MISTAKE_LABELS) as (keyof typeof MISTAKE_LABELS)[]).map(source =>
          <li key={source} className="flex justify-between"><span>{MISTAKE_LABELS[source]}</span><span className="font-semibold tabular-nums">{mistakes.bySource[source]}</span></li>)}</ul>
        <Link to="/mistakes" className="mt-3 inline-block text-sm font-bold text-emerald-700">Mistake notebook →</Link></div>
    </div>

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <div className={card}><h3 className="font-bold">Unit assessments</h3>
        {assessments.length ? <ul className="mt-2 divide-y divide-gray-100 text-sm">{assessments.map(item => <li key={item.unitId} className="flex justify-between gap-3 py-2">
          <span className="min-w-0 truncate">{item.level} Unit {item.number} · {item.title}</span><span className="shrink-0 font-semibold tabular-nums">{item.bestScore}%{item.isPassed ? " ✓" : ""}</span></li>)}</ul>
          : <p className="mt-2 text-sm text-gray-600">No assessments taken yet.</p>}</div>
      <div className={card}><h3 className="font-bold">Mock exams</h3>
        {mockExams.length ? <ul className="mt-2 divide-y divide-gray-100 text-sm">{mockExams.map(result => <li key={result.id} className="flex justify-between gap-3 py-2">
          <span>{result.level} · {new Date(result.createdAt).toLocaleDateString()}{result.timedOut ? " · time ran out" : ""}</span><span className="font-semibold tabular-nums">{result.percent}%{result.passed ? " ✓" : ""}</span></li>)}</ul>
          : <p className="mt-2 text-sm text-gray-600">No mock exams yet.</p>}</div>
      <div className={card}><h3 className="font-bold">Practice sessions</h3>
        {practice.length ? <ul className="mt-2 divide-y divide-gray-100 text-sm">{practice.map(item => <li key={item.kind} className="flex justify-between gap-3 py-2">
          <span>{PRACTICE_LABELS[item.kind] ?? item.kind} · {item.sessions} {item.sessions === 1 ? "session" : "sessions"}</span><span className="font-semibold tabular-nums">{item.answered ? Math.round(item.correct / item.answered * 100) : 0}% right</span></li>)}</ul>
          : <p className="mt-2 text-sm text-gray-600">No listening, speaking or reading sessions yet.</p>}</div>
      <div className={card}><h3 className="font-bold">Speaking tests</h3>
        {speaking.length ? <ul className="mt-2 divide-y divide-gray-100 text-sm">{speaking.map(item => <li key={item.level} className="flex justify-between gap-3 py-2">
          <span>{item.level} · {item.attempts} {item.attempts === 1 ? "attempt" : "attempts"} · {item.tasksMet} {item.tasksMet === 1 ? "task" : "tasks"} at target</span><span className="font-semibold tabular-nums">best {item.bestScore}</span></li>)}</ul>
          : <p className="mt-2 text-sm text-gray-600">No speaking tests yet.</p>}</div>
    </div>
  </section>;
}
