import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyNotice, EnglishStudyFrame, focusRing } from "../../components/englishStudy/EnglishStudyFrame";
import { useActivityTitle } from "../../context/ActivityContext";
import { studyGrammarOf } from "../../lib/englishStudy";
import type { StudyGrammarPoint } from "../../lib/englishStudy";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// Every grammar point of the level on one sheet (/english/grammar/summary): the pattern, what it is, and one example
// with its Vietnamese. One unit shows at a time, so the sheet fits the screen; printing prints the whole level.

const tab = (isChosen: boolean) => `rounded-lg px-3 py-1.5 text-sm font-bold ${focusRing} ${isChosen ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`;

export default function EnglishGrammarSummaryPage() {
  useActivityTitle("English grammar summary");
  // Without `?unit=` the scope is the whole level, which the sheet splits into its units.
  const { level, units, lessons } = useEnglishStudyScope();
  const byUnit = useMemo(() => units.map(unit => ({ unit, points: studyGrammarOf(lessons.filter(lesson => lesson.unitId === unit.id)) })), [units, lessons]);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const chosen = byUnit.find(({ unit }) => unit.id === chosenId) ?? byUnit[0];
  const total = byUnit.reduce((sum, { points }) => sum + points.length, 0);

  return <EnglishStudyFrame title="Grammar summary" titleVi="Tóm tắt ngữ pháp" level={level} intro={`All ${total} grammar points of ${level}, one unit at a time. Print for the whole level on paper.`}
    controls={<button type="button" onClick={() => window.print()} className={`rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold hover:bg-gray-100 print:hidden ${focusRing}`}>Print {level}</button>}>
    {!chosen ? <EmptyNotice>{level} has no lessons yet. Choose another level to see its grammar.</EmptyNotice> : <>
      <div role="tablist" aria-label="Unit" className="mb-3 flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1 print:hidden">{byUnit.map(({ unit }) =>
        <button key={unit.id} type="button" role="tab" aria-selected={unit.id === chosen.unit.id} onClick={() => setChosenId(unit.id)} className={tab(unit.id === chosen.unit.id)}>Unit {unit.number}</button>)}
      </div>
      {byUnit.map(({ unit, points }) => <section key={unit.id} role="tabpanel" aria-labelledby={`summary-${unit.id}`}
        className={`${unit.id === chosen.unit.id ? "" : "hidden print:block"} mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm print:break-inside-avoid`}>
        <h2 id={`summary-${unit.id}`} className="px-4 pt-3 font-black"><span className="text-emerald-700">Unit {unit.number}</span> · {unit.title} <span lang="vi" className="font-semibold text-gray-500">· {unit.titleVi}</span></h2>
        <div className="mt-2 max-h-[calc(100vh-31rem)] overflow-y-auto sm:max-h-[calc(100vh-24rem)] print:max-h-none print:overflow-visible"><SummaryTable points={points} /></div>
      </section>)}
    </>}
  </EnglishStudyFrame>;
}

function SummaryTable({ points }: { points: readonly StudyGrammarPoint[] }) {
  return <table className="w-full table-fixed text-left text-sm">
    <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500"><tr>
      <th scope="col" className="w-2/5 px-4 py-2">Pattern</th><th scope="col" className="hidden w-1/5 px-4 py-2 sm:table-cell">Point</th><th scope="col" className="px-4 py-2">Example</th>
    </tr></thead>
    <tbody className="divide-y divide-gray-100">{points.map(point => <tr key={point.id} className="align-top">
      <th scope="row" className="px-4 py-2 font-normal">
        <span lang="en-GB" className="block font-bold wrap-anywhere">{point.pattern}</span>
        <span className="block text-xs text-gray-600 sm:hidden">{point.title}</span>
        <Link to={`/lessons/english/${point.lessonSlug}`} className={`text-xs font-semibold text-emerald-700 hover:underline print:hidden ${focusRing}`}>Lesson {point.lessonNumber} →</Link>
      </th>
      <td className="hidden px-4 py-2 text-gray-700 sm:table-cell">{point.title}</td>
      <td className="px-4 py-2">{point.examples[0] && <>
        <span lang="en-GB" className="block font-semibold">{point.examples[0].english}</span>
        <span lang="vi" className="block text-gray-600">{point.examples[0].vietnamese}</span>
      </>}</td>
    </tr>)}</tbody>
  </table>;
}
