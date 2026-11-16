import { useEffect, useMemo, useSyncExternalStore } from "react";
import { fetchTravellerLook } from "../api/travellerLook";
import { getStoredTravellerLook, hasSession, isAdmin, storeTravellerLook } from "./authStorage";
import { DEFAULT_TRAVELLER_LOOK, parseTravellerLook } from "./travellerLook";
import type { TravellerLook } from "./travellerLook";

// The signed-in learner's traveller look, for every drawing of the traveller. Stored with the session; looked up once
// when it isn't known yet (after signing in), and updated when the learner changes it in the wardrobe.
const listeners = new Set<() => void>();
let lookup: Promise<void> | null = null;

/** Records the learner's look and redraws every traveller showing it. */
export function rememberTravellerLook(look: TravellerLook) {
  storeTravellerLook(JSON.stringify(look));
  listeners.forEach(listener => listener());
}

const readStored = (stored: string | null): TravellerLook | null => {
  if (stored === null) return null;
  try { return parseTravellerLook(JSON.parse(stored)); } catch { return null; }
};

/** Asks the API for the look when none usable is stored (none yet, or one saved before a part was added). */
function learn() {
  if (lookup || readStored(getStoredTravellerLook()) || !hasSession() || isAdmin()) return;
  lookup = fetchTravellerLook()
    .then(rememberTravellerLook)
    .catch(() => { /* the default look until the next page tries again */ })
    .finally(() => { lookup = null; });
}

/** The learner's look (the default one for guests, and until it is known). */
export function useTravellerLook(): TravellerLook {
  const stored = useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener); }, getStoredTravellerLook, () => null);
  const look = useMemo(() => readStored(stored), [stored]);
  useEffect(() => { if (!look) learn(); }, [look]);
  return look ?? DEFAULT_TRAVELLER_LOOK;
}
