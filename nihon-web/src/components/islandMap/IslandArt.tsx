import { useId, useMemo } from "react";
import type { ReactElement } from "react";
import { coastlinePath, coastPointToward, isletPlacements, isletToward } from "../../lib/islandCoastline";
import { ISLAND_COASTS, ISLANDS } from "../../lib/islandMap";
import { smoothClosedPath } from "../../lib/svgPath";
import type { IslandId, Point } from "../../lib/islandMap";

// Islands are drawn in their own coordinates: the land spans about x ±120 around y 0, a low shore drops below it,
// and landmarks rise above it. Colours come from IslandMap.css, so the art follows the light and dark themes.
export const ISLAND_VIEW_BOX = "-140 -170 280 240";

const SHORE_DEPTH = 12;
const SHORE_STEP = 2;
const ISLETS_PER_ISLAND = 2;
// Three rings, evenly spaced through the ripple animation (4.5s in IslandMap.css).
const RIPPLE_DELAYS = [0, -1.5, -3];
// Islets keep at least this far (radians) from where a bridge leaves.
const ISLET_CLEARANCE = 0.5;
// The hill on an island's grass, relative to its coast.
const HILL_SHARE = { x: 0.53, y: 0.48 };
const ISLAND_SHAPES = Object.fromEntries(ISLANDS.map(({ id }) => {
  const coast = ISLAND_COASTS[id];
  return [id, { coast: coastlinePath(coast), hill: coastlinePath({ radiusX: coast.radiusX * HILL_SHARE.x, radiusY: coast.radiusY * HILL_SHARE.y, seed: coast.seed + 101 }) }];
})) as Record<IslandId, { coast: string; hill: string }>;
const ink = { stroke: "var(--ink)", strokeWidth: 2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// Home grows with each JLPT level completed: the torii gains colour, rope, gold and a stone path, then glows. A stone lantern or azalea appears on the grass for each unit completed (in these spots, clear of the
// bridges).
const HOME_UNIT_SPOTS = [
  { x: -56, y: 26 }, { x: 58, y: 28 }, { x: -86, y: 2 }, { x: 88, y: 0 }, { x: -28, y: 38 }, { x: 30, y: 38 },
  { x: -48, y: -30 }, { x: 46, y: -32 }, { x: -70, y: 34 }, { x: 72, y: 34 }, { x: -20, y: -40 }, { x: 22, y: -40 },
] as const;

// The JLPT levels completed at which each part of Home appears.
const HOME_STEPS = { vermilionGate: 1, gateRope: 2, goldenGate: 3, steppingStones: 4, glow: 5 } as const;
const STEPPING_STONES = [[0, 4], [-4, 16], [2, 28]] as const;
const SHIDE_AT = [-16, 0, 16] as const;

function StoneLantern({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x},${y}) scale(0.5)`}>
    <rect x="-5" y="-22" width="10" height="22" fill="var(--paper)" {...ink} strokeWidth="2.4" />
    <rect x="-12" y="-34" width="24" height="12" fill="var(--paper)" {...ink} strokeWidth="2.4" />
    <rect x="-5" y="-31" width="10" height="6" fill="var(--lantern)" />
    <path d="M-16,-34 L0,-46 L16,-34 Z" fill="var(--slate)" {...ink} strokeWidth="2.4" />
  </g>;
}

function Azalea({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x},${y})`}>
    <path d="M-9,0 Q-10,-9 -3,-10 Q0,-15 5,-10 Q11,-9 9,0 Z" fill="var(--leaf)" {...ink} strokeWidth="1.2" />
    <circle cx="-3" cy="-7" r="1.6" fill="var(--blossom)" /><circle cx="3" cy="-9" r="1.6" fill="var(--blossom)" /><circle cx="5" cy="-4" r="1.6" fill="var(--blossom)" />
  </g>;
}

/** A shimenawa: a twisted straw rope with zigzag paper streamers (shide) hanging from it. */
function Shimenawa({ d, shide }: { d: string; shide: readonly (readonly [number, number])[] }) {
  return <g>
    <path d={d} fill="none" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
    <path d={d} fill="none" stroke="var(--straw)" strokeWidth="3.6" strokeLinecap="round" strokeDasharray="3 2" />
    {shide.map(([x, y]) => <path key={x} d={`M${x - 2},${y} l4,0 l-3,4 l4,0 l-3,4 l4,0 l-4,5`} fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinejoin="round" />)}
  </g>;
}

