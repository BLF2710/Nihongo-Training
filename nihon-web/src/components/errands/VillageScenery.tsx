import { memo } from "react";
import type { CSSProperties, ReactElement } from "react";
import { rowRuns, terrainAt } from "../../lib/errands/townMap";
import type { Rect, Terrain, TownMap } from "../../lib/errands/townMap";
import type { Vector } from "../../lib/errands/movement";
import type { Building, Gate, RoofColour } from "../../lib/errands/village";
import { BuildingFront, BuildingProps } from "./BuildingDetails";
import { LOOK_SHAPES } from "./buildingLooks";
import { STAND_UP, STAND_UP_ALONG_Y } from "./scene3d";
import { Upright } from "./Upright";

// Everything that stands up off the ground, as cards in 3D (the browser sorts them by depth, so whoever walks behind a
// house is hidden by it). Sizes are in tiles.
const EAVE_OVERHANG = 0.2;
const TREE_HEIGHT = 1.9;
// The row of trees nearest the viewer is squashed into bushes, so it doesn't hide the people on the street behind it.
const BUSH_HEIGHT = 0.9;
const TREE_FEET = 0.62;
const FENCE_HEIGHT = 0.7;
/** Tall grass stands about knee high, so the traveller wades through it. */
const TALL_GRASS_HEIGHT = 0.5;
const LANTERN_HEIGHT = 1.25;
const GATE_HEIGHT = 1.1;
const ROOF_FILL: Readonly<Record<RoofColour, string>> = {
  vermilion: "var(--village-vermilion)", indigo: "var(--village-indigo)", moss: "var(--village-moss)", wood: "var(--village-wood)",
};
const ink = { stroke: "var(--village-ink)", strokeWidth: 0.05, strokeLinejoin: "round" as const };

/** One tree of a row, drawn in a 1 × TREE_HEIGHT box; `index` is its place along the row (to vary the look). */
type TreeDrawing = (index: number) => ReactElement;

const LEAFY_TREE: TreeDrawing = () => <>
  <rect x={0.42} y={1.25} width={0.16} height={0.65} fill="var(--village-wood)" />
  <ellipse cx={0.5} cy={1.05} rx={0.48} ry={0.42} fill="var(--village-leaf)" {...ink} />
  <ellipse cx={0.5} cy={0.62} rx={0.38} ry={0.36} fill="var(--village-leaf)" {...ink} />
  <ellipse cx={0.4} cy={0.52} rx={0.14} ry={0.12} fill="var(--village-leaf-light)" />
  <ellipse cx={0.32} cy={0.98} rx={0.16} ry={0.12} fill="var(--village-leaf-light)" />
</>;

/** A ring of small bumps around a circle: the edge of a cluster of blossom. */
function scallop(cx: number, cy: number, r: number, bumps: number): string {
  const at = (index: number) => {
    const angle = (index / bumps) * Math.PI * 2;
    return `${(cx + r * Math.cos(angle)).toFixed(3)},${(cy + r * Math.sin(angle)).toFixed(3)}`;
  };
  const bump = (r * Math.sin(Math.PI / bumps) * 1.15).toFixed(3);
  return `M${at(0)} ${Array.from({ length: bumps }, (_, index) => `A${bump},${bump} 0 0 1 ${at(index + 1)}`).join(" ")} Z`;
}

/** Where a cherry tree's clusters of blossom sit (x, y, radius), on branches spreading from the trunk. */
const BLOSSOM_CLUSTERS = [[0.2, 0.86, 0.2], [0.8, 0.8, 0.21], [0.48, 0.5, 0.24], [0.28, 0.58, 0.16], [0.7, 0.5, 0.17], [0.52, 0.92, 0.17]] as const;
/** Single flowers dotted over the clusters, lighter and darker. */
const FLORETS = [[0.14, 0.8], [0.3, 0.92], [0.42, 0.42], [0.56, 0.56], [0.74, 0.74], [0.86, 0.86], [0.66, 0.44], [0.24, 0.52], [0.5, 0.98]] as const;

/** A cherry tree in bloom: a dark crooked trunk forking into branches, each ending in a cluster of blossom with gaps
 *  between, so the branches show through. Every other tree is mirrored, so a row doesn't look stamped. */
