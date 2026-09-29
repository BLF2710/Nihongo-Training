import { Link } from "react-router-dom";
import { StudyFlashcards } from "./VocabularyFlashcard";
import KanaStrokeOrder from "./KanaStrokeOrder";
import { kanjiExamples, kanjiStudyCards } from "../data/kanjiStudyCards";
import { KANJI } from "../data/kanji";
import type { Kanji } from "../data/kanji";
import strokes from "../data/kanjiStrokes.json";

function KanjiStudyCard({ kanji }: { kanji: Kanji }) {
  const examples = kanjiExamples(kanji.id);
  function exampleList(items: typeof examples) {
    return <ul className="mt-3 space-y-3">{items.map(item => <li key={item.id}>
      <Link to={item.href} className="block rounded-xl bg-gray-50 p-3 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
        <span lang="ja" className="font-bold text-emerald-800">{item.written}</span>
        <span lang="ja" className="ml-3 text-gray-600">{item.reading}</span>
        <span className="mt-1 block text-sm text-gray-700">{item.meaning} →</span>
      </Link>
    </li>)}</ul>;
  }
  return <article aria-label={`Study ${kanji.character}`} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 lang="ja" className="text-center text-8xl font-bold text-gray-900">{kanji.character}</h2>
    <dl className="mt-6 grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><dt className="font-bold">Meaning</dt><dd className="mt-1 text-gray-700">{kanji.meanings.join(" · ")}</dd></div>
      <div><dt className="font-bold">On'yomi</dt><dd lang="ja" className="mt-1 wrap-anywhere">{kanji.onyomi.join(" · ") || "Not listed"}</dd></div>
      <div><dt className="font-bold">Kun'yomi</dt><dd lang="ja" className="mt-1 wrap-anywhere">{kanji.kunyomi.join(" · ") || "Not listed"}</dd></div>
    </dl>
    <p className="mt-3 text-xs text-gray-500">Readings vary by word. A dot separates the Kanji reading from following kana; a hyphen marks a bound form.</p>
    <h3 className="mt-6 font-bold">Example vocabulary</h3>
    {exampleList(examples.slice(0, 4))}
    {examples.length < 2 && <p className="mt-2 text-sm text-gray-500">{examples.length ? "Only one linked course word is available so far." : "No linked course vocabulary yet."}</p>}
    {examples.length > 4 && <details className="mt-3"><summary className="cursor-pointer font-semibold text-emerald-700 focus-visible:outline-2">View more vocabulary ({examples.length - 4})</summary>{exampleList(examples.slice(4))}</details>}
    <details className="mt-6 border-t border-gray-100 pt-4">
      <summary className="cursor-pointer font-bold text-emerald-800 focus-visible:outline-2 focus-visible:outline-emerald-600">Stroke order · {kanji.strokeCount} strokes</summary>
      <KanaStrokeOrder character={kanji.character} paths={strokes.paths} />
    </details>
    <Link to={`/learn/kanji/practice?kanji=${kanji.id}`} className="mt-6 inline-block rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white focus-visible:outline-2">Mixed practice →</Link>
  </article>;
}

export default function KanjiFlashcards({ kanjiIds }: { kanjiIds: string[] }) {
  return <section aria-label="Kanji study">
    <p className="mb-4 text-center text-sm text-gray-500">Study only — cards do not change mastery or XP. Mixed practice records graded answers for each Kanji.</p>
    <StudyFlashcards key={kanjiIds.join(':')} cards={kanjiStudyCards(kanjiIds, "meaning")} label="Kanji flashcards"
      renderCard={card => { const kanji = KANJI.find(item => item.id === card.id); return kanji ? <KanjiStudyCard kanji={kanji} /> : null; }} />
  </section>;
}
