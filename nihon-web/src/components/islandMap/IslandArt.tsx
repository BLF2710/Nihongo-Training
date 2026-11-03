import { useId, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
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

// Home grows with each JLPT level completed: the torii gains colour, rope, gold and a stone path, then glows, and a
// sheet is pinned to the notice board for each level.

// The JLPT levels completed at which each part of Home appears.
const HOME_STEPS = { vermilionGate: 1, gateRope: 2, goldenGate: 3, steppingStones: 4, glow: 5 } as const;
const STEPPING_STONES = [[0, 4], [-4, 16], [2, 28]] as const;
const SHIDE_AT = [-16, 0, 16] as const;

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

// The torii's two pillars (left edges); each stands on a round stone base.
const TORII_PILLARS = [-34, 26] as const;

function Torii({ stage }: LandmarkProps) {
  const pillars = stage >= HOME_STEPS.vermilionGate ? "var(--vermilion)" : "var(--wood)";
  const isGolden = stage >= HOME_STEPS.goldenGate;
  return <g transform="translate(0,-6)">
    {stage >= HOME_STEPS.glow && <circle className="island-summit-glow" cx="0" cy="-74" r="64" fill="var(--checkpoint-light)" />}
    {stage >= HOME_STEPS.steppingStones && STEPPING_STONES.map(([x, y]) => <ellipse key={y} cx={x} cy={y} rx="9" ry="3.5" fill="var(--stone)" {...ink} strokeWidth="1.2" />)}
    <Pine x={-62} y={-30} size={0.9} />
    <NoticeBoard x={62} y={26} sheets={Math.min(NOTICE_SHEETS.length, 1 + stage)} />
    <GroundShadow x={2} y={-2} rx={50} />
    {TORII_PILLARS.map(x => <g key={x}>
      <rect x={x} y="-80" width="8" height="76" fill={pillars} {...ink} />
      <rect x={x + 5} y="-79" width="3" height="74" fill="var(--ink)" opacity={SHADE} />
      <line x1={x + 2} y1="-78" x2={x + 2} y2="-8" stroke="var(--paper)" strokeWidth="1" opacity="0.35" />
      <Cylinder x={x + 4} y={-2} rx={6} height={5} fill="var(--slate)" />
    </g>)}
    <Box x={-46} y={-63} width={92} height={7} depth={6} fill={pillars} />
    {isGolden
      ? <rect x="-8" y="-84" width="16" height="15" rx="1.5" fill="var(--ink)" stroke="var(--gold)" strokeWidth="1.6" />
      : <rect x="-3" y="-80" width="6" height="10" fill={pillars} {...ink} />}
    {/* The kasagi: dipping in the middle, its ends swept up. */}
    <path d="M-62,-99 Q-30,-86 0,-88 Q30,-86 62,-99 L66,-102 Q34,-89 4,-91 Q-26,-89 -58,-102 Z" fill="var(--slate)" {...ink} />
    <path d="M-62,-99 Q-30,-86 0,-88 Q30,-86 62,-99 L57,-89 Q28,-79 0,-81 Q-28,-79 -57,-89 Z" fill="var(--ink)" {...ink} />
    {isGolden && <path d="M-62,-99 L-57,-89 L-52,-91 L-56,-100 Z M62,-99 L57,-89 L52,-91 L56,-100 Z" fill="var(--gold)" stroke="var(--ink)" strokeWidth="1" />}
    {stage >= HOME_STEPS.gateRope && <Shimenawa d="M-26,-60 Q0,-50 26,-60" shide={SHIDE_AT.map(x => [x, x === 0 ? -55 : -57] as const)} />}
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

// The pagoda keeps its height as it gains tiers (3, 4, then 5), so the spire stays inside the drawing. It stands on a
// stone podium at the end of a path from the bridge.
const PAGODA_HEIGHT = 60;
const PAGODA_SPIRE_RINGS = 5;
const PAGODA_LANTERN_SIZE = 0.42;
// How deep each tier's square plan is drawn, as a share of its half-width (the oblique view foreshortens depth).
const PAGODA_TIER_DEPTH = 0.9;
const PAGODA_PATH_STONES = [[0, 14, 9], [-3, 24, 10], [1, 34, 11]] as const;
const NOTICE_SHEETS = [{ x: -9, y: -27 }, { x: 1, y: -28 }, { x: -4, y: -19 }, { x: 6, y: -20 }] as const;

/** A roofed notice board with up to four sheets pinned to it. */
function NoticeBoard({ x, y, sheets }: { x: number; y: number; sheets: number }) {
  return <g transform={`translate(${x},${y})`}>
    <GroundShadow x={2} y={2} rx={16} />
    <Post x={-10} y={2} height={34} width={2.6} />
    <Post x={14} y={2} height={34} width={2.6} />
    <Box x={-14} y={-12} width={30} height={20} depth={3} fill="var(--wood)" />
    {NOTICE_SHEETS.slice(0, sheets).map(sheet => <g key={`${sheet.x}${sheet.y}`}>
      <rect x={sheet.x} y={sheet.y} width="7" height="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.6" />
      <path d={`M${sheet.x + 1.5},${sheet.y + 2.5} h4 M${sheet.x + 1.5},${sheet.y + 4.5} h3 M${sheet.x + 1.5},${sheet.y + 6.5} h4`} stroke="var(--ink)" strokeWidth="0.6" opacity="0.6" />
    </g>)}
    <HipRoof x={-18} y={-32} width={38} depth={6} height={7} ridge={0.6} fill="var(--slate)" />
  </g>;
}

function Pagoda({ stage }: LandmarkProps) {
  const tierCount = 3 + Math.min(stage, 2);
  const spacing = PAGODA_HEIGHT / (tierCount - 1);
  const k = spacing / 30;
  const tiers = Array.from({ length: tierCount }, (_, tier) => tier);
  const topY = -8 - (tierCount - 1) * spacing;
  const peak = topY - 34 * k;
  const metal = stage >= 3 ? "var(--gold)" : "var(--bronze)";
  return <g>
    {PAGODA_PATH_STONES.map(([x, y, rx]) => <g key={y}>
      <ellipse cx={x} cy={y + 1.5} rx={rx} ry={rx * 0.36} fill="var(--shore-dark)" {...ink} strokeWidth="1" />
      <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.36} fill="var(--stone)" {...ink} strokeWidth="1" />
    </g>)}
    <Pine x={-74} y={8} size={0.9} />
    <Pine x={-58} y={-18} size={0.65} />
    <Azalea x={-28} y={26} />
    <Azalea x={26} y={24} />
    <GroundShadow x={4} y={6} rx={44} />
    <Box x={-32} y={8} width={56} height={6} depth={16} fill="var(--stone)" />
    <g transform="translate(2,4)">
      {tiers.map(tier => {
        const y = -8 - tier * spacing, half = 26 - tier * (10 / (tierCount - 1)), roof = 44 - tier * (14 / (tierCount - 1));
        const depth = half * PAGODA_TIER_DEPTH;
        const back = { x: depth * DEPTH.x, y: depth * DEPTH.y };
        const lower = y - 20 * k, upper = y - 28 * k, crown = y - 40 * k;
        const eave = `M${-roof},${lower} Q0,${y - 36 * k} ${roof},${lower} L${roof - 9},${upper} Q0,${crown} ${-roof + 9},${upper} Z`;
        const roofTop = `M${-roof + 9},${upper} Q0,${crown} ${roof - 9},${upper} L${roof - 9 + back.x},${upper + back.y} Q${back.x},${crown + back.y} ${-roof + 9 + back.x},${upper + back.y} Z`;
        const roofSide = `M${roof},${lower} L${roof + back.x},${lower + back.y} L${roof - 9 + back.x},${upper + back.y} L${roof - 9},${upper} Z`;
        // Each tier is shifted so the centres of their square plans line up under the spire.
        return <g key={tier} transform={`translate(${-back.x / 2},${-back.y / 2})`}>
          <Box x={-half} y={y} width={half * 2} height={22 * k} depth={depth} fill="var(--paper)" />
          <path d={`M${-half * 0.3},${y - 3} v${-14 * k} h${half * 0.6} v${14 * k}`} fill="var(--vermilion)" opacity="0.85" />
          <path d={roofTop} fill="var(--slate)" {...ink} />
          <path d={roofTop} fill="var(--paper)" opacity={LIGHT} />
          <path d={roofSide} fill="var(--slate)" {...ink} />
          <path d={roofSide} fill="var(--ink)" opacity={SHADE} />
          <path d={eave} fill="var(--slate)" {...ink} />
          {[{ x: -roof, y: lower }, { x: roof, y: lower }, { x: roof + back.x, y: lower + back.y }].map(corner => <g key={corner.x}>
            <line x1={corner.x} y1={corner.y} x2={corner.x} y2={corner.y + 4 * k} stroke="var(--ink)" strokeWidth="0.8" />
            <circle cx={corner.x} cy={corner.y + 5 * k} r="1.8" fill={metal} stroke="var(--ink)" strokeWidth="0.6" />
          </g>)}
        </g>;
      })}
      <path d={`M-7,${peak + 1} Q0,${peak - 8} 7,${peak + 1} Z`} fill="var(--slate)" {...ink} strokeWidth="1.2" />
      <line x1="0" y1={peak - 4} x2="0" y2={peak - 38} {...ink} strokeWidth="2.5" />
      {Array.from({ length: PAGODA_SPIRE_RINGS }, (_, ring) => <ellipse key={ring} cx="0" cy={peak - 9 - ring * 6} rx="5" ry="1.6" fill={metal} {...ink} strokeWidth="0.9" />)}
      <circle cx="0" cy={peak - 41} r="3.2" fill={metal} {...ink} strokeWidth="1" />
    </g>
    {stage >= 3 && <><GardenLantern x={-44} y={20} size={PAGODA_LANTERN_SIZE} /><GardenLantern x={44} y={20} size={PAGODA_LANTERN_SIZE} /></>}
  </g>;
}

// Built things on Practice, Games and Review are drawn as solids in the islands' shallow oblique view: depth runs up and
// to the right, tops catch the light, right-hand sides are in shade, and each stands on a soft shadow.
const DEPTH = { x: 0.75, y: -0.5 } as const;
const SHADE = 0.25;
const LIGHT = 0.2;

type BoxProps = { x: number; y: number; width: number; height: number; depth: number; fill: string };

/** A block seen from the front and above: front face, lit top and shaded side. (x, y) is its front bottom-left corner. */
function Box({ x, y, width, height, depth, fill }: BoxProps) {
  const dx = depth * DEPTH.x;
  const dy = depth * DEPTH.y;
  const top = y - height;
  const right = x + width;
  const side = `M${right},${y} L${right + dx},${y + dy} L${right + dx},${top + dy} L${right},${top} Z`;
  const lid = `M${x},${top} L${right},${top} L${right + dx},${top + dy} L${x + dx},${top + dy} Z`;
  return <g>
    <path d={side} fill={fill} {...ink} strokeWidth="1.2" />
    <path d={side} fill="var(--ink)" opacity={SHADE} />
    <path d={lid} fill={fill} {...ink} strokeWidth="1.2" />
    <path d={lid} fill="var(--paper)" opacity={LIGHT} />
    <rect x={x} y={top} width={width} height={height} fill={fill} {...ink} strokeWidth="1.2" />
  </g>;
}

type RoofProps = { x: number; y: number; width: number; depth: number; height: number; ridge: number; fill: string };

/** A hipped roof over a width × depth frame whose front eave runs right from (x, y). `ridge` is the ridge's share of the
 *  width: 0 makes a pyramid roof. */
function HipRoof({ x, y, width, depth, height, ridge, fill }: RoofProps) {
  const dx = depth * DEPTH.x;
  const dy = depth * DEPTH.y;
  const centre = x + width / 2 + dx / 2;
  const ridgeY = y + dy / 2 - height;
  const half = (width * ridge) / 2;
  const front = `M${x},${y} L${x + width},${y} L${centre + half},${ridgeY} L${centre - half},${ridgeY} Z`;
  const side = `M${x + width},${y} L${x + width + dx},${y + dy} L${centre + half},${ridgeY} Z`;
  return <g>
    <path d={side} fill={fill} {...ink} strokeWidth="1.3" />
    <path d={side} fill="var(--ink)" opacity={SHADE} />
    <path d={front} fill={fill} {...ink} strokeWidth="1.3" />
    <path d={`M${x + 2},${y - 1.5} L${x + width - 2},${y - 1.5}`} stroke="var(--paper)" strokeWidth="1" opacity="0.35" />
  </g>;
}

/** A round wooden post, outlined in ink, from (x, y) up by `height`. */
function Post({ x, y, height, width = 3 }: { x: number; y: number; height: number; width?: number }) {
  return <g>
    <line x1={x} y1={y} x2={x} y2={y - height} stroke="var(--ink)" strokeWidth={width + 1.6} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x} y2={y - height} stroke="var(--wood)" strokeWidth={width} strokeLinecap="round" />
  </g>;
}