const CHERRY_TREE: TreeDrawing = index => <g transform={index % 2 ? "translate(1 0) scale(-1 1)" : undefined}>
  <path d="M0.5,1.9 C0.46,1.55 0.56,1.35 0.48,1.12 M0.48,1.12 C0.36,1.0 0.26,0.95 0.2,0.86 M0.49,1.12 C0.62,0.98 0.74,0.9 0.8,0.8 M0.48,1.1 C0.5,0.86 0.46,0.7 0.48,0.5 M0.47,0.8 C0.38,0.7 0.32,0.64 0.28,0.58 M0.48,0.72 C0.58,0.62 0.66,0.56 0.7,0.5"
    fill="none" stroke="var(--village-bark)" strokeWidth={0.07} strokeLinecap="round" />
  <path d="M0.5,1.9 C0.46,1.55 0.56,1.35 0.48,1.12" fill="none" stroke="var(--village-bark)" strokeWidth={0.13} strokeLinecap="round" />
  {BLOSSOM_CLUSTERS.map(([cx, cy, r]) => <path key={`${cx},${cy}`} d={scallop(cx, cy, r, 7)} fill="var(--village-blossom)" stroke="var(--village-blossom-deep)" strokeWidth={0.025} />)}
  {BLOSSOM_CLUSTERS.map(([cx, cy, r]) => <path key={`light-${cx},${cy}`} d={scallop(cx - r * 0.25, cy - r * 0.3, r * 0.5, 5)} fill="var(--village-blossom-light)" />)}
  {FLORETS.map(([x, y], floret) => <circle key={`${x},${y}`} cx={x} cy={y} r={0.028} fill={floret % 3 ? "var(--village-sign)" : "var(--village-blossom-deep)"} />)}
</g>;

/** A clump of bamboo: three jointed canes of different heights, with a few leaves at the top. */
const BAMBOO_CLUMP: TreeDrawing = index => <>
  {[0.22, 0.5, 0.78].map((x, cane) => {
    const top = 0.15 + ((index + cane) % 3) * 0.18;
    return <g key={x}>
      <rect x={x - 0.06} y={top} width={0.12} height={TREE_HEIGHT - top} rx={0.04} fill={cane === 1 ? "var(--village-bamboo-light)" : "var(--village-bamboo)"} {...ink} strokeWidth={0.03} />
      {[0.45, 0.85, 1.25, 1.65].filter(y => y > top + 0.1).map(y => <path key={y} d={`M${x - 0.07},${y} h0.14`} stroke="var(--village-ink)" strokeWidth={0.03} />)}
      <path d={`M${x},${top + 0.05} q0.2,-0.05 0.3,0.06 M${x},${top + 0.12} q-0.2,-0.04 -0.28,0.08`} fill="none" stroke="var(--village-leaf)" strokeWidth={0.06} strokeLinecap="round" />
    </g>;
  })}
</>;

/** How each kind of standing tree is drawn. */
const TREE_DRAWINGS = { tree: LEAFY_TREE, sakura: CHERRY_TREE, bamboo: BAMBOO_CLUMP } as const satisfies Partial<Record<Terrain, TreeDrawing>>;
type TreeTerrain = keyof typeof TREE_DRAWINGS;
const TREE_TERRAINS = Object.keys(TREE_DRAWINGS) as TreeTerrain[]; // the keys of a literal object: a safe cast

function TreeRow({ run, height, tile, draw }: { run: Rect; height: number; tile: number; draw: TreeDrawing }) {
  return <Upright feet={{ x: run.x + run.width / 2, y: run.y + TREE_FEET }} width={run.width + 0.3} height={height} tile={tile}>
    <svg viewBox={`-0.15 0 ${run.width + 0.3} ${TREE_HEIGHT}`} className="block size-full overflow-visible" preserveAspectRatio="none">
      {Array.from({ length: run.width }, (_, index) => <g key={index} transform={`translate(${index} 0)`}>{draw(run.x + index)}</g>)}
    </svg>
  </Upright>;
}

/** A run of tall grass blades along a row, standing just in front of the tiles' middle. */
function TallGrassRow({ run, tile }: { run: Rect; tile: number }) {
  return <Upright feet={{ x: run.x + run.width / 2, y: run.y + 0.75 }} width={run.width} height={TALL_GRASS_HEIGHT} tile={tile}>
    <svg viewBox={`0 0 ${run.width} ${TALL_GRASS_HEIGHT}`} className="block size-full overflow-visible" preserveAspectRatio="none">
      {Array.from({ length: run.width * 3 }, (_, index) => {
        const x = (index + 0.5) / 3, lean = index % 2 ? 0.08 : -0.06;
        return <path key={index} d={`M${x - 0.12},${TALL_GRASS_HEIGHT} Q${x},${TALL_GRASS_HEIGHT * 0.4} ${x + lean},0 Q${x + 0.04},${TALL_GRASS_HEIGHT * 0.5} ${x + 0.12},${TALL_GRASS_HEIGHT} Z`}
          fill={index % 3 ? "var(--village-leaf)" : "var(--village-leaf-light)"} {...ink} strokeWidth={0.02} />;
      })}
    </svg>
  </Upright>;
}

