import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RubyText from "../components/RubyText";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { getMockExam, gradeMockExam, levelReached, questionNumbers, questionsOf } from "../data/mockExams";
import type { MockExam, MockResult } from "../data/mockExams";
import { getUserEmail } from "../lib/authStorage";
import { recordPractice } from "../api/activity";
import { isCourseLevel, levelOfId, useCourseLevel } from "../lib/courseLevel";

const primary = "rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600";
const card = "rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8";

type Attempt = { startedAt: number; answers: Record<string, number> };
type Best = { percent: number; passed: boolean };

// An attempt in progress survives a reload in this tab; the best result is remembered in this browser.
// Neither is sent to the server: the mock exam is practice and does not change XP or unit progress.
const attemptKey = (exam: MockExam) => `mock-exam:${exam.id}:attempt`;
const bestKey = (exam: MockExam) => `mock-exam:${exam.id}:best:${getUserEmail() ?? ""}`;
function read<T>(storage: () => Storage, key: string): T | null {
  try { const saved = storage().getItem(key); return saved ? JSON.parse(saved) as T : null; } catch { return null; }
}
function write(storage: () => Storage, key: string, value: unknown) {
  try { if (value === null) storage().removeItem(key); else storage().setItem(key, JSON.stringify(value)); } catch { /* Nothing is remembered, and the exam still works. */ }
}
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function MockExamPage() {
  const [params] = useSearchParams();
  const current = useCourseLevel();
  const requested = params.get("level");
  const level = isCourseLevel(requested) ? requested : current;
  const exam = getMockExam(level);
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setError(false); }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [retry]);
  const course = (units ?? []).filter(unit => levelOfId(unit.id) === level && !unit.isPlaceholder);

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <h1 className="mt-6 text-3xl font-black">{level} mock exam</h1>
    {!exam ? <section className={`${card} mt-6`}>
      <p className="text-gray-600">The {level} mock exam is not available yet. It arrives together with the level's units.</p>
      <Link to="/levels?next=/mock-exam" className={`${primary} mt-5 inline-block`}>Choose another level →</Link>
    </section> : <>
      {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your units could not be loaded. <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
      {!units && !error && <p role="status" className="mt-5 text-gray-500">Loading your units…</p>}
      {units && !levelReached(course) && <section className={`${card} mt-6`}>
        <p className="font-bold">🔒 The mock exam opens when you reach the last unit of {level}.</p>
        <p className="mt-2 text-gray-600">It covers every unit of the level, so it is best taken at the end.</p>
        <Link to="/lessons" className={`${primary} mt-5 inline-block`}>Go to lessons →</Link>
      </section>}
      {units && levelReached(course) && <Exam key={exam.id} exam={exam} />}
    </>}
  </main></div>;
}

function Exam({ exam }: { exam: MockExam }) {
  const [attempt, setAttempt] = useState<Attempt | null>(() => read<Attempt>(() => sessionStorage, attemptKey(exam)));
  const [result, setResult] = useState<{ result: MockResult; answers: Record<string, number>; timedOut: boolean } | null>(null);
  const [best, setBest] = useState<Best | null>(() => read<Best>(() => localStorage, bestKey(exam)));
  const total = exam.sections.reduce((sum, section) => sum + questionsOf(section).length, 0);

  const save = (next: Attempt | null) => { setAttempt(next); write(() => sessionStorage, attemptKey(exam), next); };
  const finish = (answers: Record<string, number>, timedOut: boolean) => {
    const graded = gradeMockExam(exam, answers);
    if (!best || graded.percent > best.percent) {
      const record = { percent: graded.percent, passed: graded.passed };
      setBest(record); write(() => localStorage, bestKey(exam), record);
    }
    // A submitted exam counts toward the daily streak (an empty one does not).
    recordPractice("mock-exam", exam.level, Object.keys(answers).length, graded.correct);
    save(null); setResult({ result: graded, answers, timedOut });
    window.scrollTo({ top: 0 });
  };

  if (result) return <Results exam={exam} {...result} onRetry={() => setResult(null)} />;
  if (attempt) return <Running exam={exam} attempt={attempt} total={total} onAnswer={(id, option) => save({ ...attempt, answers: { ...attempt.answers, [id]: option } })} onFinish={finish} />;
  return <section className={`${card} mt-6`}>
    <p className="text-gray-600">A practice exam in the style of the JLPT {exam.level}, built only from what this course has taught. It is not an official test.</p>
    <dl className="mt-5 grid gap-4 sm:grid-cols-3">
      <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Time</dt><dd className="mt-1 text-xl font-black">{exam.minutes} minutes</dd></div>
      <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Questions</dt><dd className="mt-1 text-xl font-black">{total}</dd></div>
      <div><dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Target</dt><dd className="mt-1 text-xl font-black">{exam.passPercent}% overall</dd><dd className="text-sm text-gray-500">and {exam.sectionMinPercent}% in each section</dd></div>
    </dl>
    <ul className="mt-5 space-y-2 text-gray-700">{exam.sections.map(section => <li key={section.id}><span className="font-bold">{section.title}</span> <span lang="ja" className="text-gray-500">{section.titleJp}</span> · {questionsOf(section).length} questions</li>)}</ul>
    <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-gray-600">
      <li>The clock starts when you begin and keeps running if you leave the page.</li>
      <li>You can move between sections and change answers until you submit.</li>
      <li>Answers and explanations are shown after you submit. There is no listening section.</li>
      <li>The result is for practice: it does not change your XP, statistics or unit progress, but finishing the exam counts toward your daily streak.</li>
    </ul>
    {best && <p className="mt-5 text-sm font-semibold text-gray-700">Your best result in this browser: {best.percent}%{best.passed ? " · target reached ✓" : ""}</p>}
    <button className={`${primary} mt-6`} onClick={() => save({ startedAt: Date.now(), answers: {} })}>Start the exam →</button>
  </section>;
}

