import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import RubyText from "../components/RubyText";
import { recordPractice } from "../api/activity";
import { recordLessonAnswers } from "../api/mistakes";
import type { LessonAnswer } from "../api/mistakes";
import { getUserHandle } from "../lib/authStorage";
import { levelOfId } from "../lib/courseLevel";
import { scoreAnswer } from "../lib/particleDrop";
import type { ParticleQuestion } from "../lib/particleDrop";
import { MIN_QUESTIONS, useParticleRound } from "../lib/useParticleRound";

const QUESTION_SECONDS = 15;
const TICK_MS = 100;
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focus}`;
const button = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 ${focus}`;
const card = "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8";

type Answer = { question: ParticleQuestion; given: string | null; correct: boolean; points: number };

const bestKey = () => `particle-drop-best:${getUserHandle() ?? ""}`;
function readBest(): number {
  try { return Number(localStorage.getItem(bestKey())) || 0; } catch { return 0; }
}
function saveBest(score: number) {
  try { localStorage.setItem(bestKey(), String(score)); } catch { /* the best score is only a convenience */ }
}
const sentenceWithGap = (question: ParticleQuestion) => question.parts.map(part => part ?? "＿").join("");

/** The round's answers to the mistake notebook (wrong ones are noted, right ones count toward clearing). */
function saveAnswers(answers: Answer[]) {
  const byLesson = new Map<string, LessonAnswer[]>();
  // A question left to time out has no chosen particle, so it can't be practised as a choice later.
  for (const { question, given, correct } of answers) {
    if (given === null) continue;
    const saved: LessonAnswer = { prompt: sentenceWithGap(question), options: question.options, answer: question.answer, given, correct, explanation: `${question.meaning} (${question.romaji})` };
    byLesson.set(question.lessonId, [...(byLesson.get(question.lessonId) ?? []), saved]);
  }
  for (const [lessonId, lessonAnswers] of byLesson) void recordLessonAnswers(lessonId, lessonAnswers).catch(() => { /* the round itself already counted */ });
}

/** Fill in the missing particle before the time runs out, with sentences from finished lessons. */
export default function ParticleDropPage() {
  const round = useParticleRound();
  const [phase, setPhase] = useState<"intro" | "playing" | "finished">("intro");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const finish = useCallback((done: Answer[]) => {
    setAnswers(done); setPhase("finished");
    const correct = done.filter(answer => answer.correct).length;
    recordPractice("particles", levelOfId(done[0].question.lessonId) ?? "N5", done.length, correct);
    saveAnswers(done);
    const score = done.reduce((total, answer) => total + answer.points, 0);
    if (score > readBest()) saveBest(score);
  }, []);
  const playAgain = () => { round.newRound(); setPhase("playing"); };

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
    <h1 className="mt-4 text-3xl font-black">Particle Drop</h1>
    <p className="mt-1 text-gray-600">Drop the right particle into each sentence before time runs out. Sentences come from lessons you have finished.</p>
    {round.status === "loading" && <p role="status" className="mt-6 text-gray-500">Loading your sentences…</p>}
    {round.status === "error" && <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{round.message} <button className="ml-2 font-bold underline" onClick={round.retry}>Try again</button></p>}
    {round.status === "ready" && round.available < MIN_QUESTIONS && <section className={`${card} mt-6`}>
      <h2 className="text-xl font-black">Finish a few more lessons first</h2>
      <p className="mt-2 text-gray-600">Particle Drop needs at least {MIN_QUESTIONS} sentences from lessons you have finished ({round.available} so far). It uses the N5 lessons' grammar examples.</p>
      <Link to="/lessons" className={`${primary} mt-5 inline-block`}>Go to lessons →</Link>
    </section>}
    {round.status === "ready" && round.available >= MIN_QUESTIONS && <>
      {phase === "intro" && <section className={`${card} mt-6`} aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-xl font-black">How to play</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-gray-700">
          <li>{round.round.length} sentences, {QUESTION_SECONDS} seconds each.</li>
          <li>Pick the particle that fills the gap: click it or press 1–4.</li>
          <li>Faster answers and answers in a row score more points.</li>
          <li>Wrong answers go to your mistake notebook.</li>
        </ul>
        <p className="mt-3 text-sm text-gray-500">{round.available} sentences available from your lessons{readBest() ? ` · Your best: ${readBest()} points` : ""}</p>
        <button className={`${primary} mt-5`} onClick={() => setPhase("playing")}>Start →</button>
      </section>}
      {phase === "playing" && <Game key={round.round.map(question => question.lessonId + sentenceWithGap(question)).join("|")} questions={round.round} onFinish={finish} />}
      {phase === "finished" && <Results answers={answers} best={readBest()} onPlayAgain={playAgain} />}
    </>}
  </main></div>;
}

