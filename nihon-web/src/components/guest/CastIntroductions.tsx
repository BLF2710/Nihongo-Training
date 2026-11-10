import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CAST_INTRODUCTIONS } from "../../data/guest/guestCast";
import { CAST, introduce } from "../../lib/cast";
import { ISLANDS } from "../../lib/islandMap";
import { Portrait } from "../cast/GuideNote";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";

/** "Meet the island", opened from Home: each island's character introducing their part of the site, in Japanese with
 *  English beside it, over the map. */
export function CastPanel({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { closeRef.current?.focus(); }, []);
  return <section aria-labelledby="cast-heading" className="absolute inset-2 z-30 flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] shadow-2xl sm:inset-6">
    <header className="flex items-start gap-3 border-b border-[var(--ink)]/20 px-5 py-4">
      <div className="min-w-0 flex-1">
        <h2 id="cast-heading" className="text-2xl font-black tracking-tight">Meet the island</h2>
        <p className="text-sm opacity-75">Every part of Lingora is an island, and someone lives on each one. Here's who you'll study with.</p>
      </div>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close Meet the island" className={`grid size-9 shrink-0 place-items-center rounded-lg text-xl hover:bg-[var(--ink)]/10 ${focus}`}>×</button>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAST_INTRODUCTIONS.map(introduction => {
          const island = ISLANDS.find(item => item.id === introduction.island);
          return <li key={introduction.character} className="flex gap-3 rounded-2xl border border-[var(--ink)]/15 bg-white/60 p-4 dark:bg-black/10">
            <Portrait character={introduction.character} mood="happy" />
            <div className="min-w-0">
              <h3 className="font-black">{introduce(CAST[introduction.character])}</h3>
              {island && <p className="text-xs font-bold uppercase tracking-wider text-[var(--vermilion)]"><span aria-hidden="true" lang="ja">{island.mark} </span>{island.name}</p>}
              <p lang="ja" className="mt-1.5 font-bold">{introduction.japanese}</p>
              <p className="mt-0.5 text-sm leading-relaxed opacity-80">{introduction.english}</p>
            </div>
          </li>;
        })}
      </ul>
    </div>
    <footer className="border-t border-[var(--ink)]/20 px-5 py-3 text-center text-sm">
      Ready for the whole island? <Link to="/register" className={`font-bold text-[var(--vermilion)] hover:underline ${focus}`}>Create a free account</Link> or <Link to="/login" className={`font-bold text-[var(--vermilion)] hover:underline ${focus}`}>sign in</Link>.
    </footer>
  </section>;
}
