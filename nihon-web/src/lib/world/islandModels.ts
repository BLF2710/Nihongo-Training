// An island drawn in real 3D (the English island): where its models stand, where its people are, and how the camera
// follows the traveller. Pure (no three.js, no React, no browser), so it runs under node's test runner. Tiles are the
// world's units: x runs east, z (a tile's y) runs south, towards the viewer.
import type { Direction, Vector } from "../errands/movement.ts";
import type { Rect, Terrain, TownMap } from "../errands/townMap.ts";
import type { Door } from "../village/villageDoors.ts";
import type { RoofColour } from "../errands/village.ts";

/** A model standing on the island. `at` is the ground it takes up (nobody walks there unless `isWalkable`); the model
 *  stands centred on it, drawn `scale` tiles to a model unit. `isMirrored` flips it east to west, so a row of the same
 *  house doesn't look stamped. A building made for the islands takes its `roof` colour and the Japanese `sign` over its
 *  door from the island's content. `facing` turns a model to face that way (it faces south, the viewer, unless said). */
export type ModelPlacement = {
  model: string; at: Rect; scale: number; isWalkable?: boolean; isMirrored?: boolean; roof?: RoofColour; sign?: string; facing?: Direction;
};

/** A villager standing on a tile, facing one way. */
export type IslandPerson = { id: string; model: string; tile: Vector; facing: Direction };

/** A rounded hill: its middle (in tiles), how far it spreads and how high it stands. */
export type Hill = { x: number; y: number; radius: number; height: number };

/** The land across the water from an island, so it doesn't sit in an empty sea: its ground, the decks carrying the
 *  island's bridges over to it and the paths they lead on to, and hills further out. */
export type FarShore = { land: readonly Rect[]; decks: readonly Rect[]; paths: readonly Rect[]; hills: readonly Hill[] };

/** What falls through the air: cherry petals on a sakura island, bamboo leaves in a grove, maple leaves in autumn,
 *  snow on the summit. */
export type Weather = "petals" | "leaves" | "maple" | "snow";

/** What lies round the island: water, or (high on the mountain) a sea of clouds. */
export type Sea = "water" | "clouds";

/** Everything the 3D scene draws: the ground (its land coloured by `landColours` where its look recolours it), what
 *  stands on it, the people, the scenery beyond the shore (`backdrop` models, and a far `shore`), the `sea` round it,
 *  its `ponds` (each the water tiles of one pond, where koi swim), and any `lanterns` lit as the page says. */
export type Island3D = {
  map: TownMap; models: readonly ModelPlacement[]; people: readonly IslandPerson[]; backdrop: readonly ModelPlacement[];
  traveller: string; doors: readonly Door[]; shore?: FarShore; weather?: Weather; sea?: Sea;
  ponds?: readonly (readonly Vector[])[]; landColours?: Partial<Readonly<Record<Terrain, string>>>;
  lanterns?: readonly SwitchedLantern[];
};

/** A lantern that can be lit while the scene stands (as the village's are, as the day's errands get done): how it
 *  looks lit, and how it looks dark. */
export type SwitchedLantern = { lit: ModelPlacement; unlit: ModelPlacement };

/** A steady number in [-1, 1) for a point, the same every time: for variety that doesn't change between visits. */
export function steadyNoise(x: number, y: number): number {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
}

/** The ground the models take up, where nobody can walk. */
export const groundTakenBy = (models: readonly ModelPlacement[]): Rect[] => models.filter(model => !model.isWalkable).map(model => model.at);

/** The tiles the people stand on, which nobody can walk through. */
export const tilesOfPeople = (people: readonly IslandPerson[]): Rect[] => people.map(({ tile }) => ({ ...tile, width: 1, height: 1 }));

/** Where a model stands: the middle of its ground. */
export const centreOf = ({ at }: ModelPlacement): Vector => ({ x: at.x + at.width / 2, y: at.y + at.height / 2 });

/** Where a person on a tile stands: its middle. */
export const personPosition = ({ tile }: IslandPerson): Vector => ({ x: tile.x + 0.5, y: tile.y + 0.5 });

/** How far a model, which faces the viewer (south), turns about its upright axis to face each way, in radians
 *  (positive turns it from facing south to facing east). */
const FACING_ANGLE: Readonly<Record<Direction, number>> = { down: 0, right: Math.PI / 2, up: Math.PI, left: -Math.PI / 2 };
export const facingAngle = (facing: Direction): number => FACING_ANGLE[facing];

/** How quickly the traveller as drawn catches up with where they are (a share of the way each second), and how far
 *  apart the two can be before the drawing jumps straight there (arriving somewhere new, say). */
const DRAWN_FOLLOW_PER_SECOND = 20;
const DRAWN_JUMP_DISTANCE = 2;

/** Where to draw the traveller this frame, `seconds` after they were drawn at `drawn`, now that they're at `actual`.
 *  Their steps reach the scene unevenly (two in one frame, none in the next), so the drawing eases after them rather
 *  than jerking from one to the next; the camera follows the drawing, so the two move together. */
export function drawnTowards(drawn: Vector, actual: Vector, seconds: number): Vector {
  const gap = { x: actual.x - drawn.x, y: actual.y - drawn.y };
  if (Math.hypot(gap.x, gap.y) > DRAWN_JUMP_DISTANCE) return actual;
  const share = Math.min(1, seconds * DRAWN_FOLLOW_PER_SECOND);
  return { x: drawn.x + gap.x * share, y: drawn.y + gap.y * share };
}

/** The angle `from` turns towards `to` by the share `amount` of the way, the short way round. */
export function turnTowards(from: number, to: number, amount: number): number {
  const difference = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + difference * amount;
}

/** The scenes' tile sizes (VillageScene): about this many tiles across, within these sizes in pixels, and at least
 *  this many from top to bottom. The 3D camera stands back far enough to show the same. */
const TILES_ACROSS = 15;
const MIN_TILE = 34;
const MAX_TILE = 64;
const MIN_TILES_DOWN = 8;

/** How big a tile is on this screen, in pixels, as the 2.5D scenes size it. */
export function tileSize(viewport: { width: number; height: number }): number {
  return Math.max(MIN_TILE, Math.min(MAX_TILE, Math.round(viewport.width / TILES_ACROSS), Math.floor(viewport.height / MIN_TILES_DOWN)));
}

/** How far back a camera with this vertical field of view (degrees) stands from what it looks at, so a tile there is
 *  as big as `tileSize` makes it. */
export function cameraDistance(viewport: { width: number; height: number }, fieldOfViewDegrees: number): number {
  const tilesDown = viewport.height / tileSize(viewport);
  return tilesDown / (2 * Math.tan((fieldOfViewDegrees * Math.PI) / 360));
}
