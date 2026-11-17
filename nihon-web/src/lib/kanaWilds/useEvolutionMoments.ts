import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserHandle } from "../authStorage";
import { unannouncedEvolutions } from "./evolution";
import type { Evolution } from "./evolution";

// Which evolutions the learner has been told about ("か evolved into が!") is kept in this browser, per learner: losing
// it (a new device, cleared storage) only means hearing about an evolution twice.
const storageKey = () => `kana-wilds-evolutions-announced:${getUserHandle() ?? ""}`;

/** The evolutions told so far, or null for a learner this browser has never kept any for. */
function readAnnounced(): Set<string> | null {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey()) ?? "null");
    return Array.isArray(saved) ? new Set(saved.filter((item): item is string => typeof item === "string")) : null;
  } catch {
    return null;
  }
}

function saveAnnounced(kana: readonly string[]) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify([...new Set([...(readAnnounced() ?? []), ...kana])]));
  } catch { /* see above: only a convenience */ }
}

/**
 * The evolution moment: the evolutions `made` (null until the collection is loaded) that the learner hasn't been told
 * about yet. Once shown (`markShown`) they're remembered as told, so they're announced only once, but they stay on
 * screen until dismissed. The first time this browser sees a learner, the evolutions they already have count as told:
 * the moment is for evolutions as they happen, not a list of old ones.
 */
export function useEvolutionMoments(made: readonly Evolution[] | null) {
  const [announcedBefore, setAnnouncedBefore] = useState(readAnnounced);
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(() => new Set());
  // Adjusted while rendering (not in an effect), so the old evolutions never flash up first.
  if (announcedBefore === null && made) setAnnouncedBefore(new Set(made.map(evolution => evolution.to.kana)));
  useEffect(() => {
    if (announcedBefore && readAnnounced() === null) saveAnnounced([...announcedBefore]);
  }, [announcedBefore]);
  const moment = useMemo(() => made && announcedBefore ? unannouncedEvolutions(made, new Set([...announcedBefore, ...dismissed])) : [],
    [made, announcedBefore, dismissed]);
  const markShown = useCallback(() => saveAnnounced(moment.map(evolution => evolution.to.kana)), [moment]);
  const dismiss = useCallback(() => setDismissed(current => new Set([...current, ...moment.map(evolution => evolution.to.kana)])), [moment]);
  return { moment, markShown, dismiss };
}
