// How near land each point of the water is, for an island drawn in 3D: a small picture of the island and its far shore
// (land bright, water dark) blurred, so it brightens smoothly towards every shore. Two blurs: a broad one the water
// turns turquoise by in the shallows, and a sharp one it foams by, hugging the very edge (so a river one tile wide
// foams along its banks, not bank to bank). Pure (no three.js, no browser).
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";
import type { FarShore } from "./islandModels.ts";

/** Pixels to a tile of the picture, how far past the map it reaches (in tiles), and how wide the blur is (in pixels,
 *  run three times, which is near enough a smooth bell). */
export const PIXELS_PER_TILE = 8;
const MARGIN_TILES = 8;
const BLUR_RADIUS = { edge: 2, shallows: 8 } as const;
const BLUR_PASSES = 3;
const LAND = 255;
/** Terrain that's water, not land: the water shades it like the sea round the island (a goldfish pool too, and the
 *  clouds round the summit). Decks over it stay water. */
const WATERY: ReadonlySet<Terrain> = new Set<Terrain>(["water", "sea", "waves", "bridge", "pier", "goldfish", "cloud"]);

/** The picture: two bytes a pixel (the sharp blur, then the broad one), `width` by `height`, its top-left corner at
 *  `origin` (in tiles), `size` tiles across. */
export type ShallowsMask = { data: Uint8Array; width: number; height: number; origin: { x: number; y: number }; size: { x: number; y: number } };
type Picture = { data: Uint8Array; width: number; height: number; origin: { x: number; y: number } };

/** Fills the pixels a rect of tiles covers. */
function fill(mask: Picture, { x, y, width, height }: Rect): void {
  const left = Math.max(0, Math.round((x - mask.origin.x) * PIXELS_PER_TILE));
  const top = Math.max(0, Math.round((y - mask.origin.y) * PIXELS_PER_TILE));
  const right = Math.min(mask.width, Math.round((x + width - mask.origin.x) * PIXELS_PER_TILE));
  const bottom = Math.min(mask.height, Math.round((y + height - mask.origin.y) * PIXELS_PER_TILE));
  for (let row = top; row < bottom; row += 1) mask.data.fill(LAND, row * mask.width + left, row * mask.width + Math.max(left, right));
}

/** Averages each pixel with its neighbours `BLUR_RADIUS` away along rows (or columns), leaving the result in `into`. */
function blurLine(from: Uint8Array, into: Uint8Array, length: number, lines: number, step: { along: number; across: number; radius: number }): void {
  for (let line = 0; line < lines; line += 1) {
    for (let index = 0; index < length; index += 1) {
      let sum = 0, count = 0;
      for (let offset = -step.radius; offset <= step.radius; offset += 1) {
        const at = index + offset;
        if (at < 0 || at >= length) continue;
        sum += from[line * step.across + at * step.along];
        count += 1;
      }
      into[line * step.across + index * step.along] = Math.round(sum / count);
    }
  }
}

/** A copy of the picture blurred `radius` pixels each way, three times over. */
function blurred({ data, width, height }: Picture, radius: number): Uint8Array {
  const result = data.slice(), spare = new Uint8Array(data.length);
  for (let pass = 0; pass < BLUR_PASSES; pass += 1) {
    blurLine(result, spare, width, height, { along: 1, across: width, radius });
    blurLine(spare, result, height, width, { along: width, across: 1, radius });
  }
  return result;
}

/** The blurred pictures of the island's land (and its far shore's, if it has one). */
export function shallowsMask(map: TownMap, shore?: FarShore): ShallowsMask {
  const size = { x: map.width + 2 * MARGIN_TILES, y: map.height + 2 * MARGIN_TILES };
  const width = size.x * PIXELS_PER_TILE, height = size.y * PIXELS_PER_TILE;
  const land: Picture = { data: new Uint8Array(width * height), width, height, origin: { x: -MARGIN_TILES, y: -MARGIN_TILES } };
  map.terrain.forEach((row, y) => row.forEach((terrain, x) => {
    if (!WATERY.has(terrain)) fill(land, { x, y, width: 1, height: 1 });
  }));
  for (const strip of shore?.land ?? []) fill(land, strip);
  const edge = blurred(land, BLUR_RADIUS.edge), shallows = blurred(land, BLUR_RADIUS.shallows);
  const data = new Uint8Array(width * height * 2);
  for (let index = 0; index < width * height; index += 1) {
    data[index * 2] = edge[index];
    data[index * 2 + 1] = shallows[index];
  }
  return { data, width, height, origin: land.origin, size };
}

/** How near land a point is by the sharp blur (`edge`) or the broad one (`shallows`), from 0 (open water) to 1 (well
 *  inside land). Past the picture it's open water. */
export function nearnessToLand(mask: ShallowsMask, at: { x: number; y: number }, blur: keyof typeof BLUR_RADIUS = "edge"): number {
  const column = Math.floor((at.x - mask.origin.x) * PIXELS_PER_TILE), row = Math.floor((at.y - mask.origin.y) * PIXELS_PER_TILE);
  if (column < 0 || row < 0 || column >= mask.width || row >= mask.height) return 0;
  return mask.data[(row * mask.width + column) * 2 + (blur === "edge" ? 0 : 1)] / LAND;
}
