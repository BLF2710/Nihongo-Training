import RubyText from "../components/RubyText";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListeningExerciseCard from "../components/ListeningExerciseCard";
import QuizChoices from "../components/QuizChoices";
import ReviewQuestionCard from "../components/ReviewQuestionCard";
import SpeakingExerciseCard from "../components/SpeakingExerciseCard";
import { apiErrorMessage } from "../api/errors";
import { fetchLevelReviewQuestions, fetchReviewQuestions } from "../api/review";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { getSkillUnit, mergeSkillUnits } from "../data/japaneseSkillPractice";
import { COURSE_LEVELS, inLevel, isCourseLevel, levelOfId, useShownLevel } from "../lib/courseLevel";
import LevelSwitch from "../components/LevelSwitch";
import { buildReviewSession } from "../lib/reviewSession";
import type { ReviewItem } from "../lib/reviewSession";
import type { ListeningExercise } from "../lib/skillRounds";
import { supportsJapaneseSpeech } from "../services/japaneseSpeech";
import { supportsSpeechRecognition } from "../services/japaneseSpeechRecognition";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const primary = "rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const KIND_LABELS: Record<ReviewItem["kind"], string> = { bank: "Question", vocabulary: "Vocabulary", listening: "Listening", speaking: "Speaking" };
type Session = { unitId: string; label: string; items: ReviewItem[]; reserve: ReviewItem[]; results: boolean[] };
const CUMULATIVE_REVIEW_SIZE = 20;

