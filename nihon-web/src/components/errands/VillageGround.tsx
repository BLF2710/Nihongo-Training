import { memo } from "react";
import type { ReactElement } from "react";
import type { Terrain, TownMap } from "../../lib/errands/townMap";
import type { Building, Gate, Lanterns, RoofColour } from "../../lib/errands/village";

// Drawn in tile units: tile (x, y) covers x..x+1, y..y+1. Buildings stay inside their footprint (roof above, wall
// below), so a person standing next to one never needs to be drawn behind it.
const ROOF_SHARE = 0.48;
const ROOF_FILL: Readonly<Record<RoofColour, string>> = {
  vermilion: "var(--village-vermilion)", indigo: "var(--village-indigo)", moss: "var(--village-moss)", wood: "var(--village-wood)",
};
const ink = { stroke: "var(--village-ink)", strokeWidth: 0.05, strokeLinejoin: "round" as const };

const TILE_ART: Partial<Record<Terrain, (x: number, y: number) => ReactElement>> = {
  path: (x, y) => <rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-path)" />,
  gravel: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-gravel)" />
    <circle cx={x + 0.3} cy={y + 0.35} r={0.04} fill="var(--village-gravel-dot)" /><circle cx={x + 0.7} cy={y + 0.75} r={0.04} fill="var(--village-gravel-dot)" /></g>,
  water: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
    <path d={`M${x + 0.15},${y + 0.45} q0.17,-0.12 0.35,0 t0.35,0`} fill="none" stroke="var(--village-water-light)" strokeWidth={0.05} strokeLinecap="round" /></g>,
  bridge: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-wood-light)" />
    {[0.25, 0.5, 0.75].map(step => <path key={step} d={`M${x},${y + step} h1`} stroke="var(--village-wood)" strokeWidth={0.04} />)}
    <path d={`M${x + 0.06},${y} v1 M${x + 0.94},${y} v1`} stroke="var(--village-wood)" strokeWidth={0.1} /></g>,
  tree: (x, y) => <g><ellipse cx={x + 0.5} cy={y + 0.88} rx={0.34} ry={0.1} fill="var(--village-shadow)" />
    <rect x={x + 0.43} y={y + 0.55} width={0.14} height={0.33} fill="var(--village-wood)" />
    <circle cx={x + 0.5} cy={y + 0.42} r={0.36} fill="var(--village-leaf)" {...ink} />
    <circle cx={x + 0.4} cy={y + 0.32} r={0.13} fill="var(--village-leaf-light)" /></g>,
  fence: (x, y) => <g><path d={`M${x + 0.5},${y} v1`} stroke="var(--village-wood)" strokeWidth={0.12} />
    <rect x={x + 0.36} y={y + 0.3} width={0.28} height={0.42} rx={0.04} fill="var(--village-wood-light)" {...ink} /></g>,
  // A round patch of grass, so flowers in the gravel garden read as a planted bed (on grass it doesn't show).
  flowers: (x, y) => <g><rect x={x + 0.06} y={y + 0.08} width={0.88} height={0.84} rx={0.36} fill="var(--village-grass)" />{[[0.3, 0.35], [0.65, 0.5], [0.4, 0.72]].map(([dx, dy]) => <g key={dx}>
    <circle cx={x + dx} cy={y + dy} r={0.09} fill="var(--village-flower)" /><circle cx={x + dx} cy={y + dy} r={0.035} fill="var(--village-flower-centre)" /></g>)}</g>,
};

function Ground({ map }: { map: TownMap }) {
  return <>
    <rect width={map.width} height={map.height} fill="var(--village-grass)" />
    {map.terrain.flatMap((row, y) => row.map((tile, x) => {
      const art = TILE_ART[tile];
      if (art) return <g key={`${x},${y}`}>{art(x, y)}</g>;
      return (x * 7 + y * 3) % 5 === 0 ? <path key={`${x},${y}`} d={`M${x + 0.4},${y + 0.6} l0.05,-0.12 l0.05,0.12`} fill="none" stroke="var(--village-grass-tuft)" strokeWidth={0.04} /> : null;
    }))}
  </>;
}

