import { useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TouchControls } from "../components/errands/TouchControls";
import { VillageScene } from "../components/errands/VillageScene";
import { BattleOverlay } from "../components/kanaWilds/BattleOverlay";
import { CHALLENGERS } from "../data/world/challengers";
import { islandSceneOf } from "../data/world/islandScenes";
import { routeById } from "../data/world/routes";
import { CAST } from "../lib/cast";
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

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{scene.name} ({scene.japaneseName})</h1>
      <VillageScene village={scene.layout} position={walker.position} facing={walker.facing} isWalking={isHolding && isWalking} isRunning={isRunning}
        openGateIds={NO_GATES} litLanterns={scene.layout.lanterns.length} markedVillagerIds={markedIds} theme={scene.theme} surroundings={scene.surroundings} nearbyId={isByChallenger ? challenger.character : null}
        onTalk={() => { if (isByChallenger) takeOn(); }} talkAction={FIGHT} nearbyDoor={door} onEnterDoor={() => act?.()}>
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
      </VillageScene>
    </main>
  </div>;
}
