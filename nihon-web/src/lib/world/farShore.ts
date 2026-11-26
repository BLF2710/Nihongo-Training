// The land across the water from an island drawn in 3D, so the island has edges to see past rather than ending in an
// empty sea: a ring of land a few tiles out, flat near the water and rising into hills beyond, with each bridge
// that leaves the island carried on over the water and on as a path. Pure (no three.js, no browser).
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";
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

/** The ring of land round the island, as strips: north and south each in three (beyond the west edge, along the
 *  island, beyond the east edge, so a side's corners can lie under snow with it), and west and east between. */
function landRing({ width, height }: TownMap): Rect[] {
  const inner = WATER_GAP, outer = WATER_GAP + LAND_DEPTH;
  const across = (y: number): Rect[] => [
    { x: -outer, y, width: outer, height: LAND_DEPTH },
    { x: 0, y, width, height: LAND_DEPTH },
    { x: width, y, width: outer, height: LAND_DEPTH },
  ];
  return [
    ...across(-outer), ...across(height + inner),
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

/** Where hills stand from `from` to `to`, a hill's spacing apart. */
const along = (from: number, to: number) => Array.from({ length: Math.floor((to - from) / HILL_SPACING) + 1 }, (_, index) => from + index * HILL_SPACING);

/** Whether a hill keeps clear of every path. */
const isClearOf = (hill: Hill, paths: readonly Rect[]) => paths.every(path =>
  Math.abs(hill.y - (path.y + 0.5)) > hill.radius + PATH_CLEARANCE || Math.abs(hill.x - (path.x + path.width / 2)) > hill.radius + path.width);

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
  const north = along(-behind, width + behind).map(x => hillAt(x, -behind - steadyNoise(x, 1) * 2, 1));
  const sides = along(-WATER_GAP, height + WATER_GAP).flatMap(y => [hillAt(-behind, y, SIDE_HILL_HEIGHT_SHARE), hillAt(width + behind, y, SIDE_HILL_HEIGHT_SHARE)]);
  return [...north, ...sides].filter(hill => isClearOf(hill, paths));
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

/** The mainland a path at sea sets out from and comes to: how far it reaches beyond the map (past where the fog closes
 *  in), how deep from its coast trees grow, and how far in from the coast its hills rise. */
const MAINLAND = { depth: 40, treeDepth: 8, hillsIn: FLAT_DEPTH + HILL.radius } as const;
const WATERY: ReadonlySet<Terrain> = new Set<Terrain>(["water", "sea", "waves"]);

type Side = "west" | "east";
/** A stretch of mainland coast on a side of the map: how many tiles of land run in from that edge along the map's
 *  first row, and what they are (from the edge inwards). */
type Coast = { side: Side; land: readonly Terrain[] };

/** The coasts the map's sides begin with: the land running in from its west and east edges before the water. */
function coastsOf(map: TownMap): Coast[] {
  const row = map.terrain[0] ?? [];
  const landFrom = (tiles: readonly Terrain[]) => {
    const water = tiles.findIndex(terrain => WATERY.has(terrain));
    return tiles.slice(0, water < 0 ? tiles.length : water);
  };
  const coasts: Coast[] = [{ side: "west", land: landFrom(row) }, { side: "east", land: landFrom([...row].reverse()) }];
  return coasts.filter(coast => coast.land.length > 0);
}

/** Where a coast's mainland lies, beyond the map: out from its edge, and on north and south of the map along the
 *  coast's own width, flush with the land inside it. */
function mainlandOf({ width, height }: TownMap, { side, land }: Coast): Rect[] {
  const { depth } = MAINLAND, coast = land.length;
  const outer = side === "west" ? -depth : width;
  const coastX = side === "west" ? 0 : width - coast;
  return [
    { x: outer, y: -depth, width: depth, height: height + 2 * depth },
    { x: coastX, y: -depth, width: coast, height: depth },
    { x: coastX, y: height, width: coast, height: depth },
  ];
}

/** Each path reaching a side edge of the map (from a pier, say) carried on inland. */
function pathsOn(map: TownMap, { side }: Coast): Rect[] {
  const edge = side === "west" ? 0 : map.width - 1;
  const from = side === "west" ? -PATH_DEPTH : map.width;
  return map.terrain.flatMap((row, y) => row[edge] === "path" ? [{ x: from, y, width: PATH_DEPTH, height: 1 }] : []);
}

/** Hills rising a little way in from a coast, all along it. */
function hillsOn(map: TownMap, { side }: Coast, paths: readonly Rect[]): Hill[] {
  const x = side === "west" ? -MAINLAND.hillsIn : map.width + MAINLAND.hillsIn;
  return along(-MAINLAND.hillsIn, map.height + MAINLAND.hillsIn).map(y => hillAt(x + steadyNoise(y, 2) * 2, y, 1)).filter(hill => isClearOf(hill, paths));
}

/** The tiles of a coast's mainland near enough the water for trees, outside the map. */
function groveOf({ width, height }: TownMap, { side, land }: Coast): { x: number; y: number }[] {
  const { treeDepth } = MAINLAND;
  const [from, to] = side === "west" ? [-treeDepth, land.length] : [width - land.length, width + treeDepth];
  const tiles: { x: number; y: number }[] = [];
  for (let y = -treeDepth; y < height + treeDepth; y += 1) {
    for (let x = from; x < to; x += 1) {
      const isOnMap = x >= 0 && x < width && y >= 0 && y < height;
      if (!isOnMap) tiles.push({ x, y });
    }
  }
  return tiles;
}

/** The mainland on either side of a stretch of open sea, its land and hills, the paths from its piers, and its groves:
 *  where trees can grow beside each coast, and the coast's own land (its trees the ones to grow there). */
export type Mainland = { shore: FarShore; groves: readonly { coast: readonly Terrain[]; tiles: readonly { x: number; y: number }[] }[] };

/** The mainland the open sea lies between: wherever the map's first row begins or ends in land, that coast runs on
 *  beyond the map's edge, north and south and inland, so the piers run out from the land rather than standing in the
 *  sea. */
export function mainlandBeside(map: TownMap): Mainland {
  const coasts = coastsOf(map);
  const paths = coasts.flatMap(coast => pathsOn(map, coast));
  return {
    shore: {
      land: coasts.flatMap(coast => mainlandOf(map, coast)), decks: [], paths,
      hills: coasts.flatMap(coast => hillsOn(map, coast, paths)),
    },
    groves: coasts.map(coast => ({ coast: coast.land, tiles: groveOf(map, coast) })),
  };
}
