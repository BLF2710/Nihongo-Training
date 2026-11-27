// A place of the English isle walked in 3D (the island, the castle courtyard, the market square): the traveller walks
// with the keys or the touch pad, goes through a door with E, and talks to a townsperson with E. The page decides what
// talking does (it opens their news) and what else floats over the scene.
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { TouchControls } from "../errands/TouchControls";
import { IslandScene3D } from "../world3d/IslandScene3D";
import { GltfModelMaker } from "../world3d/models";
import { doorPrompt, villagerMarker, villagerPrompt } from "../world3d/scenePrompts";
import type { ModelIsland } from "../../data/world/modelIsland";
import { TOWNSFOLK } from "../../lib/englishTown/townsfolk";
import type { TownsfolkId } from "../../lib/englishTown/townsfolk";
import { nearbyThing } from "../../lib/village/villageDoors";
import { useActionKey, useWorldWalk } from "../../lib/world/useWorldWalk";

const TALK = "Talk";
const NO_ONE: readonly TownsfolkId[] = [];

type EnglishPlaceWalkProps = {
  place: ModelIsland;
  /** Names the scene, so coming back shows it again at once (see IslandScene3D). */
  sceneKey: string;
  /** Where the traveller's spot is remembered, so coming back from a page puts them where they were. */
  rememberKey: string;
  /** Who the traveller is talking to: walking stops while they talk. */
  talkingTo?: TownsfolkId | null;
  onTalk?: (id: TownsfolkId) => void;
  /** Townsfolk with news, marked with a "!". */
  markedIds?: readonly TownsfolkId[];
  litLanterns?: number;
  /** Over the scene's top-left corner (the day's errands, say). */
  corner?: ReactNode;
  /** Over the scene while talking (the townsperson's news). */
  children?: ReactNode;
};

export function EnglishPlaceWalk({ place, sceneKey, rememberKey, talkingTo = null, onTalk, markedIds = NO_ONE, litLanterns = 0, corner, children }: EnglishPlaceWalkProps) {
  const navigate = useNavigate();
  const isWalking = talkingTo === null;
  const memory = useMemo(() => ({ rememberKey, arrival: null }), [rememberKey]);
  const { walker, isHolding, isRunning, press, release, setIsRunning } = useWorldWalk(place.layout, isWalking, memory);
  const nearby = isWalking ? nearbyThing(walker.position, place.townsfolk, place.doors) : null;
  const door = nearby?.kind === "door" ? nearby.door : null;
  const townspersonId = nearby?.kind === "villager" ? nearby.id : null;
  const act = useMemo(() => door ? () => navigate(door.href) : townspersonId && onTalk ? () => onTalk(townspersonId) : null, [door, townspersonId, onTalk, navigate]);
  useActionKey(act);
  const maker = useMemo(() => new GltfModelMaker(), []);
  const prompt = useMemo(() => {
    if (door) return doorPrompt(door);
    const townsperson = place.townsfolk.find(({ id }) => id === townspersonId);
    return townsperson ? villagerPrompt(townsperson.tile, TALK, `Talk to ${TOWNSFOLK[townsperson.id].name}`) : null;
  }, [door, townspersonId, place]);
  // The one in reach has the prompt over them instead of their mark.
  const markers = useMemo(() => place.townsfolk.filter(({ id }) => markedIds.includes(id) && id !== townspersonId).map(({ id, tile }) => villagerMarker(id, tile)),
    [place, markedIds, townspersonId]);
  const canTalk = place.townsfolk.length > 0;

  return <IslandScene3D sceneKey={sceneKey} island={place.scene} maker={maker} litLanterns={litLanterns} position={walker.position} facing={walker.facing}
    isWalking={isHolding && isWalking} isRunning={isRunning} prompt={prompt} onPrompt={() => act?.()} markers={markers}>
    <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
      <div>{corner}</div>
      <p className={`rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm ${corner ? "max-sm:hidden" : ""}`}>
        <span className="block text-lg font-black" lang="en-GB">{place.name}</span><span className="text-xs text-gray-600" lang="vi">{place.localName}</span>
      </p>
    </div>
    <p className="sr-only" aria-live="polite">{door ? `${door.label}. Press E to go.` : townspersonId ? `${TOWNSFOLK[townspersonId].name} is nearby. Press E to talk.` : ""}</p>
    {isWalking && <>
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
        Walk: WASD or arrow keys · Go in{canTalk ? " or talk" : ""}: E{markedIds.length ? " · A ! means news" : ""}
      </p>
      <TouchControls onPress={press} onRelease={release} onTalk={() => act?.()} canTalk={act !== null}
        talkLabel={townspersonId ? TALK : door?.action ?? "Enter"} isRunning={isRunning} onRunningChange={setIsRunning} />
    </>}
    {children}
  </IslandScene3D>;
}