function Torii({ tally, stage }: LandmarkProps) {
  const pillars = stage >= HOME_STEPS.vermilionGate ? "var(--vermilion)" : "var(--wood)";
  const isGolden = stage >= HOME_STEPS.goldenGate;
  return <g transform="translate(0,-6)">
    {stage >= HOME_STEPS.glow && <circle className="island-summit-glow" cx="0" cy="-74" r="64" fill="var(--checkpoint-light)" />}
    {stage >= HOME_STEPS.steppingStones && STEPPING_STONES.map(([x, y]) => <ellipse key={y} cx={x} cy={y} rx="9" ry="3.5" fill="var(--stone)" {...ink} strokeWidth="1.2" />)}
    {HOME_UNIT_SPOTS.slice(0, tally).map((spot, index) => index % 2 === 0 ? <StoneLantern key={spot.x} {...spot} /> : <Azalea key={spot.x} {...spot} />)}
    <rect x="-34" y="-80" width="8" height="76" fill={pillars} {...ink} />
    <rect x="26" y="-80" width="8" height="76" fill={pillars} {...ink} />
    <rect x="-46" y="-70" width="92" height="7" fill={pillars} {...ink} />
    {isGolden
      ? <rect x="-8" y="-84" width="16" height="15" rx="1.5" fill="var(--ink)" stroke="var(--gold)" strokeWidth="1.6" />
      : <rect x="-3" y="-80" width="6" height="10" fill={pillars} {...ink} />}
    {/* The kasagi: dipping in the middle, its ends swept up. */}
    <path d="M-62,-99 Q-30,-86 0,-88 Q30,-86 62,-99 L57,-89 Q28,-79 0,-81 Q-28,-79 -57,-89 Z" fill="var(--ink)" {...ink} />
    {isGolden && <path d="M-62,-99 L-57,-89 L-52,-91 L-56,-100 Z M62,-99 L57,-89 L52,-91 L56,-100 Z" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1" />}
    {stage >= HOME_STEPS.gateRope && <Shimenawa d="M-26,-60 Q0,-50 26,-60" shide={SHIDE_AT.map(x => [x, x === 0 ? -55 : -57] as const)} />}
    <Pine x={70} y={6} size={1} />
    <Pine x={-72} y={10} size={0.8} />
  </g>;
}

/** A canopy of rounded bumps around an ellipse, for leafy and blossoming trees. */
function scallopedPath({ cx, cy, rx, ry, bumps }: { cx: number; cy: number; rx: number; ry: number; bumps: number }): string {
  const points = Array.from({ length: bumps }, (_, index) => {
    const angle = (index / bumps) * Math.PI * 2;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)] as const;
  });
  const arcs = points.map((point, index) => {
    const [x, y] = points[(index + 1) % bumps];
    const radius = Math.hypot(x - point[0], y - point[1]) * BUMP_RADIUS_SHARE;
    return `A${radius.toFixed(1)},${radius.toFixed(1)} 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)} ${arcs.join(" ")} Z`;
}
// A bump's radius as a share of the gap it spans: just over half, so each bump is a little flatter than a semicircle.
const BUMP_RADIUS_SHARE = 0.62;

// The pagoda keeps its height as it gains tiers (3, 4, then 5), so the spire stays inside the drawing.
const PAGODA_HEIGHT = 60;
const PAGODA_SPIRE_RINGS = 5;

function Pagoda({ stage }: LandmarkProps) {
  const tierCount = 3 + Math.min(stage, 2);
  const spacing = PAGODA_HEIGHT / (tierCount - 1);
  const k = spacing / 30;
  const tiers = Array.from({ length: tierCount }, (_, tier) => tier);
  const topY = -8 - (tierCount - 1) * spacing;
  const peak = topY - 34 * k;
  const metal = stage >= 3 ? "var(--gold)" : "var(--bronze)";
  return <g transform="translate(0,-4)">
    {tiers.map(tier => {
      const y = -8 - tier * spacing, half = 26 - tier * (10 / (tierCount - 1)), roof = 44 - tier * (14 / (tierCount - 1));
      return <g key={tier}>
        <rect x={-half} y={y - 22 * k} width={half * 2} height={22 * k} fill="var(--paper)" {...ink} />
        <path d={`M${-roof},${y - 20 * k} Q0,${y - 36 * k} ${roof},${y - 20 * k} L${roof - 9},${y - 28 * k} Q0,${y - 40 * k} ${-roof + 9},${y - 28 * k} Z`} fill="var(--slate)" {...ink} />
      </g>;
    })}
    <path d={`M-7,${peak + 1} Q0,${peak - 8} 7,${peak + 1} Z`} fill="var(--slate)" {...ink} strokeWidth="1.2" />
    <line x1="0" y1={peak - 4} x2="0" y2={peak - 38} {...ink} strokeWidth="2.5" />
    {Array.from({ length: PAGODA_SPIRE_RINGS }, (_, ring) => <ellipse key={ring} cx="0" cy={peak - 9 - ring * 6} rx="5" ry="1.6" fill={metal} {...ink} strokeWidth="0.9" />)}
    <circle cx="0" cy={peak - 41} r="3.2" fill={metal} {...ink} strokeWidth="1" />
    {stage >= 3 && <><StoneLantern x={-46} y={14} /><StoneLantern x={46} y={14} /></>}
    <Pine x={-74} y={8} size={0.9} />
  </g>;
}

// The grove thickens as Practice grows: 3 stalks, then 5, 7 and 9 (the middle ones first).
const BAMBOO_STALKS = [
  { x: -4, h: 100 }, { x: -24, h: 116 }, { x: 18, h: 124 }, { x: -44, h: 92 }, { x: 40, h: 96 },
  { x: -64, h: 80 }, { x: 60, h: 84 }, { x: -14, h: 134 }, { x: 30, h: 138 },
] as const;

function Bamboo({ stage }: LandmarkProps) {
  const stalks = BAMBOO_STALKS.slice(0, 3 + stage * 2).toSorted((a, b) => b.h - a.h);
  return <g>
    {stalks.map(({ x, h }) => <g key={x}>
      <line x1={x} y1="6" x2={x} y2={6 - h} stroke="var(--leaf)" strokeWidth="7" strokeLinecap="round" />
      <line x1={x} y1="6" x2={x} y2={6 - h} stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
      {[0.3, 0.55, 0.8].map(share => <line key={share} x1={x - 4} y1={6 - h * share} x2={x + 4} y2={6 - h * share} stroke="var(--ink)" strokeWidth="1.5" />)}
      <path d={`M${x},${8 - h} q12,-4 18,4 q-12,2 -18,-4 Z M${x},${14 - h} q-12,-6 -18,2 q12,2 18,-2 Z`} fill="var(--leaf)" {...ink} strokeWidth="1" />
    </g>)}
    <path d="M-78,30 l10,-6 l12,4 l-6,8 Z" fill="var(--paper)" {...ink} strokeWidth="1.5" />
  </g>;
}

// Games: the festival lanterns light up one by one as games are played (middle first).
const GAME_LANTERNS = [-26, 0, 26] as const;
const LIGHTING_ORDER = [1, 0, 2] as const;

function Lanterns({ stage }: LandmarkProps) {
  const litIndexes = new Set<number>(LIGHTING_ORDER.slice(0, stage));
  return <g>
    <line x1="-52" y1="8" x2="-52" y2="-96" stroke="var(--wood)" strokeWidth="5" />
    <line x1="52" y1="8" x2="52" y2="-96" stroke="var(--wood)" strokeWidth="5" />
    <path d="M-52,-92 Q0,-64 52,-92" fill="none" {...ink} strokeWidth="1.5" />
    {GAME_LANTERNS.map((x, index) => {
      const y = -80 + (x === 0 ? 14 : 8);
      const isLit = litIndexes.has(index);
      return <g key={x}>
        {isLit && <circle className="island-lantern-lit" cx={x} cy={y + 12} r="22" fill="var(--lantern)" style={{ animationDelay: `${index * 0.7}s` }} />}
        <ellipse cx={x} cy={y + 12} rx="11" ry="14" fill={isLit ? "var(--lantern)" : "var(--paper)"} {...ink} strokeWidth="1.5" />
        <rect x={x - 6} y={y - 3} width="12" height="4" fill="var(--ink)" />
        <rect x={x - 6} y={y + 25} width="12" height="4" fill="var(--ink)" />
      </g>;
    })}
    <path d="M-20,30 l14,-8 l16,2 l10,8 l-18,6 Z" fill="var(--sand)" {...ink} strokeWidth="1.5" />
  </g>;
}

// Review: the raked rings spread (1, 2, then 3) and a second rock with moss is set at the last step.
const RAKED_RINGS = [20, 32, 44] as const;

function ZenGarden({ stage }: LandmarkProps) {
  return <g>
    {RAKED_RINGS.slice(0, 1 + Math.min(stage, 2)).map(r => <ellipse key={r} cx="22" cy="6" rx={r} ry={r * 0.42} fill="none" stroke="var(--paper)" strokeWidth="2.5" />)}
    {stage >= 3 && <>
      <ellipse cx="56" cy="20" rx="16" ry="6" fill="var(--leaf)" {...ink} strokeWidth="1.2" />
      <path d="M48,20 q2,-10 10,-10 q8,1 6,10 Z" fill="var(--slate)" {...ink} />
    </>}
    {stage >= 1 && <ellipse cx="18" cy="8" rx="16" ry="5" fill="var(--leaf)" {...ink} strokeWidth="1.2" />}
    <path d="M10,6 q4,-16 16,-14 q12,2 10,14 Z" fill="var(--slate)" {...ink} />
    <g transform="translate(-50,4)">
      <rect x="-6" y="-24" width="12" height="24" fill="var(--paper)" {...ink} />
      <rect x="-14" y="-34" width="28" height="10" fill="var(--paper)" {...ink} />
      <rect x="-10" y="-50" width="20" height="16" fill="var(--paper)" {...ink} />
      <path d="M-20,-50 L0,-66 L20,-50 Z" fill="var(--slate)" {...ink} />
      <circle cx="0" cy="-69" r="4" fill="var(--slate)" {...ink} />
    </g>
    <Pine x={70} y={30} size={0.8} />
  </g>;
}

function SmallScroll({ x, character }: { x: number; character: string }) {
  return <g transform={`translate(${x},-16)`}>
    <line x1="-14" y1="-58" x2="14" y2="-58" stroke="var(--wood)" strokeWidth="4" strokeLinecap="round" />
    <rect x="-10" y="-55" width="20" height="44" fill="var(--paper)" {...ink} strokeWidth="1.5" />
    <text x="0" y="-27" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--ink)" fontFamily="'Noto Serif JP', 'Yu Mincho', serif">{character}</text>
    <rect x="-11" y="-11" width="22" height="3" fill="var(--wood)" />
  </g>;
}

