import { useId } from "react";
import { examSky, FUJI_TRAIL, pointAlong } from "../../lib/fujiTrail";
import type { ExamSky, TrailStation } from "../../lib/fujiTrail";
import type { Point } from "../../lib/svgPath";
import type { TimeOfDay } from "../../lib/timeOfDay";
import { TravellerArt } from "../islandMap/Traveller";
import { useMapTimeOfDay } from "../islandMap/useMapTimeOfDay";
import "../islandMap/IslandMap.css";
import "./exam.css";

// The mountain is drawn 320 × 120 (lib/fujiTrail.ts). The scene adds wide open land to each side and sky above the
// summit, and is cut to fit its box from the middle: a tall box shows the mountain and a little land, a wide banner more.
const SIDE = 440, SKY = 24;
const WIDTH = 320 + SIDE * 2, HEIGHT = 120 + SKY;
const trailPath = `M${FUJI_TRAIL.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" L")}`;
const ink = { stroke: "var(--ink)", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
// The traveller's size in the scene's units.
const CLIMBER_WIDTH = 21, CLIMBER_HEIGHT = 32;

// Concave slopes rising to a flat crater rim, as in the woodblock prints.
const MOUNTAIN = "M-10,118 Q100,92 146,18 Q153,15 160,17 Q167,15 174,18 Q220,92 330,118 Z";
const SHADED_FLANK = "M160,17 Q167,15 174,18 Q220,92 330,118 Q250,123 176,121 Q186,70 160,17 Z";
// The snow cap follows the slopes exactly (MOUNTAIN's curves, cut where they cross y 42) and runs down
// the gullies in tapering streaks of different lengths.
const SNOW = "M128.3,42 Q138.1,30.7 146,18 Q153,15 160,17 Q167,15 174,18 Q181.9,30.7 191.7,42 Q190.1,40.5 188.5,43.0 C188.5,47.0 187.1,50.3 186,50.3 C184.9,50.3 183.5,47.6 183.5,44.3 Q182.5,42.8 181.5,44.7 C181.5,54.2 179.6,62.0 178,62.0 C176.4,62.0 174.5,54.8 174.5,46.0 Q173.8,44.5 173,46.2 C173,51.5 171.3,55.8 170,55.8 C168.7,55.8 167,51.8 167,46.8 Q166.0,45.3 165,46.9 C165,56.9 162.8,65.0 161,65.0 C159.2,65.0 157,56.9 157,47.0 Q156.0,45.4 155,46.9 C155,52.4 153.3,56.9 152,56.9 C150.7,56.9 149,52.2 149,46.4 Q148.2,44.7 147.5,46.2 C147.5,53.9 145.6,60.2 144,60.2 C142.4,60.2 140.5,53.4 140.5,45.1 Q139.0,43.0 137.5,44.5 C137.5,47.8 136.1,50.5 135,50.5 C133.9,50.5 132.5,47.2 132.5,43.2 Q130.4,40.5 128.3,42 Z";
const GULLIES = "M168,24 Q190,70 236,108 M155,22 Q150,62 128,104 M178,48 Q196,82 268,112";
const FAR_RANGE = "M-440,100 Q-400,84 -360,98 Q-320,80 -270,96 Q-230,86 -190,100 Q-150,82 -110,98 Q-70,80 -40,96 Q-10,84 20,102 L20,120 L-440,120 Z "
  + "M300,100 Q340,78 380,92 Q410,82 440,96 Q480,80 520,98 Q560,84 600,94 Q640,78 690,98 Q730,86 760,96 L760,120 L300,120 Z";
const GROUND = "M-440,120 L-440,111 Q-340,104 -240,112 Q-120,106 -40,112 Q40,116 100,114 Q160,116 220,112 Q330,106 440,111 Q560,104 660,112 Q720,108 760,110 L760,120 Z";
const CLOUDS: readonly Point[] = [{ x: -340, y: 50 }, { x: -220, y: 70 }, { x: -96, y: 58 }, { x: -48, y: 78 }, { x: 350, y: 52 }, { x: 392, y: 74 }, { x: 520, y: 60 }, { x: 650, y: 46 }];
// Pines along the foot of the scene, left and right of the mountain, at a slightly uneven spacing.
const PINE_SPACING = 21;
const PINES: readonly Point[] = [
  ...Array.from({ length: 21 }, (_, index) => ({ x: -430 + index * PINE_SPACING + (index % 3) * 3, y: 112 + (index % 3) * 2.5 })),
  ...Array.from({ length: 23 }, (_, index) => ({ x: 268 + index * PINE_SPACING + (index % 3) * 3, y: 116 - (index % 3) * 2 })),
];
const STARS: readonly Point[] = [{ x: -380, y: -6 }, { x: -300, y: 20 }, { x: -210, y: -14 }, { x: -130, y: 12 }, { x: -40, y: -10 }, { x: 40, y: 30 }, { x: 96, y: -16 }, { x: 230, y: -4 }, { x: 300, y: 24 }, { x: 360, y: -12 }, { x: 470, y: 10 }, { x: 560, y: -16 }, { x: 640, y: 16 }, { x: 720, y: -6 }];

// Without an exam clock the sky follows the map's mood, with the sun (or moon) where that time of day puts it.
const RESTING_SKY: Readonly<Record<TimeOfDay, ExamSky>> = {
  dawn: { timeOfDay: "dawn", body: "sun", position: { x: -40, y: 40 } },
  day: { timeOfDay: "day", body: "sun", position: { x: 392, y: 2 } },
  dusk: { timeOfDay: "dusk", body: "sun", position: { x: 400, y: 60 } },
  night: { timeOfDay: "night", body: "moon", position: { x: 392, y: 2 } },
};

function Cloud({ x, y }: Point) {
  return <path d={`M${x},${y} q2,-7 10,-5 q4,-8 14,-3 q9,-4 12,4 q6,1 4,4 Z`} fill="var(--mist)" opacity="0.9" {...ink} strokeWidth="0.7" />;
}

function Pine({ x, y }: Point) {
  return <g>
    <path d={`M${x},${y} v3`} stroke="var(--wood)" strokeWidth="1.4" />
    <path d={`M${x},${y - 15} L${x - 5.5},${y - 6} L${x - 2.5},${y - 6} L${x - 7},${y + 1} L${x + 7},${y + 1} L${x + 2.5},${y - 6} L${x + 5.5},${y - 6} Z`} fill="var(--leaf)" {...ink} strokeWidth="0.7" />
  </g>;
}

/** The torii where the climb begins. */
function Torii({ x, y }: Point) {
  return <g {...ink} strokeWidth="0.8">
    <path d={`M${x - 6},${y} V${y - 13} M${x + 6},${y} V${y - 13}`} stroke="var(--vermilion)" strokeWidth="2" />
    <path d={`M${x - 10},${y - 15.5} Q${x},${y - 13.5} ${x + 10},${y - 15.5} L${x + 9},${y - 13} Q${x},${y - 11.5} ${x - 9},${y - 13} Z`} fill="var(--ink)" />
    <path d={`M${x - 8},${y - 10} H${x + 8}`} stroke="var(--vermilion)" strokeWidth="1.6" />
  </g>;
}

/** A mountain hut at a station: its window lit once the station is reached. */
function StationHut({ x, y, isLit }: Point & { isLit: boolean }) {
  return <g>
    {isLit && <circle cx={x} cy={y - 3} r="8" fill="var(--checkpoint-light)" opacity="0.35" />}
    <rect x={x - 4.5} y={y - 4} width="9" height="5" fill="var(--wood)" {...ink} strokeWidth="0.7" />
    <rect x={x - 1.5} y={y - 2.8} width="3" height="2.4" fill={isLit ? "var(--checkpoint-light)" : "var(--ink)"} opacity={isLit ? 1 : 0.55} />
    <path d={`M${x - 6.5},${y - 3.5} L${x},${y - 8.5} L${x + 6.5},${y - 3.5} Z`} fill="var(--slate)" {...ink} strokeWidth="0.7" />
  </g>;
}

/** The sun, or a crescent moon. */
function SkyBody({ body, position }: Pick<ExamSky, "body" | "position">) {
  const place = { transform: `translate(${position.x}px, ${position.y}px)` };
  return body === "sun"
    ? <circle className="fuji-sky-body" style={place} r="13" fill="var(--checkpoint-light)" opacity="0.7" />
    : <g className="fuji-sky-body" style={place}>
      <circle r="10" fill="#f3eedb" opacity="0.95" />
      <circle cx="4" cy="-3" r="8.5" fill="var(--sea-bottom)" />
    </g>;
}

type FujiTrailProps = {
  stations: readonly TrailStation[]; climbed: number; label: string; className?: string;
  /** How much of the exam's time has gone (0–1): the sky turns from dawn to night with it. Without it, the map's mood. */
  elapsed?: number;
};

/** Fuji with the mock exam's trail: a hut at the end of each section (lit once it is done) and the learner's traveller
 *  `climbed` (0–1) of the way up, the trail behind it inked in. */
export function FujiTrail({ stations, climbed, label, className = "", elapsed }: FujiTrailProps) {
  const { timeOfDay } = useMapTimeOfDay();
  const skyId = useId(), snowId = useId();
  const sky = elapsed === undefined ? RESTING_SKY[timeOfDay] : examSky(elapsed);
  const climber = pointAlong(FUJI_TRAIL, climbed);
  const isSummitReached = stations.at(-1)?.isLit ?? false;
  return <figure role="img" aria-label={label} data-time={sky.timeOfDay} className={`island-map fuji-scene relative overflow-hidden ${className}`}>
    <svg viewBox={`${-SIDE} ${-SKY} ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMax slice" className="block size-full" aria-hidden="true">
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--sea-bottom)" /><stop offset="1" stopColor="var(--sea-top)" /></linearGradient>
        <clipPath id={snowId}><path d={SNOW} /></clipPath>
      </defs>
      <rect x={-SIDE} y={-SKY} width={WIDTH} height={HEIGHT} fill={`url(#${skyId})`} />
      {sky.body === "moon" && STARS.map(star => <circle key={`${star.x},${star.y}`} cx={star.x} cy={star.y} r="0.9" fill="#f3eedb" opacity="0.8" />)}
      <SkyBody body={sky.body} position={sky.position} />
      <path d={FAR_RANGE} fill="var(--fuji)" opacity="0.45" />
      {isSummitReached && <circle className="island-summit-glow" cx="160" cy="16" r="26" fill="var(--lantern)" />}
      <path d={MOUNTAIN} fill="var(--fuji)" {...ink} strokeWidth="1.2" />
      <path d={SHADED_FLANK} fill="var(--ink)" opacity="0.16" />
      <path d={GULLIES} fill="none" stroke="var(--ink)" strokeWidth="0.8" opacity="0.2" />
      <path d={SNOW} fill="var(--fuji-snow)" />
      <path d={SHADED_FLANK} fill="var(--fuji)" opacity="0.45" clipPath={`url(#${snowId})`} />
      <path d="M160,17 Q166,30 170,48" fill="none" stroke="var(--fuji)" strokeWidth="0.8" opacity="0.6" />
      <path d={SNOW} fill="none" {...ink} strokeWidth="0.7" />
      <path d={GROUND} fill="var(--grass)" {...ink} strokeWidth="0.8" />
      {CLOUDS.map(point => <Cloud key={`${point.x},${point.y}`} {...point} />)}
      <path d={trailPath} fill="none" {...ink} strokeWidth="3.6" opacity="0.35" />
      <path d={trailPath} fill="none" {...ink} stroke="var(--sand)" strokeWidth="2.2" />
      <path d={trailPath} pathLength={1} fill="none" {...ink} stroke="var(--vermilion)" strokeWidth="1.4" strokeDasharray={`${climbed} 1`} className="fuji-trail-climbed" />
      <Torii x={36} y={114} />
      {PINES.map(point => <Pine key={`${point.x},${point.y}`} {...point} />)}
      {stations.map(station => <StationHut key={station.title} {...pointAlong(FUJI_TRAIL, station.share)} isLit={station.isLit} />)}
      {isSummitReached && <g>
        <path d="M166,9 V-6" stroke="var(--ink)" strokeWidth="0.9" />
        <path d="M166,-5.5 L176,-3 L166,-0.5 Z" fill="var(--vermilion)" {...ink} strokeWidth="0.6" />
      </g>}
      <g className="fuji-climber" style={{ transform: `translate(${climber.x}px, ${climber.y}px)` }}>
        <foreignObject x={-CLIMBER_WIDTH / 2} y={-CLIMBER_HEIGHT} width={CLIMBER_WIDTH} height={CLIMBER_HEIGHT}><div className="h-full"><TravellerArt /></div></foreignObject>
      </g>
    </svg>
  </figure>;
}