export default function UnitReviewPage() {
  const [params, setParams] = useSearchParams();
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [unitsError, setUnitsError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setUnitsError(false); }).catch(() => { if (!controller.signal.aborted) setUnitsError(true); });
    return () => controller.abort();
  }, [retry]);

  // A unit's review opens together with its lessons.
  // `?unit=` names a unit or a level's cumulative review (`level:N5`); either decides the level shown.
  const requestedLevel = /^level:(.+)$/.exec(params.get("unit") ?? "")?.[1];
  const shownLevel = useShownLevel(params.get("unit"));
  const level = isCourseLevel(requestedLevel) ? requestedLevel : shownLevel;
  const course = (units ?? []).filter(unit => inLevel(level)(unit) && !unit.isPlaceholder && getSkillUnit(unit.id));
  const reached = course.filter(unit => unit.allowed);
  const selected = reached.find(unit => unit.id === params.get("unit")) ?? reached[0];
  // A cumulative review covers every reached unit of one level; it is chosen as `level:N5`.
  const levels = COURSE_LEVELS.map(level => level.id).filter(level => reached.some(unit => levelOfId(unit.id) === level));
  const cumulative = levels.find(level => `level:${level}` === params.get("unit"));

  const start = async () => {
    const can = { hear: supportsJapaneseSpeech(), speak: supportsSpeechRecognition() };
    const levelUnits = reached.filter(unit => levelOfId(unit.id) === cumulative).flatMap(unit => getSkillUnit(unit.id) ?? []);
    const material = cumulative ? mergeSkillUnits(levelUnits, `${cumulative} cumulative review`) : selected && getSkillUnit(selected.id);
    if (!material || starting) return;
    setStarting(true); setError("");
    try {
      if (cumulative) {
        const questions = await fetchLevelReviewQuestions(cumulative);
        setSession({ unitId: selected.id, label: `${cumulative} cumulative`, ...buildReviewSession(questions, material, can, Math.random, CUMULATIVE_REVIEW_SIZE), results: [] });
      } else {
        const questions = await fetchReviewQuestions(selected.id);
        setSession({ unitId: selected.id, label: `Unit ${selected.number}`, ...buildReviewSession(questions, material, can), results: [] });
      }
    } catch (failure) { setError(apiErrorMessage(failure, "Could not load the review. Please try again.")); }
    finally { setStarting(false); }
  };

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <div className="mt-6"><LevelSwitch level={level} /></div>
    <h1 className="mt-3 text-3xl font-black">Unit Review</h1>
    <p className="mt-2 text-gray-600">A mixed set for one unit: assessment and question-bank questions, word games, vocabulary, listening, and speaking.</p>
    {unitsError && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your units could not be loaded. <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!units && !unitsError && <p role="status" className="mt-5 text-gray-500">Loading your units…</p>}
    {units && !selected && <p className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">No unit is open for review yet. A unit appears here as soon as you reach it on the Lessons page.</p>}
    {selected && !session && <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
      <label className="block max-w-md text-sm font-bold text-gray-700">Choose a unit
        <select value={cumulative ? `level:${cumulative}` : selected.id} onChange={event => setParams({ unit: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:outline-2 focus:outline-emerald-600">
          {levels.map(level => <option key={level} value={`level:${level}`}>{level} cumulative review — every unit you have reached</option>)}
          {course.map(unit => <option key={unit.id} value={unit.id} disabled={!unit.allowed}>Unit {unit.number}: {unit.title}{unit.allowed ? "" : ` — 🔒 ${unit.reasons.join(" + ")}`}</option>)}
        </select>
      </label>
      <p className="mt-4 text-sm text-gray-500">{cumulative ? `A longer review of ${CUMULATIVE_REVIEW_SIZE} questions drawn from all ${reached.filter(unit => levelOfId(unit.id) === cumulative).length} ${cumulative} units you have reached. ` : ""}Each review picks a fresh set of questions. Listening and speaking questions can be swapped for another question if you cannot hear or speak right now.</p>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className={`${primary} mt-5`} disabled={starting} onClick={() => void start()}>{starting ? "Preparing…" : "Start review →"}</button>
    </section>}
    {session && <ReviewRun session={session} onChange={setSession} onClose={() => setSession(null)} />}
  </main></div>;
}

function ReviewRun({ session, onChange, onClose }: { session: Session; onChange: (session: Session) => void; onClose: () => void }) {
  const { items, reserve, results, unitId, label } = session;
  const index = results.length;
  const item = items[index];
  const correct = results.filter(Boolean).length;
  const record = (isCorrect: boolean) => onChange({ ...session, results: [...results, isCorrect] });
  // Replaces a listening or speaking question the learner cannot do; with nothing left to swap in, it is simply dropped.
  const swap = () => onChange({ ...session, items: [...items.slice(0, index), ...reserve.slice(0, 1), ...items.slice(index + 1)], reserve: reserve.slice(1) });

  if (!item) return <section aria-label="Review results" className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="text-2xl font-bold">{label} review complete</h2>
    <p className="mt-3 text-lg">You got <span className="font-black text-emerald-700">{correct} / {items.length}</span> correct.</p>
    <p className="mt-1 text-sm text-gray-500">Reviews are for practice: they do not change your XP, statistics, or assessment result.</p>
    <button className={`${button} mt-5`} onClick={onClose}>Review again</button>
  </section>;

  const isLast = index === items.length - 1;
  return <div className="mt-6">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-gray-600">
      <span>{label} · Question {index + 1} / {items.length} · <span className="text-emerald-700">{KIND_LABELS[item.kind]}</span></span>
      <span>{correct} correct</span>
    </div>
    {item.kind === "bank" && <ReviewQuestionCard key={item.id} unitId={item.question.unitId ?? unitId} question={item.question} isLast={isLast} onDone={record} />}
    {item.kind === "vocabulary" && <VocabularyQuestionCard key={item.id} exercise={item.exercise} isLast={isLast} onDone={record} />}
    {item.kind === "listening" && <ListeningExerciseCard key={item.id} exercise={item.exercise} isLast={isLast} onDone={record} onSkip={swap} />}
    {item.kind === "speaking" && <SpeakingExerciseCard key={item.id} exercise={item.exercise} isLast={isLast} canCheck onDone={record} onSkip={swap} />}
    <button className="mt-4 text-sm font-semibold text-gray-500 underline" onClick={onClose}>End review</button>
  </div>;
}

/** Shows a course word and asks for its meaning. */
function VocabularyQuestionCard({ exercise, isLast, onDone }: { exercise: ListeningExercise; isLast: boolean; onDone: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [word] = exercise.reveal;
  const correct = selected === exercise.answer;
  return <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <p className="text-sm font-semibold text-emerald-700">What does this word mean?</p>
    <p lang="ja" className="mt-2 text-3xl font-black text-gray-900"><RubyText text={word.japanese} /></p>
    <div className="mt-5"><QuizChoices choices={exercise.choices} selected={selected} disabled={selected !== null} onChoose={setSelected} /></div>
    {selected !== null && <div className="mt-6">
      <p role="status" className={`text-lg font-bold ${correct ? "text-emerald-700" : "text-red-700"}`}>{correct ? "Correct!" : "Not quite."}</p>
      <p className="mt-1 text-gray-700"><span lang="ja" className="font-semibold"><RubyText text={word.japanese} /></span> ({word.romaji}) — {word.meaning}</p>
      <button className={`${button} mt-5`} onClick={() => onDone(correct)}>{isLast ? "See results →" : "Next →"}</button>
    </div>}
  </section>;
}
