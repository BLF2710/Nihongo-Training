// The land across the water from an island drawn in 3D, so the island has edges to see past rather than ending in an
// empty sea: a ring of land a few tiles out, flat near the water and rising into hills beyond, with each bridge
// that leaves the island carried on over the water and on as a path. Pure (no three.js, no browser).
import type { Rect, TownMap } from "../errands/townMap.ts";
import { steadyNoise } from "./islandModels.ts";
import type { FarShore, Hill } from "./islandModels.ts";

/** How much water lies between the island and the far shore, how deep the flat land along the water is before the
 *  hills, and how far the land reaches beyond (past where the fog closes in). */
export const WATER_GAP = 4;
export const FLAT_DEPTH = 5;
const LAND_DEPTH = 40;
/** The hills: how far apart their middles are along the shore, and their sizes (each varies from one to the next). */
const HILL_SPACING = 6;
const HILL = { radius: 4, height: 3.2, radiusVariation: 1.2, heightVariation: 1.2 };
/** The hills on the sides are lower than those on the far (north) side, so they don't wall the island in. */
const SIDE_HILL_HEIGHT_SHARE = 0.55;
/** How far a hill keeps from a path leaving the island. */
const PATH_CLEARANCE = 2;

type Edge = "north" | "south" | "west" | "east";

/** The ring of land round the island, as four strips (north and south run the whole width, west and east between). */
function landRing({ width, height }: TownMap): Rect[] {
  const inner = WATER_GAP, outer = WATER_GAP + LAND_DEPTH;
  return [
    { x: -outer, y: -outer, width: width + 2 * outer, height: LAND_DEPTH },
    { x: -outer, y: height + inner, width: width + 2 * outer, height: LAND_DEPTH },
    { x: -outer, y: -inner, width: LAND_DEPTH, height: height + 2 * inner },
    { x: width + inner, y: -inner, width: LAND_DEPTH, height: height + 2 * inner },
  ];
}

/** Which edge of the map a tile lies on, if any. */
function edgeOf({ width, height }: TownMap, x: number, y: number): Edge | null {
  if (x === 0) return "west";
  if (x === width - 1) return "east";
  if (y === 0) return "north";
  if (y === height - 1) return "south";
  return null;
}

/** How far a path leaving the island runs on over the land: across the flat, and on between the hills. */
const PATH_DEPTH = FLAT_DEPTH + 2 * HILL.radius;

/** For a bridge tile on the map's edge: its deck on over the water, and the path on over the land. */
function bridgeCarriedOn(map: TownMap, x: number, y: number, edge: Edge): { deck: Rect; path: Rect } {
  const eastWest = (from: number, depth: number): Rect => ({ x: from, y, width: depth, height: 1 });
  const northSouth = (from: number, depth: number): Rect => ({ x, y: from, width: 1, height: depth });
  switch (edge) {
    case "west": return { deck: eastWest(-WATER_GAP, WATER_GAP), path: eastWest(-WATER_GAP - PATH_DEPTH, PATH_DEPTH) };
    case "east": return { deck: eastWest(map.width, WATER_GAP), path: eastWest(map.width + WATER_GAP, PATH_DEPTH) };
    case "north": return { deck: northSouth(-WATER_GAP, WATER_GAP), path: northSouth(-WATER_GAP - PATH_DEPTH, PATH_DEPTH) };
    case "south": return { deck: northSouth(map.height, WATER_GAP), path: northSouth(map.height + WATER_GAP, PATH_DEPTH) };
  }
}

function bridgesOut(map: TownMap): { decks: Rect[]; paths: Rect[] } {
  const carried = map.terrain.flatMap((row, y) => row.flatMap((terrain, x) => {
    const edge = terrain === "bridge" ? edgeOf(map, x, y) : null;
    return edge ? [bridgeCarriedOn(map, x, y, edge)] : [];
  }));
  return { decks: carried.map(({ deck }) => deck), paths: carried.map(({ path }) => path) };
}

/** A hill, its size varying steadily with where it stands. */
function hillAt(x: number, y: number, heightShare: number): Hill {
  return {
    x, y,
    radius: HILL.radius + steadyNoise(x, y) * HILL.radiusVariation,
    height: (HILL.height + steadyNoise(y, x) * HILL.heightVariation) * heightShare,
  };
}

/** Hills along the far (north) side and the two sides, just beyond the flat land; none on the near side, where
 *  they'd stand between the camera and the island. */
function hillsAround({ width, height }: TownMap, paths: readonly Rect[]): Hill[] {
  const behind = WATER_GAP + FLAT_DEPTH + HILL.radius;
  const along = (from: number, to: number) => Array.from({ length: Math.floor((to - from) / HILL_SPACING) + 1 }, (_, index) => from + index * HILL_SPACING);
  const north = along(-behind, width + behind).map(x => hillAt(x, -behind - steadyNoise(x, 1) * 2, 1));
  const sides = along(-WATER_GAP, height + WATER_GAP).flatMap(y => [hillAt(-behind, y, SIDE_HILL_HEIGHT_SHARE), hillAt(width + behind, y, SIDE_HILL_HEIGHT_SHARE)]);
  const isClearOf = (hill: Hill) => paths.every(path => Math.abs(hill.y - (path.y + 0.5)) > hill.radius + PATH_CLEARANCE || Math.abs(hill.x - (path.x + path.width / 2)) > hill.radius + path.width);
  return [...north, ...sides].filter(isClearOf);
}

export function farShoreAround(map: TownMap): FarShore {
  const { decks, paths } = bridgesOut(map);
  return { land: landRing(map), decks, paths, hills: hillsAround(map, paths) };
}

/** Every tile of the far shore's flat land along the water (where trees can stand), north, south and the sides. */
export function flatShoreTiles({ width, height }: TownMap): { x: number; y: number }[] {
  const near = WATER_GAP, far = WATER_GAP + FLAT_DEPTH;
  const tiles: { x: number; y: number }[] = [];
  for (let y = -far; y < height + far; y += 1) {
    for (let x = -far; x < width + far; x += 1) {
      const isInRing = x < -near || x >= width + near || y < -near || y >= height + near;
      if (isInRing) tiles.push({ x, y });
    }
  }
  return tiles;
}
