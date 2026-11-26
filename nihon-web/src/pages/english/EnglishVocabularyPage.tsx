import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyNotice, EnglishStudyFrame, focusRing, UnitChooser } from "../../components/englishStudy/EnglishStudyFrame";
import { WordDetail } from "../../components/englishLesson/VocabularyStep";
import { useActivityTitle } from "../../context/ActivityContext";
import { searchWords, studyWordsOf } from "../../lib/englishStudy";
import type { StudyWord } from "../../lib/englishStudy";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// Every word of the chosen level or unit (/english/vocabulary): a searchable list beside the chosen word in full, so
// the page fits one screen; on a phone the list and the chosen word take turns. Search matches the English, the Vietnamese (with or without tone marks) and the definition.
export default function EnglishVocabularyPage() {
  useActivityTitle("English vocabulary");
  const { level, units, unitId, lessons, chooseUnit } = useEnglishStudyScope();
  const [query, setQuery] = useState("");
  const words = useMemo(() => studyWordsOf(lessons), [lessons]);
  const found = useMemo(() => searchWords(words, query), [words, query]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = found.find(word => word.id === chosenId) ?? found[0];
  // Below md the list and the word take turns, so neither pushes the other off the screen.
  const isWordShownOnPhone = chosenId !== null && chosen?.id === chosenId;
  return <EnglishStudyFrame title="Vocabulary" titleVi="Từ vựng" level={level} intro={`${words.length} words and phrases from your ${level} lessons.`}
    controls={<UnitChooser units={units} value={unitId} onChange={id => { chooseUnit(id); setChosenId(null); }} />}>
    {!words.length ? <EmptyNotice>{level} has no lessons yet. Choose another level to see its words.</EmptyNotice> :
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <section aria-label="Word list" className={`${isWordShownOnPhone ? "hidden md:block" : ""} rounded-2xl border border-gray-200 bg-white p-3 shadow-sm`}>
        <label className="block text-xs font-bold text-gray-600">Search in English or Vietnamese
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="e.g. dilemma or khó xử"
            className={`mt-1 w-full rounded-xl border border-gray-200 p-2 text-sm ${focusRing}`} />
        </label>
        <p role="status" className="mt-2 text-xs text-gray-500">{found.length} of {words.length} shown</p>
        <ul className="mt-2 grid max-h-[47vh] grid-cols-2 content-start gap-1.5 overflow-y-auto pr-1 md:max-h-[calc(100vh-24rem)]">{found.map(word =>
          <li key={word.id}><WordButton word={word} isChosen={word.id === chosen?.id} onChoose={() => setChosenId(word.id)} /></li>)}</ul>
      </section>
      <section aria-label="Chosen word" className={`${isWordShownOnPhone ? "" : "hidden md:block"} rounded-2xl border border-gray-200 bg-white p-3 shadow-sm`}>
        <button type="button" onClick={() => setChosenId(null)} className={`mb-2 text-sm font-bold text-emerald-700 md:hidden ${focusRing}`}>← All words</button>
        {chosen ? <>
          <WordDetail word={chosen} />
          <p className="mt-3 text-sm text-gray-600">Taught in <Link to={`/lessons/english/${chosen.lessonSlug}`} className={`font-bold text-emerald-700 hover:underline ${focusRing}`}>Unit {chosen.unitNumber} · Lesson {chosen.lessonNumber}: {chosen.lessonTitle}</Link>.
            Words from your completed lessons come back in <Link to="/english/flashcards" className={`font-bold text-emerald-700 hover:underline ${focusRing}`}>Flashcards</Link>.</p>
        </> : <p className="text-gray-600">No word matches “{query}”.</p>}
      </section>
    </div>}
  </EnglishStudyFrame>;
}

function WordButton({ word, isChosen, onChoose }: { word: StudyWord; isChosen: boolean; onChoose: () => void }) {
  return <button type="button" aria-pressed={isChosen} onClick={onChoose}
    className={`w-full rounded-lg border px-2.5 py-1 text-left ${focusRing} ${isChosen ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"}`}>
    <span lang="en-GB" className="block truncate text-sm font-bold">{word.word}</span>
    <span lang="vi" className="block truncate text-xs text-gray-600">{word.vietnamese}</span>
  </button>;
}