function FencePost({ x, y, tile }: { x: number; y: number; tile: number }) {
  return <Upright feet={{ x: x + 0.5, y: y + 0.5 }} width={1} height={FENCE_HEIGHT} tile={tile}>
    <svg viewBox={`0 0 1 ${FENCE_HEIGHT}`} className="block size-full overflow-visible">
      <rect x={0.1} y={0.18} width={0.8} height={0.12} fill="var(--village-wood-light)" {...ink} strokeWidth={0.03} />
      <rect x={0.1} y={0.42} width={0.8} height={0.12} fill="var(--village-wood-light)" {...ink} strokeWidth={0.03} />
      <rect x={0.4} y={0.05} width={0.2} height={0.65} rx={0.04} fill="var(--village-wood)" {...ink} strokeWidth={0.03} />
    </svg>
  </Upright>;
}

/** A building as a box: walls (the front one with its sign, door and windows), gable ends at the sides and a
 *  two-sided roof, shaped and dressed by what the building is (see buildingLooks and BuildingDetails). */
function House({ building, tile }: { building: Building; tile: number }) {
  const { x, y, width, height, roof } = building;
  const shape = LOOK_SHAPES[building.look];
  const wide = width * tile, deep = height * tile, wall = shape.wallHeight * tile, ridge = shape.ridgeHeight * tile, eave = EAVE_OVERHANG * tile;
  const slope = Math.hypot(deep / 2 + eave, ridge), pitch = Math.atan2(ridge, deep / 2 + eave);
  const gable: CSSProperties = { top: -(wall + ridge), width: deep, height: wall + ridge, transform: STAND_UP_ALONG_Y, transformOrigin: "0 100%",
    clipPath: `polygon(0 100%, 0 ${ridge}px, 50% 0, 100% ${ridge}px, 100% 100%)` };
  const roofSide = (isFront: boolean): CSSProperties => ({
    left: -eave, width: wide + 2 * eave, height: slope, backgroundColor: shape.roofFill ?? ROOF_FILL[roof],
    top: isFront ? deep + eave - slope : -eave, transformOrigin: isFront ? "50% 100%" : "50% 0",
    transform: `translateZ(${wall}px) rotateX(${isFront ? -pitch : pitch}rad)`,
  });
  return <>
    <div className="village-3d absolute" style={{ left: x * tile, top: y * tile, width: wide, height: deep }}>
      <div className={`village-face village-gable ${shape.wallClass}`} style={{ ...gable, left: 0 }} />
      <div className={`village-face village-gable ${shape.wallClass}`} style={{ ...gable, left: wide }} />
      <div className={`village-face ${shape.wallClass}`} style={{ left: 0, top: deep - wall, width: wide, height: wall, transform: "rotateX(-90deg)", transformOrigin: "50% 100%", fontSize: tile }}>
        <BuildingFront building={building} />
      </div>
      <div className={`village-face village-roof village-roof-back ${shape.roofClass}`} style={roofSide(false)} />
      <div className={`village-face village-roof ${shape.roofClass}`} style={roofSide(true)} />
    </div>
    <BuildingProps building={building} tile={tile} shape={shape} />
  </>;
}

