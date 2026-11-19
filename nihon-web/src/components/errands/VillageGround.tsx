import { memo } from "react";
import type { ReactElement } from "react";
import type { Rect, Terrain, TownMap } from "../../lib/errands/townMap";

// Drawn in tile units: tile (x, y) covers x..x+1, y..y+1.
const BANK_DEPTH = 0.18;
/** How much of the cliff face shows where a mountain's edge drops to the clouds below it. */
const CLIFF_DEPTH = 0.32;
/** Where fallen petals lie on a tile. */
const PETAL_SPOTS = [[0.22, 0.3], [0.7, 0.22], [0.45, 0.62], [0.82, 0.8], [0.18, 0.86]] as const;
const WATERY: ReadonlySet<Terrain> = new Set(["water", "goldfish", "sea", "waves"]);
/** Where the rake lines run across a tile of raked gravel. */
const RAKE_LINES = [0.2, 0.4, 0.6, 0.8] as const;

/** A small five-pointed maple leaf centred on (cx, cy). */
function mapleLeaf(cx: number, cy: number, r: number): string {
  const points = Array.from({ length: 10 }, (_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const reach = index % 2 ? r * 0.45 : r;
    return `${(cx + reach * Math.cos(angle)).toFixed(3)},${(cy + reach * Math.sin(angle)).toFixed(3)}`;
  });
  return `M${points.join(" L")} Z`;
}

