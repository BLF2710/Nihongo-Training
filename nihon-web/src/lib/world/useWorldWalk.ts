import { useEffect } from "react";
import type { VillageLayout } from "../errands/village";
import { RUN_SPEED, WALK_SPEED, heldDirection } from "../errands/movement";
import type { Vector } from "../errands/movement";
import { useFrameLoop, useHeldDirections } from "../errands/useWalkControls";
import { useVillageWalk } from "../village/useVillageWalk";

const ACTION_KEYS: ReadonlySet<string> = new Set(["KeyE", "Enter", "Space"]);

/** Whether (and under which key) the spot is remembered, and where the traveller arrives instead (see useVillageWalk). */
export type WalkMemory = { rememberKey: string | null; arrival: Vector | null };
const NO_MEMORY: WalkMemory = { rememberKey: null, arrival: null };

/** Walking a path or an island: the traveller moves with the held keys (or touch pad) while `isWalking`. */
export function useWorldWalk(layout: VillageLayout, isWalking: boolean, memory: WalkMemory = NO_MEMORY) {
  const walker = useVillageWalk(layout, memory.rememberKey, memory.arrival);
  const controls = useHeldDirections(isWalking);
  const { held, isHolding, isRunning } = controls;
  useFrameLoop(isWalking && isHolding, seconds => walker.walkBy(heldDirection(held.current), seconds, isRunning ? RUN_SPEED : WALK_SPEED));
  return { walker, ...controls };
}

/** Runs `act` when an action key (E, Enter, Space) is pressed, while there is something to act on. */
export function useActionKey(act: (() => void) | null) {
  useEffect(() => {
    if (!act) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.repeat || !ACTION_KEYS.has(event.code)) return;
      event.preventDefault();
      act();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act]);
}
