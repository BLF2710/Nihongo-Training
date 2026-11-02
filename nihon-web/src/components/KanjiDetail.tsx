import { useState } from "react";
import { Link } from "react-router-dom";
import { KanjiCard } from "./KanjiCard";
import { kanjiPlacementLabel } from "../lib/kanjiPlacement";
import { StudyModePanel, StudyModeTabs, type StudyModeLabel } from "./StudyModeTabs";
import KanaStrokeOrder from "./KanaStrokeOrder";
import KanaWritingCanvas from "./KanaWritingCanvas";
import KanjiFlashcardButton from "./KanjiFlashcardButton";
import KanjiReviewButton from "./KanjiReviewButton";
import { KanjiAttribution } from "./KanjiReferences";
import { toPlain } from "../lib/furigana";
import { introducingLessons, vocabularyKanjiForm, type Kanji } from "../data/kanji";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import strokeData from "../data/kanjiStrokes.json";

// The flashcard, drawing, writing and course words share one spot, so the page stays on a single screen; the chosen mode carries over to the next kanji.
type StudyMode = "card" | "draw" | "write" | "words";
const STUDY_MODES: readonly StudyMode[] = ["card", "draw", "write", "words"];
const STUDY_MODE_LABELS: Record<StudyMode, StudyModeLabel> = { card: { short: "Card", full: "🃏 Flashcard" }, draw: { short: "Draw", full: "✏ How to Draw" }, write: { short: "Write", full: "✍ Write It!" }, words: { short: "Words", full: "📚 Words" } };
const lessons = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, unitId: unit.id, unitNumber: unit.number })));
const panel = "rounded-3xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6";

type Props = { kanji: Kanji; sequence: readonly Kanji[]; masteryLabel?: string; onStep: (kanjiId: string) => void };

export function KanjiDetail({ kanji, sequence, masteryLabel, onStep }: Props) {
  const [mode, setMode] = useState<StudyMode>("card");
  const index = sequence.findIndex(item => item.id === kanji.id);
  // The chrome variables leave room for the navbar, tabs, step row and the add-to-study buttons around the card and the square widgets.
  return <div className="mx-auto w-full max-w-xl [--card-chrome:23rem] [--widget-chrome:35rem] max-sm:[--card-chrome:29rem] max-sm:[--widget-chrome:37rem]">
    <StudyModeTabs modes={STUDY_MODES} labels={STUDY_MODE_LABELS} selected={mode} onSelect={setMode} />
    <StudyModePanel mode={mode}>
      {mode === "card" && <KanjiCard key={kanji.id} kanji={kanji} caption={`${index + 1} of ${sequence.length} • ${kanjiPlacementLabel(kanji.id)}`} masteryLabel={masteryLabel} heading="h1" />}
      {mode === "draw" && <section aria-label={`How to draw ${kanji.character}`} className={panel}><KanaStrokeOrder key={kanji.id} character={kanji.character} paths={strokeData.paths} /></section>}
      {mode === "write" && <section aria-label={`Write ${kanji.character}`} className={panel}><p className="mb-3 text-sm text-gray-500">Use a mouse, finger, or stylus. This canvas does not claim to grade handwriting.</p><KanaWritingCanvas key={kanji.id} character={kanji.character} /></section>}
      {mode === "words" && <KanjiWords kanji={kanji} />}
    </StudyModePanel>
    <KanjiStepControls kanji={kanji} previous={sequence[index - 1]} next={sequence[index + 1]} onStep={onStep} />
    <div className="mt-2 flex flex-wrap items-start justify-center gap-2"><KanjiFlashcardButton kanji={kanji} /><KanjiReviewButton key={kanji.id} kanji={kanji} /></div>
  </div>;
}

function KanjiWords({ kanji }: { kanji: Kanji }) {
  const introduced = introducingLessons(kanji.id);
  // The word list can be long, so it scrolls inside the panel rather than pushing the step controls off screen.
  return <section aria-label={`Course words with ${kanji.character}`} className={`${panel} h-[max(18rem,min(28rem,calc(100dvh-var(--card-chrome))))] overflow-y-auto`}>
    <h2 className="text-lg font-bold">Course vocabulary</h2>
    <CourseWords kanji={kanji} />
    <h2 className="mt-5 text-lg font-bold">Introduced in lessons</h2>
    {introduced.length ? <ul className="mt-2 space-y-2">{lessons.filter(lesson => introduced.includes(lesson.id)).map(lesson => <li key={lesson.id}><Link className="font-semibold text-emerald-700 hover:underline" to={lesson.href}>Unit {lesson.unitNumber} · Lesson {lesson.number}: {lesson.title} →</Link></li>)}</ul> : <p className="mt-2 text-sm text-gray-600">Reference only — not explicitly introduced in a lesson yet.</p>}
    <details className="mt-5 text-xs text-gray-500"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600">Sources &amp; notes</summary>
      <p className="mt-2 leading-5">Dictionary readings include uncommon forms: a dot separates the kanji reading from following kana, and a hyphen marks a bound form. Learn the readings of the course words above.</p>
      <KanjiAttribution />
    </details>
  </section>;
}

/** One row per course word written with this kanji (the first lesson that teaches it), linking to it in Vocabulary. */
function CourseWords({ kanji }: { kanji: Kanji }) {
  const words = lessons.flatMap(lesson => lesson.vocabulary.flatMap(item => { const form = vocabularyKanjiForm(item); return form?.kanjiIds.includes(kanji.id) ? [{ item, form, lesson }] : []; }))
    .filter((word, index, all) => all.findIndex(other => other.form.id === word.form.id) === index);
  if (!words.length) return <p className="mt-2 text-sm text-gray-600">No course words use this kanji yet.</p>;
  return <ul className="mt-3 space-y-2">{words.map(({ item, form, lesson }) => <li key={form.id}>
    <Link to={`/vocabulary?unit=${lesson.unitId}&lesson=${lesson.id}`} className="flex flex-wrap items-baseline gap-x-3 rounded-xl bg-gray-50 px-4 py-3 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
      <span lang="ja" className="text-2xl font-bold text-gray-900">{form.written}</span>
      <span lang="ja" className="text-gray-600">{form.reading}</span>
      <span className="text-gray-700">{toPlain(item.meaning)}</span>
      <span className="ml-auto text-xs font-semibold text-emerald-700">Lesson {lesson.number} · Unit {lesson.unitNumber} →</span>
    </Link>
  </li>)}</ul>;
}

function KanjiStepControls({ kanji, previous, next, onStep }: { kanji: Kanji; previous?: Kanji; next?: Kanji; onStep: (kanjiId: string) => void }) {
  const control = "rounded-xl px-3 py-3 text-center text-sm font-bold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-indigo-600";
  return <nav aria-label="Kanji" className="mt-3 grid grid-cols-3 gap-2">
    <button type="button" disabled={!previous} onClick={() => previous && onStep(previous.id)} className={`${control} border border-gray-200 bg-white text-gray-700 enabled:hover:bg-gray-50`}>← Previous</button>
    <Link to={`/learn/kanji/practice?kanji=${kanji.id}`} className={`${control} bg-emerald-600 text-white hover:bg-emerald-700`}>Practice <span lang="ja">{kanji.character}</span></Link>
    <button type="button" disabled={!next} onClick={() => next && onStep(next.id)} className={`${control} bg-indigo-600 text-white enabled:hover:bg-indigo-700`}>Next →</button>
  </nav>;
}
