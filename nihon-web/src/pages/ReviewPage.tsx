import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { REVIEW_SIZES, reviewChoices, selectReviewCharacters } from "../lib/kanaReview";
import type { CharacterStat, KanaScript, ReviewSize } from "../lib/kanaReview";

type Question = { character: CharacterStat; choices: string[] };
type Answer = { correct: boolean; correctAnswer: string };
const button = "rounded-xl border border-gray-200 px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed";

export default function ReviewPage({ script }: { script: KanaScript }) {
  const title = script === "hiragana" ? "Hiragana" : "Katakana";
  const [size, setSize] = useState<ReviewSize>(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"setup" | "quiz" | "summary">("setup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [latest, setLatest] = useState<CharacterStat[] | null>(null);
  const guard = useRef(false);
  const question = questions[index];
  const result = answers[index];
  const correct = answers.filter(a => a.correct).length;

  async function loadCharacters() {
    const response = await api.get<Record<KanaScript, { characters: CharacterStat[] }>>("/statistics");
    const characters = response.data[script]?.characters;
    if (!characters?.length) throw new Error("No characters available");
    return characters;
  }
  async function start() {
    if (guard.current) return;
    guard.current = true; setBusy(true); setError("");
    try {
      const characters = await loadCharacters();
      setQuestions(selectReviewCharacters(characters, size).map(character => ({ character, choices: reviewChoices(character, characters) })));
      setAnswers([]); setIndex(0); setSelected(null); setLatest(null); setPhase("quiz");
    } catch { setError("Could not load your character statistics. Please check your connection and try again."); }
    finally { guard.current = false; setBusy(false); }
  }
  async function answer(value: string) {
    if (guard.current || result || selected !== null) return;
    guard.current = true; setSelected(value); setBusy(true); setError("");
    try {
      const response = await api.post<Answer>("/quiz/answer", { type: script, kanaId: question.character.id, answer: value });
      setAnswers(previous => [...previous, response.data]);
    } catch {
      // A lost response may have been committed. Never automatically resend it.
      setError("We could not confirm this answer was saved. To avoid counting it twice, this session has stopped. Return to Mastery to check your statistics, then start a new review.");
    } finally { setBusy(false); }
  }
  async function refreshSummary() {
    setBusy(true); setError("");
    try { setLatest(await loadCharacters()); }
    catch { setError("Your answers were submitted, but updated character statuses could not be loaded. Please retry."); }
    finally { setBusy(false); }
  }
  function next() {
    if (!result || busy) return;
    if (index + 1 === questions.length) { setPhase("summary"); void refreshSummary(); }
    else { setIndex(index + 1); setSelected(null); guard.current = false; }
  }
  const reviewed = new Set(questions.map(q => q.character.id));
  const newlyMastered = latest?.filter(c => reviewed.has(c.id) && c.status === "mastered" && questions.find(q => q.character.id === c.id)?.character.status !== "mastered");
  const learning = latest?.filter(c => reviewed.has(c.id) && c.status === "learning");

  return <div className="min-h-screen bg-gray-50 text-gray-900">
    <Navbar />
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <Link className="text-sm font-semibold text-gray-600 hover:underline" to={`/statistics/japanese?type=${script}`}>← Back to {title} Mastery</Link>
      <h1 className="text-3xl font-bold mt-5 mb-6">{title} Review</h1>
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 text-red-700 p-4">{error}</p>}
        {phase === "setup" && <>
          <h2 className="text-xl font-semibold mb-4">How many characters do you want to review?</h2>
          <div className="flex flex-wrap gap-3">{REVIEW_SIZES.map(n => <button key={n} disabled={busy} aria-pressed={size === n} onClick={() => setSize(n)} className={`${button} ${size === n ? "bg-emerald-100 border-emerald-500" : ""}`}>{n}</button>)}</div>
          <p className="text-gray-500 my-5">Focus on Learning characters, with a few Untested and Mastered characters. Answers count toward your existing Speed Quiz statistics.</p>
          <button className={button} disabled={busy} onClick={() => void start()}>{busy ? "Loading…" : "Start Review"}</button>
        </>}
        {phase === "quiz" && question && <>
          <p className="text-gray-500 text-center">Question {index + 1} / {questions.length}</p>
          <progress className="w-full mt-3 accent-emerald-500" value={answers.length} max={questions.length} aria-label="Review progress" />
          <div lang="ja" className="text-center text-7xl sm:text-8xl py-10">{question.character.kana}</div>
          <h2 className="text-center font-semibold mb-5">Which romaji matches this character?</h2>
          <div className="grid grid-cols-2 gap-3">{question.choices.map(choice => <button key={choice} disabled={selected !== null || busy} onClick={() => void answer(choice)} className={`${button} ${selected === choice ? "border-emerald-500 bg-emerald-50" : ""}`}>{choice}</button>)}</div>
          <div aria-live="polite" className="mt-5">
            {busy && <p>Saving answer…</p>}
            {result && <><p className={`rounded-xl p-4 font-semibold ${result.correct ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{result.correct ? "Correct!" : `Incorrect. The correct answer is ${result.correctAnswer}.`}</p><button className={`${button} mt-4`} onClick={next}>{index + 1 === questions.length ? "View Summary" : "Next Question →"}</button></>}
          </div>
        </>}
        {phase === "summary" && <>
          <h2 className="text-2xl font-bold mb-5">Review Summary</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">{[["Questions reviewed", answers.length], ["Correct", correct], ["Wrong", answers.length - correct], ["Accuracy", `${Math.round(correct / answers.length * 100)}%`]].map(([label, value]) => <div key={label} className="bg-gray-50 rounded-xl p-4"><dt className="text-sm text-gray-500">{label}</dt><dd className="text-2xl font-bold">{value}</dd></div>)}</dl>
          {busy && <p role="status">Loading updated character progress…</p>}
          {latest && <div className="space-y-4 mb-6"><div><h3 className="font-semibold">Characters that reached Mastered</h3><p lang="ja" className="text-2xl mt-2">{newlyMastered?.map(c => c.kana).join(" · ") || "None this session"}</p></div><div><h3 className="font-semibold">Characters still Learning</h3><p lang="ja" className="text-2xl mt-2">{learning?.map(c => c.kana).join(" · ") || "None this session"}</p></div></div>}
          {error && <button className={button} disabled={busy} onClick={() => void refreshSummary()}>Retry loading progress</button>}
          <div className="flex flex-wrap gap-3 mt-5"><button className={button} disabled={busy} onClick={() => { guard.current = false; setPhase("setup"); setError(""); }}>Review Again</button><Link className={button} to={`/statistics/japanese?type=${script}`}>Back to {title} Mastery</Link></div>
        </>}
      </section>
    </main>
  </div>;
}
