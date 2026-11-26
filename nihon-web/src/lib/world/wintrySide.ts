// The side of an island that faces the way up to Fuji, where winter begins: the land across the water on that side
// lies under snow, thinning to patches just this side of the edge, and snow starts to fall as the traveller nears it, thickening till it falls in full at the edge.
// Pure (no three.js, no browser).
import type { TownMap } from "../errands/townMap.ts";
import { steadyNoise } from "./islandModels.ts";
import type { Heading } from "./routes.ts";

/** The side where winter begins, and the colour of the snow lying on the land there. */
export type WintrySide = { side: Heading; snow: string };

/** Snow starts to fall this many tiles in from the wintry edge, and falls in full from this many (on the bridge). */
const SNOWFALL = { startsWithin: 12, fullWithin: 2 } as const;

/** How far in from the wintry edge snow still lies in patches (in tiles), and how ragged the snowline is. */
const SNOWLINE = { depth: 6, raggedness: 0.4 } as const;

type Point = { x: number; y: number };

/** How far a point lies in from the map's edge on `side` (below 0 beyond it). */
function inFrom({ width, height }: TownMap, side: Heading, { x, y }: Point): number {
  switch (side) {
    case "west": return x;
    case "east": return width - x;
    case "north": return y;
    case "south": return height - y;
  }
}

/** Whether a point lies out beyond the map's edge on `side`. */
export const isBeyond = (map: TownMap, side: Heading, point: Point): boolean => inFrom(map, side, point) < 0;

/** How much of a full snowfall comes down at a point: none well inside the island, all of it near the wintry edge. */
export function snowfallShare(map: TownMap, side: Heading, point: Point): number {
  const share = (SNOWFALL.startsWithin - inFrom(map, side, point)) / (SNOWFALL.startsWithin - SNOWFALL.fullWithin);
  return Math.min(1, Math.max(0, share));
}

/** Whether snow lies on a tile: all of it past the wintry edge, and patches on the land just inside it, fewer the
 *  further in, so the snowline is ragged rather than ruled straight. */
export function liesUnderSnow(map: TownMap, side: Heading, tile: Point): boolean {
  const inside = inFrom(map, side, { x: tile.x + 0.5, y: tile.y + 0.5 });
  if (inside < 0) return true;
  const share = 1 - inside / SNOWLINE.depth;
  return share + steadyNoise(tile.x * 1.3, tile.y * 2.1) * SNOWLINE.raggedness > 0.5;
}

/** Whether a tile lies along the snowline: inside the wintry edge, but near enough it for snow to lie in patches. */
export function isAlongSnowline(map: TownMap, side: Heading, tile: Point): boolean {
  const inside = inFrom(map, side, { x: tile.x + 0.5, y: tile.y + 0.5 });
  return inside >= 0 && inside < SNOWLINE.depth;
}
