import { useState } from "react";
import { Link } from "react-router-dom";
import { CAST } from "../../lib/cast";
import type { DailyErrand } from "../../lib/village/villageNews";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
// Wide enough to show the list open without covering the square (Tailwind's sm).
const OPEN_FROM = "(min-width: 640px)";
const startsOpen = () => typeof window.matchMedia !== "function" || window.matchMedia(OPEN_FROM).matches;

type BoardStatus = "loading" | "ready" | "unavailable";

/** Today's errands from the villagers, over the top corner of the square: each a link to do it, ticked once done. */
/** On a phone the list starts folded to its heading, so it doesn't cover the square. */
export function DailyErrandsBoard({ errands, status }: { errands: readonly DailyErrand[]; status: BoardStatus }) {
  const [isOpen, setIsOpen] = useState(startsOpen);
  const done = errands.filter(errand => errand.isDone).length;
  return <section aria-labelledby="daily-errands-heading" className="pointer-events-auto max-w-xs rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm sm:px-4 sm:py-3">
    <h2 id="daily-errands-heading" className="text-xs font-bold uppercase tracking-widest text-emerald-700">
      <button type="button" aria-expanded={isOpen} onClick={() => setIsOpen(open => !open)} className={`flex w-full items-center gap-2 text-left uppercase ${focus}`}>
        <span>Today's errands{errands.length > 0 ? ` · ${done} of ${errands.length}` : ""}</span>
        <span aria-hidden="true" className="ml-auto text-gray-400">{isOpen ? "▴" : "▾"}</span>
      </button>
    </h2>
    {isOpen && <>
    {status === "loading" && errands.length === 0 ? <p role="status" className="text-sm text-gray-500">Asking around…</p>
      : status === "unavailable" && errands.length === 0 ? <p className="text-sm text-gray-600">Today's errands couldn't be loaded. The villagers can still show you around.</p>
      : errands.length === 0 ? <p className="text-sm text-gray-600">Nothing yet: finish a lesson to get your first errands.</p>
      : <ul className="mt-1 space-y-1">
        {errands.map(errand => <li key={errand.id}>
          <Link to={errand.href} className={`flex items-start gap-2 rounded-lg px-1 py-0.5 text-sm hover:bg-emerald-50 ${focus}`}>
            <span aria-hidden="true" className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border text-[0.65rem] font-black ${errand.isDone ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-400"}`}>{errand.isDone ? "✓" : ""}</span>
            <span className={errand.isDone ? "text-gray-500 line-through" : "text-gray-900"}>
              {errand.task} <span className="text-gray-500">({CAST[errand.giver].name})</span>
              <span className="sr-only">{errand.isDone ? " Done." : " Not done yet."}</span>
            </span>
          </Link>
        </li>)}
      </ul>}
    {errands.length > 0 && done === errands.length && <p className="mt-1 text-sm font-bold text-emerald-700">All done: the lanterns are lit! 🏮</p>}
    </>}
  </section>;
}
