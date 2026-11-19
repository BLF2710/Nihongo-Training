import { useId } from "react";
import type { CSSProperties } from "react";
import type { Terrain, TownMap } from "../../lib/errands/townMap";
import type { Heading } from "../../lib/world/routes";

// Height in the 2.5D scene: a mountainside rising past a map's edge (Fuji's flank behind the ferry's western shore), a
// plane hinged on that edge and tipped up away from the map. It is hinged a little inside the edge: the camera is
// always over the map, so a slope rising from the edge itself would lie mostly off screen. Sizes are in tiles.

/** How steeply the mountainside rises (degrees from flat). */
const RISE_DEGREES = 40;
/** How far up the mountainside climbs past the edge, and how far it reaches past the map's ends. */
const MOUNTAINSIDE_HEIGHT = 4.5;
const MOUNTAINSIDE_OVERHANG = 3;
const RADIANS = Math.PI / 180;
/** Where a way off the map meets its edge: a path goes on up the mountainside from there. */
const WAY_TERRAIN: ReadonlySet<Terrain> = new Set(["pier", "bridge", "path", "steps"]);

// The slope is drawn in its own frame: `along` the edge it rises from (west to east, or north to south) and `out` away
// from the map, the edge at out = 0. These turns lay that frame onto each side.
const ORIENT: Readonly<Record<Heading, string>> = {
  south: "", north: "scaleY(-1)", west: "rotate(90deg)", east: "rotate(-90deg) scaleX(-1)",
};
const isAcrossX = (side: Heading) => side === "north" || side === "south";

/** A plane hinged `inset` tiles inside the map's `side` edge, reaching `reach` tiles out and `overhang` past its ends. */
type Plane = { side: Heading; reach: number; overhang: number; inset: number };
type Run = { from: number; length: number };

/** Where a plane hinged on one edge of the map lies before it is tipped (flat, outside the map), and its hinge. */
function flatOutside(map: TownMap, { side, reach, overhang, inset }: Plane, tile: number): CSSProperties {
  const wide = (map.width + 2 * overhang) * tile, deep = (map.height + 2 * overhang) * tile, out = reach * tile, hinge = inset * tile;
  switch (side) {
    case "north": return { left: -overhang * tile, top: hinge - out, width: wide, height: out, transformOrigin: "50% 100%" };
    case "south": return { left: -overhang * tile, top: map.height * tile - hinge, width: wide, height: out, transformOrigin: "50% 0" };
    case "east": return { left: map.width * tile - hinge, top: -overhang * tile, width: out, height: deep, transformOrigin: "0 50%" };
    case "west": return { left: hinge - out, top: -overhang * tile, width: out, height: deep, transformOrigin: "100% 50%" };
  }
}

/** The turn that tips a plane on `side` up away from the map by `degrees`. */
function tipUp(side: Heading, degrees: number): string {
  switch (side) {
    case "north": return `rotateX(${-degrees}deg)`;
    case "south": return `rotateX(${degrees}deg)`;
    case "east": return `rotateY(${-degrees}deg)`;
    case "west": return `rotateY(${degrees}deg)`;
  }
}

/** The tile on the map's `side` edge `index` tiles along it. */
function edgeTerrain(map: TownMap, side: Heading, index: number): Terrain | undefined {
  switch (side) {
    case "north": return map.terrain[0]?.[index];
    case "south": return map.terrain[map.height - 1]?.[index];
    case "west": return map.terrain[index]?.[0];
    case "east": return map.terrain[index]?.[map.width - 1];
  }
}

/** The runs of tiles along the map's `side` edge where a way leaves it (`from`, in tiles along the edge). */
function waysOff(map: TownMap, side: Heading): Run[] {
  const along = isAcrossX(side) ? map.width : map.height;
  const runs: Run[] = [];
  for (let index = 0; index < along; index++) {
    const terrain = edgeTerrain(map, side, index);
    if (!terrain || !WAY_TERRAIN.has(terrain)) continue;
    const last = runs.at(-1);
    if (last && last.from + last.length === index) runs[runs.length - 1] = { ...last, length: last.length + 1 };
    else runs.push({ from: index, length: 1 });
  }
  return runs;
}

/** A small fixed jitter in 0..1 for the `index`th thing along the slope (the same every time it is drawn). */
const jitter = (index: number, salt: number) => ((index * 37 + salt * 11) % 17) / 17;

/** Deep snow rising away from the edge, bright all the way up, soft drifts across it, a few rocks just breaking through
 *  and snowy pines dotted over it, and a path zigzagging up from each way off the edge. */
