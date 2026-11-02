import { smoothClosedPath } from "./svgPath.ts";
import type { Point } from "./svgPath";

// Natural-looking island outlines: an ellipse whose radius wobbles with a few waves (bays and headlands), smoothed into
// a closed curve. The same seed always gives the same coastline, so islands keep their shape between visits.

export type CoastlineOptions = { radiusX: number; radiusY: number; seed: number };

const COAST_POINTS = 40;
// Lower waves stretch the island (long, Japan-like shapes); higher ones carve bays and capes.
const WAVE_AMPLITUDES = [[2, 0.13], [3, 0.07], [5, 0.045], [8, 0.025]] as const;

/** A small deterministic random number generator (mulberry32). */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

type CoastWave = { frequency: number; amplitude: number; phase: number };

function coastWaves(seed: number): CoastWave[] {
  const random = seededRandom(seed);
  return WAVE_AMPLITUDES.map(([frequency, amplitude]) => ({ frequency, amplitude: amplitude * (0.7 + random() * 0.6), phase: random() * Math.PI * 2 }));
}

const radiusAt = (waves: readonly CoastWave[], angle: number) => 1 + waves.reduce((sum, wave) => sum + wave.amplitude * Math.sin(wave.frequency * angle + wave.phase), 0);

export function coastlinePoints({ radiusX, radiusY, seed }: CoastlineOptions): Point[] {
  const waves = coastWaves(seed);
  return Array.from({ length: COAST_POINTS }, (_, index) => {
    const angle = (index / COAST_POINTS) * Math.PI * 2;
    const radius = radiusAt(waves, angle);
    return { x: radiusX * radius * Math.cos(angle), y: radiusY * radius * Math.sin(angle) };
  });
}

/** Where the coast lies in a direction from the island's centre (the same curve coastlinePath draws). */
export function coastPointToward({ radiusX, radiusY, seed }: CoastlineOptions, direction: Point): Point {
  const angle = Math.atan2(direction.y / radiusY, direction.x / radiusX);
  const radius = radiusAt(coastWaves(seed), angle);
  return { x: radiusX * radius * Math.cos(angle), y: radiusY * radius * Math.sin(angle) };
}

export const coastlinePath = (options: CoastlineOptions) => smoothClosedPath(coastlinePoints(options));

const ISLET_CANDIDATES = 24;
// How far islets sit beyond the coast's average radius.
const ISLET_DISTANCE = 1.28;

/** An islet just off the coast in a chosen direction. */
export function isletToward({ radiusX, radiusY }: CoastlineOptions, direction: Point): Point {
  const angle = Math.atan2(direction.y / radiusY, direction.x / radiusX);
  return { x: radiusX * ISLET_DISTANCE * Math.cos(angle), y: radiusY * ISLET_DISTANCE * Math.sin(angle) };
}

/** Where small islets sit off the coast: just beyond the shore at seeded angles, at least `clearance` radians away from
 *  each direction in `avoid` (where bridges leave the island). */
export function isletPlacements(options: CoastlineOptions, count: number, avoid: readonly Point[] = [], clearance = 0): Point[] {
  const random = seededRandom(options.seed * 31 + 7);
  const isClear = (point: Point) => avoid.every(direction => {
    const difference = Math.abs(Math.atan2(point.y, point.x) - Math.atan2(direction.y, direction.x)) % (Math.PI * 2);
    return Math.min(difference, Math.PI * 2 - difference) >= clearance;
  });
  const candidates = Array.from({ length: ISLET_CANDIDATES }, () => {
    const angle = random() * Math.PI * 2;
    const distance = 1.22 + random() * 0.12;
    return { x: options.radiusX * distance * Math.cos(angle), y: options.radiusY * distance * Math.sin(angle) };
  });
  return candidates.filter(isClear).slice(0, count);
}