const TILE_ART: Partial<Record<Terrain, (x: number, y: number) => ReactElement>> = {
  path: (x, y) => <rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-path)" />,
  gravel: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-gravel)" />
    <circle cx={x + 0.3} cy={y + 0.35} r={0.04} fill="var(--village-gravel-dot)" /><circle cx={x + 0.7} cy={y + 0.75} r={0.04} fill="var(--village-gravel-dot)" /></g>,
  water: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
    <path d={`M${x + 0.15},${y + 0.45} q0.17,-0.12 0.35,0 t0.35,0`} fill="none" stroke="var(--village-water-light)" strokeWidth={0.05} strokeLinecap="round" /></g>,
  sea: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
    <path d={`M${x + 0.15},${y + 0.45} q0.17,-0.12 0.35,0 t0.35,0`} fill="none" stroke="var(--village-water-light)" strokeWidth={0.05} strokeLinecap="round" /></g>,
  // Rough water: deeper, with white crests breaking, where wild kana leap out at a passing boat.
  waves: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-sea-deep)" />
    {[[0.08, 0.3], [0.45, 0.62], [0.12, 0.88]].map(([dx, dy]) => <path key={dy} d={`M${x + dx},${y + dy} q0.12,-0.16 0.24,0 q0.12,-0.16 0.24,0`}
      fill="none" stroke="var(--village-foam)" strokeWidth={0.07} strokeLinecap="round" />)}</g>,
  // The sea of clouds below a mountain's edge, a puff of it catching the light.
  cloud: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-cloud)" />
    <ellipse cx={x + ((x + y) % 2 ? 0.35 : 0.65)} cy={y + 0.62} rx={0.32} ry={0.16} fill="var(--village-cloud-light)" /></g>,
  tree: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.62} rx={0.55} ry={0.3} fill="var(--village-shadow)" />,
  sakura: (x, y) => <g><ellipse cx={x + 0.5} cy={y + 0.62} rx={0.6} ry={0.32} fill="var(--village-shadow)" />
    {PETAL_SPOTS.map(([dx, dy]) => <ellipse key={dx} cx={x + dx} cy={y + dy} rx={0.07} ry={0.045} fill="var(--village-blossom)" />)}</g>,
  bamboo: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.6} rx={0.45} ry={0.22} fill="var(--village-shadow)" />,
  maple: (x, y) => <g><ellipse cx={x + 0.5} cy={y + 0.62} rx={0.6} ry={0.32} fill="var(--village-shadow)" />
    {PETAL_SPOTS.map(([dx, dy], index) => <path key={dx} d={mapleLeaf(x + dx, y + dy, 0.07)} fill={index % 2 ? "var(--village-maple)" : "var(--village-maple-light)"} />)}</g>,
  leaves: (x, y) => <g>{PETAL_SPOTS.map(([dx, dy], index) => <path key={dx} d={mapleLeaf(x + dx, y + dy, 0.09)} fill={index % 3 ? "var(--village-maple)" : "var(--village-maple-light)"}
    transform={`rotate(${dx * 120} ${x + dx} ${y + dy})`} />)}</g>,
  stones: (x, y) => <g>{[[0.3, 0.32, 0.22], [0.72, 0.42, 0.18], [0.42, 0.76, 0.2]].map(([dx, dy, r]) =>
    <ellipse key={dx} cx={x + dx} cy={y + dy} rx={r} ry={r * 0.72} fill="var(--village-stone)" stroke="var(--village-gravel-dot)" strokeWidth={0.03} />)}</g>,
  pine: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.62} rx={0.6} ry={0.3} fill="var(--village-shadow)" />,
  // Raked gravel: lines drawn across the tile, as a rake leaves them in a zen garden.
  raked: (x, y) => <RakedGravel x={x} y={y} />,
  // Old snow lying in a patch, a little blue in its hollows.
  snow: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-snow)" />
    <ellipse cx={x + 0.35} cy={y + 0.6} rx={0.2} ry={0.07} fill="var(--village-snow-shade)" /><ellipse cx={x + 0.75} cy={y + 0.25} rx={0.14} ry={0.05} fill="var(--village-snow-shade)" /></g>,
  petals: (x, y) => <g>{PETAL_SPOTS.map(([dx, dy]) => <ellipse key={dx} cx={x + dx} cy={y + dy} rx={0.08} ry={0.05} fill="var(--village-blossom)" transform={`rotate(${dx * 90} ${x + dx} ${y + dy})`} />)}</g>,
  goldfish: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
    <path d={`M${x + 0.3},${y + 0.55} q0.12,-0.1 0.24,0 q-0.12,0.1 -0.24,0 Z M${x + 0.54},${y + 0.55} l0.1,-0.07 v0.14 Z`} fill="var(--village-goldfish)" />
    {(x + y) % 2 === 0 && <path d={`M${x + 0.62},${y + 0.25} q0.1,-0.08 0.2,0 q-0.1,0.08 -0.2,0 Z`} fill="var(--village-goldfish)" />}</g>,
  fence: (x, y) => <ellipse cx={x + 0.5} cy={y + 0.55} rx={0.4} ry={0.1} fill="var(--village-shadow)" />,
  tallgrass: (x, y) => <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-leaf-light)" />
    <path d={`M${x + 0.2},${y + 0.8} l0.08,-0.3 M${x + 0.55},${y + 0.45} l0.06,-0.28 M${x + 0.78},${y + 0.9} l0.07,-0.3`} stroke="var(--village-leaf)" strokeWidth={0.06} strokeLinecap="round" /></g>,
  // A round patch of grass, so flowers in the gravel garden read as a planted bed (on grass it doesn't show).
  flowers: (x, y) => <g><rect x={x + 0.06} y={y + 0.08} width={0.88} height={0.84} rx={0.36} fill="var(--village-grass)" />{[[0.3, 0.35], [0.65, 0.5], [0.4, 0.72]].map(([dx, dy]) => <g key={dx}>
    <circle cx={x + dx} cy={y + dy} r={0.09} fill="var(--village-flower)" /><circle cx={x + dx} cy={y + dy} r={0.035} fill="var(--village-flower-centre)" /></g>)}</g>,
};

function RakedGravel({ x, y }: { x: number; y: number }) {
  return <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-gravel)" />
    <path d={RAKE_LINES.map(step => `M${x},${y + step} h1.01`).join(" ")} stroke="var(--village-gravel-dot)" strokeWidth={0.035} /></g>;
}

/** How far the rake's rings spread round a rock set in gravel. */
const RAKE_RINGS = [0.3, 0.42] as const;

const RAKED: ReadonlySet<Terrain> = new Set(["raked"]);
const OPEN_SEA: ReadonlySet<Terrain> = new Set(["sea", "waves"]);