function RisingFace({ along, reach, ways }: { along: number; reach: number; ways: readonly Run[] }) {
  const gradientId = useId();
  const drifts = Math.ceil(along / 1.6), outcrops = Math.ceil(along / 4), pines = Math.ceil(along / 1.4);
  return <>
    <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
      <stop offset="0" stopColor="var(--village-snow-shade)" stopOpacity={0.6} />
      <stop offset="0.35" stopColor="var(--village-snow)" />
    </linearGradient>
    <rect width={along} height={reach} fill="var(--village-snow)" />
    <rect width={along} height={reach} fill={`url(#${gradientId})`} />
    {Array.from({ length: drifts }, (_, index) => {
      const x = index * 1.6 + jitter(index, 7) * 1.2, y = reach * (0.2 + jitter(index, 8) * 0.75);
      return <path key={`drift-${index}`} d={`M${x - 0.8},${y} q0.8,-0.35 1.6,0`} fill="none" stroke="var(--village-snow-shade)" strokeWidth={0.07} strokeLinecap="round" />;
    })}
    {Array.from({ length: outcrops }, (_, index) => {
      const x = index * 4 + jitter(index, 1) * 2, y = reach * (0.3 + jitter(index, 2) * 0.6), size = 0.2 + jitter(index, 3) * 0.2;
      return <g key={`rock-${index}`}>
        <path d={`M${x - size},${y + size * 0.3} L${x - size * 0.2},${y - size * 0.4} L${x + size * 0.5},${y - size * 0.2} L${x + size},${y + size * 0.3} Z`} fill="var(--village-cliff)" />
        <path d={`M${x - size * 0.9},${y + size * 0.05} L${x - size * 0.2},${y - size * 0.4} L${x + size * 0.5},${y - size * 0.2} L${x + size * 0.8},${y + size * 0.05} Z`} fill="var(--village-snow)" />
      </g>;
    })}
    {ways.map(({ from, length }) => {
      const middle = from + length / 2, turns = 4;
      const zigzag = Array.from({ length: turns }, (_, turn) => `L${middle + (turn % 2 ? -1.4 : 1.4)},${((turn + 1) / turns) * reach}`).join(" ");
      return <path key={from} d={`M${middle},0 ${zigzag}`} fill="none" stroke="var(--village-path)" strokeWidth={0.32} strokeLinejoin="round" strokeLinecap="round" />;
    })}
    {Array.from({ length: pines }, (_, index) => {
      const x = index * 1.4 + jitter(index, 4) * 0.9, y = reach * (0.15 + jitter(index, 5) * 0.8), size = 0.28 + jitter(index, 6) * 0.18;
      // A small fir in two tiers, its tip up the slope (away from the edge), snow along the top tier.
      return <g key={`pine-${index}`}>
        <path d={`M${x - size},${y} L${x},${y + size * 1.4} L${x + size},${y} Z`} fill="var(--village-pine)" />
        <path d={`M${x - size * 0.75},${y + size * 0.7} L${x},${y + size * 1.9} L${x + size * 0.75},${y + size * 0.7} Z`} fill="var(--village-pine)" />
        <path d={`M${x - size * 0.3},${y + size * 1.45} L${x},${y + size * 1.9} L${x + size * 0.3},${y + size * 1.45} Z`} fill="var(--village-snow)" />
      </g>;
    })}
  </>;
}

/** A mountainside rising from `inset` tiles inside the map's `side` edge (so the camera, held over the map, sees it):
 *  deep snow with drifts, a few rocks and snowy pines, a path zigzagging up it from the shore. */
export function Mountainside({ map, tile, side, inset }: { map: TownMap; tile: number; side: Heading; inset: number }) {
  const reach = MOUNTAINSIDE_HEIGHT / Math.sin(RISE_DEGREES * RADIANS);
  const plane: Plane = { side, reach, overhang: MOUNTAINSIDE_OVERHANG, inset };
  const along = (isAcrossX(side) ? map.width : map.height) + 2 * plane.overhang;
  const ways = waysOff(map, side).map(way => ({ ...way, from: way.from + plane.overhang }));
  return <div aria-hidden="true" className="village-slope absolute" style={{ ...flatOutside(map, plane, tile), transform: tipUp(side, RISE_DEGREES) }}>
    <svg viewBox={`0 0 ${along} ${reach}`} preserveAspectRatio="none" className="absolute left-1/2 top-1/2 block overflow-visible"
      style={{ width: along * tile, height: reach * tile, transform: `translate(-50%, -50%) ${ORIENT[side]}` }}>
      <RisingFace along={along} reach={reach} ways={ways} />
    </svg>
  </div>;
}