function Game({ questions, onFinish }: { questions: ParticleQuestion[]; onFinish: (answers: Answer[]) => void }) {
  const [position, setPosition] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const nextButton = useRef<HTMLButtonElement>(null);
  const question = questions[position];
  const current = answers[position];
  const secondsLeft = Math.max(0, QUESTION_SECONDS - (now - startedAt) / 1000);
  const streak = answers.slice().reverse().findIndex(answer => !answer.correct);
  const runningStreak = streak === -1 ? answers.length : streak;
  const score = answers.reduce((total, answer) => total + answer.points, 0);

  const answer = useCallback((given: string | null) => {
    if (answers[position]) return;
    const correct = given === question.answer;
    const left = Math.max(0, QUESTION_SECONDS - (Date.now() - startedAt) / 1000);
    setAnswers(done => [...done, { question, given, correct, points: correct ? scoreAnswer(left, runningStreak + 1) : 0 }]);
  }, [answers, position, question, startedAt, runningStreak]);

  // Ticks while the question is open; running out of time counts as no answer.
  useEffect(() => {
    if (current) return;
    const timer = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick - startedAt >= QUESTION_SECONDS * 1000) answer(null);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [current, startedAt, answer]);
  useEffect(() => { if (current) nextButton.current?.focus(); }, [current]);

  const next = useCallback(() => {
    if (position + 1 >= questions.length) { onFinish(answers); return; }
    setPosition(index => index + 1); setStartedAt(Date.now()); setNow(Date.now());
  }, [answers, onFinish, position, questions.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const choice = Number(event.key) - 1;
      if (!current && choice >= 0 && choice < question.options.length) { event.preventDefault(); answer(question.options[choice]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, current, question]);

  const timePercent = Math.round(secondsLeft / QUESTION_SECONDS * 100);
  return <section className={`${card} mt-6`} aria-label="Particle Drop question">
    <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
      <span>Sentence {position + 1} of {questions.length}</span>
      <span>{score} points{runningStreak > 1 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">🔥 {runningStreak} in a row</span>}</span>
    </div>
    <div role="progressbar" aria-label="Time left" aria-valuemin={0} aria-valuemax={QUESTION_SECONDS} aria-valuenow={Math.ceil(secondsLeft)} aria-valuetext={`${Math.ceil(secondsLeft)} seconds`} className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${timePercent < 30 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${current ? 0 : timePercent}%` }} />
    </div>
    <p lang="ja" className="mt-8 text-center text-2xl leading-loose font-bold sm:text-3xl">
      {question.parts.map((part, index) => part === null
        ? <span key={index} className={`mx-1 inline-flex min-w-12 justify-center rounded-xl border-2 border-dashed px-2 align-middle ${current ? (current.correct ? "particle-drop border-emerald-500 bg-emerald-50 text-emerald-800" : "particle-drop border-red-400 bg-red-50 text-red-800") : "border-gray-300 text-transparent"}`}>
          {current ? question.answer : "？"}<span className="sr-only">{current ? "" : "blank"}</span></span>
        : <RubyText key={index} text={part} />)}
    </p>
    <p className="mt-2 text-center text-gray-600">{question.meaning}</p>
    <div role="group" aria-label="Particles" className="mx-auto mt-8 grid max-w-md grid-cols-4 gap-3">
      {question.options.map((option, index) => {
        const isAnswer = current && option === question.answer, isWrongPick = current && option === current.given && !current.correct;
        return <button key={option} lang="ja" disabled={Boolean(current)} onClick={() => answer(option)} aria-keyshortcuts={String(index + 1)}
          className={`relative rounded-2xl border-2 py-4 text-3xl font-bold transition ${focus} ${isAnswer ? "border-emerald-500 bg-emerald-50" : isWrongPick ? "border-red-400 bg-red-50" : "border-gray-200 bg-white hover:border-emerald-400 disabled:opacity-60"}`}>
          {option}<span aria-hidden="true" className="absolute top-1 left-2 text-xs font-semibold text-gray-400">{index + 1}</span></button>;
      })}
    </div>
    <div role="status" className="mt-6 min-h-16 text-center">{current && <>
      <p className={`font-bold ${current.correct ? "text-emerald-800" : "text-red-800"}`}>{current.correct ? `Right! +${current.points}` : current.given === null ? `Time's up: the particle is ${question.answer}` : `Not quite: the particle is ${question.answer}`}</p>
      <p className="mt-1 text-sm text-gray-500">{question.romaji}</p>
    </>}</div>
    {current && <div className="mt-4 text-center"><button ref={nextButton} className={primary} onClick={next}>{position + 1 < questions.length ? "Next sentence →" : "See results"}</button></div>}
  </section>;
}

function Results({ answers, best, onPlayAgain }: { answers: Answer[]; best: number; onPlayAgain: () => void }) {
  const right = answers.filter(answer => answer.correct).length;
  const score = answers.reduce((total, answer) => total + answer.points, 0);
  const missed = answers.filter(answer => !answer.correct);
  return <section className={`${card} mt-6`} aria-labelledby="results-heading">
    <h2 id="results-heading" className="text-2xl font-black">{right === answers.length ? "Perfect round! 🎉" : "Round finished"}</h2>
    <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
      {[["Score", String(score)], ["Right", `${right} / ${answers.length}`], ["Best", String(Math.max(best, score))]].map(([label, value]) =>
        <div key={label} className="rounded-2xl bg-gray-50 p-3"><dt className="text-xs font-bold uppercase text-gray-500">{label}</dt><dd className="mt-1 text-2xl font-black">{value}</dd></div>)}
    </dl>
    {missed.length > 0 && <div className="mt-6"><h3 className="font-bold">To look at again</h3>
      <ul className="mt-2 space-y-2">{missed.map(({ question, given }, index) => <li key={index} className="rounded-xl bg-gray-50 p-3 text-sm">
        <p lang="ja" className="text-base font-semibold">{question.parts.map((part, partIndex) => part === null ? <b key={partIndex} className="text-emerald-700">{question.answer}</b> : <RubyText key={partIndex} text={part} />)}</p>
        <p className="text-gray-600">{question.meaning}{given ? <> · you chose <span lang="ja">{given}</span></> : " · time ran out"}</p>
      </li>)}</ul>
      <p className="mt-2 text-sm text-gray-500">Wrong answers are in your <Link to="/mistakes" className="font-semibold text-emerald-700 underline">mistake notebook</Link>.</p></div>}
    <div className="mt-6 flex flex-wrap gap-3"><button className={primary} onClick={onPlayAgain}>Play again</button><Link to="/" className={button}>Back to the dashboard</Link></div>
  </section>;
}
