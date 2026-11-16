import { useState } from "react";
import { saveTravellerLookToServer } from "../api/travellerLook";
import { DEFAULT_TRAVELLER_LOOK, withPart } from "./travellerLook";
import type { LookPart, TravellerLook } from "./travellerLook";
import { rememberTravellerLook, useTravellerLook } from "./useTravellerLook";

export type WardrobeStatus = "idle" | "saving" | "saved" | "failed";

/** Trying on a look: a draft starting from the learner's own, changed part by part, saved when they're happy. */
export function useWardrobe() {
  const saved = useTravellerLook();
  const [draft, setDraft] = useState<TravellerLook | null>(null);
  const [status, setStatus] = useState<WardrobeStatus>("idle");
  const look = draft ?? saved;
  const isChanged = draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  const choose = <P extends LookPart>(part: P, choice: TravellerLook[P]) => { setDraft(withPart(look, part, choice)); setStatus("idle"); };
  const resetToDefault = () => { setDraft(DEFAULT_TRAVELLER_LOOK); setStatus("idle"); };
  const save = async () => {
    setStatus("saving");
    try {
      rememberTravellerLook(await saveTravellerLookToServer(look));
      setDraft(null);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };
  return { look, isChanged, status, choose, resetToDefault, save };
}