/** Kanji: the character is faint until the first step, then inked; more scrolls hang beside it, and a red seal is
 *  stamped at the last step. */
function Scroll({ stage }: LandmarkProps) {
  return <g transform="translate(0,-4)">
    <line x1="-34" y1="6" x2="-34" y2="-108" stroke="var(--wood)" strokeWidth="6" />
    <line x1="34" y1="6" x2="34" y2="-108" stroke="var(--wood)" strokeWidth="6" />
    <line x1="-42" y1="-108" x2="42" y2="-108" stroke="var(--wood)" strokeWidth="6" strokeLinecap="round" />
    <rect x="-24" y="-102" width="48" height="84" fill="var(--paper)" {...ink} />
    <text x="0" y="-48" textAnchor="middle" fontSize="38" fontWeight="700" fill="var(--ink)" opacity={stage >= 1 ? 1 : 0.3} fontFamily="'Noto Serif JP', 'Yu Mincho', serif">漢</text>
    {stage >= 3 && <rect x="8" y="-38" width="10" height="10" rx="1.5" fill="var(--vermilion)" />}
    <rect x="-26" y="-20" width="52" height="5" fill="var(--wood)" />
    {stage >= 2 && <SmallScroll x={-62} character="字" />}
    {stage >= 3 && <SmallScroll x={-88} character="書" />}
    <ellipse cx="62" cy="14" rx="16" ry="7" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    <line x1="56" y1="10" x2="80" y2="-14" {...ink} strokeWidth="3" />
  </g>;
}

// Kana: the cherry tree comes into bloom as kana are mastered: bare branches with buds, then scattered flowers, full
// bloom, and at last flowering bushes beneath it. Petals keep falling, more as it blooms; each rests on the grass a
// moment, then fades so the island never fills up (IslandMap.css).
const SAKURA_STEPS = { flowers: 1, fullBloom: 2, undergrowth: 3 } as const;
const SAKURA_TWIGS = "M-2,-70 C0,-86 6,-100 8,-118 M30,-80 C38,-90 46,-96 54,-100 M-30,-86 C-38,-94 -46,-98 -54,-100 M-2,-70 C-14,-84 -18,-100 -20,-116";
const SAKURA_BUDS = [[8, -118], [54, -100], [-54, -100], [-20, -116], [30, -80], [-30, -86], [4, -96], [42, -92]] as const;
const SAKURA_FLOWERS = [[8, -112], [48, -98], [-48, -98], [-18, -110], [26, -88], [-26, -92], [2, -84], [36, -110], [-38, -114], [16, -124], [-6, -100]] as const;
const SAKURA_CANOPY = scallopedPath({ cx: 0, cy: -100, rx: 60, ry: 36, bumps: 13 });
const SAKURA_HIGHLIGHT = scallopedPath({ cx: -14, cy: -112, rx: 26, ry: 14, bumps: 7 });
const SAKURA_BUSHES = [[-40, 16, 1.3], [36, 14, 1.4], [-66, 2, 1], [62, -2, 1.1]] as const;
const GROUND_FLOWERS = [[-18, 26], [14, 28], [-52, 26], [50, 24], [80, -12], [-84, -6]] as const;
// Where each petal lands, and its timing in seconds. A petal falls from 80 units above its landing spot.
const FALLING_PETALS = [
  { x: -44, y: 18, duration: 9, delay: 0 }, { x: 40, y: 22, duration: 10, delay: -4 }, { x: 62, y: 2, duration: 8.5, delay: -6.5 },
  { x: -64, y: 6, duration: 11, delay: -2 }, { x: 14, y: 28, duration: 9.5, delay: -7.5 }, { x: -22, y: 30, duration: 10.5, delay: -3 },
] as const;
const FALLING_PETALS_PER_STEP = 2;

