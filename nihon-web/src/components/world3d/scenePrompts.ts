// What floats over a 3D island's scene, pinned to a place in it: the prompt to act on what the traveller is standing by
// (a door, a villager), and marks over villagers with something for the traveller.
import type { Vector } from "../../lib/errands/movement.ts";
import type { Door } from "../../lib/village/villageDoors.ts";

/** A prompt over `at` (a point of the island, in tiles), `height` tiles above the ground: `action` on its button,
 *  `label` what a screen reader says it does. */
export type ScenePrompt = { at: Vector; height: number; action: string; label: string };
/** A mark (a "!") over someone, `height` tiles above the ground. */
export type SceneMarker = { id: string; at: Vector; height: number };

/** How high over a door's tile its prompt floats (about a door's height), and over a villager's (above their head). */
const DOOR_PROMPT_HEIGHT = 1.6;
const VILLAGER_PROMPT_HEIGHT = 2;
const ENTER = "Enter";

const middleOf = (tile: Vector): Vector => ({ x: tile.x + 0.5, y: tile.y + 0.5 });

export const doorPrompt = (door: Door): ScenePrompt => ({
  at: middleOf(door.tile), height: DOOR_PROMPT_HEIGHT, action: door.action ?? ENTER,
  label: door.action ? door.label : `Go into ${door.label.toLowerCase()}`,
});

export const villagerPrompt = (tile: Vector, action: string, label: string): ScenePrompt => ({
  at: middleOf(tile), height: VILLAGER_PROMPT_HEIGHT, action, label,
});

export const villagerMarker = (id: string, tile: Vector): SceneMarker => ({ id, at: middleOf(tile), height: VILLAGER_PROMPT_HEIGHT });
