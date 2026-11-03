import RubyText from "../RubyText";
import type { Objective, Quest } from "../../lib/errands/errandsState";
import type { Item } from "../../lib/errands/village";

type ErrandsHudProps = { current: { quest: Quest; objective: Objective } | null; items: readonly Item[]; finishedCount: number; questCount: number };

/** The errand under way and what the traveller carries, over the top of the village. */
export function ErrandsHud({ current, items, finishedCount, questCount }: ErrandsHudProps) {
  return <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
    <section aria-label="Errand" aria-live="polite" className="pointer-events-auto max-w-sm rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm sm:px-4 sm:py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
        {current ? `Errand ${finishedCount + 1} of ${questCount}` : "Every errand done"}
      </p>
      <p className="font-black text-gray-900">{current ? current.quest.title : "The festival has begun!"}</p>
      <p className="text-sm text-gray-700">{current ? current.objective.text : "Walk around and talk to everyone."}</p>
    </section>
    <section aria-label="Bag" className="pointer-events-auto rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Bag</p>
      {items.length === 0 ? <p className="text-sm text-gray-500">Empty</p> : <ul className="mt-1 flex gap-2">
        {items.map(item => <li key={item.id} title={item.english} className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-bold text-gray-900">
          <span aria-hidden="true">{item.icon}</span><span lang="ja"><RubyText text={item.japanese} /></span><span className="sr-only"> ({item.english})</span>
        </li>)}
      </ul>}
    </section>
  </div>;
}