/** Whether one of the four tiles beside (x, y) is one of `terrains`. */
const isBeside = (map: TownMap, x: number, y: number, terrains: ReadonlySet<Terrain>) =>
  [[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => terrains.has(map.terrain[y + dy]?.[x + dx] ?? "grass"));
/** A rock standing out at sea, in the water (no bank of earth round it). */
const isRockAtSea = (map: TownMap, x: number, y: number) =>
  map.terrain[y]?.[x] === "rock" && !isBeside(map, x, y, RAKED) && isBeside(map, x, y, OPEN_SEA);

/**
 * A mossy rock: it stands in the way. Set in raked gravel (gravel beside it), the gravel runs on under it and the rake
 * has drawn rings round it, as in a zen garden; out at sea (the sea beside it), it stands in the water with foam round
 * it; otherwise it lies on the ground.
 */
function RockTile({ map, x, y }: { map: TownMap; x: number; y: number }) {
  const isInGravel = isBeside(map, x, y, RAKED), isAtSea = isRockAtSea(map, x, y);
  return <g>
    {isAtSea && <><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-water)" />
      <ellipse cx={x + 0.5} cy={y + 0.62} rx={0.46} ry={0.26} fill="none" stroke="var(--village-foam)" strokeWidth={0.05} /></>}
    {isInGravel && <><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-gravel)" />
      {RAKE_RINGS.map(r => <ellipse key={r} cx={x + 0.5} cy={y + 0.55} rx={r + 0.08} ry={r} fill="none" stroke="var(--village-gravel-dot)" strokeWidth={0.035} />)}</>}
    <ellipse cx={x + 0.5} cy={y + 0.66} rx={0.38} ry={0.2} fill="var(--village-shadow)" />
    <path d={`M${x + 0.18},${y + 0.68} Q${x + 0.2},${y + 0.3} ${x + 0.52},${y + 0.26} Q${x + 0.84},${y + 0.3} ${x + 0.82},${y + 0.68} Z`} fill="var(--village-stone)" stroke="var(--village-ink)" strokeWidth={0.035} />
    <path d={`M${x + 0.27},${y + 0.42} Q${x + 0.5},${y + 0.24} ${x + 0.73},${y + 0.4} Q${x + 0.52},${y + 0.36} ${x + 0.27},${y + 0.42} Z`} fill="var(--village-moss)" />
  </g>;
}

/** Bridges and piers: planks over water. */
const PLANKED: ReadonlySet<Terrain> = new Set(["bridge", "pier"]);
const PLANK_STEPS = [0.25, 0.5, 0.75] as const;
const RAIL_INSET = 0.06;

/**
 * A bridge (or pier) tile: planks laid across the way it runs, and a rail along each outer edge. A bridge runs
 * north–south where water lies beside it (a bridge across a stream running east–west), otherwise east–west; a pier
 * runs east–west, out from a west or east shore into the sea.
 */
function BridgeTile({ map, x, y }: { map: TownMap; x: number; y: number }) {
  const isBridge = (dx: number, dy: number) => PLANKED.has(map.terrain[y + dy]?.[x + dx] ?? "grass");
  const isWaterBeside = map.terrain[y]?.[x] !== "pier" && [-1, 1].some(dx => WATERY.has(map.terrain[y]?.[x + dx] ?? "grass"));
  const planks = PLANK_STEPS.map(step => isWaterBeside ? `M${x},${y + step} h1` : `M${x + step},${y} v1`).join(" ");
  const rails = isWaterBeside
    ? [!isBridge(-1, 0) && `M${x + RAIL_INSET},${y} v1`, !isBridge(1, 0) && `M${x + 1 - RAIL_INSET},${y} v1`]
    : [!isBridge(0, -1) && `M${x},${y + RAIL_INSET} h1`, !isBridge(0, 1) && `M${x},${y + 1 - RAIL_INSET} h1`];
  return <g><rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-wood-light)" />
    <path d={planks} stroke="var(--village-wood)" strokeWidth={0.04} />
    <path d={rails.filter(Boolean).join(" ")} stroke="var(--village-wood)" strokeWidth={0.1} /></g>;
}

/** Where the risers of a stone stairway fall across each tile, and how much darker each step further down is. */
const STEP_RISERS = [0.33, 0.66, 0.99] as const;
const SHADE_PER_TILE_DOWN = 0.3;
const KERB_DEPTH = 0.12;

