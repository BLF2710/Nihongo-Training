// The village's ground, in tiles: what each tile is and which ones the traveller can walk on.
// Pure (no React, no browser), so it runs under node's test runner.

/** `tallgrass` grows on the wild paths: walking into it can start a wild kana battle (see lib/world/grassEncounters).
 *  `sakura` (cherry trees), `bamboo` and `maple` (autumn maples) stand like trees; `petals` is grass strewn with
 *  fallen blossom and `leaves` with fallen maple leaves; `goldfish` is a festival pond; `stones` is a stepping-stone
 *  path. */
export type Terrain =
  | "grass" | "path" | "gravel" | "water" | "bridge" | "tree" | "fence" | "flowers" | "tallgrass"
  | "sakura" | "bamboo" | "petals" | "goldfish" | "maple" | "leaves" | "stones";
export type TileKey = `${number},${number}`;
export type Rect = { x: number; y: number; width: number; height: number };
export type TownMap = { width: number; height: number; terrain: readonly (readonly Terrain[])[] };

/** One character per tile in a map's rows. */
export const TERRAIN_LEGEND: Readonly<Record<string, Terrain>> = {
  ".": "grass", "=": "path", ",": "gravel", "~": "water", b: "bridge", T: "tree", f: "fence", "*": "flowers", w: "tallgrass",
  S: "sakura", B: "bamboo", p: "petals", g: "goldfish", M: "maple", l: "leaves", o: "stones",
};
const BLOCKING_TERRAIN: ReadonlySet<Terrain> = new Set(["water", "tree", "fence", "sakura", "bamboo", "goldfish", "maple"]);

export class TownMapError extends Error {
  constructor(message: string) { super(message); this.name = "TownMapError"; }
}

/** Reads a map written as rows of legend characters; every row must be the same length. */
export function parseTownMap(rows: readonly string[]): TownMap {
  if (rows.length === 0) throw new TownMapError("A town map needs at least one row.");
  const width = rows[0].length;
  const terrain = rows.map((row, y) => {
    if (row.length !== width) throw new TownMapError(`Row ${y} is ${row.length} tiles wide, not ${width}.`);
    return [...row].map((symbol, x) => {
      const tile = TERRAIN_LEGEND[symbol];
      if (!tile) throw new TownMapError(`Unknown tile "${symbol}" at ${x},${y}.`);
      return tile;
    });
  });
  return { width, height: rows.length, terrain };
}

export const tileKey = (x: number, y: number): TileKey => `${x},${y}`;

export function tilesOf({ x, y, width, height }: Rect): TileKey[] {
  const keys: TileKey[] = [];
  for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) keys.push(tileKey(column, row));
  return keys;
}

/** The tiles nothing can walk through: blocking ground plus whatever stands on it (buildings, closed gates, people). */
export function blockedTiles(map: TownMap, obstacles: readonly Rect[]): ReadonlySet<TileKey> {
  const blocked = new Set<TileKey>();
  map.terrain.forEach((row, y) => row.forEach((tile, x) => { if (BLOCKING_TERRAIN.has(tile)) blocked.add(tileKey(x, y)); }));
  for (const obstacle of obstacles) for (const key of tilesOf(obstacle)) blocked.add(key);
  return blocked;
}

/** The terrain at a tile, or null outside the map. */
export function terrainAt(map: TownMap, x: number, y: number): Terrain | null {
  return map.terrain[y]?.[x] ?? null;
}

/** Whether a tile is blocked; everything outside the map counts as blocked. */
export function isBlocked(map: TownMap, blocked: ReadonlySet<TileKey>, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= map.width || y >= map.height) return true;
  return blocked.has(tileKey(x, y));
}

/** The same map with some tiles changed to `terrain` (such as a gap cut through a row of trees). */
export function withTerrain(map: TownMap, tiles: readonly { x: number; y: number }[], terrain: Terrain): TownMap {
  const changed = new Set(tiles.map(({ x, y }) => tileKey(x, y)));
  return { ...map, terrain: map.terrain.map((row, y) => row.map((tile, x) => (changed.has(tileKey(x, y)) ? terrain : tile))) };
}

/** The unbroken runs of one terrain along each row, left to right (a row of trees is drawn as one piece). */
export function rowRuns(map: TownMap, terrain: Terrain): Rect[] {
  const runs: Rect[] = [];
  map.terrain.forEach((row, y) => {
    let start = -1;
    row.forEach((tile, x) => {
      if (tile === terrain && start < 0) start = x;
      const isRunOver = start >= 0 && (tile !== terrain || x === row.length - 1);
      if (isRunOver) { const end = tile === terrain ? x + 1 : x; runs.push({ x: start, y, width: end - start, height: 1 }); start = -1; }
    });
  });
  return runs;
}
