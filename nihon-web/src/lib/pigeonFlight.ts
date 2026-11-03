import { drawingScale } from "./islandMap.ts";
import type { IslandId, MapLayout } from "./islandMap.ts";
import type { Point } from "./svgPath";

// Where the carrier pigeon lands on each island, in that island's drawing units: somewhere a bird would sit.
export const PIGEON_PERCHES: Record<IslandId, Point> = {
  home: { x: 63, y: -15 }, // the notice board's roof
  lessons: { x: 2, y: -142 }, // the pagoda's finial, as first built (it drops as tiers are added, so the map passes the current one)
  practice: { x: 34, y: -134 }, // the top of the tallest bamboo
  games: { x: 52, y: -103 }, // the top of a lantern pole
  review: { x: -43, y: -44 }, // the stone lantern's cap
  kanji: { x: 32, y: -114 }, // the end of the writing frame's top beam
  kana: { x: 15, y: -54 }, // a branch of the cherry tree
  fuji: { x: 6, y: -146 }, // the summit
  harbour: { x: -60, y: -96 }, // the top of the lighthouse
  teahouse: { x: -25, y: -44 }, // the tea house's roof ridge
  belltower: { x: -29, y: -126 }, // the bell tower's roof, beside the finial
  onsen: { x: 74, y: -63 }, // the roof of the ema rack
};
// How far each leg bows upward, as a share of its length, so the pigeon flies in arcs rather than straight lines.
const ARC_BOW = 0.22;
// Flight speed in stage units a second (the stage is 100 units tall), and how long it sits at each perch.
const FLIGHT_SPEED = 7;
const PERCH_SECONDS = 3.5;
// Straight-line samples used to measure a curved leg.
const LENGTH_SAMPLES = 16;

/** One leg of the tour: a curve from one perch to the next. */
export type PigeonLeg = { from: Point; control: Point; to: Point };
/** One flight in the cycle, as shares of the whole cycle (time) and of the whole route (distance). */
export type PigeonFlight = { start: number; end: number; fromDistance: number; toDistance: number; isFacingRight: boolean };
export type PigeonTour = { path: string; durationSeconds: number; flights: readonly PigeonFlight[] };
/** The islands to tour, at what scale, and any perches that move as their island grows (in place of PIGEON_PERCHES). */
export type TourOptions = { layout: MapLayout; islands: readonly IslandId[]; pixelsPerUnit: number; perches?: Partial<Record<IslandId, Point>> };

function perchOn(layout: MapLayout, id: IslandId, perch: Point): Point {
  const place = layout.placements[id];
  const scale = drawingScale(layout, place);
  return { x: place.x * layout.aspect * 100 + perch.x * scale, y: place.y * 100 + perch.y * scale };
}

/** Home first, then the other islands clockwise around it starting from the top. */
export function tourOrder(layout: MapLayout, ids: readonly IslandId[]): IslandId[] {
  const home = layout.placements.home;
  // Angle clockwise from straight up, in 0–2π, measured on the stage (whose x is stretched by the aspect).
  const bearing = (id: IslandId) => {
    const place = layout.placements[id];
    const angle = Math.atan2((place.x - home.x) * layout.aspect, -(place.y - home.y));
    return angle < 0 ? angle + 2 * Math.PI : angle;
  };
  return ["home", ...ids.filter(id => id !== "home").sort((a, b) => bearing(a) - bearing(b))];
}

/** A leg bowing upward between two perches. */
function legBetween(from: Point, to: Point): PigeonLeg {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const span = { x: to.x - from.x, y: to.y - from.y };
  // The perpendicular of the leg's length that points up the screen (towards smaller y).
  const normal = span.x >= 0 ? { x: span.y, y: -span.x } : { x: -span.y, y: span.x };
  return { from, control: { x: middle.x + normal.x * ARC_BOW, y: middle.y + normal.y * ARC_BOW }, to };
}

/** The legs of a round trip through the perches, back to the first. */
export function tourLegs(perches: readonly Point[]): PigeonLeg[] {
  return perches.map((from, index) => legBetween(from, perches[(index + 1) % perches.length]));
}

function pointOnLeg({ from, control, to }: PigeonLeg, t: number): Point {
  const u = 1 - t;
  return { x: u * u * from.x + 2 * u * t * control.x + t * t * to.x, y: u * u * from.y + 2 * u * t * control.y + t * t * to.y };
}

export function legLength(leg: PigeonLeg): number {
  const points = Array.from({ length: LENGTH_SAMPLES + 1 }, (_, index) => pointOnLeg(leg, index / LENGTH_SAMPLES));
  return points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);
}

/** When each flight takes off and lands within the cycle: a rest at every perch, then a flight at a steady speed. */
export function flightSchedule(legs: readonly PigeonLeg[]): { durationSeconds: number; flights: PigeonFlight[] } {
  const lengths = legs.map(legLength);
  const routeLength = lengths.reduce((sum, length) => sum + length, 0);
  const durationSeconds = legs.length * PERCH_SECONDS + routeLength / FLIGHT_SPEED;
  let seconds = 0, distance = 0;
  const flights = legs.map((leg, index) => {
    const start = (seconds + PERCH_SECONDS) / durationSeconds;
    seconds += PERCH_SECONDS + lengths[index] / FLIGHT_SPEED;
    const fromDistance = distance / routeLength;
    distance += lengths[index];
    // Shares are capped at 1: rounding can push the last landing a hair past the end, which keyframes reject.
    return { start, end: Math.min(1, seconds / durationSeconds), fromDistance, toDistance: Math.min(1, distance / routeLength), isFacingRight: leg.to.x >= leg.from.x };
  });
  return { durationSeconds, flights };
}

/** The pigeon's tour of the given islands in stage pixels: the route as an SVG path, and its timing. */
export function pigeonTour({ layout, islands, pixelsPerUnit, perches = {} }: TourOptions): PigeonTour | null {
  const order = tourOrder(layout, islands);
  if (order.length < 2) return null;
  const legs = tourLegs(order.map(id => perchOn(layout, id, perches[id] ?? PIGEON_PERCHES[id])));
  const px = (point: Point) => `${Math.round(point.x * pixelsPerUnit * 10) / 10},${Math.round(point.y * pixelsPerUnit * 10) / 10}`;
  const path = `M${px(legs[0].from)} ${legs.map(leg => `Q${px(leg.control)} ${px(leg.to)}`).join(" ")}`;
  return { path, ...flightSchedule(legs) };
}

/** The pigeon's width in pixels: a fixed size in Home's drawing, so it shrinks and grows with the islands. */
export const PIGEON_WIDTH_UNITS = 48;
export const pigeonWidth = (layout: MapLayout, pixelsPerUnit: number) => PIGEON_WIDTH_UNITS * drawingScale(layout, layout.placements.home) * pixelsPerUnit;
