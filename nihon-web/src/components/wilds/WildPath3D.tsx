// A wild path walked in real 3D: its trees, rocks and swaying tall grass, the pieces standing along it in keeping with
// the island it leads to, the traveller dressed as the learner chose, and a prompt over an exit in reach.
import { useMemo } from "react";
import type { ReactNode } from "react";
import { IslandScene3D } from "../world3d/IslandScene3D";
import { JapaneseModelMaker } from "../world3d/japanese/japaneseModelMaker";
import { doorPrompt } from "../world3d/scenePrompts";
import type { Direction, Vector } from "../../lib/errands/movement";
import { useTravellerLook } from "../../lib/useTravellerLook";
import { wildRoute3D } from "../../lib/world/japaneseIsland3D";
import type { RouteExit, WildRoute } from "../../lib/world/routes";

/** What E (or the prompt) does at an exit. */
const GO = "Go";

type WildPath3DProps = {
  route: WildRoute; position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean;
  exit: RouteExit | null; onAct: () => void; children: ReactNode;
};

export function WildPath3D({ route, position, facing, isWalking, isRunning, exit, onAct, children }: WildPath3DProps) {
  const look = useTravellerLook();
  const maker = useMemo(() => new JapaneseModelMaker(look), [look]);
  const island = useMemo(() => wildRoute3D(route), [route]);
  const sceneKey = `wilds:${route.id}:${JSON.stringify(look)}`;
  const prompt = useMemo(() => exit ? doorPrompt({ id: exit.island, tile: exit.tile, href: "", label: exit.label, action: GO }) : null, [exit]);
  return <IslandScene3D sceneKey={sceneKey} island={island} maker={maker} position={position} facing={facing} isWalking={isWalking} isRunning={isRunning}
    prompt={prompt} onPrompt={onAct}>{children}</IslandScene3D>;
}
