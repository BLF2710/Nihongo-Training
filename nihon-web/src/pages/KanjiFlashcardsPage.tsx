import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { KanjiAttribution } from "../components/KanjiReferences";
import KanjiFlashcards from "../components/KanjiFlashcards";
import { KANJI } from "../data/kanji";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { isCourseLevel, useCourseLevel } from "../lib/courseLevel";
import { useKanjiFlashcards } from "../lib/kanjiFlashcards";
import { isInKanjiScope } from "../lib/kanjiPlacement";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
type Deck = "mine" | "set";

/** Flashcards only: the learner's own list, or the level / unit chosen on the kanji screen. */
export default function KanjiFlashcardsPage() {
  const [params] = useSearchParams();
  const courseLevel = useCourseLevel();
  const requestedLevel = params.get("level");
  const level = requestedLevel === "all" || isCourseLevel(requestedLevel) ? requestedLevel : courseLevel;
  const unit = JAPANESE_STUDY_UNITS.find(item => item.id === params.get("unit"));
  const setIds = KANJI.filter(kanji => isInKanjiScope(kanji.id, level, unit?.id ?? "all")).map(kanji => kanji.id);
  const setLabel = level === "all" ? "All kanji" : unit ? `${level} Unit ${unit.number}` : `${level} kanji`;
  const { kanjiIds, error, isSaving, remove } = useKanjiFlashcards();
  const [chosen, setChosen] = useState<Deck | null>(null);
  // Until the learner picks, start with their own list when it has cards.
  const deck: Deck = chosen ?? (kanjiIds?.length ? "mine" : "set");
  const deckIds = deck === "mine" ? kanjiIds ?? [] : setIds;
  const backTo = `/learn/kanji?${new URLSearchParams({ level, ...(unit ? { unit: unit.id } : {}) })}`;
  const tab = (value: Deck, label: string) => <button key={value} type="button" role="tab" aria-selected={deck === value} onClick={() => setChosen(value)}
    className={`rounded-xl border px-4 py-2 text-sm font-bold ${focus} ${deck === value ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300"}`}>{label}</button>;

  // --card-chrome leaves room for the navbar, heading, deck tabs, shuffle row and card navigation around the card.
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar back={{ to: backTo }} /><main className="mx-auto w-full max-w-2xl px-4 py-4 sm:px-6 [--card-chrome:23rem] max-sm:[--card-chrome:29rem]">
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2"><h1 className="text-2xl font-black">Kanji flashcards</h1>
    <div role="tablist" aria-label="Which flashcards" className="flex flex-wrap gap-2">
      {tab("mine", `My flashcards (${kanjiIds?.length ?? "…"})`)}
      {tab("set", `${setLabel} (${setIds.length})`)}
    </div></div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}

    {deck === "mine" && kanjiIds !== null && kanjiIds.length > 0 && <details className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
      <summary className={`cursor-pointer font-semibold ${focus}`}>Manage my list</summary>
      <ul className="mt-3 flex flex-wrap gap-2">{kanjiIds.map(id => {
        const kanji = KANJI.find(item => item.id === id);
        return kanji && <li key={id} className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 py-1 pl-3 pr-1">
          <Link to={`/learn/kanji/${id}`} lang="ja" className={`font-bold ${focus}`}>{kanji.character}</Link>
          <button type="button" disabled={isSaving} onClick={() => void remove(id)} aria-label={`Remove ${kanji.character} from my flashcards`} className={`rounded-full px-2 text-gray-500 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 ${focus}`}>×</button>
        </li>;
      })}</ul>
    </details>}

    <div className="mt-4">
      {deck === "mine" && kanjiIds === null && !error && <p role="status" className="text-gray-500">Loading your flashcards…</p>}
      {deck === "mine" && kanjiIds?.length === 0 && <section className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">
        Your list is empty. Open a kanji and choose <b>Add to flashcards</b>, or study the {setLabel} set instead.
        <div className="mt-4 flex flex-wrap gap-3"><Link to={backTo} className={`rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white ${focus}`}>Browse kanji</Link>
          <button type="button" onClick={() => setChosen("set")} className={`rounded-xl border px-4 py-2 font-bold ${focus}`}>Study {setLabel}</button></div>
      </section>}
      {deck === "set" && !setIds.length && <p className="rounded-3xl border border-gray-200 bg-white p-6 text-gray-600">No kanji have been added for {setLabel} yet.</p>}
      {deckIds.length > 0 && <KanjiFlashcards key={`${deck}:${deckIds.join(":")}`} kanjiIds={deckIds} />}
    </div>
    <footer className="mt-10 border-t border-gray-200 pt-4 text-xs text-gray-500">
      <p>Flip a card for its meaning, readings and example words. Studying here does not change mastery or XP; only Kanji practice records answers. Add kanji to your own list from a kanji's page.</p>
      <KanjiAttribution />
    </footer>
  </main></div>;
}
