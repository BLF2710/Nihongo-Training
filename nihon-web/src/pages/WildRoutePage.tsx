import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TouchControls } from "../components/errands/TouchControls";
import { VillageScene } from "../components/errands/VillageScene";
import { BattleOverlay } from "../components/kanaWilds/BattleOverlay";
import { CHALLENGERS } from "../data/world/challengers";
import { islandSceneOf } from "../data/world/islandScenes";
import { routeById, WILD_ROUTES } from "../data/world/routes";
import { CAST } from "../lib/cast";
import { ISLANDS } from "../lib/islandMap";
import type { IslandId } from "../lib/islandMap";
import { terrainAt } from "../lib/errands/townMap";
import { useWildBattles } from "../lib/kanaWilds/useWildBattles";
import { AFTER_BATTLE, FRESH_GRASS_WALK, stepOnto } from "../lib/world/grassEncounters";
import type { GrassWalk } from "../lib/world/grassEncounters";
import { arrivalOn, exitHref, grassRowsOf, isHeldBack, nearbyExit, OPPOSITE_HEADING, rowNames } from "../lib/world/routes";
import type { ChallengerId } from "../lib/world/challenges";
import type { Surroundings } from "../lib/world/sceneTheme";
import type { GrassKind, RouteExit, Travel, WildRoute } from "../lib/world/routes";
import { useActionKey, useWorldWalk } from "../lib/world/useWorldWalk";

const random = Math.random;
const NO_GATES: readonly string[] = [];
const NO_ONE: readonly never[] = [];
const ignoreTalk = () => undefined;

/** A wild path from the village to an island; an unknown path id gets a way back to the map. `?from=` names the island
 *  the traveller comes from, so they arrive at that end. */
export default function WildRoutePage() {
  const { routeId = "" } = useParams();
  const [search] = useSearchParams();
  const route = routeById(routeId);
  if (!route) return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto max-w-lg p-8"><h1 className="text-xl font-black">This path doesn't exist</h1>
      <Link to="/" className="mt-3 inline-block font-bold text-emerald-800 underline">Back to the island map</Link></main>
  </div>;
  const from = search.get("from");
  return <WildPath key={`${route.id}:${from}`} route={route} from={from} />;
}

/** Starts a battle now and then as the traveller steps onto new tall-grass (or rough-water) tiles (see lib/world/grassEncounters). */
function useGrassEncounters(route: WildRoute, tile: { x: number; y: number }, canMeet: boolean, onMeet: () => void) {
  const grassWalk = useRef<GrassWalk>(FRESH_GRASS_WALK);
  const lastTile = useRef(`${tile.x},${tile.y}`);
  useEffect(() => {
    const key = `${tile.x},${tile.y}`;
    if (key === lastTile.current) return;
    lastTile.current = key;
    if (!canMeet) return;
    const step = stepOnto(grassWalk.current, terrainAt(route.layout.map, tile.x, tile.y), random());
    grassWalk.current = step.walk;
    if (step.isEncounter) onMeet();
  }, [route, tile.x, tile.y, canMeet, onMeet]);
  return useCallback(() => { grassWalk.current = AFTER_BATTLE; }, []);
}

const capitalised = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** An end of a path, as the hint names it: Home's is the village. */
const endName = (island: IslandId) => {
  if (island === "home") return "the village";
  const name = islandSceneOf(island)?.name ?? `The ${ISLANDS.find(item => item.id === island)?.name ?? island} island`;
  return name.replace(/^The /, "the ");
};

/** Which way each end lies: "South: the village, north: the Games island". */
const waysOut = ({ heading, between: [start, end] }: WildRoute) =>
  `${capitalised(OPPOSITE_HEADING[heading])}: ${endName(start)}, ${heading}: ${endName(end)}`;

/** Where wild kana live on the way, and how the walking hint puts moving and running. */
/** What lies beyond a path's edges: the woods going on, or for the ferry the open sea. */
const SURROUNDINGS_BY_TRAVEL: Readonly<Record<Travel, Surroundings>> = { foot: "woods", boat: "water" };

const TRAVEL_WORDS: Readonly<Record<Travel, { wildPlace: string; controls: string; wildKana: string }>> = {
  foot: { wildPlace: "the tall grass", controls: "Walk: WASD or arrow keys · Run: hold Shift", wildKana: "Wild kana hide in the tall grass" },
  boat: { wildPlace: "the rough water", controls: "Row: WASD or arrow keys · Row hard: hold Shift", wildKana: "Wild kana leap from the rough water" },
};