function GroundShadow({ x, y, rx }: { x: number; y: number; rx: number }) {
  return <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.3} fill="var(--ink)" opacity="0.15" />;
}

// Practice: a corner for each skill grows with that skill's sessions, around a bamboo grove at the back right. Listening
// (front right): a wind chime, a stone basin with a bamboo spout, then a deer scarer. Speaking (front): a stage floor,
// its roof, then a curtain and a banner. Reading (back left): a bench with an open book, a pavilion over it, then a
// stack of books.
const BAMBOO_STALKS = [{ x: -26, h: 112 }, { x: -6, h: 128 }, { x: 14, h: 120 }, { x: 34, h: 104 }, { x: -44, h: 96 }] as const;

function BambooGrove() {
  return <g transform="translate(40,-8)">
    <GroundShadow x={-4} y={-6} rx={50} />
    {BAMBOO_STALKS.map(({ x, h }) => <g key={x}>
      <line x1={x} y1="-6" x2={x} y2={-6 - h} stroke="var(--leaf)" strokeWidth="6" strokeLinecap="round" />
      <line x1={x + 1.5} y1="-6" x2={x + 1.5} y2={-6 - h} stroke="var(--ink)" strokeWidth="2" opacity={SHADE} />
      <line x1={x} y1="-6" x2={x} y2={-6 - h} stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
      {[0.35, 0.6, 0.85].map(share => <line key={share} x1={x - 3.5} y1={-6 - h * share} x2={x + 3.5} y2={-6 - h * share} stroke="var(--ink)" strokeWidth="1.3" />)}
      <path d={`M${x},${-4 - h} q12,-4 18,4 q-12,2 -18,-4 Z M${x},${2 - h} q-12,-6 -18,2 q12,2 18,-2 Z`} fill="var(--leaf)" {...ink} strokeWidth="1" />
    </g>)}
  </g>;
}

