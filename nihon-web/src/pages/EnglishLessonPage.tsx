import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { EnglishLesson, Question } from "../../../shared/course/english/schema.ts";
import Navbar from "../components/Navbar";
import { Portrait } from "../components/cast/GuideNote";
import { ChallengeStep } from "../components/englishLesson/ChallengeStep";
import { DialogueStep } from "../components/englishLesson/DialogueStep";
import { ExamplesStep } from "../components/englishLesson/ExamplesStep";
import { GrammarStep } from "../components/englishLesson/GrammarStep";
import { QuestionDeck } from "../components/englishLesson/QuestionDeck";
import { VocabularyStep } from "../components/englishLesson/VocabularyStep";
import { checkLessonAccess, completeLesson, completionCelebration } from "../api/lessons";
import { recordLessonChallenge } from "../api/mistakes";
import { useActivity, useActivityState, useActivityTitle } from "../context/ActivityContext";
import { ENGLISH_LESSONS } from "../data/englishCourse";

// An English lesson (/lessons/english/:lessonSlug): the same steps as a Japanese one, but explaining English in
// Vietnamese as well (docs/ENGLISH.md). Progress, XP and the mistake notebook are shared with the Japanese course.
const STEPS = ["Welcome", "Vocabulary", "Grammar", "Examples", "Conversation", "Practice", "Challenge"] as const;
const PRACTICE_STEP = STEPS.indexOf("Practice"), LAST_STEP = STEPS.length - 1;
const PERCENT = 100;

type Access = "checking" | "allowed" | "locked";

export default function EnglishLessonPage() {
  const { lessonSlug } = useParams();
  return <LessonSession key={lessonSlug} slug={lessonSlug} />;
}

function Notice({ title, body }: { title: string; body: string }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><main className="mx-auto max-w-4xl p-8"><div role="status" className="mt-6 rounded-3xl border bg-white p-8">
    <h1 className="text-2xl font-black">{title}</h1><p className="mt-2 text-gray-600">{body}</p>
  </div></main></div>;
}

function LessonSession({ slug }: { slug: string | undefined }) {
  const lesson = ENGLISH_LESSONS.find(item => item.slug === slug);
  useActivityTitle(lesson?.title ?? "English lesson");
  const [access, setAccess] = useState<Access>("checking");
  useEffect(() => {
    if (!lesson) return;
    checkLessonAccess(lesson.id).then(() => setAccess("allowed")).catch(() => setAccess("locked"));
  }, [lesson]);
  if (!lesson) return <Notice title="Lesson not found" body="This lesson does not exist. Choose one from the Lessons page." />;
  if (access === "checking") return <Notice title="Checking lesson access…" body="One moment." />;
  if (access === "locked") return <Notice title="🔒 Lesson locked" body="Complete the earlier lessons of this unit first." />;
  return <LessonSteps lesson={lesson} />;
}

const scoreOf = (questions: readonly Question[], answers: Record<number, string>) =>
  Math.round(questions.filter((question, index) => answers[index] === question.correct).length / questions.length * PERCENT);

function LessonSteps({ lesson }: { lesson: EnglishLesson }) {
  const session = useActivity();
  const [step, setStep] = useActivityState("step", 0);
  const [practice, setPractice] = useActivityState<Record<number, string>>("practice", {});
  const [challenge, setChallenge] = useActivityState<Record<number, string>>("challenge", {});
  const [score, setScore] = useActivityState<number | null>("score", null);
  const [notice, setNotice] = useState(""), [error, setError] = useState("");
  const challengeScore = useMemo(() => scoreOf(lesson.challenge, challenge), [lesson, challenge]);
  const isPracticeDone = Object.keys(practice).length === lesson.practice.length;

  const finish = async () => {
    try {
      const result = await completeLesson(lesson.id, challengeScore);
      recordLessonChallenge(lesson.id, lesson.challenge, challenge);
      setScore(challengeScore);
      session.complete();
      const message = completionCelebration(result);
      if (message) setNotice(message);
    } catch {
      setError("Could not save lesson progress. This lesson may still be locked.");
    }
  };

  return <div className="flex min-h-screen flex-col bg-gray-50"><Navbar /><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1.5 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm sm:px-5 sm:py-3">
      <div>
        <p className="text-xs font-bold uppercase text-emerald-700">🇬🇧 English {lesson.level} · Unit {lesson.unitNumber} • Lesson {lesson.lessonNumber}</p>
        <h1 className="text-xl font-black text-gray-900 sm:text-2xl">{lesson.title} <span lang="vi" className="text-sm font-semibold text-gray-500 sm:text-base">{lesson.titleVi}</span></h1>
      </div>
      <div className="w-full sm:w-64"><div className="mb-1 flex justify-between text-xs font-bold text-gray-500"><span>{STEPS[step]}</span><span>{step + 1} / {STEPS.length}</span></div>
        <div className="h-2 rounded-full bg-gray-100"><div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-indigo-500" style={{ width: `${(step + 1) / STEPS.length * PERCENT}%` }} /></div></div>
    </header>
    {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="mt-4 rounded-xl bg-indigo-50 p-4 text-center font-black text-indigo-800">🎉 {notice}</p>}
    <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
      {step === 0 && <div><Portrait character="hakase" mood="happy" /><h2 className="mt-3 text-2xl font-black">In this lesson</h2>
        <ul className="mt-3 space-y-1 text-gray-700">{lesson.objectives.map(objective => <li key={objective}>✓ {objective}</li>)}</ul></div>}
      {step === 1 && <VocabularyStep words={lesson.vocabulary} />}
      {step === 2 && <GrammarStep points={lesson.grammar} />}
      {step === 3 && <ExamplesStep examples={lesson.examples} />}
      {step === 4 && <DialogueStep lines={lesson.dialogue} />}
      {step === PRACTICE_STEP && <div><h2 className="text-xl font-black sm:text-2xl">Practice <span lang="vi" className="text-base font-semibold text-gray-500">· Luyện tập</span></h2>
        <p className="mt-1 text-sm text-gray-600">Answer every question before continuing.</p>
        <div className="mt-3"><QuestionDeck questions={lesson.practice} answers={practice} onAnswer={(index, option) => setPractice({ ...practice, [index]: option })} showsFeedback /></div></div>}
      {step === LAST_STEP && <ChallengeStep questions={lesson.challenge} answers={challenge} onAnswer={(index, option) => setChallenge({ ...challenge, [index]: option })}
        score={score} onFinish={() => void finish()} />}
    </section>
    <nav aria-label="Lesson steps" className="mt-3 flex justify-between">
      <button type="button" disabled={step === 0} onClick={() => setStep(step - 1)} className="rounded-xl border bg-white px-5 py-2.5 font-bold disabled:opacity-40">← Back</button>
      {step < LAST_STEP && <button type="button" disabled={step === PRACTICE_STEP && !isPracticeDone} onClick={() => setStep(step + 1)}
        className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white disabled:bg-gray-300">{step === PRACTICE_STEP && !isPracticeDone ? "Complete practice" : "Continue →"}</button>}
    </nav>
  </main></div>;
}