/** A gate: red posts, and while closed a rope hung with paper streamers across the way. */
function GateArt({ gate, isOpen, tile }: { gate: Gate; isOpen: boolean; tile: number }) {
  const { x, y, width, height } = gate;
  const isAcross = width >= height, span = isAcross ? width : height;
  const posts: Vector[] = isAcross ? [{ x: x + 0.12, y: y + 0.5 }, { x: x + width - 0.12, y: y + 0.5 }] : [{ x: x + 0.5, y: y + 0.12 }, { x: x + 0.5, y: y + height - 0.12 }];
  const rope: CSSProperties = isAcross
    ? { left: x * tile, top: (y + 0.5 - GATE_HEIGHT) * tile, width: span * tile, height: GATE_HEIGHT * tile, transform: STAND_UP }
    : { left: (x + 0.5) * tile, top: (y - GATE_HEIGHT) * tile, width: span * tile, height: GATE_HEIGHT * tile, transform: STAND_UP_ALONG_Y, transformOrigin: "0 100%" };
  return <>
    {posts.map(feet => <Upright key={`${feet.x},${feet.y}`} feet={feet} width={0.3} height={GATE_HEIGHT} tile={tile}><span className="village-gate-post" /></Upright>)}
    {!isOpen && <div className="village-upright" style={rope}>
      <svg viewBox={`0 0 ${span} ${GATE_HEIGHT}`} className="block size-full overflow-visible" preserveAspectRatio="none">
        <path d={`M0.12,0.3 Q${span / 2},0.6 ${span - 0.12},0.3`} fill="none" stroke="var(--village-wood-light)" strokeWidth={0.1} strokeLinecap="round" />
        {[0.33, 0.66].map(share => <rect key={share} x={span * share - 0.06} y={0.42} width={0.12} height={0.3} fill="var(--village-sign)" {...ink} strokeWidth={0.03} />)}
      </svg>
    </div>}
  </>;
}

function Lantern({ at, isLit, tile }: { at: Vector; isLit: boolean; tile: number }) {
  return <Upright feet={{ x: at.x + 0.5, y: at.y + 0.9 }} width={1} height={LANTERN_HEIGHT} tile={tile} className={isLit ? "village-lantern-lit" : undefined}>
    <svg viewBox={`0 0 1 ${LANTERN_HEIGHT}`} className="block size-full overflow-visible">
      <circle cx={0.5} cy={0.32} r={0.45} className="village-lantern-glow" />
      <path d={`M0.5,0.55 V${LANTERN_HEIGHT}`} stroke="var(--village-wood)" strokeWidth={0.07} />
      <ellipse cx={0.5} cy={0.34} rx={0.18} ry={0.23} className="village-lantern" {...ink} strokeWidth={0.04} />
      <path d="M0.37,0.11 h0.26 M0.37,0.57 h0.26" stroke="var(--village-ink)" strokeWidth={0.05} />
    </svg>
  </Upright>;
}

/** A row of trees with nothing but water from it to the near edge is the one nearest the viewer: drawn as bushes. */
function isFrontRow(map: TownMap, run: Rect): boolean {
  for (let y = run.y + 1; y < map.height; y++) {
    for (let x = run.x; x < run.x + run.width; x++) if (terrainAt(map, x, y) !== "water") return false;
  }
  return true;
}

// Memoised: none of it changes while the traveller walks.
const StaticScenery = memo(function StaticScenery({ map, buildings, tile }: { map: TownMap; buildings: readonly Building[]; tile: number }) {
  const fences = map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => terrain === "fence" ? [{ x, y }] : []));
  return <>
    {TREE_TERRAINS.flatMap(terrain => rowRuns(map, terrain).map(run => <TreeRow key={`${terrain}-${run.x},${run.y}`} run={run}
      height={isFrontRow(map, run) ? BUSH_HEIGHT : TREE_HEIGHT} tile={tile} draw={TREE_DRAWINGS[terrain]} />))}
    {rowRuns(map, "tallgrass").map(run => <TallGrassRow key={`grass-${run.x},${run.y}`} run={run} tile={tile} />)}
    {fences.map(({ x, y }) => <FencePost key={`${x},${y}`} x={x} y={y} tile={tile} />)}
    {buildings.map(building => <House key={building.id} building={building} tile={tile} />)}
  </>;
});

type VillageSceneryProps = { map: TownMap; buildings: readonly Building[]; gates: readonly Gate[]; openGateIds: readonly string[]; lanterns: readonly Vector[]; litLanterns: number; tile: number };

/** The trees, fences, buildings, gates and lanterns (the first `litLanterns` lit), standing on the ground. */
export function VillageScenery({ map, buildings, gates, openGateIds, lanterns, litLanterns, tile }: VillageSceneryProps) {
  return <>
    <StaticScenery map={map} buildings={buildings} tile={tile} />
    {gates.map(gate => <GateArt key={gate.id} gate={gate} isOpen={openGateIds.includes(gate.id)} tile={tile} />)}
    {lanterns.map((at, index) => <Lantern key={`${at.x},${at.y}`} at={at} isLit={index < litLanterns} tile={tile} />)}
  </>;
}
