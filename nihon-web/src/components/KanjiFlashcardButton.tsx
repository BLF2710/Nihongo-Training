import { Link } from "react-router-dom";
import type { Kanji } from "../data/kanji";
import { useKanjiFlashcards } from "../lib/kanjiFlashcards";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

/** Adds a kanji to the learner's flashcard list, or shows that it is there with a way to remove it. */
export default function KanjiFlashcardButton({ kanji }: { kanji: Kanji }) {
  const { kanjiIds, error, isSaving, add, remove } = useKanjiFlashcards();
  const isAdded = kanjiIds?.includes(kanji.id) ?? false;
  return <div className="inline-flex flex-wrap items-center gap-2 text-sm">
    {isAdded
      ? <>
        <span role="status" className="rounded-xl bg-emerald-50 px-3 py-2 font-bold text-emerald-800">In your flashcards ✓</span>
        <button type="button" disabled={isSaving} onClick={() => void remove(kanji.id)} className={`rounded-xl border px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${focus}`}>Remove</button>
        <Link to="/learn/kanji/flashcards" className={`font-semibold text-emerald-700 hover:underline ${focus}`}>Study my flashcards →</Link>
      </>
      : <button type="button" disabled={kanjiIds === null || isSaving} onClick={() => void add(kanji.id)} className={`rounded-xl border bg-white px-3 py-2 font-bold hover:bg-gray-50 disabled:opacity-50 ${focus}`}>Add to flashcards</button>}
    {error && <p role="alert" className="w-full text-sm text-red-700">{error}</p>}
  </div>;
}
