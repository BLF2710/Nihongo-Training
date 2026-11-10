import { useCallback, useEffect, useState } from "react";
import { INTRO_REVEAL_MS } from "../../lib/guest/introCamera";

/** Waiting for the visitor to start, the camera pulling back to the island, or over. */
export type OpeningPhase = "waiting" | "revealing" | "done";

// The opening plays once per visit: coming back to the home page from a quiz goes straight to the island. Kept in
// memory only (a reload is a new visit), so a guest's browser storage stays untouched.
let hasPlayedThisVisit = false;
// A little longer than the camera's move, in case its animation never reports its end (a hidden tab, for one).
const REVEAL_FALLBACK_MS = INTRO_REVEAL_MS + 300;
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** The guest's opening scene: any click or key starts it, and another skips the camera's move. Reduced motion skips it. */
export function useOpeningScene() {
  const [phase, setPhase] = useState<OpeningPhase>(() => hasPlayedThisVisit || prefersReducedMotion() ? "done" : "waiting");
  // Stable, so the voyage (which calls `finish` when it lands) is not restarted by a render.
  const start = useCallback(() => { hasPlayedThisVisit = true; setPhase("revealing"); }, []);
  const finish = useCallback(() => { hasPlayedThisVisit = true; setPhase("done"); }, []);

  useEffect(() => {
    if (phase !== "revealing") return;
    const timer = window.setTimeout(() => setPhase("done"), REVEAL_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);
  useEffect(() => {
    if (phase === "done") return;
    const onKey = (event: KeyboardEvent) => {
      // Tab still moves focus; a held key counts once.
      if (event.key === "Tab" || event.repeat) return;
      event.preventDefault();
      hasPlayedThisVisit = true;
      setPhase(phase === "waiting" ? "revealing" : "done");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  return { phase, start, finish };
}
