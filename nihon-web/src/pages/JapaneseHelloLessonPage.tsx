/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

type Answer = { prompt: string; options: string[]; correct: string; explanation: string };
const expressions = [
  ["おはよう", "Ohayou", "Good morning", "Casual"], ["おはようございます", "Ohayou gozaimasu", "Good morning", "Polite"],
  ["こんにちは", "Konnichiwa", "Hello / Good afternoon", "Standard / Polite"], ["こんばんは", "Konbanwa", "Good evening", "Standard / Polite"],
  ["ありがとう", "Arigatou", "Thank you", "Casual"], ["ありがとうございます", "Arigatou gozaimasu", "Thank you", "Polite"],
  ["すみません", "Sumimasen", "Excuse me / Sorry", "Polite"], ["またね", "Mata ne", "See you", "Casual"]
];
const practice: Answer[] = [
  { prompt: "What does おはようございます mean?", options: ["Good evening", "Good morning", "Thank you", "Goodbye"], correct: "Good morning", explanation: "おはようございます means Good morning." },
  { prompt: "You meet your teacher in the morning. What should you say?", options: ["おはよう", "おはようございます", "こんばんは", "またね"], correct: "おはようございます", explanation: "Use the polite greeting おはようございます with your teacher." },
  { prompt: "Which is more polite?", options: ["ありがとう", "ありがとうございます"], correct: "ありがとうございます", explanation: "ありがとうございます is the polite form of thank you." },
  { prompt: 'Translate: “Good evening.”', options: ["こんにちは", "こんばんは", "おはようございます", "ありがとう"], correct: "こんばんは", explanation: "こんばんは is used as a general evening greeting." }
];
const challenge: Answer[] = [
  { prompt: "What does すみません mean?", options: ["Excuse me / Sorry", "See you", "Good morning", "Thank you"], correct: "Excuse me / Sorry", explanation: "" },
  { prompt: "You greet a friend in the morning. Choose the casual option.", options: ["おはよう", "おはようございます", "こんばんは", "すみません"], correct: "おはよう", explanation: "" },
  { prompt: "Which expression is polite thank you?", options: ["ありがとう", "ありがとうございます", "またね", "こんにちは"], correct: "ありがとうございます", explanation: "" },
  { prompt: 'Translate: “Hello / Good afternoon.”', options: ["こんばんは", "こんにちは", "おはよう", "またね"], correct: "こんにちは", explanation: "" },
  { prompt: "You meet your teacher in the morning. What should you say?", options: ["またね", "おはよう", "おはようございます", "ありがとう"], correct: "おはようございます", explanation: "" }
];
const steps = ["Welcome", "Words", "When to use", "Politeness", "Conversations", "Practice", "Challenge"];

