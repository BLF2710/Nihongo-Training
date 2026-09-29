import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import QuizChoices from "../components/QuizChoices";
import { KanjiAttribution } from "../components/KanjiReferences";
import { KANJI } from "../data/kanji";
import { answerKanji, startKanjiPractice } from "../api/kanji";
import type { KanjiAnswer, KanjiQuestion } from "../api/kanji";

const button = "rounded-xl border border-gray-200 px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50";
export default function KanjiPracticePage() {
  const [params] = useSearchParams();
  return <PracticeSession key={params.get("kanji") ?? "all"} kanjiId={params.get("kanji") ?? undefined} />;
}
function PracticeSession({ kanjiId }: { kanjiId?: string }) {
  const character = KANJI.find(k => k.id === kanjiId);
  const [size, setSize] = useState(kanjiId ? 3 : 10);
  const [questions, setQuestions] = useState<KanjiQuestion[]>([]);
  const [answers, setAnswers] = useState<KanjiAnswer[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<"setup" | "quiz" | "summary">("setup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const guard = useRef(false);
  const question = questions[index];
  const result = answers[index];
  const back = kanjiId ? `/learn/kanji/${kanjiId}` : "/learn/kanji";
  async function start() {
    if (guard.current) return;
    guard.current = true; setBusy(true); setError("");
    try {
      setQuestions(await startKanjiPractice(size, kanjiId));
      setAnswers([]); setSelected(null); setIndex(0); setPhase("quiz");
    } catch { setError("Could not start Kanji practice. Please try again."); }
    finally { guard.current = false; setBusy(false); }
  }
  async function answer(choice: number) {
    if (guard.current || result) return;
    guard.current = true; setBusy(true); setSelected(choice); setError("");
    try {
      const saved = await answerKanji(question.id, choice);
      setAnswers(previous => [...previous, saved]);
    } catch {
      setError("Could not confirm the save. Retry the same answer safely; it will only count once. If this session has expired, return to Kanji and start again.");
    } finally { guard.current = false; setBusy(false); }
  }
  function next() {
    if (!result || busy) return;
    if (index + 1 === questions.length) setPhase("summary");
    else { setIndex(value => value + 1); setSelected(null); }
  }
  const correct = answers.filter(a => a.correct).length;
  const latest = [...new Map(answers.map(a => [a.progress.kanjiId, a.progress])).values()];
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto max-w-4xl px-4 py-10">
    <Link className="text-sm font-semibold text-gray-600 hover:underline" to={back}>← Back to Kanji</Link>
    <h1 className="my-6 text-3xl font-black">Kanji Practice{character ? ` · ${character.character}` : ""}</h1>
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {kanjiId && !character ? <p>Kanji not found. Choose a character from the Kanji page.</p> : <>
        {phase === "setup" && <>
          <h2 className="text-xl font-bold">Choose a practice length</h2>
          <div className="mt-4 flex gap-3">{[3, 5, 10].map(n => <button key={n} disabled={busy} aria-pressed={size === n} onClick={() => setSize(n)} className={`${button} ${size === n ? "border-emerald-500 bg-emerald-100" : ""}`}>{n}</button>)}</div>
          <p className="my-5 text-gray-600">Meaning, course-word reading, and vocabulary recognition. Each answer updates only the named Kanji's progress, not Kana statistics or lesson completion. No XP is awarded.</p>
          <button disabled={busy} onClick={() => void start()} className={button}>{busy ? "Loading…" : "Start Practice"}</button>
        </>}
        {phase === "quiz" && question && <>
          <p className="text-center text-gray-500">Question {index + 1} / {questions.length}</p>
          <progress className="mt-3 w-full accent-emerald-500" value={answers.length} max={questions.length} aria-label="Kanji practice progress" />
          <p className="mt-3 text-center text-sm text-gray-500">Practicing {question.character} · {question.kind}</p>
          <div lang="ja" className="py-8 text-center text-6xl sm:text-7xl">{question.display}</div>
          <h2 className="mb-5 text-center font-semibold">{question.prompt}</h2>
          <QuizChoices choices={question.options} selected={selected === null ? null : question.options[selected]} disabled={busy || selected !== null} onChoose={choice => void answer(question.options.indexOf(choice))} />
          <div aria-live="polite" className="mt-5">
            {busy && <p>Saving answer…</p>}
            {result && <><p className={`rounded-xl p-4 font-semibold ${result.correct ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{result.correct ? "Correct!" : `Incorrect. The correct answer is ${result.correctAnswer}.`}</p><button className={`${button} mt-4`} onClick={next}>{index + 1 === questions.length ? "View Summary" : "Next Question →"}</button></>}
            {error && selected !== null && !result && <button className={`${button} mt-4`} disabled={busy} onClick={() => void answer(selected)}>Retry saving answer</button>}
          </div>
        </>}
        {phase === "summary" && <>
          <h2 className="text-2xl font-bold">Practice Summary</h2>
          <dl className="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Questions", answers.length], ["Correct", correct], ["Incorrect", answers.length - correct], ["Accuracy", `${Math.round(correct / answers.length * 100)}%`]].map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">{label}</dt><dd className="text-2xl font-bold">{value}</dd></div>)}</dl>
          <h3 className="font-semibold">Saved character progress</h3>
          <ul className="my-4 space-y-2">{latest.map(p => <li key={p.kanjiId}><Link className="font-semibold text-emerald-700 underline" to={`/learn/kanji/${p.kanjiId}`}>{KANJI.find(k => k.id === p.kanjiId)?.character}</Link> · {p.status} · {p.correctCount} correct / {p.total} attempts</li>)}</ul>
          <div className="flex flex-wrap gap-3"><button className={button} onClick={() => { setPhase("setup"); setError(""); }}>Practice Again</button><Link className={button} to={back}>Back to Kanji</Link></div>
        </>}
      </>}
    </section><KanjiAttribution />
  </main></div>;
}
