// A wild path: a walkable route from the home village to an island, with tall grass where wild kana live.
// Types and pure lookups; each path's map is content in data/world/routes.
import type { IslandId } from "../islandMap.ts";
import type { Vector } from "../errands/movement.ts";
import { TALK_DISTANCE } from "../errands/movement.ts";
import type { VillageLayout } from "../errands/village.ts";
import { HIRAGANA_ROWS } from "../kanaWilds/gojuon.ts";
import type { ChallengerId } from "./challenges.ts";
import type { SceneTheme } from "./sceneTheme.ts";

export type RouteId = "home-kana" | "home-practice" | "home-games";

/**
 * One end of the path. Standing at `tile`, the traveller can leave for `island` (Home is the village square, any
 * other island its own walkable scene). Coming onto the path from that island, they appear at `arrival`.
 */
export type RouteExit = { tile: Vector; arrival: Vector; island: IslandId; label: string };

/**
 * `between` names the islands at its two ends: Home, then the island it leads to (its bridge on the map runs between
 * them). `wildRows` are the hiragana rows living in its grass from the start; `rewardRows` join them once the
 * player beats a challenger (docs/KANA-BATTLE.md section 9). `theme` is the look of the island it leads to.
 */
export type WildRoute = {
  id: RouteId; name: string; japaneseName: string; between: readonly [IslandId, IslandId]; theme: SceneTheme;
  layout: VillageLayout; exits: readonly RouteExit[]; wildRows: readonly string[]; rewardRows?: RewardRows;
};

/** Rows held back from a path's grass until the player beats `until`. The API holds the same kana back from catches
 *  (kana-wilds.service.ts). */
export type RewardRows = { rows: readonly string[]; until: ChallengerId };

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

const inTableOrder = (rows: Iterable<string>): string[] => {
  const wanted = new Set(rows);
  return HIRAGANA_ROWS.map(({ row }) => row).filter(row => wanted.has(row));
};

/** Whether the path's reward rows are still held back. */
export const isHeldBack = (route: WildRoute, beaten: ReadonlySet<ChallengerId>): route is WildRoute & { rewardRows: RewardRows } =>
  route.rewardRows !== undefined && !beaten.has(route.rewardRows.until);

/** The rows living in the path's grass now, in table order: its own, and its reward rows once they are won. */
export function openRowsOf(route: WildRoute, beaten: ReadonlySet<ChallengerId>): string[] {
  return inTableOrder([...route.wildRows, ...(route.rewardRows && !isHeldBack(route, beaten) ? route.rewardRows.rows : [])]);
}

/** Every row living in the paths' grass now, in table order (the quick battle draws from them). */
export function allWildRows(routes: readonly WildRoute[], beaten: ReadonlySet<ChallengerId>): string[] {
  return inTableOrder(routes.flatMap(route => openRowsOf(route, beaten)));
}

/** The path whose grass beating this challenger fills, if any. */
export const routeRewardedBy = (routes: readonly WildRoute[], challenger: ChallengerId): (WildRoute & { rewardRows: RewardRows }) | undefined =>
  routes.find((route): route is WildRoute & { rewardRows: RewardRows } => route.rewardRows?.until === challenger);

/** The rows named by their first kana, for telling the player: "さ and た", "ま, や, ら, わ and ん". */
export function rowNames(rows: readonly string[]): string {
  const names = HIRAGANA_ROWS.filter(({ row }) => rows.includes(row)).map(({ kana }) => kana[0]?.kana ?? "");
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
