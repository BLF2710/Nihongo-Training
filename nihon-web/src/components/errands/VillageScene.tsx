import { memo, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CharacterArt } from "../cast/CharacterArt";
import { TravellerArt } from "../islandMap/Traveller";
import { CAST } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { Resident, VillageLayout } from "../../lib/errands/village";
import { VillageGround } from "./VillageGround";
import { VillageScenery } from "./VillageScenery";
import { FOCUS_FROM_TOP, PERSPECTIVE_PER_HEIGHT, STAND_UP, TILT_DEGREES, groundDistance } from "./scene3d";
import "../islandMap/IslandMap.css";
import "./errands.css";

// By default about this many tiles fit across the screen, within these sizes (px), and at least this many fit top to bottom.
const TILES_ACROSS = 15;
const MIN_TILE = 34;
const MAX_TILE = 64;
const MIN_TILES_DOWN = 8;
const VILLAGER_SIZE = 1.15;
// The ground beyond the map, so the edges of the village don't hang in the sky.
const SURROUNDINGS = 40;
const TRAVELLER_HEIGHT = 1.5;

type Size = { width: number; height: number };

/** Keeps `at` within `low`..`high`, or at `high` when they cross (the near edge matters more than the far one). */
const clamp = (at: number, low: number, high: number) => Math.min(high, Math.max(low, at));

/** The tile size that fits the viewport, and the ground point (px) held at the focus: the traveller, but not so near
 *  an edge that the camera looks past it (beyond the far edge is sky, which is fine). */
function camera(viewport: Size, world: Size, focus: Vector, tilesAcross: number) {
  const tile = Math.max(MIN_TILE, Math.min(MAX_TILE, Math.round(viewport.width / tilesAcross), Math.floor(viewport.height / MIN_TILES_DOWN)));
  const worldWidth = world.width * tile, worldHeight = world.height * tile;
  const x = worldWidth <= viewport.width ? worldWidth / 2 : clamp(focus.x * tile, viewport.width / 2, worldWidth - viewport.width / 2);
  const below = groundDistance(viewport.height * (1 - FOCUS_FROM_TOP), viewport.height * PERSPECTIVE_PER_HEIGHT);
  const y = clamp(focus.y * tile, 0, worldHeight - below);
  return { tile, x, y };
}

function useSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

/** A soft shadow on the ground under someone's feet. */
function FeetShadow({ feet, width, tile }: { feet: Vector; width: number; tile: number }) {
  return <span aria-hidden="true" className="pointer-events-none absolute rounded-full bg-[var(--village-shadow)]"
    style={{ left: (feet.x - width / 2) * tile, top: feet.y * tile - width * tile * 0.18, width: width * tile, height: width * tile * 0.36 }} />;
}

type VillagerTokenProps = { villager: Resident; tile: number; hasErrand: boolean; isNearby: boolean; onTalk: (id: CharacterId) => void };

// Memoised: while the traveller walks, the villagers' props stay the same, so they aren't redrawn every frame.
const VillagerToken = memo(function VillagerToken({ villager, tile, hasErrand, isNearby, onTalk }: VillagerTokenProps) {
  const size = tile * VILLAGER_SIZE;
  const { name } = CAST[villager.id];
  const feet = { x: villager.tile.x + 0.5, y: villager.tile.y + 0.85 };
  return <><FeetShadow feet={feet} width={VILLAGER_SIZE * 0.7} tile={tile} />
  <button type="button" onClick={() => onTalk(villager.id)} tabIndex={-1}
    aria-label={`${name}${hasErrand ? " (has something for you)" : ""}`}
    className="village-upright pointer-events-auto cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-emerald-600"
    style={{ left: feet.x * tile - size / 2, top: feet.y * tile - size, width: size, height: size, transform: STAND_UP }}>
    <span className="village-villager absolute inset-0 block"><CharacterArt character={villager.id} mood={hasErrand ? "happy" : "calm"} /></span>
    {hasErrand && <span aria-hidden="true" className="village-marker absolute -top-[45%] left-1/2 -ml-[0.6em] flex size-[1.2em] items-center justify-center rounded-full border-2 border-[var(--village-ink)] bg-amber-300 text-sm font-black text-[var(--village-ink)]">!</span>}
    {isNearby && <span aria-hidden="true" className="absolute -top-[40%] left-full ml-1 whitespace-nowrap rounded-lg border border-[var(--village-ink)] bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">Talk <kbd className="font-mono">E</kbd></span>}
  </button></>;
});

type VillageSceneProps = {
  village: VillageLayout; position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean;
  openGateIds: readonly string[]; litLanterns: number;
  /** Villagers shown with a "!" because they have something for the learner. */
  markedVillagerIds: readonly CharacterId[]; nearbyId: CharacterId | null;
  onTalk: (id: CharacterId) => void;
  /** How many tiles fit across a wide screen: more shows more of the village, smaller. */
  tilesAcross?: number;
  /** Overlays (the errand, inventory, conversation, controls), drawn over the village and not moved by the camera. */
  children?: ReactNode;
};

/** The village in 2.5D, seen from above at an angle in perspective and following the traveller. Everything standing
 *  is a 3D card, so the browser sorts it by depth: whoever walks behind a house is hidden by it. */
export function VillageScene({ village, position, facing, isWalking, isRunning, openGateIds, litLanterns, markedVillagerIds, nearbyId, onTalk, tilesAcross = TILES_ACROSS, children }: VillageSceneProps) {
  const { ref, size } = useSize();
  const { map } = village;
  const { tile, x, y } = camera(size, map, position, tilesAcross);
  const travellerHeight = tile * TRAVELLER_HEIGHT, travellerWidth = travellerHeight * (24 / 36);
  const travellerTurn = facing === "left" ? " scaleX(-1)" : "";
  return <div ref={ref} className="village island-map relative size-full overflow-hidden" style={{ perspective: size.height * PERSPECTIVE_PER_HEIGHT, perspectiveOrigin: `50% ${FOCUS_FROM_TOP * 100}%` }}>
    {size.width > 0 && <div className="village-3d absolute left-1/2" style={{ top: `${FOCUS_FROM_TOP * 100}%` }}>
      <div className="village-world village-3d absolute left-0 top-0" style={{ width: map.width * tile, height: map.height * tile, transformOrigin: "0 0", transform: `rotateX(${TILT_DEGREES}deg) translate3d(${-x}px, ${-y}px, 0)` }}>
        <div aria-hidden="true" className="village-surroundings absolute" style={{ inset: -SURROUNDINGS * tile }} />
        <VillageGround map={map} buildings={village.buildings} />
        <VillageScenery map={map} buildings={village.buildings} gates={village.gates} openGateIds={openGateIds} lanterns={village.lanterns} litLanterns={litLanterns} tile={tile} />
        {village.villagers.map(villager => <VillagerToken key={villager.id} villager={villager} tile={tile}
          hasErrand={markedVillagerIds.includes(villager.id)} isNearby={nearbyId === villager.id} onTalk={onTalk} />)}
        <FeetShadow feet={position} width={0.6} tile={tile} />
        <div aria-hidden="true" className={`village-upright village-person ${isRunning ? "village-running" : ""}`}
          style={{ left: position.x * tile - travellerWidth / 2, top: position.y * tile - travellerHeight, height: travellerHeight, width: travellerWidth, transform: STAND_UP + travellerTurn }}>
          <TravellerArt isWalking={isWalking} />
        </div>
      </div>
    </div>}
    <div aria-hidden="true" className="village-haze pointer-events-none absolute inset-x-0 top-0 h-1/2" />
    {children}
  </div>;
}
