// The village square in real 3D: its townhouses, shrine and people built in code, the traveller dressed as the learner
// chose, its lanterns lit as far as the day's errands are done (lit where it stands, as errands get done, without
// building it again), and a prompt over whoever or whatever is in reach.
import { useMemo } from "react";
import type { ReactNode } from "react";
import { IslandScene3D } from "../world3d/IslandScene3D";
import { JapaneseModelMaker } from "../world3d/japanese/japaneseModelMaker";
import { doorPrompt, villagerMarker, villagerPrompt } from "../world3d/scenePrompts";
import { VILLAGE_DOORS, VILLAGE_PROPS } from "../../data/village/villageSquare";
import { CAST } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { VillageLayout } from "../../lib/errands/village";
import type { Door } from "../../lib/village/villageDoors";
import { useTravellerLook } from "../../lib/useTravellerLook";
import { villageSquare3D } from "../../lib/world/japaneseIsland3D";

/** What E (or the prompt) does next to a villager. */
const TALK = "Talk";

type VillageSquare3DProps = {
  square: VillageLayout; litLanterns: number;
  position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean;
  nearbyId: CharacterId | null; nearbyDoor: Door | null; markedIds: readonly CharacterId[]; onAct: () => void;
  children: ReactNode;
};

export function VillageSquare3D({ square, litLanterns, position, facing, isWalking, isRunning, nearbyId, nearbyDoor, markedIds, onAct, children }: VillageSquare3DProps) {
  const look = useTravellerLook();
  const maker = useMemo(() => new JapaneseModelMaker(look), [look]);
  const island = useMemo(() => villageSquare3D({ layout: square, doors: VILLAGE_DOORS, props: VILLAGE_PROPS, theme: "sakura", surroundings: "water" }),
    [square]);
  // The learner's own name is on their house's sign, so it's part of what names the scene.
  const sceneKey = useMemo(() => `village:${JSON.stringify(look)}:${JSON.stringify(square.buildings)}`, [look, square]);
  const prompt = useMemo(() => {
    if (nearbyDoor) return doorPrompt(nearbyDoor);
    const villager = square.villagers.find(({ id }) => id === nearbyId);
    return villager ? villagerPrompt(villager.tile, TALK, `Talk to ${CAST[villager.id].name}`) : null;
  }, [square, nearbyDoor, nearbyId]);
  // The one in reach has the prompt over them instead of their mark.
  const markers = useMemo(() => square.villagers.filter(({ id }) => markedIds.includes(id) && id !== nearbyId).map(({ id, tile }) => villagerMarker(id, tile)),
    [square, markedIds, nearbyId]);
  return <IslandScene3D sceneKey={sceneKey} island={island} maker={maker} litLanterns={litLanterns} position={position} facing={facing} isWalking={isWalking} isRunning={isRunning}
    prompt={prompt} onPrompt={onAct} markers={markers}>{children}</IslandScene3D>;
}