/** A short round thing (a stone basin, a drum) seen from above: its side, then its lit top. */
function Cylinder({ x, y, rx, height, fill }: { x: number; y: number; rx: number; height: number; fill: string }) {
  const ry = rx * 0.38;
  return <g transform={`translate(${x},${y})`}>
    <path d={`M${-rx},${-height} V0 A${rx},${ry} 0 0 0 ${rx},0 V${-height} Z`} fill={fill} {...ink} strokeWidth="1.3" />
    <path d={`M${rx * 0.3},${-height} V${ry * 0.9} A${rx},${ry} 0 0 0 ${rx},0 V${-height} Z`} fill="var(--ink)" opacity={SHADE} />
    <ellipse cy={-height} rx={rx} ry={ry} fill={fill} {...ink} strokeWidth="1.3" />
    <ellipse cy={-height} rx={rx} ry={ry} fill="var(--paper)" opacity={LIGHT} />
  </g>;
}

function ListeningCorner({ stage }: { stage: number }) {
  return <g transform="translate(56,4)">
    {stage >= 1 && <g>
      <GroundShadow x={-6} y={10} rx={10} />
      <Box x={-10} y={10} width={4} height={56} depth={3} fill="var(--wood)" />
      <Box x={-8} y={-41} width={24} height={3} depth={3} fill="var(--wood)" />
      <g className="island-chime">
        <line x1="12" y1="-41" x2="12" y2="-37" stroke="var(--ink)" strokeWidth="1" />
        <path d="M6,-29 Q6,-38 12,-38 Q18,-38 18,-29 Z" fill="var(--shallow)" {...ink} strokeWidth="1.2" />
        <path d="M8,-31 Q8.5,-35 11,-36" fill="none" stroke="var(--paper)" strokeWidth="1" opacity="0.8" />
        <line x1="12" y1="-29" x2="12" y2="-23" stroke="var(--ink)" strokeWidth="0.8" />
        <rect x="9.5" y="-23" width="5" height="9" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
      </g>
    </g>}
    {stage >= 2 && <g transform="translate(20,12)">
      <GroundShadow x={2} y={1} rx={13} />
      <Post x={-26} y={-6} height={14} width={2} />
      <path d="M-30,-20 L-6,-14" stroke="var(--ink)" strokeWidth="5.6" strokeLinecap="round" />
      <path d="M-30,-20 L-6,-14" stroke="var(--leaf)" strokeWidth="4" strokeLinecap="round" />
      <path d="M-30,-21 L-6,-15" stroke="var(--paper)" strokeWidth="0.8" opacity="0.5" />
      <Cylinder x={0} y={0} rx={10} height={6} fill="var(--stone)" />
      <ellipse cy="-5.6" rx="6" ry="2" fill="var(--onsen)" stroke="var(--ink)" strokeWidth="0.8" />
      <path d="M-6,-14 q3,3 4,8" fill="none" stroke="var(--foam)" strokeWidth="1.8" strokeLinecap="round" />
    </g>}
    {stage >= 3 && <g transform="translate(14,24) scale(0.8)">
      <GroundShadow x={2} y={3} rx={16} />
      <Box x={4} y={1} width={2.5} height={13} depth={2} fill="var(--wood)" />
      <path d="M-16,-2 L16,-12" stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" />
      <path d="M-16,-2 L16,-12" stroke="var(--leaf)" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M-15,-3.5 L15,-13" stroke="var(--paper)" strokeWidth="0.9" opacity="0.5" />
      <Box x={-6} y={3} width={2.5} height={13} depth={2} fill="var(--wood)" />
      <circle cx="-4.5" cy="-7.5" r="1.3" fill="var(--ink)" />
    </g>}
  </g>;
}

// The stage floor's depth, shared by its posts and roof.
const STAGE_DEPTH = 20;

function SpeakingCorner({ stage }: { stage: number }) {
  if (stage < 1) return null;
  const back = { x: STAGE_DEPTH * DEPTH.x, y: STAGE_DEPTH * DEPTH.y };
  return <g transform="translate(-8,28)">
    <GroundShadow x={10} y={6} rx={42} />
    <Box x={-28} y={6} width={56} height={7} depth={STAGE_DEPTH} fill="var(--wood)" />
    {stage >= 2 && <>
      <Post x={-24 + back.x} y={-1 + back.y} height={30} />
      <Post x={24 + back.x} y={-1 + back.y} height={30} />
    </>}
    {stage >= 3 && <g>
      <GroundShadow x={44} y={6} rx={8} />
      <Post x={42} y={6} height={52} width={2} />
      <rect x="43" y="-44" width="8" height="26" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1" />
      <rect x="43" y="-44" width="8" height="5" fill="var(--vermilion)" />
    </g>}
    {stage >= 2 && <>
      <Post x={-24} y={-1} height={30} />
      <Post x={24} y={-1} height={30} />
      {stage >= 3 && <g>
        <path d="M-24,-29 q12,9 24,0 q12,9 24,0" fill="none" stroke="var(--ink)" strokeWidth="5" />
        <path d="M-24,-29 q12,9 24,0 q12,9 24,0" fill="none" stroke="var(--vermilion)" strokeWidth="3.4" />
        <path d="M-24,-29 q12,9 24,0 q12,9 24,0" fill="none" stroke="var(--paper)" strokeWidth="3.4" strokeDasharray="4 4" />
      </g>}
      <HipRoof x={-32} y={-31} width={64} depth={STAGE_DEPTH} height={14} ridge={0.45} fill="var(--slate)" />
    </>}
  </g>;
}

// The reading pavilion's depth, shared by its platform, posts and roof.
const PAVILION_DEPTH = 18;
const BOOK_STACK = [{ y: 6, width: 9, fill: "var(--vermilion)" }, { y: 3, width: 8, fill: "var(--leaf)" }, { y: 0, width: 7, fill: "var(--slate)" }] as const;

function ReadingCorner({ stage }: { stage: number }) {
  if (stage < 1) return null;
  const back = { x: PAVILION_DEPTH * DEPTH.x, y: PAVILION_DEPTH * DEPTH.y };
  const hasPavilion = stage >= 2;
  return <g transform="translate(-62,-16)">
    <GroundShadow x={6} y={10} rx={hasPavilion ? 32 : 16} />
    {hasPavilion && <>
      <Box x={-22} y={10} width={40} height={4} depth={PAVILION_DEPTH} fill="var(--stone)" />
      <Post x={-19 + back.x} y={6 + back.y} height={30} />
      <Post x={15 + back.x} y={6 + back.y} height={30} />
    </>}
    <Box x={-11} y={4} width={22} height={5} depth={8} fill="var(--wood)" />
    <path d="M-5,-2 Q-2.5,-5 0,-2.5 Q2.5,-5 5,-2 L5,-1 Q2.5,-3.5 0,-1.5 Q-2.5,-3.5 -5,-1 Z" transform="translate(3,-1)" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
    {stage >= 3 && BOOK_STACK.map(book => <Box key={book.y} x={14} y={book.y} width={book.width} height={3} depth={5} fill={book.fill} />)}
    {hasPavilion && <>
      <Post x={-19} y={6} height={30} />
      <Post x={15} y={6} height={30} />
      <HipRoof x={-26} y={-24} width={46} depth={PAVILION_DEPTH} height={16} ridge={0} fill="var(--slate)" />
      <circle cx={-3 + back.x / 2} cy={-24 + back.y / 2 - 17} r="2.4" fill="var(--slate)" {...ink} strokeWidth="1" />
    </>}
  </g>;
}

