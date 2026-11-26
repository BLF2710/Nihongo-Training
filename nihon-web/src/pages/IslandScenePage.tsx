import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TouchControls } from "../components/errands/TouchControls";
import { VillageScene } from "../components/errands/VillageScene";
import { IslandScene3D } from "../components/world3d/IslandScene3D";
import { JapaneseModelMaker } from "../components/world3d/japanese/japaneseModelMaker";
import { doorPrompt, villagerMarker, villagerPrompt } from "../components/world3d/scenePrompts";
import { japaneseIsland3D } from "../lib/world/japaneseIsland3D";
import { useTravellerLook } from "../lib/useTravellerLook";
import { BattleOverlay } from "../components/kanaWilds/BattleOverlay";
import { CHALLENGERS } from "../data/world/challengers";
import { ISLANDS_IN_3D, islandSceneOf } from "../data/world/islandScenes";
import { routeById } from "../data/world/routes";
import { CAST } from "../lib/cast";
import type { CharacterId } from "../lib/cast";
import type { Direction, Vector } from "../lib/errands/movement";
import type { Door } from "../lib/village/villageDoors";
import { useWildBattles } from "../lib/kanaWilds/useWildBattles";
import { nearbyThing } from "../lib/village/villageDoors";
import { islandArrivalFrom } from "../lib/world/islandScenes";
import type { IslandScene } from "../lib/world/islandScenes";
import type { Travel } from "../lib/world/routes";
import { useArrival } from "../lib/world/useArrival";
import { useActionKey, useWorldWalk } from "../lib/world/useWorldWalk";

const random = Math.random;
const NO_GATES: readonly string[] = [];
const NO_ONE: readonly never[] = [];
/** What E does next to the island's challenger. */
const FIGHT = "Fight";

/** An island on foot, where its wild path arrives; an island without a scene gets a way back to the map. */
export default function IslandScenePage() {
  const { islandId = "" } = useParams();
  const scene = islandSceneOf(islandId);
  if (!scene) return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto max-w-lg p-8"><h1 className="text-xl font-black">No path reaches this island yet</h1>
      <Link to="/" className="mt-3 inline-block font-bold text-emerald-800 underline">Back to the island map</Link></main>
  </div>;
  return <IslandOnFoot key={scene.island} scene={scene} />;
}

/** What the walking hint says about the way back the traveller came: over the bridge, or from the pier by boat. */
const WAY_BACK: Readonly<Record<Travel, string>> = { foot: "The bridge leads back to the path", boat: "The ferry back leaves from the pier" };

/** How the way the island is reached by is travelled (its first arrival is that way's). */
const wayBackBy = (scene: IslandScene): Travel => routeById(scene.arrivals[0]?.route ?? "")?.travel ?? "foot";

