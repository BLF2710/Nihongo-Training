import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TouchControls } from "../components/errands/TouchControls";
import { IslandScene3D } from "../components/world3d/IslandScene3D";
import { ENGLISH_ISLAND as island } from "../data/world/englishIsland";
import { nearbyThing } from "../lib/village/villageDoors";
import { useActionKey, useWorldWalk } from "../lib/world/useWorldWalk";

const WALK_MEMORY = { rememberKey: "island:english:place", arrival: null };

/** The English island on foot: walk up to the castle, the watchtower, the church school or the tavern to open its page. */
export default function EnglishIslandPage() {
  const navigate = useNavigate();
  const { walker, isHolding, isRunning, press, release, setIsRunning } = useWorldWalk(island.layout, true, WALK_MEMORY);
  const nearby = nearbyThing(walker.position, island.layout.villagers, island.doors);
  const door = nearby?.kind === "door" ? nearby.door : null;
  const act = useMemo(() => door ? () => navigate(door.href) : null, [door, navigate]);
  useActionKey(act);

  return <div className="flex h-dvh flex-col bg-gray-50 text-gray-900"><Navbar />
    <main className="relative min-h-0 flex-1">
      <h1 className="sr-only">{island.name} ({island.localName})</h1>
      <IslandScene3D island={island.scene} position={walker.position} facing={walker.facing} isWalking={isHolding} isRunning={isRunning}
        nearbyDoor={door} onEnterDoor={() => act?.()}>
        <div className="pointer-events-none absolute inset-x-2 top-2 z-[900] flex justify-end sm:inset-x-4 sm:top-4">
          <p className="rounded-xl border border-gray-200 bg-white/95 px-3 py-2 text-right shadow-sm">
            <span className="block text-lg font-black" lang="en-GB">{island.name}</span><span className="text-xs text-gray-600" lang="vi">{island.localName}</span>
          </p>
        </div>
        <p className="sr-only" aria-live="polite">{door ? `${door.label}. Press E to go.` : ""}</p>
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-[800] -translate-x-1/2 village-hint rounded-full px-3 py-1 text-xs font-semibold pointer-coarse:hidden">
          Walk: WASD or arrow keys · Go in: E · The jetty leads back to the start page
        </p>
        <TouchControls onPress={press} onRelease={release} onTalk={() => act?.()} canTalk={act !== null}
          talkLabel={door?.action ?? "Enter"} isRunning={isRunning} onRunningChange={setIsRunning} />
      </IslandScene3D>
    </main>
  </div>;
}
