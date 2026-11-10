import type { ReactNode } from "react";
import { drawingScale, ISLANDS } from "../../lib/islandMap";
import type { IslandId, IslandPlacement, MapLayout } from "../../lib/islandMap";

// The pieces of the island map's stage, shared by the learner's map and the guest landing.

// Where a label sits below an island's anchor, in island-drawing units (just under the front shore).
const LABEL_DROP = 62;

/** Puts an island-sized drawing at its placement: anchored at the island's centre, in its depth layer. */
export function Placed({ layout, place, layer, as: Tag = "div", isInteractive = false, children }: { layout: MapLayout; place: IslandPlacement; layer: number; as?: "div" | "li"; isInteractive?: boolean; children: ReactNode }) {
  return <Tag className={`absolute -translate-x-1/2 -translate-y-[71%] ${isInteractive ? "" : "pointer-events-none"}`} style={{ left: `${place.x * 100}%`, top: `${place.y * 100}%`, width: `${layout.islandWidth * place.scale * 100}%`, zIndex: layer }}>{children}</Tag>;
}

export function IslandLabel({ layout, id, isFogged, badge }: { layout: MapLayout; id: IslandId; isFogged: boolean; badge: string | null }) {
  const island = ISLANDS.find(item => item.id === id);
  const place = layout.placements[id];
  if (!island) return null;
  return <span className="absolute inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border-2 border-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 text-xs font-bold text-[var(--ink)] shadow-sm sm:text-sm"
    style={{ left: `${place.x * 100}%`, top: `${place.y * 100 + LABEL_DROP * drawingScale(layout, place)}%` }}>
    <span lang="ja" className="text-[var(--vermilion)]">{island.mark}</span>
    {island.name}
    {isFogged && <span className="font-normal opacity-70 max-sm:hidden">· in fog</span>}
    {badge && <span className="rounded-full bg-[var(--vermilion)] px-1.5 text-xs text-white">{badge}</span>}
  </span>;
}
