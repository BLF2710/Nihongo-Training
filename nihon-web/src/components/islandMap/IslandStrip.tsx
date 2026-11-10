import { Link, useLocation } from "react-router-dom";
import { IslandHost } from "../cast/IslandHost";
import { recallGrowth } from "../../lib/islandGrowthMemory";
import { ISLANDS, islandForPage } from "../../lib/islandMap";
import type { IslandId } from "../../lib/islandMap";
import { IslandLand, IslandWater } from "./IslandArt";
import { Sea } from "./Sea";
import { StripTraveller } from "./Traveller";
import { useMapTimeOfDay } from "./useMapTimeOfDay";
import "./IslandMap.css";

const NO_BRIDGES: readonly [] = [];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";

/** A short strip under the top bar of a hub page, showing the island it belongs to on the map (or `island`, given by a
 *  page that shows it only at times, such as on its start screen). */
export function IslandStrip({ island }: { island?: IslandId }) {
  const { pathname, search } = useLocation();
  const id = island ?? islandForPage(pathname, search);
  return id ? <IslandBanner id={id} /> : null;
}

/** The island over its patch of sea, at the map's time of day and as grown as the map last showed it, with its name and
 *  the learner's traveller standing on it, and the island's character greeting them. */
function IslandBanner({ id }: { id: IslandId }) {
  const { timeOfDay } = useMapTimeOfDay();
  const island = ISLANDS.find(item => item.id === id);
  if (!island) return null;
  const growth = recallGrowth(id);
  return <div data-time={timeOfDay} className="island-map island-sea relative h-20 overflow-hidden border-b border-gray-200">
    <Sea />
    <div className="relative mx-auto flex h-full max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="relative -mb-4 w-28 shrink-0 self-end sm:w-32">
        <div className="absolute inset-0"><IslandWater id={id} /></div>
        <div className="relative"><IslandLand id={id} isFogged={false} bridgeDirections={NO_BRIDGES} stage={growth?.stage ?? 0} trackStages={growth?.trackStages} /></div>
        <StripTraveller id={id} />
      </div>
      <div className="min-w-0 shrink-0 whitespace-nowrap rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-1 text-[var(--ink)] shadow-sm">
        <p className="font-black"><span lang="ja" aria-hidden="true" className="text-[var(--vermilion)]">{island.mark} </span>{island.name}</p>
        <p className="truncate text-xs opacity-75 max-sm:hidden">{island.tagline}</p>
      </div>
      <IslandHost island={id} />
      <Link to="/" aria-label="Island map" className={`ml-auto shrink-0 rounded-xl border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 text-sm font-bold text-[var(--ink)] shadow-sm hover:bg-white ${focus}`}><span aria-hidden="true">🏝 </span><span className="max-sm:hidden">Island </span>map</Link>
    </div>
  </div>;
}