function PracticeGrounds({ trackStages }: LandmarkProps) {
  const [listening = 0, speaking = 0, reading = 0] = trackStages;
  return <g>
    <ReadingCorner stage={reading} />
    <BambooGrove />
    <ListeningCorner stage={listening} />
    <SpeakingCorner stage={speaking} />
  </g>;
}

// Games: a summer festival that builds up as games are played: the lanterns light, then a food stall opens, a taiko
// drum arrives, and a goldfish-scooping pool, with fireworks at night.
const GAME_LANTERNS = [-26, 0, 26] as const;
const FESTIVAL_STEPS = { lanternsLit: 1, foodStall: 2, taiko: 3, goldfish: 4 } as const;
const GOLDFISH = [[-8, 1, 20], [6, -1, -15], [12, 3, 160]] as const;
const FIREWORKS = [{ x: -54, y: -136, color: "var(--checkpoint-light)", delay: 0 }, { x: 44, y: -150, color: "var(--blossom)", delay: -1.1 }, { x: 78, y: -112, color: "var(--shallow)", delay: -2.2 }] as const;
const FIREWORK_RAYS = Array.from({ length: 12 }, (_, index) => (index / 12) * Math.PI * 2);
const STALL_DEPTH = 12;
// The lantern string stands at the back of the island, leaving the front for the stall, drum and pool.
const LANTERN_STRING_SHIFT = -10;
const AWNING_STRIPES = [-22, -12, -2, 8] as const;

function FoodStall() {
  const back = { x: STALL_DEPTH * DEPTH.x, y: STALL_DEPTH * DEPTH.y };
  const awningAt = (x: number) => `M${x},-30 L${x + 5},-30 L${x + 5 + back.x},${-36 + back.y} L${x + back.x},${-36 + back.y} Z`;
  return <g transform="translate(-70,22) scale(1.15)">
    <GroundShadow x={4} y={2} rx={26} />
    <Post x={-16 + back.x} y={2 + back.y} height={36} width={2.4} />
    <Post x={12 + back.x} y={2 + back.y} height={36} width={2.4} />
    <Box x={-18} y={2} width={32} height={14} depth={STALL_DEPTH} fill="var(--wood)" />
    <Post x={-16} y={2} height={32} width={2.4} />
    <Post x={12} y={2} height={32} width={2.4} />
    <path d={`M-22,-30 L18,-30 L${18 + back.x},${-36 + back.y} L${-22 + back.x},${-36 + back.y} Z`} fill="var(--paper)" {...ink} strokeWidth="1.2" />
    {AWNING_STRIPES.map(x => <path key={x} d={awningAt(x)} fill="var(--vermilion)" />)}
    <path d={`M-22,-30 L18,-30 L${18 + back.x},${-36 + back.y} L${-22 + back.x},${-36 + back.y} Z`} fill="none" {...ink} strokeWidth="1.2" />
    <rect x="-22" y="-30" width="40" height="5" fill="var(--paper)" {...ink} strokeWidth="1.1" />
    {AWNING_STRIPES.map(x => <rect key={x} x={x} y="-30" width="5" height="5" fill="var(--vermilion)" />)}
    <rect x="-22" y="-30" width="40" height="5" fill="none" {...ink} strokeWidth="1.1" />
  </g>;
}

function TaikoDrum() {
  return <g transform="translate(66,16) scale(1.25)">
    <GroundShadow x={0} y={4} rx={16} />
    <path d="M-6,0 L-2,-10 M10,-2 L6,-11" stroke="var(--wood)" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M-11,-31 Q-15,-20 -11,-9 L11,-9 Q15,-20 11,-31 Z" fill="var(--vermilion)" {...ink} strokeWidth="1.4" />
    <path d="M4,-31 Q8,-20 4,-9 L11,-9 Q15,-20 11,-31 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-8,-29 Q-10,-20 -8,-11" fill="none" stroke="var(--paper)" strokeWidth="1.2" opacity="0.45" />
    {[-7, -2, 3, 8].map(x => <circle key={x} cx={x} cy="-12.5" r="0.9" fill="var(--gold)" />)}
    <ellipse cx="0" cy="-31" rx="11" ry="3.6" fill="var(--paper)" {...ink} strokeWidth="1.2" />
    <path d="M-14,4 L-8,-12 M14,4 L8,-12" stroke="var(--ink)" strokeWidth="4.4" strokeLinecap="round" />
    <path d="M-14,4 L-8,-12 M14,4 L8,-12" stroke="var(--wood)" strokeWidth="3" strokeLinecap="round" />
    <line x1="14" y1="-41" x2="4" y2="-32" stroke="var(--wood)" strokeWidth="2" strokeLinecap="round" />
  </g>;
}

function GoldfishPool() {
  return <g transform="translate(0,24) scale(1.1)">
    <ellipse cy="1.5" rx="28" ry="9.5" fill="var(--stone)" {...ink} strokeWidth="1.4" />
    <ellipse rx="28" ry="9" fill="var(--stone)" {...ink} strokeWidth="1.4" />
    <ellipse rx="28" ry="9" fill="var(--paper)" opacity={LIGHT} />
    <ellipse cy="0.5" rx="23.5" ry="6.6" fill="var(--onsen-deep)" stroke="var(--ink)" strokeWidth="1" />
    <ellipse cy="2" rx="22.5" ry="5.2" fill="var(--onsen)" />
    {GOLDFISH.map(([x, y, angle]) => <path key={x} d="M-3,0 Q0,-2.2 3,0 Q0,2.2 -3,0 Z M-3,0 l-2.5,-2 l0,4 Z" fill="var(--lantern)" transform={`translate(${x},${y}) rotate(${angle})`} />)}
  </g>;
}

function Fireworks() {
  return <g className="island-fireworks">
    {FIREWORKS.map(burst => <g key={burst.x} transform={`translate(${burst.x},${burst.y})`}>
      <g className="island-firework" style={{ animationDelay: `${burst.delay}s` }}>
        {FIREWORK_RAYS.map(angle => <line key={angle} x1={Math.cos(angle) * 6} y1={Math.sin(angle) * 6} x2={Math.cos(angle) * 17} y2={Math.sin(angle) * 17} stroke={burst.color} strokeWidth="2" strokeLinecap="round" />)}
      </g>
    </g>)}
  </g>;
}

function Festival({ stage }: LandmarkProps) {
  const isLit = stage >= FESTIVAL_STEPS.lanternsLit;
  return <g>
    {stage >= FESTIVAL_STEPS.goldfish && <Fireworks />}
    <g transform={`translate(0,${LANTERN_STRING_SHIFT})`}>
    <GroundShadow x={-50} y={8} rx={8} />
    <GroundShadow x={54} y={8} rx={8} />
    <Box x={-55} y={8} width={5} height={104} depth={3} fill="var(--wood)" />
    <Box x={49} y={8} width={5} height={104} depth={3} fill="var(--wood)" />
    <path d="M-52,-92 Q0,-64 52,-92" fill="none" {...ink} strokeWidth="1.5" />
    {GAME_LANTERNS.map((x, index) => {
      const y = -80 + (x === 0 ? 14 : 8);
      return <g key={x}>
        {isLit && <circle className="island-lantern-lit" cx={x} cy={y + 12} r="22" fill="var(--lantern)" style={{ animationDelay: `${index * 0.7}s` }} />}
        <ellipse cx={x} cy={y + 12} rx="11" ry="14" fill={isLit ? "var(--lantern)" : "var(--paper)"} {...ink} strokeWidth="1.5" />
        <path d={`M${x + 3},${y} Q${x + 12},${y + 12} ${x + 3},${y + 25}`} fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.35" />
        <rect x={x - 6} y={y - 3} width="12" height="4" fill="var(--ink)" />
        <rect x={x - 6} y={y + 25} width="12" height="4" fill="var(--ink)" />
      </g>;
    })}
    </g>
    {stage >= FESTIVAL_STEPS.foodStall && <FoodStall />}
    {stage >= FESTIVAL_STEPS.taiko && <TaikoDrum />}
    {stage >= FESTIVAL_STEPS.goldfish && <GoldfishPool />}
  </g>;
}

