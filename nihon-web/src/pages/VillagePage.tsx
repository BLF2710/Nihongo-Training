import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { TouchControls } from "../components/errands/TouchControls";
import { VillageScene } from "../components/errands/VillageScene";
import { DailyErrandsBoard } from "../components/village/DailyErrandsBoard";
import { VillagerNewsPanel } from "../components/village/VillagerNewsPanel";
import { HOME_BUILDING_ID, VILLAGE_DOORS, VILLAGE_SQUARE } from "../data/village/villageSquare";
import { getUserName } from "../lib/authStorage";
import { withHomeSign } from "../lib/village/homeSign";
import { CAST } from "../lib/cast";
import type { CharacterId } from "../lib/cast";
import { RUN_SPEED, WALK_SPEED, heldDirection } from "../lib/errands/movement";
import { useFrameLoop, useHeldDirections } from "../lib/errands/useWalkControls";
import { dailyErrands, villagerNews } from "../lib/village/villageNews";
import { useVillageLiveData } from "../lib/village/useVillageLiveData";
import { useVillageWalk } from "../lib/village/useVillageWalk";
import { useVillageShortcuts } from "../lib/village/useVillageShortcuts";
import { nearbyThing } from "../lib/village/villageDoors";
import { useNavigate } from "react-router-dom";

const TALK_KEYS: ReadonlySet<string> = new Set(["KeyE", "Enter", "Space"]);
const NO_GATES: readonly string[] = [];

/** The village square: walk up to a villager to hear their news (from the learner's own study) and go where they
 *  point; today's errands are the day's study plan, and each one done lights some of the lanterns. */
export default function VillagePage() {
  const userName = getUserName();
  const square = useMemo(() => withHomeSign(VILLAGE_SQUARE, HOME_BUILDING_ID, userName), [userName]);
  const { data, isLoading } = useVillageLiveData();
  const errands = dailyErrands(data);
  const walker = useVillageWalk(square, "village-square:place");
  const [talkingTo, setTalkingTo] = useState<CharacterId | null>(null);
  const { held, isHolding, isRunning, press, release, setIsRunning } = useHeldDirections(talkingTo === null);
  useFrameLoop(isHolding, seconds => walker.walkBy(heldDirection(held.current), seconds, isRunning ? RUN_SPEED : WALK_SPEED));

  useVillageShortcuts("village", talkingTo === null);

  const navigate = useNavigate();
  const nearby = talkingTo ? null : nearbyThing(walker.position, square.villagers, VILLAGE_DOORS);
  const nearbyId = nearby?.kind === "villager" ? nearby.id : null;
  const nearbyDoor = nearby?.kind === "door" ? nearby.door : null;
  const talk = useCallback((id: CharacterId | null) => { if (id) setTalkingTo(id); }, []);
  // E (or the touch Talk button) talks to the villager in reach, or goes through the door.
  const actOnNearby = useCallback(() => {
    if (nearbyDoor) navigate(nearbyDoor.href);
    else talk(nearbyId);
  }, [nearbyDoor, nearbyId, navigate, talk]);
  const close = useCallback(() => setTalkingTo(null), []);
  useEffect(() => {
    if (talkingTo) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || !TALK_KEYS.has(event.code) || (!nearbyId && !nearbyDoor)) return;
      event.preventDefault();
      actOnNearby();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [talkingTo, nearbyId, nearbyDoor, actOnNearby]);

  const markedIds = square.villagers.filter(({ id }) => villagerNews(id, data, errands).hasNews).map(({ id }) => id);
  const done = errands.filter(errand => errand.isDone).length;
  const litLanterns = errands.length ? Math.floor(square.lanterns.length * done / errands.length) : 0;
  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">Village square</h1>
      <VillageScene village={square} position={walker.position} facing={walker.facing} isWalking={isHolding} isRunning={isRunning}
        openGateIds={NO_GATES} litLanterns={litLanterns} markedVillagerIds={markedIds} nearbyId={nearbyId}
        onTalk={id => { if (nearbyId === id) talk(id); }} nearbyDoor={nearbyDoor} onEnterDoor={actOnNearby}>
        <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
          <DailyErrandsBoard errands={errands} status={isLoading ? "loading" : data.today === null ? "unavailable" : "ready"} />
          <p className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm max-sm:hidden">
            <span className="block text-lg font-black" lang="ja">ひろば</span><span className="text-xs text-gray-600">Village square</span>
          </p>
        </div>
        <p className="sr-only" aria-live="polite">{nearbyId ? `${CAST[nearbyId].name} is nearby. Press E to talk.` : nearbyDoor ? `${nearbyDoor.label}. Press E to go in.` : ""}</p>
        {!talkingTo && <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
          Walk: WASD or arrow keys · Run: hold Shift · Talk: E · Dashboard: Tab · Map: M · A ! means news for you
        </p>}
        {!talkingTo && <TouchControls onPress={press} onRelease={release} onTalk={actOnNearby} canTalk={nearby !== null} talkLabel={nearbyDoor ? "Enter" : "Talk"} isRunning={isRunning} onRunningChange={setIsRunning} />}
        {talkingTo && <VillagerNewsPanel villager={talkingTo} news={villagerNews(talkingTo, data, errands)} onClose={close} />}
      </VillageScene>
    </main>
  </div>;
}
