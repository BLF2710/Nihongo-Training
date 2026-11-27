import { GuideNote } from "../components/cast/GuideNote";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuizChoices from "../components/QuizChoices";
import RubyText from "../components/RubyText";
import WeakCharacters from "../components/WeakCharacters";
import { apiErrorMessage } from "../api/errors";
import { deleteMistake, fetchMistakes, fetchWeakCharacters, practiseMistake } from "../api/mistakes";
import type { Mistake, MistakeSource, Notebook, WeakCharacters as WeakList } from "../api/mistakes";
import { shuffle } from "../lib/random";
import { IslandBoard } from "../components/theme/IslandBoard";
import { EnglishStudyFrame } from "../components/englishStudy/EnglishStudyFrame";
import { useLanguage } from "../context/LanguageContext";
import { isCourseLanguage, useEnglishCourseLevel } from "../lib/courseLevel";
import type { CourseLanguage } from "../lib/courseLevel";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;
const button = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50 ${focus}`;
const SOURCE_LABELS: Record<MistakeSource, string> = { lesson: "Lessons", review: "Reviews", assessment: "Assessments", mock_exam: "Mock exams", kana: "Kana", kanji: "Kanji" };
type Status = "open" | "resolved" | "weak";

/** Each course has its own notebook: its mistakes, filters, tabs, script and look. */
type NotebookCourse = {
  id: CourseLanguage; sources: readonly MistakeSource[]; tabs: readonly Status[]; card: string; list: string;
  madeIn: string; reviewHref: string; alsoFrom: string;
  /** A question or answer in the course's language. */
  Text: (props: { text: string }) => ReactNode;
};
const COURSES: Record<CourseLanguage, NotebookCourse> = {
  japanese: {
    id: "japanese", sources: ["lesson", "review", "assessment", "mock_exam", "kana", "kanji"], tabs: ["open", "resolved", "weak"],
    card: "notice-sheet p-5 pt-7 sm:p-6 sm:pt-7", list: "mt-6 space-y-3", madeIn: "lessons, reviews, assessments, mock exams, kana quizzes and kanji practice",
    reviewHref: "/review", alsoFrom: "assessments, mock exams, kana quizzes and kanji practice",
    Text: ({ text }) => <span lang="ja"><RubyText text={text} /></span>,
  },
  english: {
    // English reviews record their answers as their lessons' questions, so they are listed under Lessons.
    id: "english", sources: ["lesson", "review", "assessment", "mock_exam"], tabs: ["open", "resolved"],
    // The list scrolls inside the page, so the notebook fits one screen like the other English study pages.
    card: "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm", list: "mt-3 max-h-[calc(100vh-32rem)] space-y-3 overflow-y-auto pr-1 sm:max-h-[calc(100vh-27rem)]", madeIn: "English lessons, reviews, unit tests and mock exams",
    reviewHref: "/english/review", alsoFrom: "unit tests and mock exams",
    Text: ({ text }) => <span lang="en-GB">{text}</span>,
  },
};
type Practisable = Extract<Mistake, { isLocked: false }>;
const isPractisable = (mistake: Mistake): mistake is Practisable => !mistake.isLocked;

export default function MistakesPage() {
  const { language } = useLanguage();
  const course = COURSES[isCourseLanguage(language) ? language : "japanese"];
  // Remounting on a language change starts the other course's notebook afresh.
  return <Notebook key={course.id} course={course} />;
}

/** The page around the notebook: the Japanese island board, or the English study frame. */
function NotebookFrame({ course, intro, children }: { course: NotebookCourse; intro: string; children: ReactNode }) {
  const level = useEnglishCourseLevel();
  if (course.id === "english") return <EnglishStudyFrame title="Mistake notebook" titleVi="Sổ lỗi sai" level={level} intro={intro}>{children}</EnglishStudyFrame>;
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <h1 className="mt-4 text-3xl font-black">Mistake notebook</h1>
    <p className="mt-1 text-gray-600">{intro}</p>
    <IslandBoard island="review" className="mt-6">{children}</IslandBoard>
  </main></div>;
}

function Notebook({ course }: { course: NotebookCourse }) {
  const hasWeakCharacters = course.tabs.includes("weak");
  const [status, setStatus] = useState<Status>("open");
  const [source, setSource] = useState<MistakeSource | "all">("all");
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [practice, setPractice] = useState<Practisable[] | null>(null);
  const [weak, setWeak] = useState<WeakList | null>(null);
  useEffect(() => {
    if (!hasWeakCharacters) return;
    const controller = new AbortController();
    fetchWeakCharacters(controller.signal).then(data => setWeak(data))
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your weak characters could not be loaded.")); });
    return () => controller.abort();
  }, [reload, hasWeakCharacters]);
  useEffect(() => {
    if (status === "weak") return;
    const controller = new AbortController();
    fetchMistakes(status, course.id, controller.signal).then(data => { setNotebook(data); setError(""); })
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your mistakes could not be loaded.")); });
    return () => controller.abort();
  }, [status, reload, course.id]);

  const shown = notebook?.mistakes.filter(mistake => source === "all" || mistake.source === source) ?? [];
  const practisable = shown.filter(isPractisable);
  const endPractice = () => { setPractice(null); setReload(value => value + 1); };
  const remove = (id: number) => setNotebook(current => current && { ...current, mistakes: current.mistakes.filter(mistake => mistake.id !== id) });

  const needed = notebook?.correctInARowToResolve ?? 2;

  return <NotebookFrame course={course} intro={`Questions you got wrong in ${course.madeIn}. Answer one right ${needed} times in a row to clear it.`}>
    {practice ? <Practice course={course} mistakes={practice} needed={needed} onDone={endPractice} /> : <>
      <div role="tablist" aria-label="Mistakes" className="flex flex-wrap gap-2">{course.tabs.map(value =>
        <button key={value} role="tab" aria-selected={status === value} onClick={() => setStatus(value)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold ${focus} ${status === value ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"}`}>
          {value === "open" ? `To practise${notebook ? ` (${notebook.counts.open})` : ""}` : value === "resolved" ? `Cleared${notebook ? ` (${notebook.counts.resolved})` : ""}` : `Weak characters${weak ? ` (${weak.kana.length + weak.kanji.length})` : ""}`}
        </button>)}</div>
      {status === "open" && notebook && notebook.counts.open > 0 && <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by where the mistake was made">
        {(["all", ...course.sources] as const).map(value => {
          const count = value === "all" ? notebook.counts.open : notebook.counts.bySource[value];
          return <button key={value} aria-pressed={source === value} onClick={() => setSource(value)} disabled={value !== "all" && !count}
            className={`rounded-full border px-3 py-1 text-sm font-semibold disabled:opacity-40 ${focus} ${source === value ? "border-indigo-600 bg-indigo-50 text-indigo-900" : "border-gray-200 bg-white text-gray-700"}`}>
            {value === "all" ? "All" : SOURCE_LABELS[value]} · {count}
          </button>;
        })}</div>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error} <button className="ml-2 font-bold underline" onClick={() => setReload(value => value + 1)}>Retry</button></p>}
      {status === "weak" ? (weak ? <WeakCharacters list={weak} onPractised={() => setReload(value => value + 1)} /> : !error && <p role="status" className="mt-6 text-gray-500">Loading your weak characters…</p>) : <>
      {!notebook && !error && <p role="status" className="mt-6 text-gray-500">Loading your mistakes…</p>}
      {notebook && status === "open" && practisable.length > 0 && <button className={`${primary} mt-5`} onClick={() => setPractice(shuffle(practisable))}>Practise {practisable.length} {practisable.length === 1 ? "question" : "questions"} →</button>}
      {notebook && !shown.length && <GuideNote character="zen" mood={status === "open" ? "happy" : "calm"} className={`${course.card} mt-6`}><p className="text-gray-600">{status === "open"
        ? <>Not a leaf out of place. Nothing to practise. Wrong answers from <Link to="/lessons" className="font-semibold text-emerald-700 underline">lessons</Link>, <Link to={course.reviewHref} className="font-semibold text-emerald-700 underline">reviews</Link>, {course.alsoFrom} appear here.</>
        : "Mistakes you clear appear here."}</p></GuideNote>}
      <ul className={course.list}>{shown.map(mistake => <li key={mistake.id}><MistakeCard course={course} mistake={mistake} needed={needed} onRemoved={remove} /></li>)}</ul>
      </>}
    </>}
  </NotebookFrame>;
}

