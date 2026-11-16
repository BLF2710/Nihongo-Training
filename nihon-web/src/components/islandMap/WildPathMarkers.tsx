import { Link } from "react-router-dom";
import { WILD_ROUTES } from "../../data/world/routes";
import { bridgeSpan, ISLANDS } from "../../lib/islandMap";
import type { MapLayout } from "../../lib/islandMap";
import { routeHref } from "../../lib/world/routes";
import { MAP_LAYER } from "./stageLayout";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vermilion)]";

/** A tuft of tall grass, the mark of a wild path. */
function GrassTuft() {
  return <svg viewBox="0 0 16 12" className="h-3 w-4 shrink-0" aria-hidden="true">
    <path d="M2,12 Q3,5 1,1 Q5,6 6,12 Z M6,12 Q8,4 8,0 Q10,5 10,12 Z M10,12 Q12,5 15,2 Q13,7 14,12 Z" fill="#4f8a3c" stroke="var(--ink)" strokeWidth="0.8" strokeLinejoin="round" />
  </svg>;
}

/** Each wild path from Home, marked halfway along the bridge it follows; it opens the path on foot, at the Home end. */
export function WildPathMarkers({ layout }: { layout: MapLayout }) {
  const fromHome = WILD_ROUTES.filter(route => route.between[0] === "home");
  return <ul aria-label="Wild paths" className="pointer-events-none absolute inset-0" style={{ zIndex: MAP_LAYER.labels }}>
    {fromHome.map(route => {
      const destination = route.between[1];
      const { start, end } = bridgeSpan(layout, destination);
      const islandName = ISLANDS.find(island => island.id === destination)?.name ?? destination;
      return <li key={route.id} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${((start.x + end.x) / 2 / (layout.aspect * 100)) * 100}%`, top: `${(start.y + end.y) / 2}%` }}>
        <Link to={routeHref(route.id, "home")} aria-label={`${route.name} (${route.japaneseName}): a wild path to the ${islandName} island`}
          className={`pointer-events-auto inline-flex items-center gap-1 whitespace-nowrap rounded-full border-2 border-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 text-xs font-bold text-[var(--ink)] shadow-sm hover:bg-white ${focus}`}>
          <GrassTuft /><span lang="ja">{route.japaneseName}</span><span className="max-sm:hidden">Wild path</span>
        </Link>
      </li>;
    })}
  </ul>;
}
