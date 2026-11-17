import { memo, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CharacterArt } from "../cast/CharacterArt";
import { TravellerArt } from "../islandMap/Traveller";
import { CAST } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { Resident, VillageLayout } from "../../lib/errands/village";
import type { SceneTheme, Surroundings } from "../../lib/world/sceneTheme";
import { VillageGround } from "./VillageGround";
import { VillageScenery } from "./VillageScenery";
import { Backdrop } from "./backdrops/landscapes";
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
const DOOR_PROMPT_HEIGHT = 2;
const TRAVELLER_HEIGHT = 1.5;
/** Blossom (or, in the maple garden, leaves; on the mountain, snow) drifting down over the scene (across the screen,
 *  in %; seconds). */
const FALLING_PETALS = [
  { left: 12, duration: 11, delay: 0 }, { left: 34, duration: 14, delay: -5 }, { left: 58, duration: 12, delay: -9 },
  { left: 76, duration: 15, delay: -2 }, { left: 93, duration: 13, delay: -7 },
] as const;

const FALLING_THEMES: ReadonlySet<SceneTheme> = new Set(["sakura", "maple", "mountain", "summit"]);
// The rowing boat the traveller sits in at sea, lying on the water, turned the way they face: its width in tiles; its
// drawing (wake included) is three times as long, with the middle of the hull this far along it.
const BOAT_WIDTH = 0.8;
const BOAT_DRAWING_LENGTH = BOAT_WIDTH * 3;
const BOAT_MIDDLE = 70 / 120;
const BOAT_TURN: Readonly<Record<Direction, number>> = { right: 0, down: 90, left: 180, up: 270 };

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

/** A small wooden rowing boat seen from above, bow first, with a wake behind it while it moves. */
function RowingBoat({ at, facing, isMoving, tile }: { at: Vector; facing: Direction; isMoving: boolean; tile: number }) {
  return <svg aria-hidden="true" viewBox="-20 0 120 40" className="pointer-events-none absolute overflow-visible"
    style={{ left: (at.x - BOAT_DRAWING_LENGTH * BOAT_MIDDLE) * tile, top: (at.y - BOAT_WIDTH / 2) * tile, width: BOAT_DRAWING_LENGTH * tile,
      height: BOAT_WIDTH * tile, transform: `rotate(${BOAT_TURN[facing]}deg)`, transformOrigin: `${BOAT_MIDDLE * 100}% 50%` }}>
    {isMoving && <path d="M-4,10 q-8,10 0,20 M-14,6 q-10,14 0,28" fill="none" stroke="var(--village-foam)" strokeWidth={2.5} strokeLinecap="round" />}
    <path d="M2,20 Q4,4 40,3 L76,5 Q94,10 99,20 Q94,30 76,35 L40,37 Q4,36 2,20 Z" fill="var(--village-wood-light)" stroke="var(--village-wood)" strokeWidth={3} />
    <path d="M10,20 Q12,10 40,9 L74,11 Q88,15 91,20 Q88,25 74,29 L40,31 Q12,30 10,20 Z" fill="var(--village-wood)" opacity={0.35} />
    <path d="M30,9 v22 M62,10 v20" stroke="var(--village-wood)" strokeWidth={3} />
  </svg>;
}

type VillagerTokenProps = { villager: Resident; tile: number; hasErrand: boolean; isNearby: boolean; talkAction: string; onTalk: (id: CharacterId) => void };

// Memoised: while the traveller walks, the villagers' props stay the same, so they aren't redrawn every frame.
const VillagerToken = memo(function VillagerToken({ villager, tile, hasErrand, isNearby, talkAction, onTalk }: VillagerTokenProps) {
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
    {isNearby && <span aria-hidden="true" className="absolute -top-[40%] left-full ml-1 whitespace-nowrap rounded-lg border border-[var(--village-ink)] bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">{talkAction} <kbd className="font-mono">E</kbd></span>}
  </button></>;
});

type VillageSceneProps = {
  village: VillageLayout; position: Vector; facing: Direction; isWalking: boolean; isRunning: boolean;
  openGateIds: readonly string[]; litLanterns: number;
  /** Villagers shown with a "!" because they have something for the learner. */
  markedVillagerIds: readonly CharacterId[]; nearbyId: CharacterId | null;
  onTalk: (id: CharacterId) => void;
  /** What the prompt over the villager in reach says pressing E does (such as "Fight" for a challenger). */
  talkAction?: string;
  /** A door the traveller is standing at, shown with a prompt to go in (pressed, it calls `onEnterDoor`). `action`
   *  names what the prompt does when it isn't going in (such as "Leave" at the end of a wild path). */
  nearbyDoor?: { tile: Vector; label: string; action?: string } | null;
  onEnterDoor?: () => void;
  /** The island's look (cherry blossom, bamboo, festival); none for the village square. */
  theme?: SceneTheme;
  /** What lies beyond the map's edges: woods (the default), open water round an island, or clouds below Fuji. */
  surroundings?: Surroundings;
  /** Whether the traveller is in a boat (on the ferry to Fuji): drawn sitting in it, the boat turning as they row. */
  isAboard?: boolean;
  /** How many tiles fit across a wide screen: more shows more of the village, smaller. */
  tilesAcross?: number;
  /** Overlays (the errand, inventory, conversation, controls), drawn over the village and not moved by the camera. */
  children?: ReactNode;
};