function Running({ exam, attempt, total, onAnswer, onFinish }: {
  exam: MockExam; attempt: Attempt; total: number; onAnswer: (questionId: string, option: number) => void; onFinish: (answers: Record<string, number>, timedOut: boolean) => void;
}) {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = Math.max(0, exam.minutes * 60 - Math.floor((now - attempt.startedAt) / 1000));
  const timeUp = remaining === 0;
  useEffect(() => { if (timeUp) onFinish(attempt.answers, true); }, [timeUp]); // eslint-disable-line react-hooks/exhaustive-deps -- runs once, when the clock reaches zero

  const section = exam.sections[sectionIndex];
  const answered = Object.keys(attempt.answers).length;
  const isLast = sectionIndex === exam.sections.length - 1;
  const goTo = (index: number) => { setSectionIndex(index); setConfirming(false); window.scrollTo({ top: 0 }); };
  const numbers = questionNumbers(exam);

  return <div className="mt-6">
    <div className="sticky top-18 z-20 -mx-4 border-b border-gray-200 bg-gray-50/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="timer" aria-label="Time remaining" className={`text-2xl font-black tabular-nums ${remaining <= 300 ? "text-red-700" : "text-gray-900"}`}>{clock(remaining)}</p>
        <p className="text-sm font-semibold text-gray-600">{answered} / {total} answered</p>
      </div>
      <div role="tablist" aria-label="Exam sections" className="mt-3 flex flex-wrap gap-2">{exam.sections.map((item, index) => {
        const done = questionsOf(item).filter(question => attempt.answers[question.id] !== undefined).length;
        return <button key={item.id} role="tab" aria-selected={index === sectionIndex} onClick={() => goTo(index)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${index === sectionIndex ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"}`}>
          {item.title} <span className="font-normal">({done}/{questionsOf(item).length})</span>
        </button>;
      })}</div>
    </div>

    <h2 className="mt-6 text-2xl font-black">{section.title} <span lang="ja" className="ml-2 text-lg font-semibold text-gray-500">{section.titleJp}</span></h2>
    {section.groups.map(group => <section key={group.instruction + (group.passage ?? "")} className="mt-6">
      <p className="font-bold text-emerald-800">{group.instruction}</p>
      {group.passage && <p lang="ja" className="mt-3 whitespace-pre-line rounded-2xl border border-gray-200 bg-white p-5 text-lg leading-loose"><RubyText text={group.passage} /></p>}
      <ol className="mt-4 space-y-4">{group.questions.map(question => {
        return <li key={question.id} className="rounded-2xl border border-gray-200 bg-white p-5">
          <p id={`q-${question.id}`} className="font-bold leading-relaxed"><span className="mr-2 text-emerald-700">{numbers.get(question.id)}.</span><RubyText text={question.prompt} /></p>
          <div role="radiogroup" aria-labelledby={`q-${question.id}`} className="mt-4 grid gap-3 sm:grid-cols-2">{question.options.map((option, index) => {
            const chosen = attempt.answers[question.id] === index;
            return <button key={option} type="button" role="radio" aria-checked={chosen} onClick={() => onAnswer(question.id, index)}
              className={`rounded-xl border px-4 py-3 text-left font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600 ${chosen ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-gray-200 hover:bg-gray-50"}`}>
              <RubyText text={option} />
            </button>;
          })}</div>
        </li>;
      })}</ol>
    </section>)}

    <div className="mt-8 flex flex-wrap gap-3">
      {sectionIndex > 0 && <button className={button} onClick={() => goTo(sectionIndex - 1)}>← {exam.sections[sectionIndex - 1].title}</button>}
      {!isLast && <button className={primary} onClick={() => goTo(sectionIndex + 1)}>{exam.sections[sectionIndex + 1].title} →</button>}
      {!confirming && <button className={isLast ? primary : button} onClick={() => setConfirming(true)}>Submit exam</button>}
    </div>
    {confirming && <div role="alertdialog" aria-labelledby="submit-heading" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p id="submit-heading" className="font-bold text-amber-950">{answered < total ? `${total - answered} ${total - answered === 1 ? "question is" : "questions are"} unanswered. Submit anyway?` : "Submit your answers?"}</p>
      <p className="mt-1 text-sm text-amber-900">You cannot change answers after submitting.</p>
      <div className="mt-4 flex flex-wrap gap-3"><button className={primary} onClick={() => onFinish(attempt.answers, false)}>Yes, submit</button><button className={button} onClick={() => setConfirming(false)}>Keep working</button></div>
    </div>}
  </div>;
}

function Results({ exam, result, answers, timedOut, onRetry }: { exam: MockExam; result: MockResult; answers: Record<string, number>; timedOut: boolean; onRetry: () => void }) {
  const numbers = questionNumbers(exam);
  return <div className="mt-6">
    <section aria-label="Exam result" className={card}>
      {timedOut && <p role="status" className="mb-3 font-bold text-amber-800">Time is up. Your answers were submitted automatically.</p>}
      <p className="text-sm font-bold uppercase tracking-wider text-gray-500">Your result</p>
      <p className="mt-1 text-4xl font-black">{result.percent}% <span className="text-lg font-semibold text-gray-600">· {result.correct} / {result.total} correct</span></p>
      <p className={`mt-3 text-lg font-bold ${result.passed ? "text-emerald-700" : "text-amber-800"}`}>{result.passed
        ? `Target reached. You are ready to move beyond ${exam.level}.`
        : `Not at the target yet: ${exam.passPercent}% overall and ${exam.sectionMinPercent}% in each section.`}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">{result.sections.map(section => <li key={section.id} className={`rounded-2xl border p-4 ${section.reached ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        <p className="font-bold">{section.title}</p>
        <p className="mt-1 text-2xl font-black">{section.percent}%</p>
        <p className="text-sm text-gray-600">{section.correct} / {section.total} correct{section.reached ? "" : " · below the section minimum"}</p>
      </li>)}</ul>
      <p className="mt-4 text-sm text-gray-500">This is a practice result. It does not change your XP, statistics or unit progress.</p>
      <div className="mt-5 flex flex-wrap gap-3"><button className={primary} onClick={onRetry}>Take it again</button><Link to={`/review?unit=level:${exam.level}`} className={button}>Cumulative review →</Link><Link to={`/grammar/summary?level=${exam.level}`} className={button}>Grammar summary →</Link></div>
    </section>

    <h2 className="mt-8 text-2xl font-black">Review your answers</h2>
    {exam.sections.map(section => <section key={section.id} className="mt-6">
      <h3 className="text-lg font-bold text-emerald-800">{section.title}</h3>
      {section.groups.map(group => <div key={group.instruction + (group.passage ?? "")}>
        {group.passage && <p lang="ja" className="mt-3 whitespace-pre-line rounded-2xl border border-gray-200 bg-white p-5 leading-loose"><RubyText text={group.passage} /></p>}
        <ol className="mt-3 space-y-3">{group.questions.map(question => {
          const given = answers[question.id];
          const correct = given === question.correctIndex;
          return <li key={question.id} className={`rounded-2xl border bg-white p-5 ${correct ? "border-emerald-200" : "border-red-200"}`}>
            <p className="font-bold leading-relaxed"><span className="mr-2 text-emerald-700">{numbers.get(question.id)}.</span><RubyText text={question.prompt} /></p>
            <p className={`mt-2 font-semibold ${correct ? "text-emerald-700" : "text-red-700"}`}>{correct ? "✓ Correct" : given === undefined ? "Not answered" : <>✗ Your answer: <RubyText text={question.options[given]} /></>}</p>
            {!correct && <p className="mt-1 font-semibold text-gray-900">Correct answer: <RubyText text={question.options[question.correctIndex]} /></p>}
            <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700"><RubyText text={question.explanation} /></p>
          </li>;
        })}</ol>
      </div>)}
    </section>)}
  </div>;
}