// Review: a raked gravel garden under a maple. Its raking spreads with cards learned (rings, then a pebble border) and
// moss and rocks settle with mature cards. Fallen maple leaves lie on the gravel for the cards due today, one for every
// few, and are gone once they are reviewed.
const GRAVEL = { cx: 22, cy: 10, rx: 56, ry: 22 } as const;
const GRAVEL_EDGE = 3;
const RAKED_RINGS = [16, 26, 36] as const;
const CARDS_PER_LEAF = 5;
const FALLEN_LEAVES = [[-14, 8, 20], [52, 4, -30], [36, 22, 70], [-24, 16, -60], [62, 16, 10], [4, 24, 120], [44, -6, 200], [-4, -4, 40]] as const;
const LEAF_PATH = "M0,-4 Q3.4,-1 0,4 Q-3.4,-1 0,-4 Z M0,-3 L0,5";
const GRAVEL_PEBBLES = Array.from({ length: 16 }, (_, index) => (index / 16) * Math.PI * 2);
const MAPLE_CANOPY = scallopedPath({ cx: 0, cy: -46, rx: 22, ry: 16, bumps: 9 });
const MAPLE_SHADE = scallopedPath({ cx: 6, cy: -40, rx: 15, ry: 9, bumps: 7 });
const MAPLE_LIGHT = scallopedPath({ cx: -7, cy: -52, rx: 10, ry: 6, bumps: 6 });

/** A garden rock: a lit face and a shaded one, bedded in moss when `isMossy`. */
function GardenRock({ x, y, size, isMossy }: { x: number; y: number; size: number; isMossy: boolean }) {
  return <g transform={`translate(${x},${y}) scale(${size})`}>
    {isMossy ? <ellipse cx="0" cy="2" rx="14" ry="5" fill="var(--leaf)" {...ink} strokeWidth="1.2" /> : <GroundShadow x={1} y={2} rx={12} />}
    <path d="M-8,2 q2,-12 9,-11 q8,1 6,11 Z" fill="var(--slate)" {...ink} />
    <path d="M2,-9 q6,2 5,11 L1,2 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-6,0 q2,-8 6,-9" fill="none" stroke="var(--paper)" strokeWidth="1.2" opacity="0.35" />
  </g>;
}

function ZenGarden({ tally, trackStages }: LandmarkProps) {
  const [learned = 0, mature = 0] = trackStages;
  const leaves = Math.min(FALLEN_LEAVES.length, Math.ceil(tally / CARDS_PER_LEAF));
  return <g>
    <g transform="translate(-86,-16)">
      <GroundShadow x={4} y={0} rx={20} />
      <path d="M-2,0 C-1,-14 -3,-24 0,-34 M0,-26 C6,-30 10,-36 12,-42" fill="none" stroke="var(--wood)" strokeWidth="4" strokeLinecap="round" />
      <path d={MAPLE_CANOPY} fill="var(--maple)" {...ink} strokeWidth="1.5" />
      <path d={MAPLE_SHADE} fill="var(--ink)" opacity="0.18" />
      <path d={MAPLE_LIGHT} fill="var(--paper)" opacity="0.3" />
    </g>
    <ellipse cx={GRAVEL.cx} cy={GRAVEL.cy + GRAVEL_EDGE} rx={GRAVEL.rx} ry={GRAVEL.ry} fill="var(--shore-dark)" {...ink} strokeWidth="1.4" />
    <ellipse {...GRAVEL} fill="var(--sand)" {...ink} strokeWidth="1.4" />
    {RAKED_RINGS.slice(0, 1 + Math.min(learned, 2)).map(r => <ellipse key={r} cx="24" cy="8" rx={r} ry={r * 0.42} fill="none" stroke="var(--shore-dark)" strokeWidth="1.4" />)}
    {learned >= 3 && GRAVEL_PEBBLES.map(angle => <circle key={angle} cx={GRAVEL.cx + Math.cos(angle) * GRAVEL.rx} cy={GRAVEL.cy + Math.sin(angle) * GRAVEL.ry} r="2.6" fill="var(--stone)" stroke="var(--ink)" strokeWidth="0.8" />)}
    <GardenRock x={22} y={6} size={1.25} isMossy={mature >= 1} />
    {mature >= 2 && <GardenRock x={58} y={14} size={0.9} isMossy />}
    {mature >= 3 && <GardenRock x={-18} y={14} size={0.7} isMossy />}
    {FALLEN_LEAVES.slice(0, leaves).map(([x, y, angle]) => <path key={`${x}${y}`} d={LEAF_PATH} fill="var(--maple)" stroke="var(--ink)" strokeWidth="0.6" transform={`translate(${GRAVEL.cx + x - 20},${GRAVEL.cy + y - 8}) rotate(${angle}) scale(1.8)`} />)}
    <GardenLantern x={-46} y={6} size={0.85} />
  </g>;
}

/** A stone lantern built of blocks; its window glows at night. */
function GardenLantern({ x, y, size }: { x: number; y: number; size: number }) {
  return <g transform={`translate(${x},${y}) scale(${size})`}>
    <GroundShadow x={2} y={0} rx={14} />
    <circle className="island-lantern-glow" cx="2" cy="-42" r="18" fill="var(--lantern)" opacity="0.5" />
    <Box x={-6} y={0} width={12} height={24} depth={6} fill="var(--paper)" />
    <Box x={-14} y={-24} width={28} height={10} depth={8} fill="var(--paper)" />
    <Box x={-10} y={-34} width={20} height={16} depth={6} fill="var(--paper)" />
    <rect x="-6" y="-46" width="12" height="8" fill="var(--lantern)" opacity="0.8" />
    <HipRoof x={-20} y={-50} width={40} depth={10} height={14} ridge={0} fill="var(--slate)" />
    <circle cx={3.75} cy={-69} r="4" fill="var(--slate)" {...ink} />
  </g>;
}

const SCROLL_FONT = "'Noto Serif JP', 'Yu Mincho', serif";
const PRACTICE_SHEETS = [{ x: -40, y: 26, angle: -8 }, { x: -18, y: 30, angle: 6 }] as const;
const BRUSHES = [-2, 0, 2.2] as const;

/** A hanging scroll: wooden rollers with round ends at top and bottom, paper between, with a soft shadow behind. */
function HangingScroll({ x, top, width, height, children }: { x: number; top: number; width: number; height: number; children?: ReactNode }) {
  const left = x - width / 2;
  return <g>
    <rect x={left + 3} y={top + 4} width={width} height={height} fill="var(--ink)" opacity="0.15" />
    <rect x={left} y={top} width={width} height={height} fill="var(--paper)" {...ink} strokeWidth="1.4" />
    <rect x={left + 2} y={top + 2} width={width - 4} height={height * 0.12} fill="var(--shore)" opacity="0.6" />
    {children}
    {[top - 1, top + height + 1].map(y => <g key={y}>
      <line x1={left - 3} y1={y} x2={left + width + 3} y2={y} stroke="var(--ink)" strokeWidth="4.6" strokeLinecap="round" />
      <line x1={left - 3} y1={y} x2={left + width + 3} y2={y} stroke="var(--wood)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={left - 4} cy={y} r="2.4" fill="var(--wood)" {...ink} strokeWidth="1" />
      <circle cx={left + width + 4} cy={y} r="2.4" fill="var(--wood)" {...ink} strokeWidth="1" />
    </g>)}
  </g>;
}

