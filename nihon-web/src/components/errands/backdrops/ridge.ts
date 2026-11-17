import { BACKDROP_HEIGHT as GROUND } from "./BackdropCard";

// A backdrop's rolling hills, in the card's tiles (the ground line is y = GROUND): fixed sums of sines, not randomness,
// so a scene looks the same every time it is drawn.

/** A rolling line of hills: how high its lowest and highest points stand off the ground, and how long its swells are. */
export type RidgeShape = { base: number; amplitude: number; length: number; phase: number };
/** A drawn ridge: its outline down to the ground, and how high it stands at any x (as a y on the card). */
export type Ridge = { outline: string; topAt: (x: number) => number };

const RIDGE_STEP = 0.5;

export function ridge(width: number, { base, amplitude, length, phase }: RidgeShape): Ridge {
  const topAt = (x: number) => {
    const long = 0.5 + 0.5 * Math.sin((2 * Math.PI * x) / length + phase);
    const short = 0.5 + 0.5 * Math.sin((2 * Math.PI * x) / (length * 0.43) + phase * 2.3);
    return GROUND - base - amplitude * (0.6 * long + 0.4 * short);
  };
  const steps = Math.ceil(width / RIDGE_STEP);
  const line = Array.from({ length: steps + 1 }, (_, index) => `L${(index * RIDGE_STEP).toFixed(2)},${topAt(index * RIDGE_STEP).toFixed(3)}`).join(" ");
  return { outline: `M0,${GROUND} ${line} L${width},${GROUND} Z`, topAt };
}
