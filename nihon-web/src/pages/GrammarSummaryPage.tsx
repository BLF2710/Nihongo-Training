import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import RubyText from "../components/RubyText";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { COURSE_LEVELS, isCourseLevel, levelOfId, useCourseLevel } from "../lib/courseLevel";
import { toPlain } from "../lib/furigana";

const normalize = (text: string) => toPlain(text).normalize("NFKC").toLowerCase();

/** Every grammar point of one level on a single page: the pattern, what it does, and one example. */
export default function GrammarSummaryPage() {
  const [params, setParams] = useSearchParams();
  const current = useCourseLevel();
  const requested = params.get("level");
  const level = isCourseLevel(requested) ? requested : current;
  const [search, setSearch] = useState("");
  const units = JAPANESE_STUDY_UNITS.filter(unit => levelOfId(unit.id) === level);
  const matches = (text: string) => normalize(text).includes(normalize(search.trim()));
  const visible = units.map(unit => ({
    unit,
    points: unit.lessons.flatMap(lesson => lesson.grammar.map(point => ({ point, lesson })))
      .filter(({ point }) => matches([point.title, point.pattern, point.explanation, ...point.examples.flatMap(example => [example.japanese, example.romaji, example.meaning])].join(" "))),
  })).filter(group => group.points.length);
  const total = units.reduce((sum, unit) => sum + unit.lessons.reduce((count, lesson) => count + lesson.grammar.length, 0), 0);

  return <div className="min-h-screen bg-gray-50 text-gray-900"><div className="print:hidden"><Navbar /></div>
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mt-6">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">🇯🇵 Japanese • {level}</span>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{level} grammar summary</h1>
        <p className="mt-2 text-gray-600">{total ? `All ${total} sentence patterns of the level, in the order you learn them. Open a pattern's lesson for the full explanation.` : "This level has no grammar yet."}</p>
      </header>
      <div className="mt-6 flex flex-wrap items-end gap-4 print:hidden">
        <label className="block text-sm font-bold text-gray-700">Level
          <select value={level} onChange={event => setParams({ level: event.target.value })} className="mt-2 block rounded-xl border border-gray-200 bg-white p-3 focus-visible:outline-2 focus-visible:outline-emerald-600">
            {COURSE_LEVELS.map(item => <option key={item.id} value={item.id}>{item.id}</option>)}
          </select>
        </label>
        <label className="block min-w-0 flex-1 text-sm font-bold text-gray-700">Search patterns, examples or meanings
          <input type="search" value={search} onChange={event => setSearch(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal focus-visible:outline-2 focus-visible:outline-emerald-600" />
        </label>
        <button type="button" onClick={() => window.print()} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600">Print</button>
      </div>
      {total > 0 && !visible.length && <p role="status" className="mt-10 text-center font-medium text-gray-500">No pattern matches this search.</p>}
      {!total && <Link to="/levels?next=/grammar/summary" className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Choose another level →</Link>}
      <div className="mt-8 space-y-10">{visible.map(({ unit, points }) => <section key={unit.id} aria-labelledby={`summary-${unit.id}`}>
        <h2 id={`summary-${unit.id}`} className="text-xl font-black"><span className="text-emerald-700">Unit {unit.number}</span> · {unit.title}</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500"><tr>
              <th scope="col" className="w-2/5 px-4 py-3">Pattern</th><th scope="col" className="hidden w-1/4 px-4 py-3 sm:table-cell">Use</th><th scope="col" className="px-4 py-3">Example</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">{points.map(({ point, lesson }) => <tr key={point.id} className="align-top">
              <th scope="row" className="px-4 py-3 font-normal">
                <span lang="ja" className="block text-base font-bold leading-relaxed wrap-anywhere"><RubyText text={point.pattern} /></span>
                <span className="mt-1 block text-gray-600 sm:hidden">{point.title}</span>
                <Link to={lesson.href} className="mt-1 inline-block text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600 print:hidden">Lesson {lesson.number} →</Link>
              </th>
              <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">{point.title}</td>
              <td className="px-4 py-3">{point.examples[0] && <>
                <span lang="ja" className="block font-semibold leading-relaxed wrap-anywhere"><RubyText text={point.examples[0].japanese} /></span>
                <span className="mt-1 block text-gray-600">{point.examples[0].meaning}</span>
              </>}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>)}</div>
    </main>
  </div>;
}
