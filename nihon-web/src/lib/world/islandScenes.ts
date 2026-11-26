// An island on foot (docs/WORLD.md section 3): where a wild path arrives. Its buildings open the island's pages, its
// challenger waits there, and the bridge leads back onto the path. Types only; each island is content in
// data/world/islandScenes.
import type { VillageLayout } from "../errands/village.ts";
import type { IslandId } from "../islandMap.ts";
import type { Door } from "../village/villageDoors.ts";
import type { Vector } from "../errands/movement.ts";
import type { ChallengerId } from "./challenges.ts";
import type { Heading, RouteId } from "./routes.ts";
import type { SceneTheme, Surroundings } from "./sceneTheme.ts";
import type { IslandProp } from "./islandProps.ts";

/** `layout.villagers` holds the challenger, standing where they can be walked up to; `doors` include the way back
 *  and any path on. `arrivals` says where the traveller appears coming off each path (by its bridge). `theme` is the
 *  island's look, and `surroundings` what lies round it (water, or for Fuji clouds). `props` are the shrine pieces
 *  standing about it, drawn only in 3D (the ground they block is among `layout.obstacles`). */
export type IslandScene = {
  island: IslandId; name: string; japaneseName: string; theme: SceneTheme; surroundings: Surroundings;
  layout: VillageLayout; doors: readonly Door[]; challenger: ChallengerId; arrivals: readonly { route: RouteId; tile: Vector }[];
  props: readonly IslandProp[];
  /** The side facing the way up to Fuji, if the island has one: its far shore lies under snow and snow falls near it. */
  wintrySide?: Heading;
};

/** Where the traveller appears coming off the path `routeId`: by its bridge, or at the island's start for any other. */
export const islandArrivalFrom = (scene: IslandScene, routeId: string): Vector =>
  scene.arrivals.find(arrival => arrival.route === routeId)?.tile ?? scene.layout.start;
