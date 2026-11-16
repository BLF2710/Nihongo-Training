import type { ReactElement } from "react";
import { lookColours } from "../../lib/travellerLook";
import type { TravellerLook } from "../../lib/travellerLook";

// The learner's traveller, drawn facing right in a 24 × 36 box (feet at the bottom), in the colours and with the hat
// and the thing carried of their look. The legs (traveller-leg) step while walking (IslandMap.css).
const ink = { stroke: "var(--ink, #2e2a26)", strokeWidth: 0.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const PAPER = "#fffaf0";
const STRAW = "#e2c98f";
const STRAW_DARK = "#b9995c";
const WOOD = "#8a6a4a";
const BLUSH = "#f08a8a";
const LANTERN_RED = "#d2492f";

type Colours = ReturnType<typeof lookColours>;

/** What the traveller carries, drawn behind the body (`back`) or in front of it (`front`). */
type Carried = { back?: ReactElement; front?: ReactElement };

const BUNDLE: Carried = {
  back: <g>
    <path d="M7.2,20.6 L1.6,8.4" stroke={WOOD} strokeWidth="1" strokeLinecap="round" />
    <path d="M-0.8,8.8 Q1.8,4.4 4.6,8.6 Q4.2,11.8 1.8,11.6 Q-0.8,11.4 -0.8,8.8 Z" fill="#4f8a3c" {...ink} />
    <path d="M0.2,8.4 l0.8,0.8 M2.4,7.2 l0.8,0.8 M1.6,10 l0.8,0.8 M3.4,9.6 l0.6,0.6" stroke={PAPER} strokeWidth="0.6" strokeLinecap="round" />
    <path d="M1.2,6.6 Q1.6,5.4 2.6,6.2" fill="none" {...ink} strokeWidth="0.7" />
  </g>,
};

const FAN: Carried = {
  front: <g>
    <path d="M18.2,22.4 L23,17.6 A5.2,5.2 0 0 0 16.8,17 Z" fill={LANTERN_RED} {...ink} />
    <path d="M18.2,22.4 L22,16.8 M18.2,22.4 L20,16.6" stroke={PAPER} strokeWidth="0.45" opacity="0.8" />
    <circle cx="20" cy="18.2" r="0.9" fill={PAPER} opacity="0.85" />
  </g>,
};

const LANTERN: Carried = {
  front: <g>
    <path d="M18,22.4 L22.6,14.6" stroke={WOOD} strokeWidth="0.8" strokeLinecap="round" />
    <path d="M22.6,14.6 v1.4" stroke="var(--ink, #2e2a26)" strokeWidth="0.5" />
    <ellipse cx="22.6" cy="18.4" rx="1.9" ry="2.5" fill={PAPER} {...ink} />
    <path d="M20.8,17.6 h3.6 M20.8,19.2 h3.6" stroke={LANTERN_RED} strokeWidth="0.7" />
    <path d="M21.6,15.9 h2 M21.6,20.9 h2" stroke="var(--ink, #2e2a26)" strokeWidth="0.8" strokeLinecap="round" />
  </g>,
};

const CARRIED: Record<TravellerLook["accessory"], Carried> = { bundle: BUNDLE, fan: FAN, lantern: LANTERN, none: {} };

function Hat({ hat, hair }: { hat: TravellerLook["hat"]; hair: string }) {
  if (hat === "kasa") return <g>
    <path d="M1.4,10.2 L12.4,1.4 L23.4,10.2 Q12.4,12.6 1.4,10.2 Z" fill={STRAW} {...ink} />
    <path d="M5.4,9.6 L12.4,1.4 M9,10.4 L12.4,1.4 M15.8,10.4 L12.4,1.4 M19.4,9.6 L12.4,1.4" stroke={STRAW_DARK} strokeWidth="0.45" />
    <path d="M3.8,8.2 Q12.4,9.8 21,8.2" fill="none" stroke={STRAW_DARK} strokeWidth="0.45" />
  </g>;
  if (hat === "hachimaki") return <g>
    <path d="M7.6,8.6 Q12.4,7.2 17.6,8.8 L17.4,10.4 Q12.4,9 7.8,10.2 Z" fill={PAPER} {...ink} strokeWidth="0.6" />
    <circle cx="13.6" cy="8.9" r="0.42" fill={LANTERN_RED} />
    <path d="M7.8,9.4 Q5,9.2 3.4,11.4 M7.8,9.6 Q5.4,10.6 4.6,13" fill="none" stroke={PAPER} strokeWidth="1.1" strokeLinecap="round" />
  </g>;
  // No hat: a topknot.
  return <g><circle cx="10.6" cy="5.4" r="1.7" fill={hair} {...ink} strokeWidth="0.6" /><path d="M10.4,7 v0.8" stroke={LANTERN_RED} strokeWidth="0.8" /></g>;
}

function Head({ colours, hat, cheeks }: { colours: Colours; hat: TravellerLook["hat"]; cheeks: TravellerLook["cheeks"] }) {
  return <g>
    {/* hair at the back of the head, and the face */}
    <path d="M7.4,11.4 Q6.6,16 9.4,16.8 L10.4,11 Z" fill={colours.hair} {...ink} strokeWidth="0.6" />
    <circle cx="12.4" cy="11.6" r="4.9" fill={colours.skin} {...ink} />
    {/* hair on top, under any hat: a fringe over the brow */}
    <path d="M7.6,11.8 Q7.4,6.4 12.6,6.6 Q17.4,6.8 17.4,10.4 Q15.6,9.2 14.4,10.2 Q13.4,8.8 11.6,9.8 Q10,9.2 9.2,11 Q8.4,10.8 7.6,11.8 Z" fill={colours.hair} {...ink} strokeWidth="0.6" />
    <path d="M10.6,12 q-1.1,0.2 -0.9,1.3 q0.2,0.8 1,0.6" fill={colours.skin} stroke="var(--ink, #2e2a26)" strokeWidth="0.4" strokeLinecap="round" />
    {/* the face, looking ahead */}
    <ellipse cx="15" cy="12.4" rx="0.62" ry="0.85" fill="var(--ink, #2e2a26)" />
    <circle cx="15.2" cy="12.05" r="0.24" fill="#ffffff" />
    <path d="M14.2,11 q0.8,-0.4 1.6,0" fill="none" stroke={colours.hair} strokeWidth="0.45" strokeLinecap="round" />
    {cheeks === "rosy" && <ellipse cx="15.1" cy="14" rx="0.8" ry="0.5" fill={BLUSH} opacity="0.55" />}
    <path d="M14.6,15.1 q0.45,0.3 0.9,0" fill="none" stroke="var(--ink, #2e2a26)" strokeWidth="0.45" strokeLinecap="round" />
    <Hat hat={hat} hair={colours.hair} />
  </g>;
}

function Leg({ side, x }: { side: "back" | "front"; x: number }) {
  const toe = side === "front" ? 0.9 : -0.3;
  return <g className={`traveller-leg traveller-leg-${side}`}>
    <path d={`M${x},26 L${x + (side === "front" ? 0.3 : -0.3)},32.6`} stroke="var(--ink, #2e2a26)" strokeWidth="2.2" strokeLinecap="round" />
    <ellipse cx={x + toe * 0.6} cy="33.2" rx="1.5" ry="0.85" fill={PAPER} {...ink} strokeWidth="0.5" />
    <path d={`M${x - 1.4 + toe * 0.6},34.1 h3`} stroke={WOOD} strokeWidth="0.7" strokeLinecap="round" />
  </g>;
}

/** The traveller in `look`; its legs step while `isWalking`. */
export function TravellerFigure({ look, isWalking = false }: { look: TravellerLook; isWalking?: boolean }) {
  const colours = lookColours(look);
  const carried = CARRIED[look.accessory];
  return <svg viewBox="0 0 24 36" className={`block h-full w-auto overflow-visible ${isWalking ? "traveller-walking" : ""}`} aria-hidden="true">
    <ellipse cx="12" cy="34.6" rx="6.5" ry="1.3" fill="var(--ink, #2e2a26)" opacity="0.18" />
    {carried.back}
    <Leg side="back" x={10.4} />
    <Leg side="front" x={13.6} />
    {/* the kimono (no arms: things are held at the side): a crossed collar, the sash with its bow at the back, a darker hem */}
    <path d="M8,15.8 L16.8,15.8 L18.6,27.2 L6.2,27.2 Z" fill={colours.outfit} {...ink} />
    <path d="M6.5,25.4 L18.3,25.4 L18.6,27.2 L6.2,27.2 Z" fill="var(--ink, #2e2a26)" opacity="0.25" />
    <path d="M13.8,15.8 L11.2,27.2" stroke="var(--ink, #2e2a26)" strokeWidth="0.5" opacity="0.5" />
    <path d="M10.6,15.8 L13.4,19.6 L16.2,15.8" fill="none" stroke={PAPER} strokeWidth="1" strokeLinejoin="round" />
    {[[9, 23.6], [15.8, 24], [12.6, 18.2], [8.4, 18.8]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="0.45" fill={PAPER} opacity="0.4" />)}
    <path d="M6.9,20.2 h11 v2.5 h-11 Z" fill={colours.sash} {...ink} strokeWidth="0.6" />
    {/* the bow at the back: two loops and a hanging end */}
    <path d="M7.2,21.4 Q5.6,18.8 4.6,20.2 Q4.2,21.2 7.2,21.4 Z M7.2,21.4 Q5.4,23.8 4.6,22.6 Q4.2,21.6 7.2,21.4 Z" fill={colours.sash} {...ink} strokeWidth="0.55" />
    <path d="M7,21.6 Q6.6,23.4 7.4,24.6" fill="none" stroke={colours.sash} strokeWidth="0.9" strokeLinecap="round" />
    <circle cx="7.2" cy="21.4" r="0.6" fill={colours.sash} {...ink} strokeWidth="0.5" />
    {carried.front}
    <Head colours={colours} hat={look.hat} cheeks={look.cheeks} />
  </svg>;
}