function ScrollRack({ characters }: { characters: readonly string[] }) {
  return <g transform="translate(-70,-12)">
    <GroundShadow x={2} y={0} rx={20} />
    <Post x={-16} y={0} height={66} width={3} />
    <Post x={16} y={0} height={66} width={3} />
    <Box x={-20} y={-64} width={40} height={4} depth={4} fill="var(--wood)" />
    {characters.map((character, index) => <g key={character}>
      <line x1={-8 + index * 16} y1="-64" x2={-8 + index * 16} y2="-60" stroke="var(--ink)" strokeWidth="0.8" />
      <HangingScroll x={-8 + index * 16} top={-58} width={12} height={36}>
        <text x={-8 + index * 16} y="-34" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)" fontFamily={SCROLL_FONT}>{character}</text>
      </HangingScroll>
    </g>)}
  </g>;
}

function WritingDesk({ hasSealBox }: { hasSealBox: boolean }) {
  return <g transform="translate(30,22)">
    <GroundShadow x={14} y={0} rx={30} />
    <Box x={-4} y={12} width={18} height={3} depth={10} fill="var(--vermilion)" />
    <Box x={-10} y={0} width={42} height={8} depth={14} fill="var(--wood)" />
    <path d="M-4,-10 L14,-10 L19,-15 L1,-15 Z" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.8" />
    <path d="M5,-11 q2,-2 4,-1 M6,-13 l3,0" stroke="var(--ink)" strokeWidth="0.9" fill="none" />
    <Box x={20} y={-9} width={8} height={2.5} depth={6} fill="var(--slate)" />
    <Cylinder x={34} y={-12} rx={3} height={8} fill="var(--bronze)" />
    {BRUSHES.map(dx => <line key={dx} x1={34 + dx} y1="-20" x2={34 + dx * 2} y2="-27" stroke="var(--wood)" strokeWidth="1.2" strokeLinecap="round" />)}
    <line x1="-2" y1="-9" x2="16" y2="-17" stroke="var(--wood)" strokeWidth="1.4" strokeLinecap="round" />
    {hasSealBox && <Box x={22} y={-14} width={4} height={3} depth={4} fill="var(--vermilion)" />}
  </g>;
}

/** Kanji: a calligraphy corner. The character is faint until the first step, then inked, and practice sheets lie on
 *  the grass; a drying rack holds more scrolls at the next steps, and a red seal is stamped at the last. */