/** The village in 2.5D, seen from above at an angle in perspective and following the traveller. Everything standing
 *  is a 3D card, so the browser sorts it by depth: whoever walks behind a house is hidden by it. */
export function VillageScene({ village, position, facing, isWalking, isRunning, openGateIds, litLanterns, markedVillagerIds, nearbyId, onTalk, talkAction = "Talk", nearbyDoor, onEnterDoor, theme, surroundings = "woods", isAboard = false, tilesAcross = TILES_ACROSS, children }: VillageSceneProps) {
  const { ref, size } = useSize();
  const { map } = village;
  const { tile, x, y } = camera(size, map, position, tilesAcross);
  const travellerHeight = tile * TRAVELLER_HEIGHT, travellerWidth = travellerHeight * (24 / 36);
  const travellerTurn = facing === "left" ? " scaleX(-1)" : "";
  return <div ref={ref} className={`village island-map relative size-full overflow-hidden ${theme ? `village-theme-${theme}` : ""}`} style={{ perspective: size.height * PERSPECTIVE_PER_HEIGHT, perspectiveOrigin: `50% ${FOCUS_FROM_TOP * 100}%` }}>
    {size.width > 0 && <div className="village-3d absolute left-1/2" style={{ top: `${FOCUS_FROM_TOP * 100}%` }}>
      <div className="village-world village-3d absolute left-0 top-0" style={{ width: map.width * tile, height: map.height * tile, transformOrigin: "0 0", transform: `rotateX(${TILT_DEGREES}deg) translate3d(${-x}px, ${-y}px, 0)` }}>
        <div aria-hidden="true" className={`village-surroundings village-surroundings-${surroundings} absolute`} style={{ inset: -SURROUNDINGS * tile }} />
        <Backdrop look={theme ?? "home"} map={map} tile={tile} />
        <VillageGround map={map} buildings={village.buildings} />
        <VillageScenery map={map} buildings={village.buildings} gates={village.gates} openGateIds={openGateIds} lanterns={village.lanterns} litLanterns={litLanterns} tile={tile} />
        {village.villagers.map(villager => <VillagerToken key={villager.id} villager={villager} tile={tile}
          hasErrand={markedVillagerIds.includes(villager.id)} isNearby={nearbyId === villager.id} talkAction={talkAction} onTalk={onTalk} />)}
        {/* Stood just in front of the house's wall (not in it, where the wall would hide it), above the traveller's head. */}
        {nearbyDoor && <div className="village-upright" style={{ left: (nearbyDoor.tile.x - 0.5) * tile, top: (nearbyDoor.tile.y + 0.4 - DOOR_PROMPT_HEIGHT) * tile, width: 2 * tile, height: DOOR_PROMPT_HEIGHT * tile, transform: STAND_UP }}>
          <button type="button" tabIndex={-1} onClick={onEnterDoor} aria-label={nearbyDoor.action ? nearbyDoor.label : `Go into ${nearbyDoor.label.toLowerCase()}`}
            className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[var(--village-ink)] bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">{nearbyDoor.action ?? "Enter"} <kbd className="font-mono">E</kbd></button>
        </div>}
        {isAboard ? <RowingBoat at={position} facing={facing} isMoving={isWalking} tile={tile} /> : <FeetShadow feet={position} width={0.6} tile={tile} />}
        <div aria-hidden="true" className={`village-upright village-person ${isRunning ? "village-running" : ""}`}
          style={{ left: position.x * tile - travellerWidth / 2, top: position.y * tile - travellerHeight, height: travellerHeight, width: travellerWidth, transform: STAND_UP + travellerTurn }}>
          <TravellerArt isWalking={isWalking} />
        </div>
      </div>
    </div>}
    <div aria-hidden="true" className="village-haze pointer-events-none absolute inset-x-0 top-0 h-1/2" />
    {theme && FALLING_THEMES.has(theme) && <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {FALLING_PETALS.map(petal => <div key={petal.left} className="scenery-petal" style={{ left: `${petal.left}%`, animationDuration: `${petal.duration}s`, animationDelay: `${petal.delay}s` }} />)}
    </div>}
    {children}
  </div>;
}
