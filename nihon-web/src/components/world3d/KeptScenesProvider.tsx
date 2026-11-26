// Keeps the last island scene built for as long as the app is open (or until another island is built), so coming
// back to an island from one of its pages doesn't build it again.
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { SceneKeeper } from "../../lib/world/sceneKeeper";
import { KeptScenesContext } from "./keptScenes";
import type { IslandRenderer } from "./islandRenderer";

export function KeptScenesProvider({ children }: { children: ReactNode }) {
  const [keeper] = useState(() => new SceneKeeper<IslandRenderer>());
  useEffect(() => () => keeper.release(), [keeper]);
  return <KeptScenesContext.Provider value={keeper}>{children}</KeptScenesContext.Provider>;
}
