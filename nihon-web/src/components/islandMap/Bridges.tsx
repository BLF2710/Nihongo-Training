import type { CSSProperties } from "react";
import { BRIDGED_ISLANDS, bridgeSpan } from "../../lib/islandMap";
import type { IslandId, MapLayout, Point } from "../../lib/islandMap";

// Sizes in the bridge layer's units (the stage is 100 high).
const DECK_WIDTH = 1.4;
const RAIL_HEIGHT = 0.9;
const PLANK_SPACING = 0.8;
const POST_SPACING = 3.2;
const REFLECTION_DROP = 2.4;
const ARCH_SHARE = 0.14;
const MAX_ARCH = 5;

type Arch = { start: Point; control: Point; end: Point };

const pointOn = ({ start, control, end }: Arch, t: number): Point => ({
  x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x,
  y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y,
});
const tangentAt = ({ start, control, end }: Arch, t: number): Point => {
  const x = 2 * (1 - t) * (control.x - start.x) + 2 * t * (end.x - control.x), y = 2 * (1 - t) * (control.y - start.y) + 2 * t * (end.y - control.y);
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
};
const moved = (arch: Arch, by: Point): Arch => {
  const move = (point: Point) => ({ x: point.x + by.x, y: point.y + by.y });
  return { start: move(arch.start), control: move(arch.control), end: move(arch.end) };
};
const raised = (arch: Arch, by: number) => moved(arch, { x: 0, y: by });
const pathOf = ({ start, control, end }: Arch) => `M${start.x},${start.y} Q${control.x},${control.y} ${end.x},${end.y}`;
/** Evenly spread positions along the arch (0–1), about `spacing` apart, ends excluded. */
const stepsAlong = (length: number, spacing: number) => { const count = Math.max(1, Math.floor(length / spacing)); return Array.from({ length: count - 1 }, (_, index) => (index + 1) / count); };

function Bridge({ arch, isOpen }: { arch: Arch; isOpen: boolean }) {
  const length = Math.hypot(arch.end.x - arch.start.x, arch.end.y - arch.start.y);
  // A railing along each edge of the deck, standing a little above it.
  const across = { x: -(arch.end.y - arch.start.y) / length * DECK_WIDTH / 2, y: (arch.end.x - arch.start.x) / length * DECK_WIDTH / 2 };
  const rails = [1, -1].map(side => moved(arch, { x: across.x * side, y: across.y * side - RAIL_HEIGHT }));
  const planks = stepsAlong(length, PLANK_SPACING).map(t => {
    const at = pointOn(arch, t), along = tangentAt(arch, t), half = { x: -along.y * DECK_WIDTH / 2, y: along.x * DECK_WIDTH / 2 };
    return `M${at.x - half.x},${at.y - half.y} L${at.x + half.x},${at.y + half.y}`;
  }).join(" ");
  const posts = rails.map(railArch => [0.03, ...stepsAlong(length, POST_SPACING), 0.97].map(t => { const at = pointOn(railArch, t); return `M${at.x},${at.y} v${RAIL_HEIGHT}`; }).join(" ")).join(" ");
  return <g opacity={isOpen ? 1 : 0.35} strokeLinecap="round" fill="none">
    <path d={pathOf(arch)} stroke="var(--ink)" strokeWidth={DECK_WIDTH + 0.35} />
    <path d={pathOf(arch)} stroke="var(--wood)" strokeWidth={DECK_WIDTH} />
    <path d={planks} stroke="var(--ink)" strokeWidth="0.1" opacity="0.35" />
    <path d={posts} stroke="var(--vermilion)" strokeWidth="0.3" />
    {rails.map((railArch, index) => <path key={index} d={pathOf(railArch)} stroke="var(--vermilion)" strokeWidth="0.35" />)}
  </g>;
}

function archOf(layout: MapLayout, id: IslandId): Arch {
  const { start, end } = bridgeSpan(layout, id);
  const length = Math.hypot(end.x - start.x, end.y - start.y);
  return { start, control: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - Math.min(length * ARCH_SHARE, MAX_ARCH) }, end };
}

const layerProps = (layout: MapLayout) => ({ viewBox: `0 0 ${layout.aspect * 100} 100`, className: "pointer-events-none absolute inset-0 size-full overflow-visible", "aria-hidden": true } as const);

/** Every bridge's reflection on the water, drawn under all the land. */
export function BridgeReflections({ layout }: { layout: MapLayout }) {
  return <svg {...layerProps(layout)}>
    {BRIDGED_ISLANDS.map(island => <path key={island.id} d={pathOf(raised(archOf(layout, island.id), REFLECTION_DROP))} fill="none" stroke="var(--wave)" strokeWidth={DECK_WIDTH} strokeLinecap="round" opacity="0.45" />)}
  </svg>;
}

/** Arched wooden bridges from Home's shore to these islands' shores; bridges to islands in fog are faint. */
export function Bridges({ layout, ids, isOpen, style }: { layout: MapLayout; ids: readonly IslandId[]; isOpen: (id: IslandId) => boolean; style?: CSSProperties }) {
  return <svg {...layerProps(layout)} style={style}>
    {ids.map(id => <Bridge key={id} arch={archOf(layout, id)} isOpen={isOpen(id)} />)}
  </svg>;
}
