// Where the last island scene built is kept between pages (see lib/world/sceneKeeper), handed down from the app.
import { createContext, useContext } from "react";
import type { SceneKeeper } from "../../lib/world/sceneKeeper";
import type { IslandRenderer } from "./islandRenderer";

export type KeptScenes = SceneKeeper<IslandRenderer>;

export const KeptScenesContext = createContext<KeptScenes | null>(null);

export class MissingKeptScenesError extends Error {
  constructor() { super("An island scene is drawn outside KeptScenesProvider."); this.name = "MissingKeptScenesError"; }
}

export function useKeptScenes(): KeptScenes {
  const keeper = useContext(KeptScenesContext);
  if (!keeper) throw new MissingKeptScenesError();
  return keeper;
}
