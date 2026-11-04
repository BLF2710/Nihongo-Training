// Doors in the village square that lead to a page of the site, and what the traveller is close enough to use: a
// villager to talk to or a door to go through, whichever is nearer. Pure, so it runs under node.
import { TALK_DISTANCE, nearestWithin } from "../errands/movement.ts";
import type { Vector } from "../errands/movement.ts";
import type { CharacterId } from "../cast.ts";

/** `tile` is the tile in front of the door, where the traveller stands to go in. */
export type Door = { id: string; tile: Vector; href: string; label: string };

export type NearbyThing =
  | { kind: "villager"; id: CharacterId }
  | { kind: "door"; door: Door };

const distanceTo = (position: Vector, tile: Vector) => Math.hypot(tile.x + 0.5 - position.x, tile.y + 0.5 - position.y);

export function nearbyThing(position: Vector, villagers: readonly { id: CharacterId; tile: Vector }[], doors: readonly Door[]): NearbyThing | null {
  const villager = nearestWithin(position, villagers, TALK_DISTANCE);
  const door = nearestWithin(position, doors, TALK_DISTANCE);
  if (door && (!villager || distanceTo(position, door.tile) < distanceTo(position, villager.tile))) return { kind: "door", door };
  return villager ? { kind: "villager", id: villager.id } : null;
}
