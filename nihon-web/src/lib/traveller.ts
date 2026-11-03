import { BRIDGED_ISLANDS, bridgeSpan, drawingScale, isIslandId } from "./islandMap.ts";
import type { IslandId, MapLayout } from "./islandMap.ts";
import type { Point } from "./svgPath";

// The learner's traveller: a small figure standing on the island of the page they were last on (in its strip and on the
// map), who walks the bridges to the island they pick on the map.

// Where the traveller stands on each island, in that island's drawing units: open ground at the front, clear of the
// buildings and of the island's name below the shore.
const STANDING_SPOT: Point = { x: -40, y: 26 };
const STANDING_SPOTS: Partial<Record<IslandId, Point>> = {
  home: { x: -78, y: 22 },
  fuji: { x: -62, y: 26 },
  harbour: { x: 20, y: 28 },
  onsen: { x: -60, y: 24 },
};
export const standingSpot = (id: IslandId): Point => STANDING_SPOTS[id] ?? STANDING_SPOT;

/** Walking pace in stage units a second (the stage is 100 units tall). */
export const WALKING_SPEED = 16;

/** How the traveller gets from one island to another: on foot over the bridges, or by ferry to an outlying place. */
export type Journey = { kind: "stay" } | { kind: "walk"; points: Point[] } | { kind: "ferry" };

const isBridged = (id: IslandId) => BRIDGED_ISLANDS.some(island => island.id === id);

/** Where the traveller stands on an island, in stage units. */
export function standingPoint(layout: MapLayout, id: IslandId): Point {
  const place = layout.placements[id];
  const scale = drawingScale(layout, place), spot = standingSpot(id);
  return { x: place.x * layout.aspect * 100 + spot.x * scale, y: place.y * 100 + spot.y * scale };
}

/** The way across a bridge: from the island's end to Home's, or back. */
function crossing(layout: MapLayout, id: IslandId, isTowardHome: boolean): Point[] {
  const { start, end } = bridgeSpan(layout, id);
  return isTowardHome ? [end, start] : [start, end];
}

/** The journey between two islands, in stage units. Bridges join Home to the ring, so ring islands are walked through
 *  Home; the outlying places have no bridge, so they are reached by ferry. */
export function journey(layout: MapLayout, from: IslandId, to: IslandId): Journey {
  if (from === to) return { kind: "stay" };
  const isWalkable = (id: IslandId) => id === "home" || isBridged(id);
  if (!isWalkable(from) || !isWalkable(to)) return { kind: "ferry" };
  return { kind: "walk", points: [
    standingPoint(layout, from),
    ...(from === "home" ? [] : crossing(layout, from, true)),
    ...(to === "home" ? [] : crossing(layout, to, false)),
    standingPoint(layout, to),
  ] };
}

export const walkLength = (points: readonly Point[]) =>
  points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index].x, point.y - points[index].y), 0);

/** Each step of a walk as shares of the whole: where it ends, and whether it heads right (the figure faces that way). */
export function walkSteps(points: readonly Point[]): { end: number; isFacingRight: boolean }[] {
  const total = walkLength(points);
  let walked = 0;
  return points.slice(1).map((point, index) => {
    const from = points[index];
    walked += Math.hypot(point.x - from.x, point.y - from.y);
    return { end: total ? Math.min(1, walked / total) : 1, isFacingRight: point.x >= from.x };
  });
}

const STORAGE_KEY = "traveller_island";

/** Remembers the island of the page the learner is on, for the map to stand the traveller there. */
export function rememberIsland(id: IslandId) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch { /* the map starts the traveller at Home instead */ }
}

/** The island last remembered, or Home. */
export function recallIsland(): IslandId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isIslandId(saved) ? saved : "home";
  } catch { return "home"; }
}
