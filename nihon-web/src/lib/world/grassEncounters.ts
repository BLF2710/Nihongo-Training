// When walking through tall grass starts a wild kana battle. Pure: the caller rolls the dice and says which terrain the
// traveller stepped onto, so the rule runs under node's test runner.
import type { Terrain } from "../errands/townMap.ts";

/** The chance that a step onto a new tall-grass tile starts a battle. */
export const ENCOUNTER_CHANCE = 1 / 8;
/** After a battle, this many grass tiles are safe, so the traveller can walk out of the grass. */
export const SAFE_GRASS_STEPS = 3;

/** How many grass tiles are still safe after the last battle. */
export type GrassWalk = { safeSteps: number };

export const FRESH_GRASS_WALK: GrassWalk = { safeSteps: 0 };
export const AFTER_BATTLE: GrassWalk = { safeSteps: SAFE_GRASS_STEPS };

/** Where wild kana live: tall grass on foot, rough water by boat. */
const WILD_TERRAIN: ReadonlySet<Terrain> = new Set(["tallgrass", "waves"]);
export const isWildTerrain = (terrain: Terrain | null): boolean => terrain !== null && WILD_TERRAIN.has(terrain);

/** A step onto a new tile: only tall grass (or rough water) can start a battle, and not while safe steps are left. */
export function stepOnto(walk: GrassWalk, terrain: Terrain | null, roll: number): { walk: GrassWalk; isEncounter: boolean } {
  if (!isWildTerrain(terrain)) return { walk, isEncounter: false };
  if (walk.safeSteps > 0) return { walk: { safeSteps: walk.safeSteps - 1 }, isEncounter: false };
  return { walk, isEncounter: roll < ENCOUNTER_CHANCE };
}
