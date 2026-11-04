import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Portrait } from "../cast/GuideNote";
import { CAST, introduce } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { VillagerNews } from "../../lib/village/villageNews";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";
const primary = `rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-700 ${focus}`;
const secondary = `rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-800 hover:bg-gray-100 ${focus}`;

type VillagerNewsPanelProps = { villager: CharacterId; news: VillagerNews; onClose: () => void };

/** A villager's news for today, over the bottom of the square, with the way to their part of the site. */
export function VillagerNewsPanel({ villager, news, onClose }: VillagerNewsPanelProps) {
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => first.current?.focus(), [villager]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.code === "Escape" || (event.code === "KeyE" && !event.repeat)) { event.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return <section role="dialog" aria-label={`Talking with ${CAST[villager].name}`} className="notice-sheet absolute inset-x-2 bottom-2 z-[1000] mx-auto max-w-2xl p-4 pt-5 sm:inset-x-4 sm:bottom-4 sm:p-5 sm:pt-6">
    <div className="flex items-start gap-3">
      <Portrait character={villager} mood={news.hasNews ? "happy" : "calm"} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{introduce(CAST[villager])}</p>
        <p className="mt-1 text-xl font-bold leading-relaxed text-gray-900 sm:text-2xl" lang="ja">{news.japanese}</p>
        <p className="text-sm text-gray-600">{news.english}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {news.links.map((link, index) => <Link key={link.href} ref={index === 0 ? first : undefined} to={link.href} className={index === 0 ? primary : secondary}>{link.label}{index === 0 ? " →" : ""}</Link>)}
          <button type="button" className={secondary} onClick={onClose}>Bye</button>
        </div>
      </div>
    </div>
  </section>;
}
