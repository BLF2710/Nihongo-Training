import type { MapLayout, Point, Size } from "../islandMap.ts";

// The guest's opening: the traveller's boat drifts on open sea; once the visitor starts, it sails in to Home while the
// camera pulls back from it to the whole island.

// How close the camera starts. Kept moderate: the island is drawn once at this scale for the whole pull-back, so a
// larger zoom costs more to draw and memory to hold.
export const INTRO_ZOOM = 2.5;
export const INTRO_REVEAL_MS = 5200;
// The boat lands a little before the camera settles.
export const INTRO_SAIL_MS = 4600;
// How far below Games the voyage starts, as a share of the stage's height: open water, clear of every island's shore.
const BOAT_DROP = 0.06;
// Where the boat comes in to land: the water just off Home's front shore, from Home's anchor, as stage shares.
const HOME_LANDING = { x: 0.07, y: 0.13 };

export type Voyage = { from: Point; to: Point };

/** The boat's voyage, as stage shares: from open water between Games and Kana, below both, in to Home's front shore. */
export function introVoyage(layout: MapLayout): Voyage {
  const { games, kana, home } = layout.placements;
  return {
    from: { x: (games.x + kana.x) / 2, y: Math.min(games.y + BOAT_DROP, 0.97) },
    to: { x: home.x + HOME_LANDING.x, y: home.y + HOME_LANDING.y },
  };
}

/** The transform (origin top left) that puts `point` (stage shares) at the middle of the map area, zoomed in. The stage
 *  is centred in the map area, as on the island map. */
export function introCameraTransform(space: Size, stage: Size, point: Point, zoom: number): string {
  const boat = { x: (space.width - stage.width) / 2 + point.x * stage.width, y: (space.height - stage.height) / 2 + point.y * stage.height };
  const x = space.width / 2 - boat.x * zoom;
  const y = space.height / 2 - boat.y * zoom;
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${zoom})`;
}

/** How far the boat is from its landing at the start of the voyage, in stage pixels. */
export function voyageOffset(voyage: Voyage, stage: Size): Point {
  return { x: (voyage.from.x - voyage.to.x) * stage.width, y: (voyage.from.y - voyage.to.y) * stage.height };
}