function SakuraFlower({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x},${y})`}>
    {[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cy="-3" rx="2.4" ry="3.2" fill="var(--blossom)" stroke="var(--ink)" strokeWidth="0.6" transform={`rotate(${angle})`} />)}
    <circle r="1.3" fill="var(--gold)" />
  </g>;
}

function CherryTree({ stage }: LandmarkProps) {
  const isFullBloom = stage >= SAKURA_STEPS.fullBloom;
  return <g>
    <path d="M-4,8 C-2,-20 -10,-44 -2,-70 M-4,-34 C10,-50 22,-60 30,-80 M-6,-48 C-18,-60 -26,-72 -30,-86" fill="none" stroke="var(--wood)" strokeWidth="7" strokeLinecap="round" />
    <path d={SAKURA_TWIGS} fill="none" stroke="var(--wood)" strokeWidth="3.5" strokeLinecap="round" />
    {isFullBloom && <path d={SAKURA_CANOPY} fill="var(--blossom)" {...ink} strokeWidth="1.6" />}
    {isFullBloom && <path d={SAKURA_HIGHLIGHT} fill="var(--paper)" opacity="0.35" />}
    {stage < SAKURA_STEPS.flowers
      ? SAKURA_BUDS.map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="var(--blossom)" stroke="var(--ink)" strokeWidth="0.8" />)
      : SAKURA_FLOWERS.slice(0, isFullBloom ? SAKURA_FLOWERS.length : 7).map(([x, y]) => <SakuraFlower key={`${x}${y}`} x={x} y={y} />)}
    {stage >= SAKURA_STEPS.undergrowth && <g>
      {SAKURA_BUSHES.map(([x, y, size]) => <g key={x} transform={`translate(${x},${y}) scale(${size})`}><Azalea x={0} y={0} /></g>)}
      {GROUND_FLOWERS.map(([x, y]) => <g key={x} transform={`translate(${x},${y}) scale(0.7)`}><SakuraFlower x={0} y={0} /></g>)}
    </g>}
    {FALLING_PETALS.slice(0, stage * FALLING_PETALS_PER_STEP).map(petal => <g key={petal.x} transform={`translate(${petal.x},${petal.y})`}>
      <ellipse className="island-petal-fall" rx="3.8" ry="2.4" fill="var(--blossom)" stroke="var(--ink)" strokeWidth="0.5" style={{ animationDuration: `${petal.duration}s`, animationDelay: `${petal.delay}s` }} />
    </g>)}
  </g>;
}

function Pine({ x, y, size }: { x: number; y: number; size: number }) {
  return <g transform={`translate(${x},${y}) scale(${size})`}>
    <line x1="0" y1="0" x2="0" y2="-12" stroke="var(--wood)" strokeWidth="4" />
    <path d="M-16,-10 L0,-34 L16,-10 Z M-12,-24 L0,-46 L12,-24 Z" fill="var(--leaf)" {...ink} strokeWidth="1.5" />
  </g>;
}

/** How many of something a landmark shows: levels reached on Fuji, badges earned (ema plaques) at the onsen, friends' boats at the
 *  harbour, the bell tower's time of day. */
/** `stage`: how far the island has grown (lib/islandGrowth.ts): 0–3 for the ring islands, JLPT levels completed (0–5)
 *  for Home. */
type LandmarkProps = { tally: number; stage: number };

// The trail up Fuji's lit face: one station per JLPT level, from the foot (N5) to the summit (N1).
const FUJI_STATIONS = [{ x: -64, y: 4 }, { x: -42, y: -36 }, { x: -30, y: -74 }, { x: -15, y: -110 }, { x: 0, y: -148 }] as const;

/** A checkpoint lantern on Fuji's trail: lit once its level is completed, glowing softly while it is the next goal. */
function Checkpoint({ x, y, state }: { x: number; y: number; state: "lit" | "next" | "unlit" }) {
  return <g transform={`translate(${x},${y})`}>
    {state === "lit" && <circle className="island-checkpoint-glow" cy="-8" r="13" fill="var(--checkpoint-light)" />}
    {state === "next" && <circle className="island-checkpoint-next" cy="-8" r="11" fill="var(--checkpoint-light)" />}
    <rect x="-2" y="-4" width="4" height="5" fill="var(--paper)" {...ink} strokeWidth="1" />
    <rect x="-5" y="-12" width="10" height="8" rx="1" fill={state === "lit" ? "var(--checkpoint-light)" : "var(--paper)"} {...ink} strokeWidth="1" />
    <path d="M-7,-12 L0,-17 L7,-12 Z" fill="var(--slate)" {...ink} strokeWidth="1" />
  </g>;
}

function FujiMountain({ tally }: LandmarkProps) {
  const trail = FUJI_STATIONS.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const climbed = FUJI_STATIONS.slice(0, Math.max(tally, 1)).map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  const isSummitReached = tally >= FUJI_STATIONS.length;
  return <g>
    {isSummitReached && <circle className="island-summit-glow" cx="0" cy="-150" r="34" fill="var(--lantern)" />}
    <path d="M-118,14 Q-58,-40 -18,-150 L18,-150 Q58,-40 118,14 Q0,30 -118,14 Z" fill="var(--fuji)" {...ink} strokeWidth="1.5" />
    <path d="M4,-150 L18,-150 Q58,-40 118,14 Q64,26 12,24 Q22,-60 4,-150 Z" fill="var(--ink)" opacity="0.16" />
    <path d="M10,-144 Q26,-76 50,-12 M-2,-138 Q-2,-70 -6,4" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.18" />
    <path d="M-18,-150 L18,-150 Q28,-128 38,-110 L28,-113 L20,-102 L10,-112 L0,-99 L-10,-112 L-20,-104 L-29,-114 L-38,-110 Q-28,-128 -18,-150 Z" fill="var(--paper)" {...ink} strokeWidth="1.2" />
    <path d={trail} fill="none" stroke="var(--wood)" strokeWidth="1.6" strokeDasharray="3 3" strokeLinecap="round" />
    {tally > 1 && <path d={climbed} fill="none" stroke="var(--checkpoint-light)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
    {FUJI_STATIONS.map((point, index) => <Checkpoint key={point.y} {...point} state={index < tally ? "lit" : index === tally ? "next" : "unlit"} />)}
    <Pine x={-104} y={20} size={0.75} /><Pine x={-84} y={28} size={0.9} /><Pine x={84} y={26} size={0.85} /><Pine x={104} y={18} size={0.7} />
  </g>;
}

// Moorings along the pier, one boat for each friend who studied today (up to this many).
const PIER_MOORINGS = [{ x: 96, y: 46 }, { x: 128, y: 30 }, { x: 116, y: 58 }, { x: 146, y: 42 }] as const;

function HarbourTown({ tally }: LandmarkProps) {
  return <g>
    <path d="M58,20 L70,14 L140,44 L128,52 Z" fill="var(--wood)" {...ink} strokeWidth="1.5" />
    <path d="M80,24 L76,32 M104,34 L100,42 M128,44 L124,52" stroke="var(--ink)" strokeWidth="1.5" />
    {PIER_MOORINGS.slice(0, tally).map(({ x, y }) => <g key={x} transform={`translate(${x},${y})`}>
      <path d="M-13,0 L13,0 L8,7 L-8,7 Z" fill="var(--wood)" {...ink} strokeWidth="1.2" />
      <line x1="0" y1="0" x2="0" y2="-16" {...ink} strokeWidth="1.2" />
      <path d="M1,-15 L10,-3 L1,-3 Z" fill="var(--paper)" {...ink} strokeWidth="1" />
    </g>)}
    <g transform="translate(-62,-85)">
      <g className="island-lighthouse-beam"><path d="M0,0 L120,-18 L120,18 Z M0,0 L-120,-18 L-120,18 Z" fill="var(--lantern)" /></g>
    </g>
    <path d="M-72,-6 L-52,-6 L-56,-78 L-68,-78 Z" fill="var(--paper)" {...ink} />
    <path d="M-70.8,-24 L-53.2,-24 L-53.9,-36 L-70.1,-36 Z M-69.6,-50 L-54.4,-50 L-55,-62 L-69,-62 Z" fill="var(--vermilion)" />
    <rect x="-70" y="-92" width="16" height="14" fill="var(--lantern)" {...ink} strokeWidth="1.5" />
    <path d="M-74,-92 L-62,-105 L-50,-92 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    <g transform="translate(4,-4)">
      <rect x="-12" y="-26" width="34" height="24" fill="var(--paper)" {...ink} strokeWidth="1.5" />
      <path d="M-18,-26 L5,-44 L28,-26 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
      <rect x="0" y="-14" width="8" height="12" fill="var(--wood)" />
    </g>
    <g transform="translate(40,4)">
      <rect x="-10" y="-20" width="26" height="18" fill="var(--paper)" {...ink} strokeWidth="1.5" />
      <path d="M-15,-20 L3,-34 L21,-20 Z" fill="var(--vermilion)" {...ink} strokeWidth="1.5" />
    </g>
  </g>;
}

function TeaHouse() {
  return <g>
    <g transform="translate(-14,-2)">
      <rect x="-40" y="-20" width="64" height="8" fill="var(--wood)" {...ink} strokeWidth="1.5" />
      <path d="M-36,-12 v10 M20,-12 v10" stroke="var(--ink)" strokeWidth="2" />
      <rect x="-36" y="-46" width="56" height="26" fill="var(--paper)" {...ink} strokeWidth="1.5" />
      <path d="M-22,-46 v26 M-8,-46 v26 M6,-46 v26 M-36,-33 h56" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
      <rect x="-6" y="-44" width="10" height="9" fill="var(--slate)" />
      <path d="M-52,-46 Q-8,-62 36,-46 L30,-58 Q-8,-74 -46,-58 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    </g>
    <g transform="translate(46,0)">
      <path d="M-18,0 L18,0 L14,8 L-22,8 Z" fill="var(--vermilion)" {...ink} strokeWidth="1.2" />
      <line x1="0" y1="4" x2="-6" y2="-58" {...ink} strokeWidth="1.5" />
      <path d="M-36,-50 Q-6,-76 24,-50 Q-6,-58 -36,-50 Z" fill="var(--vermilion)" {...ink} strokeWidth="1.5" />
    </g>
    <g transform="translate(-74,10) scale(0.6)">
      <rect x="-6" y="-24" width="12" height="24" fill="var(--paper)" {...ink} />
      <rect x="-14" y="-34" width="28" height="10" fill="var(--paper)" {...ink} />
      <path d="M-18,-34 L0,-48 L18,-34 Z" fill="var(--slate)" {...ink} />
    </g>
  </g>;
}

/** A time bell tower (toki no kane): a wooden tower whose bell swings when the map's time of day changes (`tally`). */
function TimeBellTower({ tally }: Pick<LandmarkProps, "tally">) {
  return <g transform="translate(-34,0)">
    <rect x="-30" y="-10" width="60" height="12" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    <path d="M-24,-10 L-17,-112 M24,-10 L17,-112" stroke="var(--wood)" strokeWidth="6" strokeLinecap="round" />
    <path d="M-24,-10 L-17,-112 M24,-10 L17,-112" fill="none" {...ink} strokeWidth="1" opacity="0.6" />
    <path d="M-22,-40 L20,-62 M22,-40 L-20,-62" stroke="var(--wood)" strokeWidth="2.5" />
    <rect x="-27" y="-66" width="54" height="7" fill="var(--wood)" {...ink} strokeWidth="1.3" />
    <path d="M-27,-66 v-5 M-13,-66 v-5 M0,-66 v-5 M13,-66 v-5 M27,-66 v-5 M-27,-71 h54" stroke="var(--ink)" strokeWidth="1.2" />
    <rect x="-20" y="-114" width="40" height="5" fill="var(--wood)" {...ink} strokeWidth="1.2" />
    <g key={tally} className="island-bell-swing">
      <line x1="0" y1="-109" x2="0" y2="-104" {...ink} strokeWidth="1.5" />
      <path d="M-9,-104 Q-10,-96 -12,-84 L12,-84 Q10,-96 9,-104 Q0,-108 -9,-104 Z" fill="var(--bronze)" {...ink} strokeWidth="1.3" />
      <path d="M-11,-90 h22 M-6,-100 v4 M0,-101 v4 M6,-100 v4" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
    </g>
    <path d="M14,-108 L14,-96 M24,-108 L24,-96" stroke="var(--ink)" strokeWidth="0.8" />
    <rect x="10" y="-97" width="18" height="4" rx="2" fill="var(--wood)" {...ink} strokeWidth="1" />
    <path d="M-44,-106 Q-28,-110 -16,-128 L16,-128 Q28,-110 44,-106 L38,-102 Q0,-112 -38,-102 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    <path d="M-14,-128 L0,-138 L14,-128 Z" fill="var(--slate)" {...ink} strokeWidth="1.3" />
    <line x1="0" y1="-138" x2="0" y2="-146" {...ink} strokeWidth="1.5" />
  </g>;
}

/** A moon-viewing deck (tsukimi-dai) built out over the water, with pampas grass, moon dumplings and a stone lantern. */
function MoonViewingDeck() {
  return <g>
    <path d="M44,22 v14 M70,24 v14 M100,18 v16 M118,14 v16" stroke="var(--wood)" strokeWidth="3" />
    <path d="M36,14 L112,4 L124,18 L48,30 Z" fill="var(--wood)" {...ink} strokeWidth="1.5" />
    <path d="M56,12 L66,26 M76,9 L86,23 M96,6 L106,20" stroke="var(--ink)" strokeWidth="0.8" opacity="0.4" />
    <path d="M112,4 v-10 M124,18 v-10 M112,-6 L124,8 M48,30 v-10 M124,8 L48,20" fill="none" stroke="var(--vermilion)" strokeWidth="2.2" strokeLinecap="round" />
    <g transform="translate(66,10)">
      <path d="M-8,0 L8,0 L5,6 L-5,6 Z" fill="var(--wood)" {...ink} strokeWidth="1" />
      <circle cx="-4" cy="-3" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" /><circle cx="2" cy="-3" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" /><circle cx="-1" cy="-8" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" />
    </g>
    <g transform="translate(92,6)">
      <path d="M-5,0 L5,0 L4,-10 L-4,-10 Z" fill="var(--slate)" {...ink} strokeWidth="1" />
      <path d="M0,-10 Q-6,-30 -14,-38 M0,-10 Q2,-32 6,-42 M0,-10 Q8,-26 16,-32" fill="none" stroke="var(--sand)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M0,-10 Q-6,-30 -14,-38 M0,-10 Q2,-32 6,-42 M0,-10 Q8,-26 16,-32" fill="none" stroke="var(--ink)" strokeWidth="0.6" />
    </g>
    <g transform="translate(26,4) scale(0.6)">
      <circle className="island-lantern-glow" cx="0" cy="-32" r="16" fill="var(--lantern)" opacity="0.5" />
      <rect x="-6" y="-24" width="12" height="24" fill="var(--paper)" {...ink} />
      <rect x="-14" y="-38" width="28" height="14" fill="var(--paper)" {...ink} />
      <rect x="-6" y="-35" width="12" height="8" fill="var(--lantern)" />
      <path d="M-18,-38 L0,-52 L18,-38 Z" fill="var(--slate)" {...ink} />
    </g>
  </g>;
}

function BellTowerShore({ tally }: LandmarkProps) {
  return <g><MoonViewingDeck /><TimeBellTower tally={tally} /><Pine x={-90} y={14} size={0.7} /></g>;
}

// The hot spring: an uneven pool (the coastline generator, small) edged with boulders of uneven shape and size, larger
// at the back, with a few gaps.
const ONSEN_POOL = { radiusX: 60, radiusY: 20, seed: 53 };
const ONSEN_POOL_CENTRE = { x: -6, y: 8 };
const ONSEN_ROCK_SLOTS = 22;
// Deterministic "noise" in 0–1 for a slot, so the rocks look scattered but never change between renders.
const jitter = (index: number, salt: number) => ((index * salt) % 17) / 17;

/** A rounded, lumpy boulder outline around (0,0). */
function boulderPath(rx: number, ry: number, seed: number) {
  const corners = 7;
  return smoothClosedPath(Array.from({ length: corners }, (_, corner) => {
    const angle = (corner / corners) * Math.PI * 2;
    const bulge = 0.82 + jitter(seed + corner, 11) * 0.3;
    return { x: Math.cos(angle) * rx * bulge, y: Math.sin(angle) * ry * bulge };
  }));
}

const ONSEN_ROCKS = Array.from({ length: ONSEN_ROCK_SLOTS }, (_, index) => index)
  .filter(index => jitter(index, 5) > 0.18)
  .map(index => {
    const angle = ((index + (jitter(index, 7) - 0.5) * 0.6) / ONSEN_ROCK_SLOTS) * Math.PI * 2;
    const edge = coastPointToward(ONSEN_POOL, { x: Math.cos(angle), y: Math.sin(angle) });
    const frontness = (Math.sin(angle) + 1) / 2;
    const size = 4 + jitter(index, 13) * 6 + (1 - frontness) * 4;
    return { x: ONSEN_POOL_CENTRE.x + edge.x * 1.05, y: ONSEN_POOL_CENTRE.y + edge.y * 1.1, size, path: boulderPath(size, size * 0.66, index) };
  })
  .sort((a, b) => a.y - b.y);
// The ema board at the back of the island, where a bath house would stand: one wooden plaque for each badge earned.
// Room for every badge in the catalog (30): five rails of six plaques, filled from the top rail down.
const EMA_COLUMNS = 6;
const EMA_RAILS = [-37, -30, -23, -16, -9] as const;
const EMA_LEFT = -18;
const EMA_SPACING = 7;
const EMA_PLAQUES = EMA_RAILS.flatMap((railY, rail) => Array.from({ length: EMA_COLUMNS }, (_, column) => ({
  x: EMA_LEFT + column * EMA_SPACING + (rail % 2) * 1.5,
  y: railY + 1.5,
})));
const ONSEN_POOL_PATH = coastlinePath(ONSEN_POOL);
// The big boulder at the back the bamboo spout rests on, and tufts of moss between the stones.
const SPOUT_ROCK = boulderPath(16, 11, 3);
const MOSS_TUFTS = [{ x: -60, y: 4 }, { x: 44, y: -2 }, { x: -30, y: 30 }, { x: 30, y: 28 }, { x: 10, y: -14 }] as const;

/** A shrine's ema rack: a small roofed frame with a wooden plaque (red cord, red mark) hung for each badge. */
function EmaRack({ count }: { count: number }) {
  const railPath = EMA_RAILS.map(y => `M-21,${y} H21`).join(" ");
  return <g transform="translate(74,-6)">
    <ellipse cx="3" cy="6" rx="32" ry="5" fill="var(--ink)" opacity="0.15" />
    <path d="M-22,-4 v9 M22,-4 v9 M28,-8 v9" stroke="var(--wood)" strokeWidth="3" strokeLinecap="round" />
    <path d="M24,-42 L30,-46 L30,-8 L24,-4 Z" fill="var(--wood)" {...ink} strokeWidth="1.2" />
    <path d="M24,-42 L30,-46 L30,-8 L24,-4 Z" fill="var(--ink)" opacity="0.25" />
    <rect x="-24" y="-42" width="48" height="38" fill="var(--wood)" {...ink} strokeWidth="1.4" />
    <path d={railPath} stroke="var(--ink)" strokeWidth="1" opacity="0.45" />
    {EMA_PLAQUES.slice(0, count).map(({ x, y }, index) => <g key={`${x},${y}`} transform={`translate(${x},${y})`}>
      <g className="island-ema" style={{ animationDelay: `${-index * 0.7}s` }}>
        <path d="M0,-2 v1.5" stroke="var(--vermilion)" strokeWidth="1" />
        <path d="M-2.8,0 L0,-2.2 L2.8,0 V4.6 H-2.8 Z" fill="var(--ema)" {...ink} strokeWidth="0.7" />
        <circle cy="1.9" r="1" fill="var(--vermilion)" />
      </g>
    </g>)}
    <path d="M-32,-42 Q0,-56 36,-44 L30,-56 Q0,-68 -26,-54 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
  </g>;
}

/** An onsen: a steaming rock pool fed by a bamboo spout, a fence, and an ema rack
 *  with a plaque for every badge. */
function Onsen({ tally }: LandmarkProps) {
  return <g>
    <path d="M-104,-6 v-34 M-94,-8 v-36 M-84,-10 v-32 M-108,-30 L-80,-34" stroke="var(--wood)" strokeWidth="3" strokeLinecap="round" />
    <Pine x={-30} y={-20} size={0.7} />
    <EmaRack count={tally} />
    <g transform={`translate(${ONSEN_POOL_CENTRE.x},${ONSEN_POOL_CENTRE.y})`}>
      <path d={ONSEN_POOL_PATH} fill="var(--onsen-deep)" {...ink} strokeWidth="1.2" />
      <path d={ONSEN_POOL_PATH} transform="translate(0,3) scale(0.84)" fill="var(--onsen)" />
      <path d={ONSEN_POOL_PATH} transform="translate(4,5) scale(0.45)" fill="var(--steam)" opacity="0.45" />
      <path d="M-34,2 q7,-3 14,0 M10,8 q7,-3 14,0 M-8,-5 q5,-2 10,0" fill="none" stroke="var(--foam)" strokeWidth="1.3" strokeLinecap="round" opacity="0.75" />
    </g>
    <g transform="translate(-62,-6)">
      <path d={SPOUT_ROCK} fill="var(--stone)" {...ink} strokeWidth="1.2" />
      <path d="M-24,-22 L10,-8" stroke="var(--leaf)" strokeWidth="5" strokeLinecap="round" />
      <path d="M-24,-22 L10,-8" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" opacity="0.15" />
      <path d="M-14,-21 l-2,5 M-2,-16 l-2,5" stroke="var(--ink)" strokeWidth="1" />
      <path d="M11,-7 Q14,0 16,10" fill="none" stroke="var(--foam)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M-26,-30 v14" stroke="var(--wood)" strokeWidth="2" />
    </g>
    {ONSEN_ROCKS.map(rock => <g key={`${rock.x},${rock.y}`} transform={`translate(${rock.x},${rock.y})`}>
      <path d={rock.path} fill="var(--stone)" {...ink} strokeWidth="1.1" />
      <path d={rock.path} transform={`translate(${-rock.size * 0.2},${-rock.size * 0.2}) scale(0.45)`} fill="var(--paper)" opacity="0.35" />
    </g>)}
    {MOSS_TUFTS.map(({ x, y }) => <path key={x} d={`M${x - 5},${y} q2,-6 5,-7 q3,1 5,7 Z`} fill="var(--leaf)" {...ink} strokeWidth="0.8" />)}
    {[-36, -6, 22].map((x, index) => <path key={x} className="island-steam" style={{ animationDelay: `${-index * 1.3}s` }}
      d={`M${x},0 q-8,-12 0,-24 q8,-12 0,-24`} fill="none" stroke="var(--steam)" strokeWidth="5" strokeLinecap="round" />)}
  </g>;
}

// New islands add a landmark here; the island base stays the same.
const LANDMARKS: Record<IslandId, (props: LandmarkProps) => ReactElement> = {
  home: Torii, lessons: Pagoda, practice: Bamboo, games: Lanterns, review: ZenGarden, kanji: Scroll, kana: CherryTree,
  fuji: FujiMountain, harbour: HarbourTown, teahouse: TeaHouse, belltower: BellTowerShore, onsen: Onsen,
};

/** The land: a low shore under a sandy beach, grass with a hill, and the island's landmark. */
function Land({ coast, hill, children }: { coast: string; hill: string; children?: ReactElement }) {
  const shore = Array.from({ length: SHORE_DEPTH / SHORE_STEP }, (_, index) => SHORE_DEPTH - index * SHORE_STEP);
  return <>
    {shore.map(depth => <path key={depth} d={coast} transform={`translate(0,${depth})`} fill={depth === SHORE_DEPTH ? "var(--shore-dark)" : "var(--shore)"} {...(depth === SHORE_DEPTH ? ink : {})} />)}
    <path d={coast} fill="var(--sand)" {...ink} />
    <path d={coast} transform="translate(-2,-5) scale(0.84)" fill="var(--grass)" />
    <path d={hill} transform="translate(0,-10)" fill="var(--grass-shade)" />
    <path d={hill} transform="translate(-6,-14) scale(0.7)" fill="var(--grass)" />
    {children}
  </>;
}

function Islet({ x, y, coast }: { x: number; y: number; coast: string }) {
  return <g transform={`translate(${x},${y})`}>
    <path className="island-foam" d={coast} transform={`translate(0,${SHORE_STEP * 2})`} fill="none" stroke="var(--foam)" strokeWidth="3" />
    <path d={coast} transform={`translate(0,${SHORE_STEP * 2})`} fill="var(--shore-dark)" {...ink} strokeWidth="1.5" />
    <path d={coast} fill="var(--sand)" {...ink} strokeWidth="1.5" />
    <path d={coast} transform="translate(-1,-2) scale(0.6)" fill="var(--grass)" />
  </g>;
}

function Mist({ blurId }: { blurId: string }) {
  return <g className="island-mist" filter={`url(#${blurId})`} opacity="0.92">
    <ellipse cx="-50" cy="-40" rx="80" ry="46" fill="var(--mist)" />
    <ellipse cx="46" cy="-62" rx="84" ry="52" fill="var(--mist)" />
    <ellipse cx="0" cy="8" rx="120" ry="44" fill="var(--mist)" />
    <ellipse cx="10" cy="-110" rx="60" ry="34" fill="var(--mist)" />
  </g>;
}