function Scroll({ stage }: LandmarkProps) {
  const rackScrolls = ["字", "書"].slice(0, Math.max(0, stage - 1));
  return <g>
    <Pine x={70} y={-14} size={0.7} />
    {rackScrolls.length > 0 && <ScrollRack characters={rackScrolls} />}
    <g transform="translate(6,-4)">
      <GroundShadow x={3} y={0} rx={36} />
      <Box x={-36} y={0} width={6} height={4} depth={8} fill="var(--stone)" />
      <Box x={30} y={0} width={6} height={4} depth={8} fill="var(--stone)" />
      <Post x={-33} y={-3} height={106} width={5} />
      <Post x={33} y={-3} height={106} width={5} />
      <Box x={-42} y={-108} width={84} height={5} depth={5} fill="var(--wood)" />
      <line x1="0" y1="-103" x2="0" y2="-99" stroke="var(--ink)" strokeWidth="1" />
      <HangingScroll x={0} top={-97} width={44} height={74}>
        <text x="0" y="-46" textAnchor="middle" fontSize="36" fontWeight="700" fill="var(--ink)" opacity={stage >= 1 ? 1 : 0.3} fontFamily={SCROLL_FONT}>漢</text>
        {stage >= 3 && <rect x="9" y="-37" width="9" height="9" rx="1.5" fill="var(--vermilion)" />}
      </HangingScroll>
    </g>
    {stage >= 1 && PRACTICE_SHEETS.map(sheet => <g key={sheet.x} transform={`translate(${sheet.x},${sheet.y}) rotate(${sheet.angle})`}>
      <path d="M-8,0 L8,0 L11,-5 L-5,-5 Z" fill="var(--paper)" {...ink} strokeWidth="0.9" />
      <path d="M-2,-1.5 q2,-2 4,-1 M1,-3.5 l2,0" stroke="var(--ink)" strokeWidth="0.8" fill="none" />
      <ellipse cx="-6" cy="-1" rx="2.4" ry="1.4" fill="var(--stone)" stroke="var(--ink)" strokeWidth="0.6" />
    </g>)}
    <WritingDesk hasSealBox={stage >= 3} />
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
/** `stage`: how far the island has grown (lib/islandGrowth.ts), all its growth tracks added up; JLPT levels completed
 *  (0–5) for Home. `trackStages`: each track's own step, for islands that grow in several ways (Practice's skills,
 *  Review's cards learned and mature cards). Review's tally is the cards due today. */
type LandmarkProps = { tally: number; stage: number; trackStages: readonly number[] };

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
const PIER_POSTS = [[80, 24], [104, 34], [128, 44]] as const;
const PIER_PLANKS = [72, 86, 100, 114, 128] as const;
const NET_MESH = "M-10,-30 L10,-14 M-4,-30 L10,-19 M2,-30 L10,-24 M-10,-24 L4,-14 M-10,-19 L-2,-14 M10,-30 L-10,-14 M4,-30 L-10,-19 M-2,-30 L-10,-24 M10,-24 L-4,-14 M10,-19 L2,-14";

function Lighthouse() {
  return <g>
    <GroundShadow x={-58} y={0} rx={22} />
    <Box x={-76} y={2} width={28} height={6} depth={10} fill="var(--stone)" />
    <path d="M-72,-4 L-52,-4 L-56,-78 L-68,-78 Z" fill="var(--paper)" {...ink} />
    <path d="M-70.8,-24 L-53.2,-24 L-53.9,-36 L-70.1,-36 Z M-69.6,-50 L-54.4,-50 L-55,-62 L-69,-62 Z" fill="var(--vermilion)" />
    <path d="M-60,-4 L-52,-4 L-56,-78 L-61,-78 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-68,-8 L-65,-74" stroke="var(--paper)" strokeWidth="1.4" opacity="0.5" />
    <Box x={-72} y={-76} width={20} height={3} depth={6} fill="var(--slate)" />
    <rect x="-69" y="-91" width="14" height="13" fill="var(--lantern)" {...ink} strokeWidth="1.5" />
    <path d="M-64,-91 v13 M-59,-91 v13" stroke="var(--ink)" strokeWidth="1" />
    <HipRoof x={-73} y={-91} width={22} depth={6} height={13} ridge={0} fill="var(--slate)" />
  </g>;
}

function Pier() {
  return <g>
    {PIER_POSTS.map(([x, y]) => <g key={x}>
      <line x1={x} y1={y} x2={x - 4} y2={y + 9} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <line x1={x} y1={y} x2={x - 4} y2={y + 9} stroke="var(--wood)" strokeWidth="2.4" strokeLinecap="round" />
    </g>)}
    <path d="M58,20 L128,52 L128,56 L58,24 Z" fill="var(--wood)" {...ink} strokeWidth="1.2" />
    <path d="M58,20 L128,52 L128,56 L58,24 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M58,20 L70,14 L140,44 L128,52 Z" fill="var(--wood)" {...ink} strokeWidth="1.5" />
    <path d="M58,20 L70,14 L140,44 L128,52 Z" fill="var(--paper)" opacity={LIGHT} />
    {PIER_PLANKS.map(x => <line key={x} x1={x - 1} y1={(x - 58) * 0.457 + 20} x2={x + 11} y2={(x - 58) * 0.457 + 14} stroke="var(--ink)" strokeWidth="0.7" opacity="0.4" />)}
  </g>;
}

function MooredBoat({ x, y }: { x: number; y: number }) {
  return <g transform={`translate(${x},${y})`}>
    <path d="M-13,0 L13,0 L8,7 L-8,7 Z" fill="var(--wood)" {...ink} strokeWidth="1.2" />
    <path d="M3,0 L13,0 L8,7 L2,7 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-11,0 L11,0 L9,2.2 L-9,2.2 Z" fill="var(--ink)" opacity="0.3" />
    <line x1="0" y1="0" x2="0" y2="-16" {...ink} strokeWidth="1.2" />
    <path d="M1,-15 L10,-3 L1,-3 Z" fill="var(--paper)" {...ink} strokeWidth="1" />
  </g>;
}

/** The harbour town: a lighthouse, two houses, a red post box for messages, a bench, a net drying, and crates and a
 *  barrel by the pier, where a boat moors for each friend who studied today (`tally`). */
function HarbourTown({ tally }: LandmarkProps) {
  return <g>
    <Pier />
    {PIER_MOORINGS.slice(0, tally).map(mooring => <MooredBoat key={mooring.x} {...mooring} />)}
    <g transform="translate(-62,-85)">
      <g className="island-lighthouse-beam"><path d="M0,0 L120,-18 L120,18 Z M0,0 L-120,-18 L-120,18 Z" fill="var(--lantern)" /></g>
    </g>
    <g transform="translate(-96,-14)">
      <GroundShadow x={0} y={0} rx={14} />
      <Post x={-10} y={0} height={32} width={2.2} />
      <Post x={10} y={0} height={32} width={2.2} />
      <path d="M-11,-31 L11,-31" stroke="var(--wood)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-10,-30 L10,-30 L10,-14 Q0,-10 -10,-14 Z" fill="var(--shallow)" opacity="0.35" />
      <path d={NET_MESH} stroke="var(--ink)" strokeWidth="0.6" opacity="0.55" />
    </g>
    <Pine x={-104} y={12} size={0.65} />
    <Lighthouse />
    <GroundShadow x={14} y={-4} rx={30} />
    <Box x={-8} y={-6} width={34} height={22} depth={16} fill="var(--paper)" />
    <rect x="4" y="-18" width="8" height="12" fill="var(--wood)" {...ink} strokeWidth="1" />
    <rect x="16" y="-21" width="6" height="6" fill="var(--shallow)" {...ink} strokeWidth="1" />
    <HipRoof x={-12} y={-28} width={42} depth={16} height={14} ridge={0.4} fill="var(--slate)" />
    <GroundShadow x={46} y={6} rx={20} />
    <Box x={30} y={6} width={26} height={18} depth={12} fill="var(--paper)" />
    <rect x="35" y="-7" width="7" height="7" fill="var(--shallow)" {...ink} strokeWidth="1" />
    <rect x="46" y="-6" width="6" height="12" fill="var(--wood)" {...ink} strokeWidth="1" />
    <HipRoof x={27} y={-12} width={32} depth={12} height={12} ridge={0.3} fill="var(--vermilion)" />
    <g transform="translate(14,22)">
      <GroundShadow x={1} y={0} rx={6} />
      <Cylinder x={0} y={0} rx={3.6} height={13} fill="var(--vermilion)" />
      <line x1="-2" y1="-9" x2="2" y2="-9" stroke="var(--ink)" strokeWidth="1" />
    </g>
    <g transform="translate(-34,26)">
      <GroundShadow x={6} y={0} rx={14} />
      <Box x={-8} y={0} width={22} height={4} depth={6} fill="var(--wood)" />
    </g>
    <g transform="translate(70,10)">
      <GroundShadow x={6} y={0} rx={14} />
      <Box x={-4} y={0} width={9} height={8} depth={7} fill="var(--wood)" />
      <Box x={-3} y={-8} width={8} height={7} depth={6} fill="var(--wood)" />
      <Cylinder x={16} y={1} rx={4} height={9} fill="var(--wood)" />
      <path d="M12,-2 h8 M12,-6 h8" stroke="var(--ink)" strokeWidth="0.8" opacity="0.6" />
    </g>
  </g>;
}

const TEAHOUSE_DEPTH = 18;
const TEA_PATH_STONES = [[-20, 12, 6], [-13, 21, 7], [-6, 30, 7]] as const;

function TeaHouseBuilding() {
  return <g transform="translate(-22,-4)">
    <GroundShadow x={6} y={6} rx={48} />
    <Box x={-40} y={6} width={62} height={6} depth={TEAHOUSE_DEPTH} fill="var(--wood)" />
    <Box x={-34} y={-2} width={50} height={24} depth={12} fill="var(--paper)" />
    <path d="M-22,-26 v24 M-10,-26 v24 M2,-26 v24 M-34,-14 h50" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
    <rect x="-6" y="-24" width="10" height="9" fill="var(--slate)" />
    <HipRoof x={-46} y={-26} width={72} depth={TEAHOUSE_DEPTH} height={18} ridge={0.4} fill="var(--slate)" />
  </g>;
}

/** An open-air tea set (nodate): a red bench under a paper parasol, with a bowl and a kettle. */
function OpenAirTea() {
  return <g transform="translate(46,4)">
    <GroundShadow x={0} y={6} rx={24} />
    <Box x={-16} y={8} width={28} height={5} depth={10} fill="var(--vermilion)" />
    <ellipse cx="-6" cy="0" rx="3" ry="1.4" fill="var(--paper)" stroke="var(--ink)" strokeWidth="0.7" />
    <path d="M-9,0 q3,4 6,0" fill="var(--leaf)" stroke="var(--ink)" strokeWidth="0.7" />
    <Cylinder x={4} y={1} rx={3} height={4} fill="var(--slate)" />
    <line x1="2" y1="4" x2="-4" y2="-58" stroke="var(--ink)" strokeWidth="2.6" />
    <line x1="2" y1="4" x2="-4" y2="-58" stroke="var(--wood)" strokeWidth="1.2" />
    <path d="M-36,-50 Q-6,-76 24,-50 Q-6,-58 -36,-50 Z" fill="var(--vermilion)" {...ink} strokeWidth="1.5" />
    <path d="M-6,-64 Q8,-62 24,-50 Q8,-56 -6,-56 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-5,-63 L-28,-51 M-5,-63 L-14,-54 M-5,-63 L4,-54 M-5,-63 L16,-51" stroke="var(--paper)" strokeWidth="0.7" opacity="0.6" />
  </g>;
}

/** The tea house: a tea room on a veranda, stepping stones, a stone basin with a ladle, a stone lantern, a pine and a
 *  flowering bush, with an open-air tea set beside it. */
function TeaHouse() {
  return <g>
    <Pine x={-58} y={-24} size={0.6} />
    <Azalea x={20} y={-22} />
    <TeaHouseBuilding />
    {TEA_PATH_STONES.map(([x, y, rx]) => <g key={y}>
      <ellipse cx={x} cy={y + 1.2} rx={rx} ry={rx * 0.36} fill="var(--shore-dark)" {...ink} strokeWidth="0.9" />
      <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.36} fill="var(--stone)" {...ink} strokeWidth="0.9" />
    </g>)}
    <g transform="translate(-66,18)">
      <GroundShadow x={1} y={1} rx={9} />
      <Cylinder x={0} y={0} rx={7} height={6} fill="var(--stone)" />
      <ellipse cy="-6" rx="4" ry="1.4" fill="var(--onsen)" stroke="var(--ink)" strokeWidth="0.6" />
      <path d="M-2,-7 L6,-12" stroke="var(--wood)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    <GardenLantern x={-80} y={4} size={0.55} />
    <OpenAirTea />
  </g>;
}