/** Walk up to a building to open its page, to the challenger to take them on, or to the bridge to head back. */
function IslandOnFoot({ scene }: { scene: IslandScene }) {
  const navigate = useNavigate();
  const battles = useWildBattles(random);
  const { beatenChallengers, screen, challenge, close } = battles;
  // The overlay opens for a challenge (asking for a starter first, if there is none yet).
  const isWalking = screen.kind === "none";
  // Off the path, the traveller arrives at the bridge; back from a building's page, they stand where they were.
  const arrival = useArrival(routeId => islandArrivalFrom(scene, routeId));
  const { walker, isHolding, isRunning, press, release, setIsRunning } = useWorldWalk(scene.layout, isWalking, { rememberKey: `island:${scene.island}:place`, arrival });

  const challenger = CHALLENGERS[scene.challenger];
  const { name: challengerName } = CAST[challenger.character];
  const nearby = isWalking ? nearbyThing(walker.position, scene.layout.villagers, scene.doors) : null;
  const door = nearby?.kind === "door" ? nearby.door : null;
  const isByChallenger = nearby?.kind === "villager";
  const takeOn = useCallback(() => challenge(challenger), [challenge, challenger]);
  const act = useMemo(() => door ? () => navigate(door.href) : isByChallenger ? takeOn : null, [door, isByChallenger, navigate, takeOn]);
  useActionKey(act);
  const markedIds = beatenChallengers.has(challenger.id) ? NO_ONE : [challenger.character];

  const challengerHere = useMemo(() => isByChallenger ? { tile: challengerTile(scene), name: challengerName } : null, [isByChallenger, scene, challengerName]);
  const overlays = <>
    <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex justify-end sm:inset-x-4 sm:top-4">
      <p className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm">
        <span className="block text-lg font-black" lang="ja">{scene.japaneseName}</span><span className="text-xs text-gray-600">{scene.name}</span>
      </p>
    </div>
    <p className="sr-only" aria-live="polite">{door ? `${door.label}. Press E to go.` : isByChallenger ? `${challengerName} is here. Press E to challenge them.` : ""}</p>
    {isWalking && <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
      Walk: WASD or arrow keys · Go in, or challenge {challengerName}: E · {WAY_BACK[wayBackBy(scene)]}
    </p>}
    {isWalking && <TouchControls onPress={press} onRelease={release} onTalk={() => act?.()} canTalk={act !== null}
      talkLabel={isByChallenger ? FIGHT : door?.action ?? "Enter"} isRunning={isRunning} onRunningChange={setIsRunning} />}
    {!isWalking && <BattleOverlay battles={battles} random={random} backLabel={`Back to the ${scene.name.replace(/^The /, "")}`} onBack={close} onCollection={() => navigate("/games/kana-wilds")} />}
  </>;
  const walking = { position: walker.position, facing: walker.facing, isWalking: isHolding && isWalking, isRunning };

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{scene.name} ({scene.japaneseName})</h1>
      {ISLANDS_IN_3D.has(scene.island)
        ? <Island3D scene={scene} {...walking} door={door} challenger={challengerHere}
          markedIds={markedIds} onAct={() => act?.()}>{overlays}</Island3D>
        : <VillageScene village={scene.layout} {...walking}
          openGateIds={NO_GATES} litLanterns={scene.layout.lanterns.length} markedVillagerIds={markedIds} theme={scene.theme} surroundings={scene.surroundings} nearbyId={isByChallenger ? challenger.character : null}
          onTalk={() => { if (isByChallenger) takeOn(); }} talkAction={FIGHT} nearbyDoor={door} onEnterDoor={() => act?.()}>{overlays}</VillageScene>}
    </main>
  </div>;
}

/** Where the island's challenger stands. */
const challengerTile = (scene: IslandScene): Vector => scene.layout.villagers[0]?.tile ?? scene.layout.start;

type Island3DProps = {
  scene: IslandScene; position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean;
  door: Door | null; challenger: { tile: Vector; name: string } | null; markedIds: readonly CharacterId[]; onAct: () => void; children: ReactNode;
};

/** The island in real 3D: its models built in code, the traveller dressed as the learner chose. */
function Island3D({ scene, position, facing, isWalking, isRunning, door, challenger, markedIds, onAct, children }: Island3DProps) {
  const look = useTravellerLook();
  const island = useMemo(() => japaneseIsland3D(scene), [scene]);
  const maker = useMemo(() => new JapaneseModelMaker(look), [look]);
  const sceneKey = `island:${scene.island}:${JSON.stringify(look)}`;
  const prompt = useMemo(() => door ? doorPrompt(door)
    : challenger ? villagerPrompt(challenger.tile, FIGHT, `Challenge ${challenger.name}`) : null, [door, challenger]);
  const markers = useMemo(() => scene.layout.villagers.filter(({ id }) => markedIds.includes(id) && !challenger).map(({ id, tile }) => villagerMarker(id, tile)),
    [scene, markedIds, challenger]);
  return <IslandScene3D sceneKey={sceneKey} island={island} maker={maker} position={position} facing={facing} isWalking={isWalking} isRunning={isRunning}
    prompt={prompt} onPrompt={onAct} markers={markers}>{children}</IslandScene3D>;
}
