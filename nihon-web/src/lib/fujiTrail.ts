import type { Point } from "./svgPath";
import type { TimeOfDay } from "./timeOfDay.ts";

// The mock exam as a climb up Fuji (components/exam/FujiTrail.tsx): the trail zigzags up the mountain, each section of the
// exam is a stretch of it ending at a station, and the traveller climbs as questions are answered.

// The trail's switchbacks, from the torii at the foot to the summit, in the mountain's drawing units (320 × 120, y down).
// Each turn stays inside the mountain's concave slopes, which narrow towards the top.
const SWITCHBACKS: readonly Point[] = [
  { x: 50, y: 113 }, { x: 236, y: 100 }, { x: 84, y: 87 }, { x: 214, y: 74 }, { x: 116, y: 61 }, { x: 190, y: 48 }, { x: 142, y: 36 }, { x: 160, y: 19 },
];
// How much of each stretch a turn rounds off, and how many straight pieces draw each rounded turn.
const TURN_SHARE = 0.18;
const TURN_SAMPLES = 6;

const lerp = (from: Point, to: Point, t: number): Point => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });

/** A path through the corners with each turn rounded into a curve, as straight pieces short enough to look smooth. */
export function roundedPath(corners: readonly Point[]): Point[] {
  const turns = corners.slice(1, -1).flatMap((corner, index) => {
    const [before, after] = [lerp(corner, corners[index], TURN_SHARE), lerp(corner, corners[index + 2], TURN_SHARE)];
    return Array.from({ length: TURN_SAMPLES + 1 }, (_, step) => {
      const t = step / TURN_SAMPLES;
      return lerp(lerp(before, corner, t), lerp(corner, after, t), t);
    });
  });
  return [corners[0], ...turns, corners[corners.length - 1]];
}

/** The trail, from the foot to the summit. */
export const FUJI_TRAIL: readonly Point[] = roundedPath(SWITCHBACKS);

/** A section of the exam on the trail: its number of questions, and whether it is complete (or, after, reached). */
export type TrailSection = { title: string; total: number; isComplete: boolean };
/** A station at the end of each section, as a share of the trail; lit once its section is complete. */
export type TrailStation = { title: string; share: number; isLit: boolean };

export function trailStations(sections: readonly TrailSection[]): TrailStation[] {
  const total = sections.reduce((sum, section) => sum + section.total, 0);
  let passed = 0;
  return sections.map(section => {
    passed += section.total;
    return { title: section.title, share: total ? passed / total : 1, isLit: section.isComplete };
  });
}

/** How far up the trail a share of the questions takes the climber, from 0 (the foot) to 1 (the summit). */
export const climbedShare = (done: number, total: number) => total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;

// Without the target the climber stops short of the summit, however close the score.
const BELOW_SUMMIT = 0.94;

/** Where a finished exam leaves the climber: on the summit with the target reached, otherwise as far as the score goes. */
export const resultShare = (percent: number, isPassed: boolean) => isPassed ? 1 : Math.min(BELOW_SUMMIT, climbedShare(percent, 100));

/** The point a share of the way along a path of straight stretches. */
export function pointAlong(points: readonly Point[], share: number): Point {
  if (share >= 1) return points[points.length - 1];
  const lengths = points.slice(1).map((point, index) => Math.hypot(point.x - points[index].x, point.y - points[index].y));
  let remaining = Math.min(1, Math.max(0, share)) * lengths.reduce((sum, length) => sum + length, 0);
  for (const [index, length] of lengths.entries()) {
    if (remaining <= length && length > 0) {
      const [from, to] = [points[index], points[index + 1]], t = remaining / length;
      return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
    }
    remaining -= length;
  }
  return points[points.length - 1];
}

/** The sky over the climb: its mood, and the sun or moon in it, in the scene's drawing units. */
export type ExamSky = { timeOfDay: TimeOfDay; body: "sun" | "moon"; position: Point };

// The exam's time as one day on the mountain: it begins at dawn, and night falls for the last stretch.
const DAWN_ENDS = 0.15, DAY_ENDS = 0.6, DUSK_ENDS = 0.8;
// The sun climbs from low on the left to its height and sets on the right; the moon then rises on the left.
const SUN_FROM = { x: -80, y: 70 }, SUN_TO = { x: 400, y: 70 }, SUN_HEIGHT = 72;
const MOON_FROM = { x: -100, y: 60 }, MOON_TO = { x: 60, y: 4 };

const timeOfExam = (elapsed: number): TimeOfDay =>
  elapsed < DAWN_ENDS ? "dawn" : elapsed < DAY_ENDS ? "day" : elapsed < DUSK_ENDS ? "dusk" : "night";

/** The sky when a share (0–1) of the exam's time has gone. */
export function examSky(elapsed: number): ExamSky {
  const share = Math.min(1, Math.max(0, elapsed));
  if (share >= DUSK_ENDS) return { timeOfDay: "night", body: "moon", position: lerp(MOON_FROM, MOON_TO, (share - DUSK_ENDS) / (1 - DUSK_ENDS)) };
  const t = share / DUSK_ENDS, along = lerp(SUN_FROM, SUN_TO, t);
  return { timeOfDay: timeOfExam(share), body: "sun", position: { x: along.x, y: along.y - SUN_HEIGHT * Math.sin(Math.PI * t) } };
}
