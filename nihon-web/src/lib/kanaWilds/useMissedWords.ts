import { useCallback, useState } from "react";
import { getUserHandle } from "../authStorage";
import { noteReading } from "./missedWords";

// The missed-word list is kept in this browser, per learner: it only steers which words a hand deals, so losing it
// (a new device, cleared storage) costs nothing but some practice focus.
const storageKey = () => `kana-wilds-missed:${getUserHandle() ?? ""}`;

function readMissed(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey()) ?? "[]");
    return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function saveMissed(missed: readonly string[]) {
  try { localStorage.setItem(storageKey(), JSON.stringify(missed)); } catch { /* see above: only a convenience */ }
}

/** Words the learner has read wrong in battle, and a way to note each reading. */
export function useMissedWords() {
  const [missed, setMissed] = useState(readMissed);
  const noteWordReading = useCallback((word: string, isCorrect: boolean) => {
    setMissed(current => {
      const next = noteReading(current, word, isCorrect);
      saveMissed(next);
      return next;
    });
  }, []);
  return { missed, noteWordReading };
}
