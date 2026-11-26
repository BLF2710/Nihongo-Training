import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import englishExams from "../../../../shared/course/english/mock-exams.json";
import type { EnglishLevel, EnglishMockExam, EnglishMockGroup, EnglishMockQuestion } from "../../../../shared/course/english/schema.ts";
import { apiErrorMessage } from "../../api/errors";
import { fetchMockHistory, submitMockExam } from "../../api/mockExams";
import type { MockHistory } from "../../api/mockExams";
import { fetchUnits } from "../../api/units";
import type { CourseUnit } from "../../api/units";
import { EmptyNotice, EnglishStudyFrame, focusRing } from "../../components/englishStudy/EnglishStudyFrame";
import { useActivityTitle } from "../../context/ActivityContext";
import { gradeMockExam, levelReached, questionsOf } from "../../data/mockExams";
import type { MockResult } from "../../data/mockExams";
import { englishLevelOfId, useEnglishCourseLevel } from "../../lib/courseLevel";

// An English level's mock exam (/english/mock-exam): vocabulary, grammar and reading, timed. One question is shown at
// a time (with its passage beside it), so the exam fits one screen. The browser shows the result at once; the server
// grades it again and saves it, with its mistakes, like the Japanese mock exams.
const EXAMS = englishExams as unknown as Partial<Record<EnglishLevel, EnglishMockExam>>;   // written by the importer, which validates it
const SECONDS_PER_MINUTE = 60, LAST_MINUTES = 5 * SECONDS_PER_MINUTE, TICK_MS = 1000;
const primary = `rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focusRing}`;
const secondary = `rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-semibold hover:bg-gray-50 ${focusRing}`;
const clock = (seconds: number) => `${Math.floor(seconds / SECONDS_PER_MINUTE)}:${String(seconds % SECONDS_PER_MINUTE).padStart(2, "0")}`;

type Attempt = { startedAt: number; answers: Record<string, number> };
type Graded = { result: MockResult; answers: Record<string, number>; timedOut: boolean };
type SaveState = { status: "saving" } | { status: "saved" } | { status: "failed"; message: string };
/** A question with the instruction and passage of its group, in exam order. */
type Step = { question: EnglishMockQuestion; group: EnglishMockGroup; sectionTitle: string; number: number };

const stepsOf = (exam: EnglishMockExam): Step[] => exam.sections.flatMap(section => section.groups.flatMap(group => group.questions.map(question => ({ question, group, sectionTitle: section.title }))))
  .map((step, index) => ({ ...step, number: index + 1 }));

// An attempt in progress survives a reload in this tab.
const attemptKey = (exam: EnglishMockExam) => `mock-exam:${exam.id}:attempt`;
function readAttempt(exam: EnglishMockExam): Attempt | null {
  try { const saved = sessionStorage.getItem(attemptKey(exam)); return saved ? JSON.parse(saved) as Attempt : null; } catch { return null; }   // only this page writes it
}
function writeAttempt(exam: EnglishMockExam, attempt: Attempt | null) {
  try { if (attempt) sessionStorage.setItem(attemptKey(exam), JSON.stringify(attempt)); else sessionStorage.removeItem(attemptKey(exam)); } catch { /* the exam still works, it just isn't remembered */ }
}

