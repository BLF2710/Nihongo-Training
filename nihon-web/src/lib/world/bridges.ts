// The bridges of an island drawn in 3D, each as one span: its tiles on the island, joined by the decks carrying it on
// over the water to the far shore, and as long again on the far shore as on the island, so it's the same at both
// ends. The island end is walked on, so it lies flat, and so does the far end; the stretch over the open water, which
// nobody walks, arches up as a drum bridge does. Pure (no three.js, no browser).
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";

/** One bridge: the ground it spans, which way it runs (along x, east to west, or along y, north to south), and where
 *  along that way its arch rises from and comes down to (none if it isn't carried over open water). */
export type BridgeSpan = { at: Rect; runsAlong: "x" | "y"; arch: { from: number; to: number } | null };

const NEIGHBOURS = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }] as const;

/** The bridge tiles joined (side by side) to `start`, marking them seen. */
function joinedTiles(map: TownMap, start: { x: number; y: number }, seen: Set<string>): { x: number; y: number }[] {
  const tiles = [start];
  seen.add(`${start.x},${start.y}`);
  for (let index = 0; index < tiles.length; index += 1) {
    for (const step of NEIGHBOURS) {
      const next = { x: tiles[index].x + step.x, y: tiles[index].y + step.y };
      const key = `${next.x},${next.y}`;
      if (seen.has(key) || map.terrain[next.y]?.[next.x] !== "bridge") continue;
      seen.add(key);
      tiles.push(next);
    }
  }
  return tiles;
}

function boundsOf(tiles: readonly { x: number; y: number }[]): Rect {
  const xs = tiles.map(({ x }) => x), ys = tiles.map(({ y }) => y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x + 1, height: Math.max(...ys) - y + 1 };
}

/** What a bridge crosses. */
const WATERY: ReadonlySet<Terrain> = new Set<Terrain>(["water", "sea", "waves", "goldfish"]);

/** How many of the tiles just beyond a bridge's two sides, along `side` (its north and south rows, or its west and
 *  east columns), are water. */
function waterBeside(map: TownMap, { x, y, width, height }: Rect, side: "north-south" | "west-east"): number {
  const isWater = (tileX: number, tileY: number) => WATERY.has(map.terrain[tileY]?.[tileX] ?? "grass");
  const beside = side === "north-south"
    ? Array.from({ length: width }, (_, column) => [{ x: x + column, y: y - 1 }, { x: x + column, y: y + height }]).flat()
    : Array.from({ length: height }, (_, row) => [{ x: x - 1, y: y + row }, { x: x + width, y: y + row }]).flat();
  return beside.filter(tile => isWater(tile.x, tile.y)).length;
}

/** A bridge runs out across the edge of the map it touches. One inside the island runs across the water it spans:
 *  east to west over a stream flowing past its north and south sides, north to south over one past its west and east
 *  sides (along its longer side, if that doesn't settle it). */
function runOf(map: TownMap, bridge: Rect): "x" | "y" {
  const { x, y, width, height } = bridge;
  if (y === 0 || y + height === map.height) return "y";
  if (x === 0 || x + width === map.width) return "x";
  const northSouth = waterBeside(map, bridge, "north-south"), westEast = waterBeside(map, bridge, "west-east");
  if (northSouth !== westEast) return northSouth > westEast ? "x" : "y";
  return height >= width ? "y" : "x";
}

/** Whether a deck carries the bridge on: it lies across the bridge's width and touches one end of it. */
function carriesOn(bridge: Rect, deck: Rect, runsAlong: "x" | "y"): boolean {
  if (runsAlong === "y") return deck.x >= bridge.x && deck.x < bridge.x + bridge.width && (deck.y + deck.height === bridge.y || deck.y === bridge.y + bridge.height);
  return deck.y >= bridge.y && deck.y < bridge.y + bridge.height && (deck.x + deck.width === bridge.x || deck.x === bridge.x + bridge.width);
}

/** `span` reaching on past the water onto the far shore as far as the bridge (`island`) reaches onto the island. */
function withFarLanding(span: Rect, island: Rect, runsAlong: "x" | "y"): Rect {
  if (runsAlong === "y") {
    const isFarNorth = span.y < island.y;
    return { ...span, y: isFarNorth ? span.y - island.height : span.y, height: span.height + island.height };
  }
  const isFarWest = span.x < island.x;
  return { ...span, x: isFarWest ? span.x - island.width : span.x, width: span.width + island.width };
}

/** Every bridge on the island, joined to the decks (`carried`) that carry it on over the water. */
export function bridgeSpans(map: TownMap, carried: readonly Rect[]): BridgeSpan[] {
  const seen = new Set<string>();
  const spans: BridgeSpan[] = [];
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (terrain !== "bridge" || seen.has(`${x},${y}`)) return;
    const island = boundsOf(joinedTiles(map, { x, y }, seen));
    const runsAlong = runOf(map, island);
    const decks = carried.filter(deck => carriesOn(island, deck, runsAlong));
    if (decks.length === 0) {
      spans.push({ at: island, runsAlong, arch: null });
      return;
    }
    const water = boundsOf(decks.flatMap(({ x: deckX, y: deckY, width, height }) => [{ x: deckX, y: deckY }, { x: deckX + width - 1, y: deckY + height - 1 }]));
    const at = boundsOf([island, water].flatMap(rect => [{ x: rect.x, y: rect.y }, { x: rect.x + rect.width - 1, y: rect.y + rect.height - 1 }]));
    const arch = runsAlong === "y" ? { from: water.y, to: water.y + water.height } : { from: water.x, to: water.x + water.width };
    spans.push({ at: withFarLanding(at, island, runsAlong), runsAlong, arch });
  }));
  return spans;
}