function MistakeCard({ course, mistake, needed, onRemoved }: { course: NotebookCourse; mistake: Mistake; needed: number; onRemoved: (id: number) => void }) {
  const { Text, card } = course;
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const remove = async () => {
    try { await deleteMistake(mistake.id); onRemoved(mistake.id); } catch (failure) { setError(apiErrorMessage(failure, "It could not be removed.")); }
  };
  return <article className={card} aria-label={`Mistake: ${mistake.prompt}`}>
    <p className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-700"><span>{mistake.label}</span>
      <span className="text-gray-500">{mistake.resolvedAt ? `Cleared ${new Date(mistake.resolvedAt).toLocaleDateString()}` : `Wrong ${mistake.wrongCount}× · ${mistake.correctStreak} of ${needed} right in a row`}</span></p>
    <p className="mt-2 text-lg font-bold leading-relaxed"><Text text={mistake.prompt} /></p>
    {mistake.given && <p className="mt-2 text-red-700">✗ Your answer: <Text text={mistake.given} /></p>}
    {mistake.isLocked
      ? <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">🔒 The right answer appears once you pass this assessment, so it stays a fair test. Review the unit's lessons in the meantime.</p>
      : <><p className="mt-1 font-semibold text-emerald-800">✓ Right answer: <Text text={mistake.answer} /></p>
        {mistake.explanation && <p className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700"><Text text={mistake.explanation} /></p>}</>}
    <div className="mt-3">{confirming
      ? <span className="flex flex-wrap items-center gap-2 text-sm"><span>Remove it from the notebook?</span><button className={button} onClick={() => void remove()}>Yes, remove</button><button className={button} onClick={() => setConfirming(false)}>Keep it</button></span>
      : <button className="text-sm font-semibold text-gray-500 underline hover:text-gray-800" onClick={() => setConfirming(true)}>Remove</button>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>
  </article>;
}

/** One question at a time: choose among the options, or reveal the answer and say whether you knew it. */
function Practice({ course, mistakes, needed, onDone }: { course: NotebookCourse; mistakes: Practisable[]; needed: number; onDone: () => void }) {
  const { Text, card } = course;
  const [position, setPosition] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [outcome, setOutcome] = useState<{ correct: boolean; correctStreak: number; isResolved: boolean } | null>(null);
  const [cleared, setCleared] = useState(0);
  const [error, setError] = useState("");
  const mistake = mistakes[position];
  const options = mistake?.options && mistake.options.length > 1 ? mistake.options : null;

  const answer = async (correct: boolean, choice: string | null = null) => {
    setChosen(choice); setError("");
    try {
      const saved = await practiseMistake(mistake.id, correct);
      setOutcome({ correct, ...saved });
      if (saved.isResolved) setCleared(value => value + 1);
    } catch (failure) {
      setChosen(null); setError(apiErrorMessage(failure, "The answer could not be saved. Please try again."));
    }
  };
  const next = () => { setPosition(value => value + 1); setChosen(null); setIsRevealed(false); setOutcome(null); };

  if (!mistake) return <section className={card} aria-labelledby="practice-done">
    <h2 id="practice-done" className="text-2xl font-black">Practice finished</h2>
    <GuideNote character="zen" mood={cleared ? "happy" : "calm"} className="mt-3"><p>{cleared ? "A few weeds pulled from the garden. Well done." : "Patience. Each mistake fades with practice."}</p></GuideNote>
    <p className="mt-2 text-gray-600">{cleared ? `${cleared} ${cleared === 1 ? "mistake" : "mistakes"} cleared.` : "Keep going: each needs to be answered right " + needed + " times in a row."}</p>
    <button className={`${primary} mt-5`} onClick={onDone}>Back to the notebook</button>
  </section>;

  return <section className={card} aria-label="Practice question">
    <p className="flex justify-between text-sm font-semibold text-gray-600"><span>Question {position + 1} of {mistakes.length}</span><span>{mistake.label}</span></p>
    <p className="mt-4 text-xl font-bold leading-relaxed"><Text text={mistake.prompt} /></p>
    <div className="mt-5">{options
      ? <QuizChoices choices={options} selected={chosen} disabled={outcome !== null} onChoose={choice => void answer(choice === mistake.answer, choice)} />
      : !isRevealed
        ? <button className={primary} onClick={() => setIsRevealed(true)}>Show the answer</button>
        : <div><p className="font-semibold text-emerald-800">Answer: <Text text={mistake.answer} /></p>
          {!outcome && <div className="mt-3 flex flex-wrap gap-3"><button className={button} onClick={() => void answer(true)}>I knew it</button><button className={button} onClick={() => void answer(false)}>I didn't</button></div>}</div>}</div>
    {outcome && <div role="status" className={`mt-5 rounded-2xl p-4 ${outcome.correct ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
      <p className="font-bold">{outcome.correct ? (outcome.isResolved ? "Right, and cleared from the notebook ✓" : `Right · ${outcome.correctStreak} of ${needed} in a row`) : "Not this time. It stays in the notebook."}</p>
      {!outcome.correct && options && <p className="mt-1">Right answer: <Text text={mistake.answer} /></p>}
      {mistake.explanation && <p className="mt-2 text-sm"><Text text={mistake.explanation} /></p>}
    </div>}
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    <div className="mt-5 flex flex-wrap gap-3">{outcome && <button className={primary} onClick={next}>{position + 1 < mistakes.length ? "Next question →" : "Finish"}</button>}
      <button className={button} onClick={onDone}>Stop practising</button></div>
  </section>;
}