export default function EnglishMockExamPage() {
  useActivityTitle("English mock exam");
  const level = useEnglishCourseLevel();
  const exam = EXAMS[level];
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(setUnits).catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your units could not be loaded.")); });
    return () => controller.abort();
  }, []);
  const levelUnits = (units ?? []).filter(unit => englishLevelOfId(unit.id) === level && !unit.isPlaceholder);
  return <EnglishStudyFrame title="Mock exam" titleVi="Thi thử" level={level} intro="A timed practice test over every unit of the level. It is not an official exam.">
    {!exam ? <EmptyNotice>The {level} mock exam is not available yet.</EmptyNotice> : <>
      {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
      {!units && !error && <p role="status" className="text-gray-500">Loading your units…</p>}
      {units && !levelReached(levelUnits) && <EmptyNotice>🔒 The mock exam opens when you reach the last unit of {level}. It covers every unit, so it's best taken at the end. <Link to="/lessons" className="font-bold text-emerald-700 underline">Go to lessons →</Link></EmptyNotice>}
      {units && levelReached(levelUnits) && <Exam key={exam.id} exam={exam} />}
    </>}
  </EnglishStudyFrame>;
}

function Exam({ exam }: { exam: EnglishMockExam }) {
  const [attempt, setAttempt] = useState<Attempt | null>(() => readAttempt(exam));
  const [graded, setGraded] = useState<Graded | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "saving" });
  const [history, setHistory] = useState<MockHistory | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetchMockHistory(exam.level, controller.signal).then(setHistory).catch(() => { /* the history is only a line on the start page */ });
    return () => controller.abort();
  }, [exam.level, graded]);
  const keep = (next: Attempt | null) => { setAttempt(next); writeAttempt(exam, next); };
  const send = (answers: Record<string, number>, timedOut: boolean) => {
    setSaveState({ status: "saving" });
    submitMockExam(exam.level, answers, timedOut).then(() => setSaveState({ status: "saved" }))
      .catch(failure => setSaveState({ status: "failed", message: apiErrorMessage(failure, "Your result could not be saved.") }));
  };
  const finish = (answers: Record<string, number>, timedOut: boolean) => {
    keep(null);
    setGraded({ result: gradeMockExam(exam, answers), answers, timedOut });
    if (Object.keys(answers).length) send(answers, timedOut);
    else setSaveState({ status: "failed", message: "An exam without answers isn't saved." });
  };
  if (graded) return <Results exam={exam} graded={graded} saveState={saveState} onSaveAgain={() => send(graded.answers, graded.timedOut)} onRetry={() => setGraded(null)} />;
  if (attempt) return <Running exam={exam} attempt={attempt} onAnswer={(id, option) => keep({ ...attempt, answers: { ...attempt.answers, [id]: option } })} onFinish={finish} />;
  const total = exam.sections.reduce((sum, section) => sum + questionsOf(section).length, 0);
  return <section aria-labelledby="exam-start" className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <h2 id="exam-start" className="text-2xl font-black">{exam.title}</h2>
    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
      <div><dt className="text-xs font-bold uppercase text-gray-500">Time</dt><dd className="text-xl font-black">{exam.minutes} minutes</dd></div>
      <div><dt className="text-xs font-bold uppercase text-gray-500">Questions</dt><dd className="text-xl font-black">{total}</dd></div>
      <div><dt className="text-xs font-bold uppercase text-gray-500">Target</dt><dd className="text-xl font-black">{exam.passPercent}%</dd><dd className="text-sm text-gray-500">and {exam.sectionMinPercent}% in each section</dd></div>
    </dl>
    <ul className="mt-3 text-gray-700">{exam.sections.map(section => <li key={section.id}><b>{section.title}</b> <span lang="vi" className="text-gray-500">{section.titleVi}</span> · {questionsOf(section).length} questions</li>)}</ul>
    <p className="mt-3 text-sm text-gray-600">The clock keeps running if you leave the page. You can change answers until you submit. Wrong answers go to your mistake notebook; XP and unit progress don't change.</p>
    {history && history.bestPercent !== null && <p className="mt-2 text-sm font-semibold">Your best: {history.bestPercent}%{history.hasPassed ? " · target reached ✓" : ""} · {history.attempts} {history.attempts === 1 ? "attempt" : "attempts"}</p>}
    <button type="button" className={`${primary} mt-4`} onClick={() => keep({ startedAt: Date.now(), answers: {} })}>Start the exam →</button>
  </section>;
}

function useSecondsLeft(exam: EnglishMockExam, attempt: Attempt) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), TICK_MS); return () => clearInterval(timer); }, []);
  return Math.max(0, exam.minutes * SECONDS_PER_MINUTE - Math.floor((now - attempt.startedAt) / TICK_MS));
}

