import { TravellerArt } from "../islandMap/Traveller";

/** Which way the boat's bow points. */
export type Heading = "left" | "right";

const ink = { stroke: "var(--ink)", strokeWidth: 1, strokeLinejoin: "round" as const };

/** The learner's traveller standing in a small boat, rocking on the swell with a wake behind it (decorative). */
export function IntroBoat({ heading }: { heading: Heading }) {
  return <div aria-hidden="true" className="intro-boat relative aspect-[3/2] w-full" style={{ transform: heading === "left" ? "scaleX(-1)" : undefined }}>
    <svg viewBox="0 0 60 40" className="intro-wake absolute inset-x-0 bottom-0 w-full overflow-visible">
      <path d="M-30,33 Q-14,30 4,32" fill="none" stroke="var(--foam)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M-22,37 Q-8,35 6,36" fill="none" stroke="var(--foam)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
    </svg>
    <div className="intro-boat-rock absolute inset-0">
      <span className="absolute bottom-[26%] left-[38%] block h-[64%]"><TravellerArt /></span>
      <svg viewBox="0 0 60 40" className="absolute inset-x-0 bottom-0 w-full overflow-visible">
        <path d="M2,26 L58,26 L50,35 Q30,38 10,35 Z" fill="var(--wood)" {...ink} />
        <path d="M6,29 L54,29" stroke="var(--ink)" strokeWidth="0.5" opacity="0.4" />
        <path d="M52,26 L58,20" stroke="var(--ink)" strokeWidth="1" strokeLinecap="round" />
        <path d="M0,36 Q30,42 60,36" fill="none" stroke="var(--foam)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
      </svg>
    </div>
  </div>;
}
