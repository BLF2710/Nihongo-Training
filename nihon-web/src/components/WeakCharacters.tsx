import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../api/errors";
import type { WeakCharacters as WeakList, WeakKana, WeakKanji } from "../api/mistakes";
import { submitKanaAnswer } from "../api/quiz";
import { shuffle } from "../lib/random";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${focus}`;
const button = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 disabled:opacity-50 ${focus}`;
const card = "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";
const SCRIPT_NAMES = { hiragana: "Hiragana", katakana: "Katakana" } as const;

function Accuracy({ item }: { item: WeakKana | WeakKanji }) {
  return <span className="block text-xs text-gray-600">
    <b className={item.accuracy < 60 ? "text-red-700" : "text-amber-800"}>{item.accuracy}%</b> · {item.correctCount}/{item.total}
    {item.status === "mastered" && <> <span className="rounded-full bg-emerald-50 px-1.5 font-semibold text-emerald-800">mastered</span></>}
  </span>;
}

/** Kana and Kanji the learner still misses: kana are drilled here, each Kanji opens its own practice. */
export default function WeakCharacters({ list, onPractised }: { list: WeakList; onPractised: () => void }) {
  const [drill, setDrill] = useState<WeakKana[] | null>(null);
  if (drill) return <KanaDrill kana={drill} onDone={() => { setDrill(null); onPractised(); }} />;
  const isEmpty = !list.kana.length && !list.kanji.length;
  return <div className="mt-6 space-y-6">
    <p className="text-sm text-gray-600">Characters you have missed and still answer right less than {list.weakBelowPercent}% of the time, even ones already counted as mastered. Weakest first.</p>
    {isEmpty && <section className={`${card} text-gray-600`}>No weak characters. Keep practising <Link to="/practice?type=hiragana" className="font-semibold text-emerald-700 underline">kana</Link> and <Link to="/learn/kanji/practice" className="font-semibold text-emerald-700 underline">kanji</Link>; any you miss often show up here.</section>}
    {list.kana.length > 0 && <section className={card} aria-labelledby="weak-kana-heading">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="weak-kana-heading" className="text-xl font-black">Kana ({list.kana.length})</h2>
        <button className={primary} onClick={() => setDrill(shuffle(list.kana))}>Practise these kana →</button></div>
      <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">{list.kana.map(item => <li key={`${item.script}-${item.id}`} className="rounded-2xl border border-gray-200 p-3 text-center">
        <span lang="ja" className="block text-3xl font-bold">{item.kana}</span>
        <span className="sr-only">{SCRIPT_NAMES[item.script]} {item.romaji}, </span><Accuracy item={item} />
      </li>)}</ul>
    </section>}
    {list.kanji.length > 0 && <section className={card} aria-labelledby="weak-kanji-heading">
      <h2 id="weak-kanji-heading" className="text-xl font-black">Kanji ({list.kanji.length})</h2>
      <p className="mt-1 text-sm text-gray-600">Choose one to practise its meaning, readings and words.</p>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{list.kanji.map(item => <li key={item.kanjiId}>
        <Link to={`/learn/kanji/practice?kanji=${encodeURIComponent(item.kanjiId)}`} aria-label={`Practise ${item.character} (${item.meaning}), ${item.accuracy}% right`}
          className={`flex items-center gap-3 rounded-2xl border border-gray-200 p-3 hover:border-emerald-400 ${focus}`}>
          <span lang="ja" className="text-3xl font-bold">{item.character}</span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold">{item.meaning}</span><Accuracy item={item} /></span>
        </Link></li>)}</ul>
    </section>}
  </div>;
}

type Result = { correct: boolean; correctAnswer: string };

/** Type the reading of each weak kana; answers are graded by the server and count toward the kana's accuracy. */
function KanaDrill({ kana, onDone }: { kana: WeakKana[]; onDone: () => void }) {
  const [position, setPosition] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [rightCount, setRightCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  // One submission id per question, so a retried request is never counted twice.
  const submissionIds = useRef(kana.map(() => crypto.randomUUID()));
  const input = useRef<HTMLInputElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const item = kana[position];
  useEffect(() => { (result ? nextButton : input).current?.focus(); }, [result, position]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim() || isSaving || result) return;
    setIsSaving(true); setError("");
    try {
      const saved = await submitKanaAnswer({ type: item.script, kanaId: item.id, answer: value.trim(), submissionId: submissionIds.current[position] });
      setResult(saved);
      if (saved.correct) setRightCount(count => count + 1);
    } catch (failure) {
      setError(apiErrorMessage(failure, "The answer could not be saved. Please try again."));
    } finally { setIsSaving(false); }
  };
  const next = () => { setPosition(index => index + 1); setValue(""); setResult(null); };

  if (!item) return <section className={`${card} mt-6`} aria-labelledby="drill-done">
    <h2 id="drill-done" className="text-2xl font-black">Practice finished</h2>
    <p className="mt-2 text-gray-600">{rightCount} of {kana.length} right. Your accuracy for each kana is updated.</p>
    <button className={`${primary} mt-5`} onClick={onDone}>Back to weak characters</button>
  </section>;

  return <section className={`${card} mt-6`} aria-label="Kana practice">
    <p className="flex justify-between text-sm font-semibold text-gray-600"><span>Kana {position + 1} of {kana.length}</span><span>{SCRIPT_NAMES[item.script]}</span></p>
    <p lang="ja" className="mt-4 text-center text-7xl font-bold">{item.kana}</p>
    <form onSubmit={event => void submit(event)} className="mx-auto mt-6 flex max-w-sm gap-2">
      <label className="sr-only" htmlFor="kana-reading">Reading in romaji</label>
      <input id="kana-reading" ref={input} value={value} onChange={event => setValue(event.target.value)} disabled={result !== null} autoComplete="off" autoCapitalize="off" spellCheck={false}
        placeholder="Type the reading" className={`min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-lg ${focus}`} />
      <button className={primary} disabled={!value.trim() || isSaving || result !== null}>{isSaving ? "Checking…" : "Check"}</button>
    </form>
    {result && <div role="status" className={`mt-5 rounded-2xl p-4 text-center ${result.correct ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}>
      <p className="font-bold">{result.correct ? "Right ✓" : <>Not quite: <span lang="ja">{item.kana}</span> is “{result.correctAnswer}”</>}</p>
    </div>}
    {error && <p role="alert" className="mt-4 text-center text-sm text-red-700">{error}</p>}
    <div className="mt-5 flex flex-wrap justify-center gap-3">{result && <button ref={nextButton} className={primary} onClick={next}>{position + 1 < kana.length ? "Next kana →" : "Finish"}</button>}
      <button className={button} onClick={onDone}>Stop practising</button></div>
  </section>;
}