export default function JapaneseHelloLessonPage() {
  const navigate = useNavigate();
  const storageKey = `lesson-1-hello-${localStorage.getItem("user_name") || "guest"}`;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [matching, setMatching] = useState<Record<string, string>>({});
  const [selectedJapanese, setSelectedJapanese] = useState<string | null>(null);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, string>>({});
  const [completedScore, setCompletedScore] = useState<number | null>(null);
  const [saveError, setSaveError] = useState("");
  const [celebration, setCelebration] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const progress = JSON.parse(saved) as { completed?: boolean; score?: number };
      if (progress.completed) {
        const score = progress.score ?? 0;
        setCompletedScore(score);
        // Migrate a completion saved by the earlier client-only lesson into the
        // server progression system. XP events make this safe to retry.
        void api.post("/lessons/japanese-n5-unit-1-hello/complete", { challengeScore: score }).catch(() => undefined);
      }
    }
  }, [storageKey]);

  const challengeScore = useMemo(() => challenge.reduce((total, question, index) => total + (challengeAnswers[index] === question.correct ? 1 : 0), 0), [challengeAnswers]);
  const finishChallenge = async () => {
    const score = Math.round((challengeScore / challenge.length) * 100);
    try {
      const { data } = await api.post("/lessons/japanese-n5-unit-1-hello/complete", { challengeScore: score });
      setCompletedScore(score);
      localStorage.setItem(storageKey, JSON.stringify({ completed: true, score, completedAt: new Date().toISOString() }));
      if (data.completion?.level > data.completion?.oldLevel) setCelebration(`LEVEL UP! Level ${data.completion.oldLevel} → Level ${data.completion.level}`);
      else if (data.completion?.rank !== data.completion?.oldRank) setCelebration(`RANK UP! ${data.completion.oldRank} → ${data.completion.rank}`);
      else if (data.achievements?.length) setCelebration("Achievement unlocked!");
    } catch { setSaveError("Could not save lesson progress."); }
  };
  const matchPairs = [["おはようございます", "Good morning"], ["こんにちは", "Hello / Good afternoon"], ["こんばんは", "Good evening"], ["ありがとう", "Thank you"]];
  const allMatched = matchPairs.every(([jp, en]) => matching[jp] === en);
  const practiceComplete = Object.keys(answers).length === practice.length && allMatched;
  const chooseMeaning = (meaning: string) => { if (selectedJapanese) { setMatching((current) => ({ ...current, [selectedJapanese]: meaning })); setSelectedJapanese(null); } };
  const answerButton = (question: Answer, index: number, state: Record<number, string>, setState: (value: Record<number, string>) => void, showFeedback = true) => <div className="space-y-2">{question.options.map((option) => { const selected = state[index] === option; const correct = selected && option === question.correct; const wrong = selected && option !== question.correct; return <button key={option} onClick={() => setState({ ...state, [index]: option })} className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition cursor-pointer ${correct ? "border-emerald-500 bg-emerald-50 text-emerald-900" : wrong ? "border-red-400 bg-red-50 text-red-900" : selected ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300"}`}>{option}{correct && "  ✓"}{wrong && "  ✗"}</button>; })}{showFeedback && state[index] && <p className={`rounded-xl p-3 text-sm ${state[index] === question.correct ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{state[index] === question.correct ? "✓ Correct!" : `✗ Not quite. Correct answer: ${question.explanation}`}</p>}</div>;

  return <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar /><main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
    <div className="flex items-center justify-between gap-4"><button onClick={() => navigate("/lessons?unit=japanese-n5-unit-1")} className="text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer">← Back to Lessons</button><span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full">N5 Beginner</span></div>
    <div className="mt-6 bg-white rounded-3xl border border-gray-200 shadow-sm p-5 sm:p-8">
      <p className="text-xs font-bold tracking-wider uppercase text-emerald-700">Unit 1 • Lesson 1</p><h1 className="mt-2 text-3xl sm:text-4xl font-black text-gray-900">How to Say Hello</h1>
      <div className="mt-6"><div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>{steps[step]}</span><span>{step + 1} / {steps.length}</span></div><div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-linear-to-r from-emerald-500 to-indigo-500 transition-all" style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div></div>
    </div>

    {saveError && <p className="mt-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">{saveError}</p>}
    {celebration && <p className="mt-6 rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-center font-black text-indigo-800">🎉 {celebration}</p>}
    <section className="mt-6 bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8">
      {step === 0 && <div className="max-w-2xl"><span className="text-5xl">👋</span><h2 className="mt-4 text-2xl font-black text-gray-900">How to Say Hello in Japanese</h2><p className="mt-3 leading-7 text-gray-600">Japanese has different greetings depending on the time of day and situation. It also has different levels of politeness. In this short lesson, you’ll learn the greetings you can start using today.</p><div className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900"><strong>By the end:</strong> recognize eight common expressions, know when to use them, and choose casual or polite Japanese.</div></div>}
      {step === 1 && <div><h2 className="text-2xl font-black text-gray-900">Eight useful expressions</h2><p className="mt-2 text-gray-600">Japanese is shown first—let your eyes get used to it.</p><div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">{expressions.map(([jp, romaji, meaning, level]) => <article key={jp} className="rounded-2xl border border-gray-200 p-5 bg-gray-50/50"><p className="text-3xl font-bold text-gray-900">{jp}</p><p className="mt-1 font-mono text-sm text-indigo-700">{romaji}</p><p className="mt-3 font-semibold text-gray-700">{meaning}</p><span className={`inline-block mt-3 text-xs font-bold px-2.5 py-1 rounded-full ${level === "Casual" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{level}</span></article>)}</div></div>}
      {step === 2 && <div><h2 className="text-2xl font-black text-gray-900">When to use them</h2><p className="mt-2 text-gray-600">These are general guidelines, not strict clock rules.</p><div className="mt-6 grid sm:grid-cols-3 gap-4">{[["🌅", "Morning", "おはようございます"], ["☀️", "Daytime", "こんにちは"], ["🌙", "Evening", "こんばんは"]].map(([icon, time, word]) => <div key={time} className="rounded-2xl border border-gray-200 p-5 text-center"><p className="text-3xl">{icon}</p><p className="mt-3 font-bold text-gray-500">{time}</p><p className="mt-2 text-2xl font-black text-gray-900">{word}</p></div>)}</div></div>}
      {step === 3 && <div><h2 className="text-2xl font-black text-gray-900">Casual vs polite</h2><p className="mt-2 text-gray-600">Use polite forms with teachers, people you do not know well, or in formal settings.</p><div className="mt-6 grid sm:grid-cols-2 gap-5">{[["ありがとう", "Casual", "ありがとうございます", "Polite"], ["おはよう", "Casual", "おはようございます", "Polite"]].map(([casual, casualLabel, polite, politeLabel]) => <div key={casual} className="rounded-2xl border border-gray-200 overflow-hidden"><div className="p-5 bg-amber-50"><span className="text-xs font-bold text-amber-700">{casualLabel}</span><p className="mt-1 text-2xl font-black">{casual}</p></div><div className="p-5 bg-emerald-50"><span className="text-xs font-bold text-emerald-700">{politeLabel}</span><p className="mt-1 text-2xl font-black">{polite}</p></div></div>)}</div></div>}
      {step === 4 && <div><h2 className="text-2xl font-black text-gray-900">Example conversations</h2><div className="mt-6 space-y-5">{[["おはようございます。", "おはようございます。", "Good morning.", "Good morning."], ["ありがとうございます。", "どういたしまして。", "Thank you.", "You’re welcome."], ["すみません。", "はい？", "Excuse me.", "Yes?"]].map(([a, b, at, bt], index) => <article key={a} className="rounded-2xl border border-gray-200 p-5"><p className="text-xs font-bold text-gray-400 uppercase">Conversation {index + 1}</p><div className="mt-3 flex flex-col gap-2"><p className="self-start rounded-2xl rounded-bl-sm bg-indigo-50 px-4 py-3 text-lg font-bold">A: {a}</p><p className="self-end rounded-2xl rounded-br-sm bg-emerald-50 px-4 py-3 text-lg font-bold">B: {b}</p></div><div className="mt-3 text-sm text-gray-500">A: {at}<br />B: {bt}</div></article>)}</div></div>}
      {step === 5 && <div><h2 className="text-2xl font-black text-gray-900">Practice</h2><p className="mt-2 text-gray-600">Choose an answer before you see feedback.</p><div className="mt-6 space-y-8">{practice.map((question, index) => <article key={question.prompt} className="rounded-2xl border border-gray-200 p-5"><p className="font-bold text-gray-900">{index + 1}. {question.prompt}</p><div className="mt-4">{answerButton(question, index, answers, setAnswers)}</div></article>)}<article className="rounded-2xl border border-gray-200 p-5"><p className="font-bold text-gray-900">5. Match each Japanese expression to its meaning.</p><p className="mt-1 text-sm text-gray-500">Select a Japanese phrase, then select its English meaning.</p><div className="mt-4 grid sm:grid-cols-2 gap-4"><div className="space-y-2">{matchPairs.map(([jp, en]) => { const isCorrect = matching[jp] === en; return <button key={jp} onClick={() => setSelectedJapanese(jp)} className={`w-full rounded-xl border p-3 text-left font-bold cursor-pointer ${selectedJapanese === jp ? "border-indigo-500 bg-indigo-50" : matching[jp] ? isCorrect ? "border-emerald-400 bg-emerald-50" : "border-red-400 bg-red-50" : "border-gray-200 hover:border-indigo-300"}`}>{jp}{matching[jp] && <span className="float-right">{isCorrect ? "✓" : "✗"}</span>}</button>; })}</div><div className="space-y-2">{matchPairs.map(([, en]) => <button key={en} onClick={() => chooseMeaning(en)} className="w-full rounded-xl border border-gray-200 p-3 text-left text-sm font-semibold hover:border-indigo-300 cursor-pointer">{en}</button>)}</div></div>{allMatched && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">✓ Great matching—all four pairs are correct.</p>}</article></div></div>}
      {step === 6 && <div>{completedScore !== null ? <div className="text-center py-6"><p className="text-5xl">🎉</p><h2 className="mt-4 text-3xl font-black text-gray-900">Lesson Complete!</h2><p className="mt-2 text-lg text-gray-600">How to Say Hello</p><div className="mt-6 inline-block rounded-2xl bg-emerald-50 px-8 py-5"><p className="text-xs font-bold uppercase text-emerald-700">Score</p><p className="text-4xl font-black text-emerald-700">{completedScore}%</p></div><p className="mt-6 font-bold text-gray-800">You learned:</p><p className="mt-2 text-sm text-gray-600">✓ 8 expressions &nbsp; ✓ Basic greetings &nbsp; ✓ Casual vs polite &nbsp; ✓ When to use them</p><button onClick={() => navigate("/lessons?unit=japanese-n5-unit-1")} className="mt-7 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold cursor-pointer">Back to Lessons</button></div> : <><h2 className="text-2xl font-black text-gray-900">Lesson Challenge</h2><p className="mt-2 text-gray-600">Answer all five questions, then check your result.</p><div className="mt-6 space-y-6">{challenge.map((question, index) => <article key={question.prompt} className="rounded-2xl border border-gray-200 p-5"><p className="font-bold text-gray-900">{index + 1}. {question.prompt}</p><div className="mt-4">{answerButton(question, index, challengeAnswers, setChallengeAnswers, false)}</div></article>)}</div><button disabled={Object.keys(challengeAnswers).length !== challenge.length} onClick={finishChallenge} className="mt-6 w-full bg-indigo-600 enabled:hover:bg-indigo-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-bold transition cursor-pointer disabled:cursor-not-allowed">Check my score</button></>}</div>}
    </section>
    <div className="mt-6 flex items-center justify-between"><button disabled={step === 0} onClick={() => setStep((current) => current - 1)} className="px-5 py-3 rounded-xl border border-gray-300 bg-white disabled:opacity-40 font-bold text-sm cursor-pointer">← Back</button>{step < steps.length - 1 && <button disabled={step === 5 && !practiceComplete} onClick={() => setStep((current) => current + 1)} className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm cursor-pointer">{step === 5 && !practiceComplete ? "Complete all practice questions" : "Continue →"}</button>}</div>
  </main></div>;
}
