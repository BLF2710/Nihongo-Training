import { useEffect, useState } from "react";

/** Whether the learner asked their system for less motion: battle animations are then skipped, with no waits. */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * `value`, but each change shows only after `delayMs` (at once with reduced motion). Lets a number follow an
 * animation, such as HP changing when the blow lands rather than when the answer is given.
 */
export function useDelayedValue<T>(value: T, delayMs: number): T {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setShown(value), prefersReducedMotion() ? 0 : delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return shown;
}
