// Saving the village between visits. The page depends on ErrandsSaveStore; the browser's localStorage is one store.
import type { Attempt, ErrandsState } from "./errandsState.ts";
import type { Direction } from "./movement.ts";

export interface ErrandsSaveStore {
  load(): ErrandsState | null;
  save(state: ErrandsState): void;
  clear(): void;
}

const DIRECTIONS: readonly Direction[] = ["up", "down", "left", "right"];
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every(item => typeof item === "string");
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const isDirection = (value: unknown): value is Direction => DIRECTIONS.some(direction => direction === value);
const isAttempt = (value: unknown): value is Attempt => isRecord(value) && typeof value.quest === "string" && typeof value.isCorrectFirstTime === "boolean";

/** A saved state read back, or null when it isn't one (another version, or edited by hand). */
export function readSavedState(value: unknown): ErrandsState | null {
  if (!isRecord(value) || !isRecord(value.position) || !isRecord(value.attempts)) return null;
  const { position, facing, inventory, flags, finished, attempts } = value;
  if (!isFiniteNumber(position.x) || !isFiniteNumber(position.y)) return null;
  if (!isDirection(facing)) return null;
  if (!isStringList(inventory) || !isStringList(flags) || !isStringList(finished)) return null;
  const checked: Record<string, Attempt> = {};
  for (const [key, attempt] of Object.entries(attempts)) {
    if (!isAttempt(attempt)) return null;
    checked[key] = attempt;
  }
  return { position: { x: position.x, y: position.y }, facing, inventory, flags, finished, attempts: checked };
}

/** A store in the browser's localStorage under `key`. The save is a convenience: when storage is unavailable
 *  (a private window) the village simply starts over next time. */
export function localErrandsSave(key: string): ErrandsSaveStore {
  return {
    load() {
      try {
        const saved = localStorage.getItem(key);
        return saved ? readSavedState(JSON.parse(saved)) : null;
      } catch { return null; }
    },
    save(state) {
      try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* see above */ }
    },
    clear() {
      try { localStorage.removeItem(key); } catch { /* see above */ }
    },
  };
}