/** How many tiles of stairway lie unbroken to the west of (x, y): how far down the stairway it is. */
const stepsWestOf = (map: TownMap, x: number, y: number): number =>
  map.terrain[y]?.[x - 1] === "steps" ? 1 + stepsWestOf(map, x - 1, y) : 0;

/**
 * A tile of a stone stairway going down eastward over a mountain's edge: treads with a riser across every third of a
 * tile, each tile further down (more steps west of it) in deeper shade, kerbs of rock along its sides, and at the map's
 * edge clouds drifting over the last steps, which go on down out of sight.
 */
function StepsTile({ map, x, y }: { map: TownMap; x: number; y: number }) {
  const isSteps = (dx: number, dy: number) => map.terrain[y + dy]?.[x + dx] === "steps";
  const stepsAbove = stepsWestOf(map, x, y);
  const isAtEdge = x === map.width - 1;
  return <g>
    <rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-stone)" />
    <path d={STEP_RISERS.map(step => `M${x + step},${y} v1`).join(" ")} stroke="var(--village-gravel-dot)" strokeWidth={0.06} />
    <rect x={x} y={y} width={1.01} height={1.01} fill="var(--village-shadow)" opacity={stepsAbove * SHADE_PER_TILE_DOWN} />
    {!isSteps(0, -1) && <rect x={x} y={y} width={1.01} height={KERB_DEPTH} fill="var(--village-cliff)" />}
    {!isSteps(0, 1) && <rect x={x} y={y + 1 - KERB_DEPTH} width={1.01} height={KERB_DEPTH} fill="var(--village-cliff)" />}
    {isAtEdge && <ellipse cx={x + 0.9} cy={y + 0.5} rx={0.45} ry={0.6} fill="var(--village-cloud-light)" opacity={0.85} />}
  </g>;
}

function Ground({ map }: { map: TownMap }) {
  return <>
    <rect width={map.width} height={map.height} fill="var(--village-grass)" />
    {map.terrain.flatMap((row, y) => row.map((tile, x) => {
      if (PLANKED.has(tile)) return <BridgeTile key={`${x},${y}`} map={map} x={x} y={y} />;
      if (tile === "rock") return <RockTile key={`${x},${y}`} map={map} x={x} y={y} />;
      if (tile === "steps") return <StepsTile key={`${x},${y}`} map={map} x={x} y={y} />;
      const art = TILE_ART[tile];
      // Water lies lower than the bank above it, which shows as a strip of earth (none under a rock out at sea).
      const above = map.terrain[y - 1]?.[x];
      const hasBank = WATERY.has(tile) && !(above && WATERY.has(above)) && !isRockAtSea(map, x, y - 1);
      // Likewise the clouds lie far below a mountain's edge, which shows as a strip of cliff.
      const hasCliff = tile === "cloud" && above !== undefined && above !== "cloud";
      if (art) return <g key={`${x},${y}`}>{art(x, y)}{hasBank && <rect x={x} y={y} width={1.01} height={BANK_DEPTH} fill="var(--village-bank)" />}
        {hasCliff && <rect x={x} y={y} width={1.01} height={CLIFF_DEPTH} fill="var(--village-cliff)" />}</g>;
      return (x * 7 + y * 3) % 5 === 0 ? <path key={`${x},${y}`} d={`M${x + 0.4},${y + 0.6} l0.05,-0.12 l0.05,0.12`} fill="none" stroke="var(--village-grass-tuft)" strokeWidth={0.04} /> : null;
    }))}
  </>;
}

/** The ground lying flat: grass, paths, water, flower beds, and the shadows of what stands on it (each building's a
 *  little wider than its walls, which stand up in VillageScenery). Memoised: it never changes while the traveller walks. */
export const VillageGround = memo(function VillageGround({ map, buildings }: { map: TownMap; buildings: readonly Rect[] }) {
  return <svg viewBox={`0 0 ${map.width} ${map.height}`} className="absolute inset-0 size-full" aria-hidden="true">
    <Ground map={map} />
    {buildings.map(({ x, y, width, height }) => <rect key={`${x},${y}`} x={x - 0.15} y={y + 0.1} width={width + 0.3} height={height + 0.12} rx={0.2} fill="var(--village-shadow)" />)}
  </svg>;
});
