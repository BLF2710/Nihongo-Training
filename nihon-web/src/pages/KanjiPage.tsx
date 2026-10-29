import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { VocabularyCard } from "../components/StudyReferenceCards";
import { KanjiAttribution } from "../components/KanjiReferences";
import { KANJI, introducingLessons, vocabularyKanjiForm } from "../data/kanji";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { fetchKanjiProgress } from "../api/kanji";
import type { KanjiProgress } from "../api/kanji";
import KanaStrokeOrder from "../components/KanaStrokeOrder";
import strokeData from "../data/kanjiStrokes.json";
import KanjiFlashcardButton from "../components/KanjiFlashcardButton";
import KanjiReviewButton from "../components/KanjiReviewButton";
import { COURSE_LEVELS, isCourseLevel, levelOfId, useCourseLevel } from "../lib/courseLevel";
import { isInKanjiScope, KANJI_PLACEMENT as placement } from "../lib/kanjiPlacement";

const labels = { untested: "Untested", learning: "Learning", mastered: "Mastered" };
const masteryStyle = {
  mastered: { card: "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-950", active: "bg-emerald-600 text-white", idle: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", icon: "🟢" },
  learning: { card: "border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-950", active: "bg-amber-500 text-white", idle: "bg-amber-50 text-amber-700 hover:bg-amber-100", icon: "🟡" },
  untested: { card: "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70 text-gray-800", active: "bg-gray-500 text-white", idle: "bg-gray-100 text-gray-600 hover:bg-gray-200", icon: "⚪" },
};
const lessons = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, unitNumber: unit.number })));
const select = "mt-2 block w-full rounded-xl border border-gray-200 bg-white p-3 font-normal focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const normalize = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[.\-\s]/g, "");

