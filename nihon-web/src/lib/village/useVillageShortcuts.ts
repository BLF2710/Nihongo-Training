import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { VILLAGE_PATH, shortcutPath } from "./villageShortcuts";
import type { ShortcutPlace } from "./villageShortcuts";

type ArrivedFromVillage = { hasComeFromVillage: true };
const ARRIVED_FROM_VILLAGE: ArrivedFromVillage = { hasComeFromVillage: true };

const hasArrivedFromVillage = (state: unknown) =>
  typeof state === "object" && state !== null && "hasComeFromVillage" in state && state.hasComeFromVillage === true;

// The page itself, or a villager clicked on (they're left out of the tab order), doesn't count as focus on a control.
const isFocusTaken = (target: EventTarget | null) => target instanceof HTMLElement && target !== document.body && target.tabIndex >= 0;

/** The village's shortcut keys on `place`, while `isListening`. Away from the square they only work on a page opened
 *  with one (so Tab on the dashboard is left alone for everyone else), and going back is a step back in history: the
 *  browser's Back button then still works as expected. */
export function useVillageShortcuts(place: ShortcutPlace, isListening = true) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = isListening && (place === "village" || hasArrivedFromVillage(location.state));
  useEffect(() => {
    if (!isActive) return;
    const onKey = (event: KeyboardEvent) => {
      const path = shortcutPath({ code: event.code, repeat: event.repeat, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey, isFocusTaken: isFocusTaken(event.target) }, place);
      if (!path) return;
      event.preventDefault();
      if (path === VILLAGE_PATH) navigate(-1);
      else navigate(path, { state: ARRIVED_FROM_VILLAGE });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, place, navigate]);
}
