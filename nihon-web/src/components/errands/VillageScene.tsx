import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { CharacterArt } from "../cast/CharacterArt";
import { TravellerArt } from "../islandMap/Traveller";
import { CAST } from "../../lib/cast";
import type { CharacterId } from "../../lib/cast";
import type { Villager } from "../../lib/errands/conversation";
import type { Direction, Vector } from "../../lib/errands/movement";
import type { Village } from "../../lib/errands/village";
import { VillageGround } from "./VillageGround";
import "../islandMap/IslandMap.css";
import "./errands.css";

// About this many tiles fit across the screen, within these sizes (px), and at least this many fit top to bottom.
const TILES_ACROSS = 15;
const MIN_TILE = 34;
const MAX_TILE = 64;
const MIN_TILES_DOWN = 8;
const VILLAGER_SIZE = 1.15;
const TRAVELLER_HEIGHT = 1.5;

/** The tile size that fits the viewport, and the camera's top-left corner (px) keeping the traveller in view. */
function camera(viewport: { width: number; height: number }, world: { width: number; height: number }, focus: Vector) {
  const tile = Math.max(MIN_TILE, Math.min(MAX_TILE, Math.round(viewport.width / TILES_ACROSS), Math.floor(viewport.height / MIN_TILES_DOWN)));
  const along = (size: number, worldSize: number, at: number) => worldSize * tile <= size
    ? -(size - worldSize * tile) / 2
    : Math.max(0, Math.min(worldSize * tile - size, at * tile - size / 2));
  return { tile, left: along(viewport.width, world.width, focus.x), top: along(viewport.height, world.height, focus.y) };
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

/** People are stacked by where their feet are, so whoever is further down the screen is drawn in front. */
const depth = (feetY: number) => Math.round(feetY * 10);

type VillagerTokenProps = { villager: Villager; tile: number; hasErrand: boolean; isNearby: boolean; onTalk: (id: CharacterId) => void };

function VillagerToken({ villager, tile, hasErrand, isNearby, onTalk }: VillagerTokenProps) {
  const size = tile * VILLAGER_SIZE;
  const { name } = CAST[villager.id];
  return <button type="button" onClick={() => onTalk(villager.id)} tabIndex={-1}
    aria-label={`${name}${hasErrand ? " (has an errand for you)" : ""}`}
    className="absolute cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-emerald-600"
    style={{ left: (villager.tile.x + 0.5) * tile - size / 2, top: (villager.tile.y + 1) * tile - size, width: size, height: size, zIndex: depth(villager.tile.y + 1) }}>
    <span aria-hidden="true" className="absolute inset-x-[12%] bottom-0 h-[14%] rounded-full bg-[var(--village-shadow)]" />
    <span className="village-villager absolute inset-0 block"><CharacterArt character={villager.id} mood={hasErrand ? "happy" : "calm"} /></span>
    {hasErrand && <span aria-hidden="true" className="village-marker absolute -top-[45%] left-1/2 -ml-[0.6em] flex size-[1.2em] items-center justify-center rounded-full border-2 border-[var(--village-ink)] bg-amber-300 text-sm font-black text-[var(--village-ink)]">!</span>}
    {isNearby && <span aria-hidden="true" className="absolute -top-[40%] left-full ml-1 whitespace-nowrap rounded-lg border border-[var(--village-ink)] bg-white px-2 py-0.5 text-xs font-bold text-gray-900 shadow">Talk <kbd className="font-mono">E</kbd></span>}
  </button>;
}

type VillageSceneProps = {
  village: Village; position: Vector; facing: Direction; isWalking: boolean;
  openGateIds: readonly string[]; areLanternsLit: boolean;
  errandVillagerIds: readonly CharacterId[]; nearbyId: CharacterId | null;
  onTalk: (id: CharacterId) => void;
  /** Overlays (the errand, inventory, conversation, controls), drawn over the village and not moved by the camera. */
  children?: ReactNode;
};

/** The village seen from above at an angle, following the traveller. */
export function VillageScene({ village, position, facing, isWalking, openGateIds, areLanternsLit, errandVillagerIds, nearbyId, onTalk, children }: VillageSceneProps) {
  const { ref, size } = useSize();
  const { map } = village;
  const { tile, left, top } = camera(size, map, position);
  const travellerHeight = tile * TRAVELLER_HEIGHT, travellerWidth = travellerHeight * (24 / 36);
  return <div ref={ref} className="village island-map relative size-full overflow-hidden">
    {size.width > 0 && <div className="village-world absolute left-0 top-0" style={{ width: map.width * tile, height: map.height * tile, transform: `translate3d(${-left}px, ${-top}px, 0)` }}>
      <VillageGround map={map} buildings={village.buildings} gates={village.gates} openGateIds={openGateIds} lanterns={village.lanterns} areLanternsLit={areLanternsLit} />
      {village.villagers.map(villager => <VillagerToken key={villager.id} villager={villager} tile={tile}
        hasErrand={errandVillagerIds.includes(villager.id)} isNearby={nearbyId === villager.id} onTalk={onTalk} />)}
      <div aria-hidden="true" className="village-person pointer-events-none absolute"
        style={{ left: position.x * tile - travellerWidth / 2, top: position.y * tile - travellerHeight * 0.97, height: travellerHeight, width: travellerWidth, zIndex: depth(position.y), transform: facing === "left" ? "scaleX(-1)" : undefined }}>
        <TravellerArt isWalking={isWalking} />
      </div>
    </div>}
    {children}
  </div>;
}