/** The water around a coast: a pale band of shallows, ripples spreading out, and foam at the waterline. */
function Shallows({ coast }: { coast: string }) {
  const shallowId = useId();
  return <>
    <defs><filter id={shallowId} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter></defs>
    <g transform={`translate(0,${SHORE_DEPTH})`}>
      <path d={coast} transform="scale(1.2)" fill="var(--shallow)" filter={`url(#${shallowId})`} />
      {RIPPLE_DELAYS.map(delay => <path key={delay} className="island-ripple" d={coast} fill="none" stroke="var(--foam)" strokeWidth="1.6" style={{ animationDelay: `${delay}s` }} />)}
      <path className="island-foam" d={coast} fill="none" stroke="var(--foam)" strokeWidth="5" strokeLinecap="round" />
    </g>
  </>;
}

const svgProps = { viewBox: ISLAND_VIEW_BOX, className: "block h-auto w-full overflow-visible", "aria-hidden": true } as const;

/** An island's water, drawn under every bridge so bridges cross over the shallows. */
export function IslandWater({ id }: { id: IslandId }) {
  return <svg {...svgProps}><Shallows coast={ISLAND_SHAPES[id].coast} /></svg>;
}

/** An island's land and landmark, with fog over it until the learner reaches it. */
type IslandLandProps = {
  id: IslandId; isFogged: boolean;
  /** Where bridges leave the island; seeded islets keep clear of them. */
  bridgeDirections: readonly Point[];
  /** Directions for the islets instead of seeded ones (Home's sits between two bridges). */
  isletDirections?: readonly Point[];
  /** What the landmark counts (see LandmarkProps); 0 for islands that count nothing. */
  tally?: number;
  /** How far the island has grown (see LandmarkProps). */
  stage?: number;
};

export function IslandLand({ id, isFogged, bridgeDirections, isletDirections, tally = 0, stage = 0 }: IslandLandProps) {
  const blurId = useId();
  const { coast, hill } = ISLAND_SHAPES[id];
  const islets = useMemo(() => {
    const coastOptions = ISLAND_COASTS[id];
    const places = isletDirections ? isletDirections.map(direction => isletToward(coastOptions, direction)) : isletPlacements(coastOptions, ISLETS_PER_ISLAND, bridgeDirections, ISLET_CLEARANCE);
    return places.map((place, index) => ({ ...place, coast: coastlinePath({ radiusX: 15, radiusY: 7, seed: coastOptions.seed * 7 + index }) }));
  }, [id, bridgeDirections, isletDirections]);
  const Landmark = LANDMARKS[id];
  return <svg {...svgProps}>
    <defs><filter id={blurId} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter></defs>
    <g className={isFogged ? "island-fogged-art" : undefined}>
      {islets.map(islet => <Islet key={`${islet.x},${islet.y}`} {...islet} />)}
      <Land coast={coast} hill={hill}><Landmark tally={tally} stage={stage} /></Land>
    </g>
    {isFogged && <Mist blurId={blurId} />}
  </svg>;
}