/** A building in 2.5D: a tiled roof seen from above and the front wall below it, with a sign and a door. */
function House({ building }: { building: Building }) {
  const { x, y, width, height, sign, label, roof } = building;
  const roofBottom = y + height * ROOF_SHARE, front = y + height;
  const doorWidth = Math.min(0.9, width * 0.22);
  const signWidth = Math.max(0.9, sign.length * 0.55 + 0.3);
  return <g>
    <title>{label}</title>
    <ellipse cx={x + width / 2} cy={front - 0.02} rx={width / 2 + 0.1} ry={0.14} fill="var(--village-shadow)" />
    <rect x={x + 0.12} y={roofBottom} width={width - 0.24} height={front - roofBottom - 0.05} fill="var(--village-wall)" {...ink} />
    <rect x={x + 0.12} y={roofBottom} width={width - 0.24} height={0.18} fill="var(--village-wall-shade)" />
    <rect x={x + width / 2 - doorWidth / 2} y={front - 0.75} width={doorWidth} height={0.7} fill="var(--village-wood)" {...ink} />
    <path d={`M${x + width / 2},${front - 0.75} v0.7`} stroke="var(--village-wood-light)" strokeWidth={0.04} />
    <path d={`M${x},${roofBottom + 0.05} L${x + 0.35},${y + 0.05} L${x + width - 0.35},${y + 0.05} L${x + width},${roofBottom + 0.05} Z`} fill={ROOF_FILL[roof]} {...ink} />
    {Array.from({ length: Math.floor(width * 2) }, (_, index) => <path key={index} d={`M${x + 0.25 + index * 0.5},${y + 0.2} v${roofBottom - y - 0.25}`} stroke="var(--village-ink)" strokeOpacity={0.18} strokeWidth={0.04} />)}
    <rect x={x + width / 2 - signWidth / 2} y={y + height * ROOF_SHARE * 0.3} width={signWidth} height={0.62} rx={0.08} fill="var(--village-sign)" {...ink} />
    <text x={x + width / 2} y={y + height * ROOF_SHARE * 0.3 + 0.46} textAnchor="middle" fontSize={0.44} fontWeight={800} fill="var(--village-ink)">{sign}</text>
  </g>;
}

const StaticVillage = memo(function StaticVillage({ map, buildings }: { map: TownMap; buildings: readonly Building[] }) {
  return <><Ground map={map} />{buildings.map(building => <House key={building.id} building={building} />)}</>;
});

/** A gate: red posts, and while closed a rope hung with paper streamers across the way. */
function GateArt({ gate, isOpen }: { gate: Gate; isOpen: boolean }) {
  const { x, y, width, height } = gate;
  const isAcross = width >= height;
  const [start, end] = isAcross ? [[x + 0.08, y + 0.5], [x + width - 0.08, y + 0.5]] : [[x + 0.5, y + 0.08], [x + 0.5, y + height - 0.08]];
  return <g>
    <title>{`${gate.label} (${isOpen ? "open" : "closed"})`}</title>
    {[start, end].map(([px, py]) => <rect key={`${px},${py}`} x={px - 0.12} y={py - 0.4} width={0.24} height={0.5} rx={0.05} fill="var(--village-vermilion)" {...ink} />)}
    {!isOpen && <>
      <path d={`M${start[0]},${start[1] - 0.25} Q${(start[0] + end[0]) / 2},${(start[1] + end[1]) / 2 + 0.05} ${end[0]},${end[1] - 0.25}`} fill="none" stroke="var(--village-wood-light)" strokeWidth={0.12} strokeLinecap="round" />
      {[0.33, 0.66].map(share => <rect key={share} x={start[0] + (end[0] - start[0]) * share - 0.06} y={start[1] + (end[1] - start[1]) * share - 0.15} width={0.12} height={0.28} fill="var(--village-sign)" {...ink} strokeWidth={0.03} />)}
    </>}
  </g>;
}

function LanternArt({ x, y }: { x: number; y: number }) {
  return <g>
    <circle cx={x + 0.5} cy={y + 0.3} r={0.42} className="village-lantern-glow" />
    <path d={`M${x + 0.5},${y + 0.55} v0.4`} stroke="var(--village-wood)" strokeWidth={0.06} />
    <ellipse cx={x + 0.5} cy={y + 0.32} rx={0.17} ry={0.22} className="village-lantern" {...ink} strokeWidth={0.04} />
    <path d={`M${x + 0.38},${y + 0.1} h0.24 M${x + 0.38},${y + 0.54} h0.24`} stroke="var(--village-ink)" strokeWidth={0.05} />
  </g>;
}

type VillageGroundProps = { map: TownMap; buildings: readonly Building[]; gates: readonly Gate[]; openGateIds: readonly string[]; lanterns: Lanterns; areLanternsLit: boolean };

/** Everything in the village that isn't a person: the ground, buildings, gates and festival lanterns. */
export function VillageGround({ map, buildings, gates, openGateIds, lanterns, areLanternsLit }: VillageGroundProps) {
  return <svg viewBox={`0 0 ${map.width} ${map.height}`} className={`absolute inset-0 size-full ${areLanternsLit ? "village-lanterns-lit" : ""}`} aria-hidden="true">
    <StaticVillage map={map} buildings={buildings} />
    {gates.map(gate => <GateArt key={gate.id} gate={gate} isOpen={openGateIds.includes(gate.id)} />)}
    {lanterns.tiles.map(({ x, y }) => <LanternArt key={`${x},${y}`} x={x} y={y} />)}
  </svg>;
}
