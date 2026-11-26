import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyNotice, EnglishStudyFrame, focusRing, UnitChooser } from "../../components/englishStudy/EnglishStudyFrame";
import { ExplanationSwitch } from "../../components/englishLesson/ExplanationSwitch";
import { GrammarPointPanel } from "../../components/englishLesson/GrammarStep";
import { useActivityTitle } from "../../context/ActivityContext";
import { studyGrammarOf } from "../../lib/englishStudy";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// Every grammar point of the chosen level or unit (/english/grammar): the list beside the chosen point in full,
// explained in English or, with the switch, Vietnamese.
export default function EnglishGrammarPage() {
  useActivityTitle("English grammar");
  const { level, units, unitId, lessons, chooseUnit } = useEnglishStudyScope();
  const points = useMemo(() => studyGrammarOf(lessons), [lessons]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = points.find(point => point.id === chosenId) ?? points[0];
  // Below md the list and the point take turns, so neither pushes the other off the screen.
  const isPointShownOnPhone = chosenId !== null && chosen?.id === chosenId;
  return <EnglishStudyFrame title="Grammar" titleVi="Ngữ pháp" level={level} intro={`${points.length} grammar points from your ${level} lessons.`}
    controls={<UnitChooser units={units} value={unitId} onChange={id => { chooseUnit(id); setChosenId(null); }} />}>
    {!chosen ? <EmptyNotice>{level} has no lessons yet. Choose another level to see its grammar.</EmptyNotice> :
    <div className="grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)]">
      <nav aria-label="Grammar points" className={`${isPointShownOnPhone ? "hidden md:block" : ""} rounded-2xl border border-gray-200 bg-white p-3 shadow-sm`}>
        <ul className="max-h-[57vh] space-y-1 overflow-y-auto pr-1 md:max-h-[calc(100vh-19rem)]">{points.map(point => <li key={point.id}>
          <button type="button" aria-pressed={point.id === chosen.id} onClick={() => setChosenId(point.id)}
            className={`w-full rounded-lg border px-2.5 py-1.5 text-left text-sm ${focusRing} ${point.id === chosen.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300"}`}>
            <span className="block font-bold">{point.title}</span>
            <span className="block truncate text-xs text-gray-500">Unit {point.unitNumber} · {point.lessonTitle}</span>
          </button>
        </li>)}</ul>
      </nav>
      <article aria-labelledby="grammar-title" className={`${isPointShownOnPhone ? "" : "hidden md:block"} rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5`}>
        <button type="button" onClick={() => setChosenId(null)} className={`mb-2 text-sm font-bold text-emerald-700 md:hidden ${focusRing}`}>← All grammar points</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="grammar-title" className="text-xl font-black sm:text-2xl">{chosen.title}</h2>
            <p className="text-sm text-gray-600">From <Link to={`/lessons/english/${chosen.lessonSlug}`} className={`font-bold text-emerald-700 hover:underline ${focusRing}`}>Unit {chosen.unitNumber} · Lesson {chosen.lessonNumber}: {chosen.lessonTitle}</Link></p>
          </div>
          <ExplanationSwitch />
        </div>
        <div className="mt-3"><GrammarPointPanel key={chosen.id} point={chosen} /></div>
      </article>
    </div>}
  </EnglishStudyFrame>;
}
