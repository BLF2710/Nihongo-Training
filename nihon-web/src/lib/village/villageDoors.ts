// Doors in the village square that lead to a page of the site, and what the traveller is close enough to use: a
// villager to talk to or a door to go through, whichever is nearer. Pure, so it runs under node.
import { TALK_DISTANCE, nearestWithin } from "../errands/movement.ts";
import type { Vector } from "../errands/movement.ts";

/** `tile` is the tile in front of the door, where the traveller stands to go in; `action` names going through it
 *  ("Enter" when not given). */
export type Door = { id: string; tile: Vector; href: string; label: string; action?: string };

/** Who is near: a villager (by id: the Japanese cast, or the English townsfolk) or a door. */
export type NearbyThing<Id extends string = string> =
  | { kind: "villager"; id: Id }
  | { kind: "door"; door: Door };

const distanceTo = (position: Vector, tile: Vector) => Math.hypot(tile.x + 0.5 - position.x, tile.y + 0.5 - position.y);

export function nearbyThing<Id extends string>(position: Vector, villagers: readonly { id: Id; tile: Vector }[], doors: readonly Door[]): NearbyThing<Id> | null {
  const villager = nearestWithin(position, villagers, TALK_DISTANCE);
  const door = nearestWithin(position, doors, TALK_DISTANCE);
  if (door && (!villager || distanceTo(position, door.tile) < distanceTo(position, villager.tile))) return { kind: "door", door };
  return villager ? { kind: "villager", id: villager.id } : null;
}
