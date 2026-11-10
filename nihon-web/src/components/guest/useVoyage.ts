import { useLayoutEffect } from "react";
import type { RefObject } from "react";
import { INTRO_REVEAL_MS, INTRO_SAIL_MS } from "../../lib/guest/introCamera";
import type { OpeningPhase } from "./useOpeningScene";

const REVEAL_EASING = "cubic-bezier(0.45, 0, 0.2, 1)";
const SAIL_EASING = "cubic-bezier(0.3, 0, 0.3, 1)";
const SETTLED_CAMERA = "translate(0px, 0px) scale(1)";
const LANDED_BOAT = "translate(0px, 0px)";

type VoyageOptions = {
  phase: OpeningPhase;
  cameraRef: RefObject<HTMLElement | null>;
  boatRef: RefObject<HTMLElement | null>;
  /** Where the camera and the boat start, as CSS transforms. */
  cameraStart: string;
  boatStart: string;
  onLanded: () => void;
};

/** While the opening is revealing, the boat sails in to Home and the camera pulls back to the whole island. Both run as
 *  Web Animations of `transform` alone, so the browser's compositor plays them without redrawing the island each frame. */
export function useVoyage({ phase, cameraRef, boatRef, cameraStart, boatStart, onLanded }: VoyageOptions) {
  useLayoutEffect(() => {
    const camera = cameraRef.current;
    const boat = boatRef.current;
    if (phase !== "revealing" || !camera || !boat) return;
    const pullBack = camera.animate([{ transform: cameraStart }, { transform: SETTLED_CAMERA }], { duration: INTRO_REVEAL_MS, easing: REVEAL_EASING, fill: "forwards" });
    const sail = boat.animate([{ transform: boatStart }, { transform: LANDED_BOAT }], { duration: INTRO_SAIL_MS, easing: SAIL_EASING, fill: "forwards" });
    pullBack.onfinish = onLanded;
    return () => { pullBack.cancel(); sail.cancel(); };
  }, [phase, cameraRef, boatRef, cameraStart, boatStart, onLanded]);
}
