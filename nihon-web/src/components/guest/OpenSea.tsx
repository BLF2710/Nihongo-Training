import { IntroBoat } from "./IntroBoat";
import type { Heading } from "./IntroBoat";

/** Open water with no land in sight: swells rolling past the traveller's boat as it drifts and turns, before the
 *  visitor starts. It fades away as the voyage to the island begins. `boatWidth` matches the boat's size on the island
 *  at the opening's zoom and `boatTop` its height in the scene, so the hand-over is seamless. Decorative only. */
export function OpenSea({ boatWidth, boatTop, heading, isLeaving }: { boatWidth: number; boatTop: string; heading: Heading; isLeaving: boolean }) {
  return <div aria-hidden="true" className={`open-sea pointer-events-none absolute inset-0 z-30 overflow-hidden ${isLeaving ? "open-sea-leaving" : ""}`}>
    <div className="open-sea-swell open-sea-swell-far" />
    <div className="open-sea-swell open-sea-swell-near" />
    <div className="open-sea-drift absolute left-1/2" style={{ top: boatTop, width: boatWidth }}>
      <div className="-translate-x-1/2 -translate-y-[80%]"><IntroBoat heading={heading} /></div>
    </div>
    <div className="open-sea-swell open-sea-swell-front" />
  </div>;
}
