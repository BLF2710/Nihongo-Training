import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ENGLISH_LEVELS } from "../../../../shared/course/english/schema.ts";
import type { EnglishLevel } from "../../../../shared/course/english/schema.ts";
import { fetchMockHistory } from "../../api/mockExams";
import { fetchSrsSummary } from "../../api/srs";
import type { SrsSummary } from "../../api/srs";
import { fetchUnits } from "../../api/units";
import { englishProgressByLevel } from "../../lib/englishStudy";
import type { EnglishLevelProgress } from "../../lib/englishStudy";
import { focusRing } from "./EnglishStudyFrame";

type MockBest = { level: EnglishLevel; bestPercent: number | null; hasPassed: boolean };
type CourseProgress = { levels: EnglishLevelProgress[]; flashcards: SrsSummary | null; mockBests: MockBest[] };

/** Units decide the panel; flashcards and mock exams only add to it, so their failures leave their part out. */
async function loadCourseProgress(signal: AbortSignal): Promise<CourseProgress> {
  const levels = englishProgressByLevel(await fetchUnits(signal), ENGLISH_LEVELS);
  const bestOf = (level: EnglishLevel): Promise<MockBest | null> => fetchMockHistory(level, signal)
    .then(history => ({ level, bestPercent: history.bestPercent, hasPassed: history.hasPassed })).catch(() => null);
  const [flashcards, bests] = await Promise.all([
    fetchSrsSummary(signal, "english").catch(() => null),
    Promise.all(levels.map(({ level }) => bestOf(level))),
  ]);
  return { levels, flashcards, mockBests: bests.filter(best => best !== null) };
}

/** The English course at a glance on the statistics page: lessons and units per level, flashcards and mock exams. */
export function EnglishCourseProgress() {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    loadCourseProgress(controller.signal).then(setProgress).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  if (error) return <p role="alert" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your English course progress could not be loaded.</p>;
  if (!progress) return <p role="status" className="mb-8 text-center text-gray-500">Loading your English course…</p>;
  const { levels, flashcards, mockBests } = progress;
  return <section aria-labelledby="english-course-heading" className="mb-10">
    <h2 id="english-course-heading" className="mb-4 text-2xl font-black text-gray-900">Your English course</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{levels.map(item => {
      const best = mockBests.find(entry => entry.level === item.level);
      return <article key={item.level} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-black">{item.level}</h3>
        <p className="mt-1 text-sm text-gray-600">{item.lessonsDone} / {item.lessonsTotal} lessons · {item.unitsDone} / {item.unitsTotal} units</p>
        <progress aria-label={`${item.level} lessons completed`} value={item.lessonsDone} max={item.lessonsTotal || 1} className="mt-2 h-2 w-full accent-emerald-600" />
        <p className="mt-2 text-sm text-gray-600">Mock exam: {best?.bestPercent != null ? `best ${best.bestPercent}%${best.hasPassed ? " ✓" : ""}` : "not taken"}</p>
      </article>;
    })}</div>
    {flashcards && <p className="mt-4 text-sm text-gray-700">🗂️ Flashcards: <b>{flashcards.total}</b> words in your deck · <b>{flashcards.learned}</b> learned · <b>{flashcards.mature}</b> well known · <b>{flashcards.dueTotal}</b> due now.{" "}
      <Link to="/english/flashcards" className={`font-bold text-emerald-700 hover:underline ${focusRing}`}>Review them →</Link></p>}
  </section>;
}