/** What the path's sign says lives in grass that isn't the path's own rows. */
const SHARED_GRASS_NOTE: Readonly<Record<Exclude<GrassKind, "own-rows">, (wildPlace: string) => string>> = {
  "every-open-row": wildPlace => `wild kana from every path in ${wildPlace}`,
  review: wildPlace => `kana you have caught, from every path, in ${wildPlace}: a review`,
};

/** What lives in the path's grass, and who holds back the rest: "Beat Chun to bring the さ and た rows here". */
function grassNote(route: WildRoute, beaten: ReadonlySet<ChallengerId>, openRows: readonly string[]): string {
  const { wildPlace } = TRAVEL_WORDS[route.travel];
  if (route.grass !== "own-rows") return SHARED_GRASS_NOTE[route.grass](wildPlace);
  if (!isHeldBack(route, beaten)) return `wild kana in ${wildPlace}`;
  const { name } = CAST[CHALLENGERS[route.rewardRows.until].character];
  const held = `Beat ${name} to bring the ${rowNames(route.rewardRows.rows)} rows here.`;
  return openRows.length ? `wild kana in ${wildPlace}. ${held}` : `the grass is quiet. ${held}`;
}

function WildPath({ route, from }: { route: WildRoute; from: string | null }) {
  const navigate = useNavigate();
  const battles = useWildBattles(random);
  const { collection: { state }, screen, explore, review, close, beatenChallengers } = battles;
  const hasStarter = state.status === "ready" && state.collection.starter !== null;
  const isWalking = hasStarter && screen.kind === "none";
  const layout = useMemo(() => ({ ...route.layout, start: arrivalOn(route, from) }), [route, from]);
  const { walker, isHolding, isRunning, press, release, setIsRunning } = useWorldWalk(layout, isWalking);

  const tile = { x: Math.floor(walker.position.x), y: Math.floor(walker.position.y) };
  const openRows = useMemo(() => grassRowsOf(route, WILD_ROUTES, beatenChallengers), [route, beatenChallengers]);
  const meet = route.grass === "review" ? review : explore;
  const meetWildKana = useCallback(() => meet(openRows), [meet, openRows]);
  const afterBattle = useGrassEncounters(route, tile, isWalking && openRows.length > 0, meetWildKana);
  const backToPath = useCallback(() => { afterBattle(); close(); }, [afterBattle, close]);

  const exit = isWalking ? nearbyExit(walker.position, route.exits) : null;
  const leave = useCallback((through: RouteExit) => navigate(exitHref(through, route.id)), [navigate, route.id]);
  const act = useMemo(() => exit ? () => leave(exit) : null, [exit, leave]);
  useActionKey(act);

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{route.name} ({route.japaneseName}), a wild path</h1>
      <VillageScene village={route.layout} position={walker.position} facing={walker.facing} isWalking={isHolding && isWalking} isRunning={isRunning}
        openGateIds={NO_GATES} litLanterns={route.layout.lanterns.length} markedVillagerIds={NO_ONE} nearbyId={null} onTalk={ignoreTalk} theme={route.theme} surroundings={SURROUNDINGS_BY_TRAVEL[route.travel]} isAboard={route.travel === "boat"}
        nearbyDoor={exit ? { tile: exit.tile, label: exit.label, action: "Go" } : null} onEnterDoor={() => act?.()}>
        <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex justify-end sm:inset-x-4 sm:top-4">
          <p className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm">
            <span className="block text-lg font-black" lang="ja">{route.japaneseName}</span><span className="text-xs text-gray-600">{route.name}: {grassNote(route, beatenChallengers, openRows)}</span>
          </p>
        </div>
        <p className="sr-only" aria-live="polite">{exit ? `${exit.label}. Press E to go.` : ""}</p>
        {isWalking && <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
          {TRAVEL_WORDS[route.travel].controls} · {TRAVEL_WORDS[route.travel].wildKana} · {waysOut(route)} (E)
        </p>}
        {isWalking && <TouchControls onPress={press} onRelease={release} onTalk={() => act?.()} canTalk={act !== null} talkLabel="Go"
          isRunning={isRunning} onRunningChange={setIsRunning} />}
        {!isWalking && <BattleOverlay battles={battles} random={random} backLabel="Back to the path" onBack={backToPath} onCollection={() => navigate("/games/kana-wilds")} />}
      </VillageScene>
    </main>
  </div>;
}
