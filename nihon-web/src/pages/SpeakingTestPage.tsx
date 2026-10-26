import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpeakingResultView, { BandChip } from "../components/speaking/SpeakingResultView";
import SpeakingTaskRunner from "../components/speaking/SpeakingTaskRunner";
import { apiErrorMessage } from "../api/errors";
import { fetchSpeakingAttempts, fetchSpeakingTest } from "../api/speakingTest";
import type { SpeakingLevel, SpeakingResult, SpeakingTestOverview } from "../api/speakingTest";
import { useCourseLevel } from "../lib/courseLevel";

const TEST_LEVELS: readonly SpeakingLevel[] = ["N3", "N2", "N1"];
const isTestLevel = (value: unknown): value is SpeakingLevel => TEST_LEVELS.some(level => level === value);
const KIND_LABEL = { read_aloud: "Read aloud", production: "Talk about it", interaction: "Conversation" } as const;

/** The speaking test for N3 and above: graded free answers and read-aloud (see GRADING.md). */
export default function SpeakingTestPage() {
  const [params, setParams] = useSearchParams();
  const courseLevel = useCourseLevel();
  const level: SpeakingLevel = isTestLevel(params.get("level")) ? params.get("level") as SpeakingLevel : isTestLevel(courseLevel) ? courseLevel : "N3";
  const taskId = params.get("task");
  const [overview, setOverview] = useState<SpeakingTestOverview | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SpeakingResult[]>([]);
  const [shown, setShown] = useState<SpeakingResult | null>(null);

  const load = useCallback((signal?: AbortSignal) => fetchSpeakingTest(level, signal)
    .then(data => { setOverview(data); setError(""); })
    .catch(failure => { if (!signal?.aborted) setError(apiErrorMessage(failure, "Could not load the speaking test.")); }), [level]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  const loadHistory = useCallback((signal?: AbortSignal) => taskId ? fetchSpeakingAttempts(taskId, signal).then(setHistory).catch(() => setHistory([])) : Promise.resolve(), [taskId]);
  useEffect(() => { const controller = new AbortController(); void loadHistory(controller.signal); return () => controller.abort(); }, [loadHistory]);

  const task = overview?.tasks.find(item => item.id === taskId) ?? null;
  const open = (id: string | null) => { setShown(null); setParams(id ? { level, task: id } : { level }); };
  const graded = (result: SpeakingResult) => { setShown(result); void load(); void loadHistory(); };

  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-3xl font-black">Speaking test</h1><p className="mt-1 text-gray-600">Answer in your own words and get a graded result for your level. N5 and N4 use <Link to="/speaking" className="font-semibold text-emerald-700 hover:underline">speaking practice</Link>.</p></div>
      <nav aria-label="Level" className="flex gap-1 rounded-xl bg-gray-100 p-1">{TEST_LEVELS.map(item =>
        <button key={item} type="button" aria-pressed={item === level} onClick={() => { setShown(null); setParams({ level: item }); }} className={`rounded-lg px-3 py-1.5 text-sm font-bold ${item === level ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{item}</button>)}</nav>
    </div>
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error} <button className="font-bold underline" onClick={() => void load()}>Try again</button></p>}
    {!overview && !error && <p role="status" className="mt-6">Loading the speaking test…</p>}
    {overview && !overview.open && <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 text-center"><p className="text-3xl" aria-hidden="true">🔒</p><h2 className="mt-2 text-lg font-bold">The {overview.level} speaking test is locked</h2><p className="mt-1 text-gray-600">{overview.lockedReason}</p></section>}
    {overview?.open && <>
      <p className="mt-4 text-sm text-gray-600">Target level <b>{overview.jfLevel}</b> (JF Standard) · {overview.usedToday} of {overview.dailyLimit} answers graded today · bands from がんばろう to すばらしい, 63/100 meets the target.</p>
      {overview.delivery === "browser" && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Pronunciation and fluency aren't scored on this site yet, so free answers are graded on content only, and read-aloud by how closely the speech recogniser matched the passage.</p>}
      {!overview.contentGrading && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Grading of free answers isn't available right now. Read-aloud tasks still work.</p>}
      {!task ? <ul className="mt-6 grid gap-4 sm:grid-cols-2">{overview.tasks.map(item => <li key={item.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{KIND_LABEL[item.kind]}</p>
        <h2 className="mt-1 text-lg font-bold">{item.title}</h2>
        <p className="mt-1 flex-1 text-sm text-gray-600">{item.canDo}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {item.best ? <span className="text-sm text-gray-700">Best: <b className="tabular-nums">{item.best.score}</b> <BandChip band={item.best.band} />{item.best.met && <span className="ml-1 font-semibold text-emerald-700">✓</span>}</span> : <span className="text-sm text-gray-600">Not tried yet</span>}
          <button type="button" disabled={!item.available} onClick={() => open(item.id)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50" aria-label={`${!item.available ? "Unavailable" : item.best ? "Try again" : "Start"}: ${item.title}`}>{item.available ? (item.best ? "Try again" : "Start") : "Unavailable"}</button>
        </div>
      </li>)}</ul> : <div className="mt-6 space-y-6">
        <button type="button" onClick={() => open(null)} className="text-sm font-semibold text-gray-600 hover:text-gray-900">← All {overview.level} tasks</button>
        {shown ? <SpeakingResultView result={shown} onRetry={() => setShown(null)} /> : <SpeakingTaskRunner key={task.id} task={task} delivery={overview.delivery} onGraded={graded} />}
        {history.length > 0 && <section aria-labelledby="history-heading" className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 id="history-heading" className="font-bold">Your results for this task</h2>
          <ul className="mt-2 divide-y divide-gray-100">{history.map(result => <li key={result.id}>
            <button type="button" onClick={() => setShown(result)} aria-current={shown?.id === result.id ? "true" : undefined} className={`flex w-full flex-wrap items-center gap-3 px-1 py-2 text-left text-sm hover:bg-gray-50 ${shown?.id === result.id ? "bg-emerald-50" : ""}`}>
              <span className="w-10 font-black tabular-nums">{result.score}</span><BandChip band={result.band} /><span className="text-gray-600">{new Date(result.createdAt).toLocaleString()}</span>{result.met && <span className="font-semibold text-emerald-700">✓ met</span>}
            </button>
          </li>)}</ul>
        </section>}
      </div>}
    </>}
  </main></div>;
}
