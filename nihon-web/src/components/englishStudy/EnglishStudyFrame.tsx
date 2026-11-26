import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { EnglishUnit } from "../../../../shared/course/english/schema.ts";
import Navbar from "../Navbar";

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
export const ALL_UNITS = "all";

type FrameProps = {
  title: string; titleVi: string; level: string; intro: string; children: ReactNode;
  /** Shown on the right of the heading, such as a unit chooser. */
  controls?: ReactNode;
};

/** The page around every English study tool: a compact heading with the level, so the tool itself fits one screen. */
export function EnglishStudyFrame({ title, titleVi, level, intro, controls, children }: FrameProps) {
  return <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-3 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm sm:px-5 sm:py-3">
      <div>
        <p className="text-xs font-bold uppercase text-emerald-700">🇬🇧 English {level} · <Link to="/levels" className={`underline-offset-2 hover:underline ${focusRing}`}>Change level</Link></p>
        <h1 className="text-xl font-black sm:text-2xl">{title} <span lang="vi" className="text-sm font-semibold text-gray-500 sm:text-base">{titleVi}</span></h1>
        <p className="text-sm text-gray-600">{intro}</p>
      </div>
      {controls}
    </header>
    <div className="mt-3">{children}</div>
  </main></div>;
}

/** Chooses one unit of the level, or all of them. */
export function UnitChooser({ units, value, onChange }: { units: readonly EnglishUnit[]; value: string; onChange: (unitId: string) => void }) {
  return <label className="text-xs font-bold text-gray-600">Unit
    <select value={value} onChange={event => onChange(event.target.value)} className={`mt-1 block w-full rounded-xl border border-gray-200 bg-white p-2 text-sm sm:w-72 ${focusRing}`}>
      <option value={ALL_UNITS}>All units</option>
      {units.map(unit => <option key={unit.id} value={unit.id}>Unit {unit.number}: {unit.title}</option>)}
    </select>
  </label>;
}

/** A message in place of a tool that has nothing to show yet. */
export function EmptyNotice({ children }: { children: ReactNode }) {
  return <p role="status" className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600">{children}</p>;
}
