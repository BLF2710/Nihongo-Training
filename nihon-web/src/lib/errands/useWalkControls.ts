import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Direction } from "./movement.ts";

// Physical keys, so WASD works the same on any keyboard layout.
const KEY_DIRECTIONS: Readonly<Record<string, Direction>> = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};

const isTypingIn = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** The directions held down, by arrow keys or WASD (while `isListening`) or the touch pad (press and release). */
export function useHeldDirections(isListening: boolean): { held: RefObject<Set<Direction>>; press: (direction: Direction) => void; release: (direction: Direction) => void } {
  const held = useRef(new Set<Direction>());
  useEffect(() => {
    const directions = held.current;
    directions.clear();
    if (!isListening) return;
    const onDown = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.code];
      if (!direction || isTypingIn(event.target)) return;
      event.preventDefault();
      directions.add(direction);
    };
    const onUp = (event: KeyboardEvent) => { const direction = KEY_DIRECTIONS[event.code]; if (direction) directions.delete(direction); };
    // Keys released while the window is in the background never send keyup, so leaving it lets go of everything.
    const letGo = () => directions.clear();
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", letGo);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); window.removeEventListener("blur", letGo); directions.clear(); };
  }, [isListening]);
  const press = useCallback((direction: Direction) => { held.current.add(direction); }, []);
  const release = useCallback((direction: Direction) => { held.current.delete(direction); }, []);
  return { held, press, release };
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
