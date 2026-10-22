import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuizChoices from "../components/QuizChoices";
import RubyText from "../components/RubyText";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { readingsForUnit } from "../data/japaneseReading";
import { recordPractice } from "../api/activity";
import LevelSwitch from "../components/LevelSwitch";
import { inLevel, useShownLevel } from "../lib/courseLevel";
import type { UnitReading } from "../data/japaneseReading";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const toggle = "rounded-xl border px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-emerald-600";

export default function ReadingPage() {
  const [params, setParams] = useSearchParams();
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setError(false); }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [retry]);

  // Passages open together with their unit's lessons; units without passages are not listed.
  const level = useShownLevel(params.get("unit"));
  const course = (units ?? []).filter(unit => inLevel(level)(unit) && !unit.isPlaceholder && readingsForUnit(unit.id).length);
  const reached = course.filter(unit => unit.allowed);
  const selected = reached.find(unit => unit.id === params.get("unit")) ?? reached[0];
  const passages = selected ? readingsForUnit(selected.id) : [];
  const passage = passages.find(item => item.id === params.get("passage"));

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <div className="mt-6"><LevelSwitch level={level} /></div>
    <h1 className="mt-3 text-3xl font-black">Reading</h1>
    <p className="mt-2 text-gray-600">Read short passages from the units you have reached, then check your understanding.</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your units could not be loaded. <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!units && !error && <p role="status" className="mt-5 text-gray-500">Loading your units…</p>}
    {units && !selected && <p className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">{course.length ? "No unit with reading passages is open yet. Passages appear here as soon as you reach their unit on the Lessons page." : `${level} has no reading passages yet. They arrive with its units.`}</p>}
    {selected && !passage && <>
      <label className="mt-6 block max-w-md text-sm font-bold text-gray-700">Choose a unit
        <select value={selected.id} onChange={event => setParams({ unit: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:outline-2 focus:outline-emerald-600">
          {course.map(unit => <option key={unit.id} value={unit.id} disabled={!unit.allowed}>Unit {unit.number}: {unit.title}{unit.allowed ? "" : ` — 🔒 ${unit.reasons.join(" + ")}`}</option>)}
        </select>
      </label>
      <ul className="mt-5 space-y-3">{passages.map(item => <li key={item.id}>
        <Link to={`?unit=${encodeURIComponent(selected.id)}&passage=${encodeURIComponent(item.id)}`} className="block rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-emerald-600">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{item.genre}</p>
          <h2 className="mt-1 text-lg font-bold">{item.lessonTitle} <span className="text-emerald-600">→</span></h2>
          <p className="mt-1 text-sm text-gray-500">{item.questions.length} {item.questions.length === 1 ? "question" : "questions"}</p>
        </Link>
      </li>)}</ul>
    </>}
    {selected && passage && <Passage key={passage.id} passage={passage} backTo={`?unit=${encodeURIComponent(selected.id)}`} />}
  </main></div>;
}

function Passage({ passage, backTo }: { passage: UnitReading; backTo: string }) {
  const [showReadings, setShowReadings] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const hasFurigana = passage.text.includes("<ruby>");
  const answered = Object.keys(answers).length;
  const correct = passage.questions.filter((question, index) => answers[index] === question.correct).length;
  // Answering every question finishes the passage, which counts toward the daily streak (once per attempt).
  const complete = answered === passage.questions.length;
  const reported = useRef(false);
  useEffect(() => {
    if (!complete) { reported.current = false; return; }
    if (reported.current) return;
    reported.current = true;
    recordPractice("reading", passage.unitId, answered, correct);
  }, [complete, passage.unitId, answered, correct]);

  return <article className="mt-6">
    <Link to={backTo} className="text-sm font-semibold text-gray-600 hover:underline">← All passages in this unit</Link>
    <section aria-label="Passage" className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{passage.genre}</p>
      <h2 className="mt-1 text-xl font-bold">{passage.lessonTitle}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {hasFurigana && <button aria-pressed={showReadings} onClick={() => setShowReadings(value => !value)} className={`${toggle} ${showReadings ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white"}`}>Furigana</button>}
        <button aria-pressed={showTranslation} onClick={() => setShowTranslation(value => !value)} className={`${toggle} ${showTranslation ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white"}`}>English translation</button>
      </div>
      <p lang="ja" className="mt-6 whitespace-pre-line text-xl leading-loose text-gray-900"><RubyText text={passage.text} showReadings={showReadings} /></p>
      {showTranslation && <p className="mt-5 whitespace-pre-line rounded-xl bg-gray-50 p-4 leading-relaxed text-gray-700">{passage.translation}</p>}
      <p className="mt-5 text-sm text-gray-500">From the lesson <Link to={passage.lessonHref} className="font-semibold text-emerald-700 hover:underline">{passage.lessonTitle}</Link>.</p>
    </section>

    <h2 className="mb-3 mt-8 text-xl font-bold">Check your understanding</h2>
    <ol className="space-y-5">{passage.questions.map((question, index) => {
      const selected = answers[index] ?? null;
      const isCorrect = selected === question.correct;
      return <li key={question.prompt} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="mb-4 font-bold text-gray-900"><span className="text-emerald-700">{index + 1}.</span> <RubyText text={question.prompt} /></p>
        <QuizChoices choices={question.options} selected={selected} disabled={selected !== null} onChoose={choice => setAnswers(previous => ({ ...previous, [index]: choice }))} />
        {selected !== null && <div className="mt-4">
          <p role="status" className={`font-bold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>{isCorrect ? "Correct!" : `Not quite. Correct answer: ${question.correct}`}</p>
          <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{question.explanation}</p>
        </div>}
      </li>;
    })}</ol>
    {answered === passage.questions.length && <section aria-label="Reading result" className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
      <p className="text-lg">You got <span className="font-black text-emerald-800">{correct} / {passage.questions.length}</span> correct.</p>
      <p className="mt-1 text-sm text-gray-600">Reading practice does not change your XP or statistics, but a finished passage counts toward your daily streak.</p>
      <div className="mt-4 flex flex-wrap gap-3"><button className={button} onClick={() => { setAnswers({}); setShowTranslation(false); }}>Try again</button><Link to={backTo} className={button}>Choose another passage</Link></div>
    </section>}
  </article>;
}