export default function KanjiPage() {
  const { kanjiId } = useParams();
  const [progress, setProgress] = useState<KanjiProgress[] | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | KanjiProgress["status"]>("all");
  // The level and unit filters live in the address, so they survive opening a character and coming back.
  const [params, setParams] = useSearchParams();
  const courseLevel = useCourseLevel();
  const requestedLevel = params.get("level");
  const level = requestedLevel === "all" || isCourseLevel(requestedLevel) ? requestedLevel : courseLevel;
  const levelUnits = JAPANESE_STUDY_UNITS.filter(unit => levelOfId(unit.id) === level && KANJI.some(item => placement.get(item.id)?.unit?.id === unit.id));
  const unitId = levelUnits.find(unit => unit.id === params.get("unit"))?.id ?? "all";
  const inScope = (id: string) => isInKanjiScope(id, level, unitId);
  const scoped = KANJI.filter(item => inScope(item.id));
  useEffect(() => {
    const controller = new AbortController();
    fetchKanjiProgress(controller.signal).then(data => { setProgress(data); setError(""); }).catch(() => {
      if (!controller.signal.aborted) setError("Could not load Kanji progress. Your saved answers have not been reset.");
    });
    return () => controller.abort();
  }, [reload, kanjiId]);
  const kanji = KANJI.find(item => item.id === kanjiId);
  const state = progress?.find(item => item.kanjiId === kanjiId);
  const related = kanji ? lessons.flatMap(lesson => lesson.vocabulary.filter(item => vocabularyKanjiForm(item)?.kanjiIds.includes(kanji.id)).map(item => ({ item, lesson }))) : [];
  const introduced = kanji ? introducingLessons(kanji.id) : [];
  const placed = kanji ? placement.get(kanji.id) : undefined;
  const visible = scoped.filter(item => {
    const status = progress?.find(p => p.kanjiId === item.id)?.status;
    return (filter === "all" || status === filter) && normalize([item.character, ...item.meanings, ...item.onyomi, ...item.kunyomi].join(" ")).includes(normalize(search));
  });
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">

      {error && <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error} <button className="underline" onClick={() => setReload(value => value + 1)}>Retry loading progress</button></div>}
      {!progress && !error && <p role="status" className="mt-4">Loading progress…</p>}
      {kanjiId && !kanji ? <h1 className="mt-6 text-2xl font-bold">Kanji not found</h1> : kanji ? <>
        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
          <h1 lang="ja" className="text-center text-8xl">{kanji.character}</h1>
          <p className="mt-5 text-center text-xl font-bold">{kanji.meanings.join(" · ")}</p>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><dt className="font-bold">On'yomi</dt><dd lang="ja" className="mt-1 wrap-anywhere">{kanji.onyomi.join(" · ") || "Not listed"}</dd></div>
            <div><dt className="font-bold">Kun'yomi</dt><dd lang="ja" className="mt-1 wrap-anywhere">{kanji.kunyomi.join(" · ") || "Not listed"}</dd></div>
            <div><dt className="font-bold">Stroke count</dt><dd>{kanji.strokeCount} (KANJIDIC2)</dd></div>
            <div><dt className="font-bold">Course placement</dt><dd>{placed?.level && placed.unit ? `${placed.level} course · Unit ${placed.unit.number}` : "Reference only"} · official JLPT level not verified</dd></div>
          </dl>
          <p className="mt-4 text-sm text-gray-500">Dictionary readings include uncommon forms. A dot separates the Kanji reading from its following kana; a hyphen marks a bound form. Learn the full course-word readings below rather than guessing from individual characters.</p>
          <h2 className="mt-6 text-xl font-bold">How to Draw</h2>
          <KanaStrokeOrder key={kanji.id} character={kanji.character} paths={strokeData.paths} />
          {state && <div className={`mt-5 rounded-xl border p-4 ${masteryStyle[state.status].card}`}>
            <p className="font-bold">{masteryStyle[state.status].icon} {labels[state.status]}</p>
            <p className="mt-1 text-sm">{state.total} attempts · {state.correctCount} correct · {state.wrongCount} incorrect · {state.accuracy}% accuracy</p>
            <p className="mt-1 text-sm">Last practiced: {state.lastPracticedAt ? new Date(state.lastPracticedAt).toLocaleString() : "Not yet practiced"}</p>
          </div>}
          <Link className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white focus-visible:outline-2" to={`/learn/kanji/practice?kanji=${kanji.id}`}>Practice {kanji.character}</Link>
          <KanjiFlashcardButton kanji={kanji} />
          <KanjiReviewButton key={kanji.id} kanji={kanji} />
        </section>
        <section className="mt-8"><h2 className="text-2xl font-bold">Course vocabulary</h2>
          <p className="mt-2 text-sm text-gray-600">These are the existing lesson vocabulary entries with their Kanji spellings. Only characters in the current Kanji collection have detail links.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">{related.map(({ item, lesson }) => <div key={item.id}>
            <VocabularyCard item={item} lesson={lesson} />
            <Link className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline focus-visible:outline-2" to={`/vocabulary?unit=japanese-n5-unit-${lesson.unitNumber}&lesson=${lesson.id}`}>Study {item.japanese} in Vocabulary →</Link>
          </div>)}</div>
        </section>
        <section className="mt-8 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Introduced in lessons</h2>
          {introduced.length ? <ul className="mt-3 space-y-2">{lessons.filter(lesson => introduced.includes(lesson.id)).map(lesson => <li key={lesson.id}><Link className="font-semibold text-emerald-700 hover:underline" to={lesson.href}>Unit {lesson.unitNumber} · Lesson {lesson.number}: {lesson.title} →</Link></li>)}</ul> : <p className="mt-3 text-gray-600">Reference only — not explicitly introduced in a lesson yet.</p>}
          <p className="mt-3 text-sm text-gray-500">Vocabulary association alone does not count as introduction or completion. Lessons retain their existing access requirements.</p>
        </section>
      </> : <>
        <h1 className="mt-6 text-3xl font-black">Kanji</h1>
        <p className="mt-2 text-gray-600">Recognize characters through familiar vocabulary from your lessons. Filter by course level and unit to study one set at a time.</p>
        <p className="mt-2 text-sm text-gray-500">Mastered: at least 3 correct answers and 80% displayed accuracy (rounded to whole percent, matching Kana). Only practice answers change progress.</p>
        <Link to={`/learn/kanji/flashcards?${new URLSearchParams({ level, ...(unitId === "all" ? {} : { unit: unitId }) })}`} className="mt-4 inline-block rounded-xl border bg-white px-4 py-2 font-bold focus-visible:outline-2">Study flashcards</Link>
        <section aria-labelledby="kanji-mastery-heading" className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-6 sm:flex-row sm:items-center">
            <div>
              <h2 id="kanji-mastery-heading" className="text-2xl font-bold text-gray-900">漢 Kanji Character Mastery</h2>
              <p className="mt-0.5 text-sm text-gray-500">Click a character to view readings, accuracy, and practice options.</p>
              <Link to="/learn/kanji/practice" className="mt-3 inline-block rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Practice Kanji</Link>
            </div>
            <div role="group" aria-label="Filter Kanji progress" className="flex flex-wrap gap-2 text-xs font-semibold">
              <button aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={`cursor-pointer rounded-lg px-3 py-1.5 transition focus-visible:outline-2 focus-visible:outline-emerald-600 ${filter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>All ({scoped.length})</button>
              {(["mastered", "learning", "untested"] as const).map(status => <button key={status} disabled={!progress} aria-pressed={filter === status} onClick={() => setFilter(status)} className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 transition focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 ${filter === status ? masteryStyle[status].active : masteryStyle[status].idle}`}>
                <span>{masteryStyle[status].icon} {labels[status]}</span> ({progress ? progress.filter(p => p.status === status && inScope(p.kanjiId)).length : "—"})
              </button>)}
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">Course level
              <select value={level} onChange={event => setParams({ level: event.target.value })} className={select}>
                <option value="all">All levels ({KANJI.length})</option>
                {COURSE_LEVELS.map(item => { const count = KANJI.filter(entry => placement.get(entry.id)?.level === item.id).length; return <option key={item.id} value={item.id}>{item.id} ({count})</option>; })}
              </select>
            </label>
            <label className="block text-sm font-semibold">Unit
              <select value={unitId} disabled={level === "all" || !levelUnits.length} onChange={event => setParams({ level, ...(event.target.value === "all" ? {} : { unit: event.target.value }) })} className={select}>
                <option value="all">{level === "all" ? "Choose a level first" : "All units"}</option>
                {levelUnits.map(unit => <option key={unit.id} value={unit.id}>Unit {unit.number}: {unit.title} ({KANJI.filter(entry => placement.get(entry.id)?.unit?.id === unit.id).length})</option>)}
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">Levels show where this course teaches a character. They are approximate, not an official JLPT list. <Link to="/levels?next=/learn/kanji" className="font-semibold text-emerald-700 hover:underline">Change your course level</Link></p>
          <label className="mt-6 block text-sm font-semibold">Search character, meaning, or reading
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 focus-visible:outline-2 focus-visible:outline-emerald-600" />
          </label>
          <div className="grid grid-cols-3 gap-3 pt-6 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">{visible.map(item => {
            const saved = progress?.find(p => p.kanjiId === item.id);
            return <Link key={item.id} to={`/learn/kanji/${item.id}`} title={`View details for ${item.character} (${item.meanings[0]})`} className={`flex min-w-0 flex-col items-center justify-between rounded-xl border p-2.5 text-center shadow-xs transition-all hover:scale-105 hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-600 motion-reduce:transform-none ${masteryStyle[saved?.status ?? "untested"].card}`}>
              <span lang="ja" className="mb-0.5 block text-2xl font-bold">{item.character}</span>
              <span className="block text-xs font-medium text-gray-500 wrap-anywhere">{item.meanings[0]}</span>
              <span className="mt-2 w-full rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                {!saved ? <span className="text-gray-400">Progress unavailable</span> : saved.total === 0 ? <span className="text-gray-400">Untested</span> : <><span className={saved.status === "mastered" ? "text-emerald-700" : "text-amber-700"}>{saved.accuracy}%</span><span className="sr-only"> {labels[saved.status]}</span></>}
              </span>
            </Link>;
          })}</div>
          {!visible.length && <p role="status" className="py-16 text-center font-medium text-gray-400">{scoped.length ? "No Kanji match this search and filter." : `No Kanji have been added for ${level} yet.`}</p>}
        </section>
      </>}
      <KanjiAttribution />
    </main>
  </div>;
}
