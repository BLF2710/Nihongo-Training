// Decorative life around the islands (styles and motion in IslandMap.css). Hidden from assistive technology.
const ink = { stroke: "var(--ink)", strokeWidth: 1.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
// The flight of cranes: where each bird flies in the formation (rem), and how far behind the leader it flaps.
// Cherry petals drifting down by day: where each starts across the map (%), how long its fall takes and when it begins (s).
const PETALS = [{ left: 12, duration: 19, delay: -2 }, { left: 34, duration: 23, delay: -14 }, { left: 52, duration: 17, delay: -8 }, { left: 71, duration: 25, delay: -19 }, { left: 88, duration: 21, delay: -5 }, { left: 96, duration: 18, delay: -12 }] as const;
const FLOCK = [{ left: 0, top: 2.2, delay: -0.25 }, { left: 4.2, top: 0, delay: 0 }, { left: 8.6, top: 2.6, delay: -0.45 }] as const;

function SailingBoatArt() {
  return <svg viewBox="0 0 60 50" className="scenery-boat-art" aria-hidden="true">
    <path d="M4,44 Q30,52 56,44" fill="none" stroke="var(--foam)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
    <path d="M6,34 L54,34 L46,42 L14,42 Z" fill="var(--wood)" {...ink} />
    <line x1="30" y1="34" x2="30" y2="6" {...ink} />
    <path d="M31,8 L48,30 L31,30 Z" fill="var(--paper)" {...ink} />
    <path d="M29,12 L16,30 L29,30 Z" fill="var(--paper)" {...ink} />
  </svg>;
}

/** A boat sailing along a lane through open water (`route` is an SVG path in the stage's pixels). */
export function SailingBoat({ route }: { route: string }) {
  return <div aria-hidden="true" className="scenery-boat" style={{ offsetPath: `path("${route}")` }}><SailingBoatArt /></div>;
}

/** A red-crowned crane in flight, facing right; its near wing flaps. */
function Crane({ flapDelay }: { flapDelay: number }) {
  const flap = { animationDelay: `${flapDelay}s` };
  const wing = "M30,20 Q26,6 40,0 Q50,-2 58,2 Q48,6 44,20 Z";
  const wingTip = "M40,0 Q50,-2 58,2 Q52,3 48,4 Z";
  return <svg viewBox="0 -4 80 34" className="block w-full" aria-hidden="true">
    <g className="scenery-wing" style={flap} opacity="0.75"><path d={wing} transform="translate(-4,1)" fill="var(--crane)" {...ink} strokeWidth="1" /></g>
    <path d="M22,21 q-6,-3 -9,2 q5,1.5 9,0 Z" fill="var(--ink)" />
    <path d="M22,23 L4,25 M22,22 L5,23" stroke="var(--ink)" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M44,20 Q56,14 66,15" fill="none" stroke="var(--ink)" strokeWidth="4.4" strokeLinecap="round" />
    <path d="M44,20 Q56,14 66,15" fill="none" stroke="var(--crane)" strokeWidth="2.6" strokeLinecap="round" />
    <ellipse cx="34" cy="21" rx="13" ry="4.5" fill="var(--crane)" {...ink} strokeWidth="1.2" />
    <circle cx="67" cy="15" r="2.6" fill="var(--crane)" {...ink} strokeWidth="1" />
    <circle cx="67.6" cy="13.4" r="1.3" fill="var(--vermilion)" />
    <path d="M69,15.6 L77,16.8" stroke="var(--ink)" strokeWidth="1.3" strokeLinecap="round" />
    <g className="scenery-wing" style={flap}><path d={wing} fill="var(--crane)" {...ink} strokeWidth="1.2" /><path d={wingTip} fill="var(--ink)" /></g>
  </svg>;
}

/** A fisherman in a small boat, rocking in place, with a fish leaping beside it now and then. */
export function FishingBoat() {
  return <div aria-hidden="true" className="scenery-fishing">
    <svg viewBox="0 0 80 50" className="scenery-boat-art" aria-hidden="true">
      <path d="M8,40 Q36,48 66,40" fill="none" stroke="var(--foam)" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
      <path d="M10,32 L60,32 L52,40 L18,40 Z" fill="var(--wood)" {...ink} />
      <circle cx="34" cy="20" r="4" fill="var(--paper)" {...ink} />
      <path d="M26,22 L34,12 L42,22 Z" fill="var(--wood)" {...ink} />
      <path d="M33,24 L35,32" {...ink} />
      <path d="M36,25 L68,6" {...ink} strokeWidth="1.2" />
      <path d="M68,6 Q72,24 72,38" fill="none" stroke="var(--ink)" strokeWidth="0.6" />
    </svg>
    <svg viewBox="0 0 30 30" className="scenery-fish" aria-hidden="true">
      <path d="M4,15 Q14,6 24,15 Q14,22 4,15 Z M24,15 L29,10 L28,20 Z" fill="var(--slate)" {...ink} strokeWidth="1" />
    </svg>
  </div>;
}

/** Paper lanterns floating on the water; they glow at night and are hidden by day. */
export function FloatingLantern() {
  return <div aria-hidden="true" className="scenery-lantern">
    <svg viewBox="0 0 30 30" className="block w-full" aria-hidden="true">
      <ellipse cx="15" cy="24" rx="12" ry="4" fill="var(--lantern)" opacity="0.35" />
      <rect x="8" y="10" width="14" height="13" rx="2" fill="var(--lantern)" {...ink} strokeWidth="1" />
      <path d="M8,10 L15,5 L22,10 Z" fill="var(--wood)" {...ink} strokeWidth="1" />
    </svg>
  </div>;
}

/** Under the islands: the sun with its rays and glitter on the waves (a moon at night; mist at dawn, a golden streak at dusk), and cloud shadows passing over the water. */
export function SceneryBelow() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="scenery-sun-wash" />
    <div className="scenery-morning-mist" />
    <div className="scenery-morning-mist scenery-morning-mist-late" />
    <div className="scenery-sun-streak" />
    <div className="scenery-sun-glitter" />
    <div className="scenery-sun-glitter scenery-sun-glitter-offset" />
    <div className="scenery-sun-rays" />
    <div className="scenery-sun" />
    <div className="scenery-cloud-shadow" />
    <div className="scenery-cloud-shadow scenery-cloud-shadow-late" />
  </div>;
}

/** Above the islands: a flight of cranes now and then, with their shadows on the water far below, and cherry petals by day. */
export function SceneryAbove() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {PETALS.map(petal => <div key={petal.left} className="scenery-petal" style={{ left: `${petal.left}%`, animationDuration: `${petal.duration}s`, animationDelay: `${petal.delay}s` }} />)}
    <div className="scenery-flock">
      {FLOCK.map(bird => <div key={bird.left}>
        <div className="scenery-crane-shadow" style={{ left: `${bird.left + 0.6}rem`, top: `${bird.top + 7}rem` }} />
        <div className="scenery-crane" style={{ left: `${bird.left}rem`, top: `${bird.top}rem` }}><Crane flapDelay={bird.delay} /></div>
      </div>)}
    </div>
  </div>;
}