// The bell tower's legs splay out to its base; the back pair stands this far behind the front pair.
const TOWER_LEGS = "M-24,-10 L-17,-112 M24,-10 L17,-112";
const TOWER_BACK = { x: 6, y: -4 } as const;

/** A time bell tower (toki no kane): a wooden tower whose bell swings when the map's time of day changes (`tally`). */
function TimeBellTower({ tally }: Pick<LandmarkProps, "tally">) {
  return <g transform="translate(-34,0)">
    <GroundShadow x={4} y={2} rx={40} />
    <Box x={-30} y={2} width={60} height={12} depth={12} fill="var(--slate)" />
    <g transform={`translate(${TOWER_BACK.x},${TOWER_BACK.y})`}>
      <path d={TOWER_LEGS} stroke="var(--ink)" strokeWidth="7.6" strokeLinecap="round" />
      <path d={TOWER_LEGS} stroke="var(--wood)" strokeWidth="6" strokeLinecap="round" />
      <path d={TOWER_LEGS} stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" opacity={SHADE} />
    </g>
    <path d={TOWER_LEGS} stroke="var(--ink)" strokeWidth="7.6" strokeLinecap="round" />
    <path d={TOWER_LEGS} stroke="var(--wood)" strokeWidth="6" strokeLinecap="round" />
    <path d="M-22,-40 L20,-62 M22,-40 L-20,-62" stroke="var(--wood)" strokeWidth="2.5" />
    <Box x={-27} y={-59} width={54} height={7} depth={8} fill="var(--wood)" />
    <path d="M-27,-66 v-5 M-13,-66 v-5 M0,-66 v-5 M13,-66 v-5 M27,-66 v-5 M-27,-71 h54" stroke="var(--ink)" strokeWidth="1.2" />
    <Box x={-20} y={-109} width={40} height={5} depth={6} fill="var(--wood)" />
    <g key={tally} className="island-bell-swing">
      <line x1="0" y1="-109" x2="0" y2="-104" {...ink} strokeWidth="1.5" />
      <path d="M-9,-104 Q-10,-96 -12,-84 L12,-84 Q10,-96 9,-104 Q0,-108 -9,-104 Z" fill="var(--bronze)" {...ink} strokeWidth="1.3" />
      <path d="M3,-105 Q8,-96 9,-84 L12,-84 Q10,-96 9,-104 Z" fill="var(--ink)" opacity={SHADE} />
      <path d="M-6,-101 Q-8,-94 -9,-87" fill="none" stroke="var(--paper)" strokeWidth="1.2" opacity="0.4" />
      <path d="M-11,-90 h22 M-6,-100 v4 M0,-101 v4 M6,-100 v4" stroke="var(--ink)" strokeWidth="0.8" opacity="0.5" />
    </g>
    <path d="M14,-108 L14,-96 M24,-108 L24,-96" stroke="var(--ink)" strokeWidth="0.8" />
    <rect x="10" y="-97" width="18" height="4" rx="2" fill="var(--wood)" {...ink} strokeWidth="1" />
    <path d="M-44,-106 Q-28,-110 -16,-128 L16,-128 Q28,-110 44,-106 L38,-102 Q0,-112 -38,-102 Z" fill="var(--slate)" {...ink} strokeWidth="1.5" />
    <path d="M0,-128 L16,-128 Q28,-110 44,-106 L38,-102 Q20,-108 0,-109 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M-14,-128 L0,-138 L14,-128 Z" fill="var(--slate)" {...ink} strokeWidth="1.3" />
    <path d="M0,-138 L14,-128 L0,-128 Z" fill="var(--ink)" opacity={SHADE} />
    <line x1="0" y1="-138" x2="0" y2="-146" {...ink} strokeWidth="1.5" />
  </g>;
}

const DECK_POSTS = [[44, 22, 14], [70, 24, 14], [100, 18, 16], [118, 14, 16]] as const;

/** A moon-viewing deck (tsukimi-dai) built out over the water, with pampas grass, moon dumplings and a stone lantern. */
function MoonViewingDeck() {
  return <g>
    {DECK_POSTS.map(([x, y, height]) => <g key={x}>
      <line x1={x} y1={y} x2={x} y2={y + height} stroke="var(--ink)" strokeWidth="4.4" />
      <line x1={x} y1={y} x2={x} y2={y + height} stroke="var(--wood)" strokeWidth="3" />
    </g>)}
    <path d="M48,30 L124,18 L124,22 L48,34 Z" fill="var(--wood)" {...ink} strokeWidth="1.2" />
    <path d="M48,30 L124,18 L124,22 L48,34 Z" fill="var(--ink)" opacity={SHADE} />
    <path d="M36,14 L112,4 L124,18 L48,30 Z" fill="var(--wood)" {...ink} strokeWidth="1.5" />
    <path d="M36,14 L112,4 L124,18 L48,30 Z" fill="var(--paper)" opacity={LIGHT} />
    <path d="M56,12 L66,26 M76,9 L86,23 M96,6 L106,20" stroke="var(--ink)" strokeWidth="0.8" opacity="0.4" />
    <path d="M112,4 v-10 M124,18 v-10 M112,-6 L124,8 M48,30 v-10 M124,8 L48,20" fill="none" stroke="var(--vermilion)" strokeWidth="2.2" strokeLinecap="round" />
    <g transform="translate(66,10)">
      <Box x={-8} y={6} width={14} height={5} depth={6} fill="var(--wood)" />
      <circle cx="-4" cy="-2" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" /><circle cx="2" cy="-2" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" /><circle cx="-1" cy="-7" r="3" fill="var(--paper)" {...ink} strokeWidth="0.8" />
    </g>
    <g transform="translate(92,6)">
      <Cylinder x={0} y={0} rx={5} height={10} fill="var(--slate)" />
      <path d="M0,-10 Q-6,-30 -14,-38 M0,-10 Q2,-32 6,-42 M0,-10 Q8,-26 16,-32" fill="none" stroke="var(--sand)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M0,-10 Q-6,-30 -14,-38 M0,-10 Q2,-32 6,-42 M0,-10 Q8,-26 16,-32" fill="none" stroke="var(--ink)" strokeWidth="0.6" />
    </g>
    <GardenLantern x={26} y={4} size={0.6} />
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
  home: Torii, lessons: Pagoda, practice: PracticeGrounds, games: Festival, review: ZenGarden, kanji: Scroll, kana: CherryTree,
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
  /** How far the island has grown, and each of its growth tracks (see LandmarkProps). */
  stage?: number;
  trackStages?: readonly number[];
};

const NO_TRACKS: readonly number[] = [];

export function IslandLand({ id, isFogged, bridgeDirections, isletDirections, tally = 0, stage = 0, trackStages = NO_TRACKS }: IslandLandProps) {
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
      <Land coast={coast} hill={hill}><Landmark tally={tally} stage={stage} trackStages={trackStages} /></Land>
    </g>
    {isFogged && <Mist blurId={blurId} />}
  </svg>;
}
