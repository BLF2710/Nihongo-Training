import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import importedUnits from "../../../shared/course/units.json";
import { COURSE_LEVELS, setCourseLevel, useCourseLevel } from "../lib/courseLevel";
import type { CourseLevel } from "../lib/courseLevel";

const BUILT_IN_N5_UNITS = 3;
const unitCount = (level: CourseLevel) => (level === "N5" ? BUILT_IN_N5_UNITS : 0)
  + (importedUnits as { level: string; published: boolean }[]).filter(unit => unit.published && unit.level === level).length;

// Only pages of this site may be returned to after choosing a level.
const safeNext = (next: string | null) => next && /^\/(?!\/)/.test(next) ? next : "/lessons";

export default function LevelPickerPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const current = useCourseLevel();
  const choose = (level: CourseLevel) => { setCourseLevel(level); navigate(safeNext(params.get("next"))); };

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Your path <span lang="ja" aria-hidden="true" className="ml-3 text-base font-normal text-gray-400">道</span></p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">A clearer place to start.<br /><span className="text-emerald-700">Step by step.</span></h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">Choose the level you want to study. You can switch at any time, and your progress in every level is kept.</p>
      </header>
      <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{COURSE_LEVELS.map(level => {
        const units = unitCount(level.id);
        const selected = level.id === current;
        return <li key={level.id}>
          <button type="button" aria-pressed={selected} onClick={() => choose(level.id)}
            className={`group flex h-full w-full flex-col rounded-3xl border bg-white p-6 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 motion-reduce:transform-none ${selected ? "border-emerald-500 shadow-sm" : "border-gray-200 hover:border-emerald-300"}`}>
            <span className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-black ${selected ? "bg-emerald-600 text-white shadow-md" : "bg-emerald-50 text-emerald-800"}`}>{level.id}</span>
            <span className="mt-5 block text-lg font-black">{level.title}</span>
            <span className="mt-2 block text-sm leading-relaxed text-gray-600">{level.blurb}</span>
            <span className="mt-3 block text-xs font-bold uppercase tracking-wider text-gray-400">{units ? `${units} units` : "Coming soon"}</span>
            <span className="mt-auto block pt-5 text-sm font-black text-emerald-700">{selected ? "Current level ✓" : `${level.action} →`}</span>
          </button>
        </li>;
      })}</ol>
      <p className="mt-8 text-center text-sm text-gray-500">Levels follow the JLPT scale from N5 (beginner) to N1 (advanced). Course placement is approximate and is not an official JLPT list.</p>
    </main>
  </div>;
}
