// The ponds of an island: its water that lies inside it, cut off from the sea round it. Koi swim in them. Pure (no
// three.js, no browser).
import type { Vector } from "../errands/movement.ts";
import type { Terrain, TownMap } from "../errands/townMap.ts";

const POND_WATER: ReadonlySet<Terrain> = new Set<Terrain>(["water", "goldfish"]);
const NEIGHBOURS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }] as const;

/** The tiles of each body of water joined to `start` (side by side, not corner to corner). */
function bodyOfWater(map: TownMap, start: Vector, seen: Set<string>): Vector[] {
  const body: Vector[] = [];
  const waiting = [start];
  seen.add(`${start.x},${start.y}`);
  for (let tile = waiting.pop(); tile; tile = waiting.pop()) {
    body.push(tile);
    for (const step of NEIGHBOURS) {
      const next = { x: tile.x + step.x, y: tile.y + step.y };
      const key = `${next.x},${next.y}`;
      if (seen.has(key) || !POND_WATER.has(map.terrain[next.y]?.[next.x] ?? "grass")) continue;
      seen.add(key);
      waiting.push(next);
    }
  }
  return body;
}

const touchesEdge = (map: TownMap, body: readonly Vector[]) =>
  body.some(({ x, y }) => x === 0 || y === 0 || x === map.width - 1 || y === map.height - 1);

/** Each pond's water tiles: bodies of water that don't reach the map's edge, where the sea is. */
export function pondsOf(map: TownMap): Vector[][] {
  const seen = new Set<string>();
  const ponds: Vector[][] = [];
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (!POND_WATER.has(terrain) || seen.has(`${x},${y}`)) return;
    const body = bodyOfWater(map, { x, y }, seen);
    if (!touchesEdge(map, body)) ponds.push(body);
  }));
  return ponds;
}
