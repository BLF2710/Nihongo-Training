// An island on foot (docs/WORLD.md section 3): where a wild path arrives. Its buildings open the island's pages, its
// challenger waits there, and the bridge leads back onto the path. Types only; each island is content in
// data/world/islandScenes.
import type { VillageLayout } from "../errands/village.ts";
import type { IslandId } from "../islandMap.ts";
import type { Door } from "../village/villageDoors.ts";
import type { ChallengerId } from "./challenges.ts";
import type { SceneTheme } from "./sceneTheme.ts";

/** `layout.villagers` holds the challenger, standing where they can be walked up to; `doors` include the way back.
 *  `theme` is the island's look. */
export type IslandScene = {
  island: IslandId; name: string; japaneseName: string; theme: SceneTheme;
  layout: VillageLayout; doors: readonly Door[]; challenger: ChallengerId;
};
