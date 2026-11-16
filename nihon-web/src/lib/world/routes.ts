// A wild path: a walkable route from the home village to an island, with tall grass where wild kana live.
// Types and pure lookups; each path's map is content in data/world/routes.
import type { IslandId } from "../islandMap.ts";
import type { Vector } from "../errands/movement.ts";
import { TALK_DISTANCE } from "../errands/movement.ts";
import type { VillageLayout } from "../errands/village.ts";
import { HIRAGANA_ROWS } from "../kanaWilds/gojuon.ts";
import type { SceneTheme } from "./sceneTheme.ts";

export type RouteId = "home-kana" | "home-practice" | "home-games";

/**
 * One end of the path. Standing at `tile`, the traveller can leave for `island` (Home is the village square, any
 * other island its own walkable scene). Coming onto the path from that island, they appear at `arrival`.
 */
export type RouteExit = { tile: Vector; arrival: Vector; island: IslandId; label: string };

/**
 * `between` names the islands at its two ends: Home, then the island it leads to (its bridge on the map runs between
 * them). `wildRows` are the hiragana rows living in its grass. `theme` is the look of the island it leads to.
 */
export type WildRoute = {
  id: RouteId; name: string; japaneseName: string; between: readonly [IslandId, IslandId]; theme: SceneTheme;
  layout: VillageLayout; exits: readonly RouteExit[]; wildRows: readonly string[];
};

/** The exit the traveller is close enough to use, or null. */
export function nearbyExit(position: Vector, exits: readonly RouteExit[]): RouteExit | null {
  const distanceTo = (exit: RouteExit) => Math.hypot(exit.tile.x + 0.5 - position.x, exit.tile.y + 0.5 - position.y);
  const inReach = exits.filter(exit => distanceTo(exit) <= TALK_DISTANCE);
  return inReach.sort((a, b) => distanceTo(a) - distanceTo(b))[0] ?? null;
}

/** The address parameter naming where the traveller comes from: an island, opening a path; a path, arriving at the
 *  village or an island. */
export const ARRIVED_FROM = "from";

/** Where leaving a path through an exit goes: the village square for Home, otherwise that island's own scene, each
 *  told which path the traveller comes off (so they appear at its end). */
export const exitHref = (exit: RouteExit, routeId: RouteId) =>
  `${exit.island === "home" ? "/village" : `/islands/${exit.island}`}?${ARRIVED_FROM}=${routeId}`;

/** The page that opens a path from one of its ends (`from` is the island the traveller comes from). */
export const routeHref = (routeId: RouteId, from: IslandId) => `/wilds/${routeId}?${ARRIVED_FROM}=${from}`;

/** Where the traveller appears coming from `from`: that end's arrival spot, or the Home end when `from` isn't an end. */
export function arrivalOn(route: WildRoute, from: string | null): Vector {
  const end = route.exits.find(exit => exit.island === from) ?? route.exits.find(exit => exit.island === route.between[0]);
  return end?.arrival ?? route.layout.start;
}

/** Every row living in the paths' grass, in table order (the quick battle draws from them). */
export function allWildRows(routes: readonly WildRoute[]): string[] {
  const rows = new Set(routes.flatMap(route => route.wildRows));
  return HIRAGANA_ROWS.map(({ row }) => row).filter(row => rows.has(row));
}
