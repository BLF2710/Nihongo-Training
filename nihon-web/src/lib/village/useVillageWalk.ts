import { useEffect, useMemo, useState } from "react";
import { facingOf, nearestWithin, walk } from "../errands/movement";
import type { Direction, Vector } from "../errands/movement";
import { isBlocked } from "../errands/townMap";
import { blockedTilesWithOpenGates } from "../errands/village";
import type { VillageLayout } from "../errands/village";

type Place = { position: Vector; facing: Direction };
const REMEMBER_DELAY_MS = 500;
const FACINGS: readonly Direction[] = ["up", "down", "left", "right"];

// Where the traveller stood, kept for this tab: coming back from a villager's page puts them back outside it.
function recallPlace(key: string): Place | null {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (typeof saved !== "object" || saved === null || !("position" in saved) || !("facing" in saved)) return null;
    const { position, facing } = saved;
    const isPosition = typeof position === "object" && position !== null && "x" in position && "y" in position && Number.isFinite(position.x) && Number.isFinite(position.y);
    const direction = FACINGS.find(candidate => candidate === facing);
    return isPosition && direction ? { position: { x: Number(position.x), y: Number(position.y) }, facing: direction } : null;
  } catch { return null; }
}
function rememberPlace(key: string, place: Place) {
  try { sessionStorage.setItem(key, JSON.stringify(place)); } catch { /* only a convenience */ }
}

/** Walking around a village with every gate open: where the traveller stands, and who is near enough to talk to. */
export function useVillageWalk(layout: VillageLayout, rememberKey: string) {
  const blocked = useMemo(() => blockedTilesWithOpenGates(layout, layout.gates.map(gate => gate.id)), [layout]);
  const [place, setPlace] = useState<Place>(() => {
    const recalled = recallPlace(rememberKey);
    // A spot remembered from before the village changed can be inside a building now.
    const isStandable = recalled && !isBlocked(layout.map, blocked, Math.floor(recalled.position.x), Math.floor(recalled.position.y));
    return recalled && isStandable ? recalled : { position: layout.start, facing: "down" };
  });
  useEffect(() => {
    const timer = setTimeout(() => rememberPlace(rememberKey, place), REMEMBER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [place, rememberKey]);
  return {
    ...place,
    nearby: nearestWithin(place.position, layout.villagers),
    walkBy(direction: Vector, seconds: number, speed: number) {
      setPlace(current => ({ position: walk(current.position, direction, seconds, (x, y) => isBlocked(layout.map, blocked, x, y), speed), facing: facingOf(direction, current.facing) }));
    },
  };
}
