import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Direction } from "./movement.ts";

// Physical keys, so WASD works the same on any keyboard layout.
const KEY_DIRECTIONS: Readonly<Record<string, Direction>> = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};

const RUN_KEYS: ReadonlySet<string> = new Set(["ShiftLeft", "ShiftRight"]);

const isTypingIn = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

type HeldDirections = {
  held: RefObject<Set<Direction>>;
  /** Whether any direction is held: the frame loop only needs to run then. */
  isHolding: boolean;
  /** Whether Shift (or the touch pad's Run button) is held. */
  isRunning: boolean;
  press: (direction: Direction) => void; release: (direction: Direction) => void;
  setIsRunning: (isRunning: boolean) => void;
};

/** The directions held down, by arrow keys or WASD (while `isListening`) or the touch pad (press and release), and
 *  whether the traveller runs. */
export function useHeldDirections(isListening: boolean): HeldDirections {
  const held = useRef(new Set<Direction>());
  const [isHolding, setIsHolding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const press = useCallback((direction: Direction) => { held.current.add(direction); setIsHolding(true); }, []);
  const release = useCallback((direction: Direction) => { held.current.delete(direction); setIsHolding(held.current.size > 0); }, []);
  const releaseAll = useCallback(() => { held.current.clear(); setIsHolding(false); setIsRunning(false); }, []);
  useEffect(() => {
    if (!isListening) return;
    const onDown = (event: KeyboardEvent) => {
      if (RUN_KEYS.has(event.code)) { setIsRunning(true); return; }
      const direction = KEY_DIRECTIONS[event.code];
      if (!direction || isTypingIn(event.target)) return;
      event.preventDefault();
      press(direction);
    };
    const onUp = (event: KeyboardEvent) => {
      if (RUN_KEYS.has(event.code)) { setIsRunning(false); return; }
      const direction = KEY_DIRECTIONS[event.code];
      if (direction) release(direction);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    // Keys released while the window is in the background never send keyup, so leaving it lets go of everything.
    window.addEventListener("blur", releaseAll);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); window.removeEventListener("blur", releaseAll); releaseAll(); };
  }, [isListening, press, release, releaseAll]);
  return { held, isHolding: isListening && isHolding, isRunning: isListening && isRunning, press, release, setIsRunning };
}

/** Calls `onFrame` with the seconds since the last frame, once per screen refresh, while `isRunning`. */
export function useFrameLoop(isRunning: boolean, onFrame: (seconds: number) => void) {
  const latest = useRef(onFrame);
  useEffect(() => { latest.current = onFrame; });
  useEffect(() => {
    if (!isRunning) return;
    let frame = 0, last = performance.now();
    const tick = (now: number) => { latest.current((now - last) / 1000); last = now; frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isRunning]);
}