function Running({ exam, attempt, onAnswer, onFinish }: {
  exam: EnglishMockExam; attempt: Attempt; onAnswer: (questionId: string, option: number) => void; onFinish: (answers: Record<string, number>, timedOut: boolean) => void;
}) {
  const steps = useMemo(() => stepsOf(exam), [exam]);
  const [position, setPosition] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const remaining = useSecondsLeft(exam, attempt);
  const isTimeUp = remaining === 0;
  useEffect(() => { if (isTimeUp) onFinish(attempt.answers, true); }, [isTimeUp]); // eslint-disable-line react-hooks/exhaustive-deps -- runs once, when the clock reaches zero
  const step = steps[position];
  const answered = Object.keys(attempt.answers).length;
  if (!step) return null;
  return <div>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
      <p role="timer" aria-label="Time remaining" className={`px-2 text-xl font-black tabular-nums ${remaining <= LAST_MINUTES ? "text-red-700" : ""}`}>⏱ {clock(remaining)}</p>
      <ol aria-label="Questions" className="flex flex-wrap gap-1">{steps.map((item, index) => {
        const isAnswered = attempt.answers[item.question.id] !== undefined;
        return <li key={item.question.id}><button type="button" aria-current={index === position ? "step" : undefined} onClick={() => { setPosition(index); setIsConfirming(false); }}
          aria-label={`Question ${item.number}${isAnswered ? ", answered" : ""}`}
          className={`h-7 w-7 rounded-full border text-xs font-bold ${focusRing} ${index === position ? "border-indigo-600 bg-indigo-600 text-white" : isAnswered ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-white"}`}>{item.number}</button></li>;
      })}</ol>
      <p className="px-2 text-sm font-bold">{answered} / {steps.length}</p>
    </div>
    <div className={`mt-3 grid gap-3 ${step.group.passage ? "md:grid-cols-2" : ""}`}>
      {step.group.passage && <section aria-label="Reading text" className="max-h-[45vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4 md:max-h-[calc(100vh-17rem)]">
        <p lang="en-GB" className="whitespace-pre-line leading-7">{step.group.passage}</p>
      </section>}
      <section aria-labelledby="exam-question" className="rounded-2xl border border-gray-200 bg-white p-4">
        <p className="text-xs font-bold uppercase text-emerald-700">{step.sectionTitle} · {step.group.instruction}</p>
        <p id="exam-question" lang="en-GB" className="mt-2 font-bold"><span className="mr-2 text-emerald-700">{step.number}.</span>{step.question.prompt}</p>
        <div role="radiogroup" aria-labelledby="exam-question" className="mt-3 grid gap-2 sm:grid-cols-2">{step.question.options.map((option, index) => {
          const isChosen = attempt.answers[step.question.id] === index;
          return <button key={option} type="button" role="radio" aria-checked={isChosen} onClick={() => onAnswer(step.question.id, index)}
            className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold ${focusRing} ${isChosen ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-gray-200 hover:bg-gray-50"}`}><span lang="en-GB">{option}</span></button>;
        })}</div>
      </section>
    </div>
    <div className="mt-3 flex flex-wrap justify-between gap-2">
      <button type="button" className={secondary} disabled={position === 0} onClick={() => setPosition(position - 1)}>← Previous</button>
      <div className="flex gap-2">
        {position < steps.length - 1 && <button type="button" className={primary} onClick={() => setPosition(position + 1)}>Next →</button>}
        {!isConfirming && <button type="button" className={secondary} onClick={() => setIsConfirming(true)}>Submit exam</button>}
      </div>
    </div>
    {isConfirming && <div role="alertdialog" aria-labelledby="submit-heading" className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p id="submit-heading" className="font-bold text-amber-950">{answered < steps.length ? `${steps.length - answered} unanswered. Submit anyway?` : "Submit your answers?"} You can't change them afterwards.</p>
      <div className="mt-3 flex gap-2"><button type="button" className={primary} onClick={() => onFinish(attempt.answers, false)}>Yes, submit</button><button type="button" className={secondary} onClick={() => setIsConfirming(false)}>Keep working</button></div>
    </div>}
  </div>;
}

function Results({ exam, graded, saveState, onSaveAgain, onRetry }: { exam: EnglishMockExam; graded: Graded; saveState: SaveState; onSaveAgain: () => void; onRetry: () => void }) {
  const { result, answers, timedOut } = graded;
  const steps = useMemo(() => stepsOf(exam), [exam]);
  const [shownIndex, setShownIndex] = useState(0);
  const shown = steps[shownIndex];
  return <div className="grid gap-3 md:grid-cols-2">
    <section aria-label="Exam result" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {timedOut && <p role="status" className="font-bold text-amber-800">Time is up. Your answers were submitted automatically.</p>}
      <p className="text-4xl font-black">{result.percent}% <span className="text-lg font-semibold text-gray-600">· {result.correct} / {result.total}</span></p>
      <p className={`mt-1 font-bold ${result.passed ? "text-emerald-700" : "text-amber-800"}`}>{result.passed ? `Target reached. You're ready to move beyond ${exam.level}.` : `Not at the target yet: ${exam.passPercent}% overall and ${exam.sectionMinPercent}% in each section.`}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">{result.sections.map(section => <li key={section.id} className={`rounded-xl border p-3 ${section.reached ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        <p className="text-sm font-bold">{section.title}</p><p className="text-xl font-black">{section.percent}%</p><p className="text-xs text-gray-600">{section.correct} / {section.total}</p>
      </li>)}</ul>
      <p role="status" className={`mt-3 text-sm ${saveState.status === "failed" ? "text-red-700" : "text-gray-500"}`}>
        {saveState.status === "saving" ? "Saving your result…" : saveState.status === "saved" ? <>Saved. Wrong answers are in your <Link to="/mistakes" className="font-semibold text-emerald-700 underline">mistake notebook</Link>.</> : saveState.message}
        {saveState.status === "failed" && Object.keys(answers).length > 0 && <button type="button" className="ml-2 font-bold underline" onClick={onSaveAgain}>Try again</button>}
      </p>
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" className={primary} onClick={onRetry}>Take it again</button><Link to="/english/review" className={secondary}>Review →</Link></div>
    </section>
    <section aria-label="Your answers" className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <ol aria-label="Questions" className="flex flex-wrap gap-1">{steps.map((item, index) => {
        const isRight = answers[item.question.id] === item.question.correctIndex;
        return <li key={item.question.id}><button type="button" aria-current={index === shownIndex ? "step" : undefined} onClick={() => setShownIndex(index)}
          aria-label={`Question ${item.number}, ${isRight ? "correct" : "wrong"}`}
          className={`h-7 w-7 rounded-full border text-xs font-bold ${focusRing} ${index === shownIndex ? "border-indigo-600 bg-indigo-600 text-white" : isRight ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-red-300 bg-red-50 text-red-800"}`}>{item.number}</button></li>;
      })}</ol>
      {shown && <AnswerReview step={shown} given={answers[shown.question.id]} />}
    </section>
  </div>;
}

function AnswerReview({ step, given }: { step: Step; given: number | undefined }) {
  const { question } = step;
  const isRight = given === question.correctIndex;
  return <div className="mt-3">
    <p lang="en-GB" className="font-bold"><span className="mr-2 text-emerald-700">{step.number}.</span>{question.prompt}</p>
    <p className={`mt-1 font-semibold ${isRight ? "text-emerald-700" : "text-red-700"}`}>{isRight ? "✓ Correct" : given === undefined ? "Not answered" : `✗ Your answer: ${question.options[given]}`}</p>
    {!isRight && <p className="font-semibold">Correct answer: <span lang="en-GB">{question.options[question.correctIndex]}</span></p>}
    <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{question.explanation}</p>
    {step.group.passage && <details className="mt-2 text-sm"><summary className="cursor-pointer font-semibold">Show the text</summary><p lang="en-GB" className="mt-1 whitespace-pre-line text-gray-700">{step.group.passage}</p></details>}
  </div>;
}
