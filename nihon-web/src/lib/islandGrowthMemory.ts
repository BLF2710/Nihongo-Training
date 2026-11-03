import type { IslandId } from "./islandMap.ts";

// The growth stages the island map last worked out, kept in this browser so page strips can show each island as grown
// without fetching every statistic again. Strips show an island as first built until the map has been opened once.
const STORAGE_KEY = "island_growth";

export type RememberedGrowth = { stage: number; trackStages: readonly number[] };
export type GrowthMemory = Partial<Record<IslandId, RememberedGrowth>>;

const isStage = (value: unknown): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0;
const isRememberedGrowth = (value: unknown): value is RememberedGrowth => typeof value === "object" && value !== null
  && "stage" in value && isStage(value.stage) && "trackStages" in value && Array.isArray(value.trackStages) && value.trackStages.every(isStage);

/** Reads remembered growth, keeping only well-formed entries (storage can hold anything). */
export function parseGrowthMemory(raw: string | null): GrowthMemory {
  if (!raw) return {};
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return {}; }
  if (typeof parsed !== "object" || parsed === null) return {};
  return Object.fromEntries(Object.entries(parsed).filter(([, growth]) => isRememberedGrowth(growth)));
}

/** Saves the islands' growth over what was remembered before, so islands missing from a partial load keep theirs. */
export function rememberGrowth(memory: GrowthMemory) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parseGrowthMemory(localStorage.getItem(STORAGE_KEY)), ...memory }));
  } catch (error) {
    console.warn("Island growth could not be remembered for page strips", error);
  }
}

export function recallGrowth(id: IslandId): RememberedGrowth | null {
  try { return parseGrowthMemory(localStorage.getItem(STORAGE_KEY))[id] ?? null; } catch { return null; }
}
