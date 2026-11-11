import { useEffect, useState } from "react";
import { strokePathsOf } from "../../lib/kanaWilds/strokeSamples";

/** How long the enemy takes to draw each stroke of an attack. */
export const STROKE_DRAW_MS = 450;

/** Counts up the strokes drawn so far, one every STROKE_DRAW_MS, until `total`. Re-key the user to start again. */
export function useStrokeDrawing(total: number): number {
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    if (drawn >= total) return;
    const timer = window.setTimeout(() => setDrawn(count => count + 1), STROKE_DRAW_MS);
    return () => window.clearTimeout(timer);
  }, [drawn, total]);
  return Math.min(drawn, total);
}

export const strokeTotalOf = (characters: readonly string[]) => characters.reduce((sum, character) => sum + strokePathsOf(character).length, 0);

/** How many of `drawn` strokes fall on each character, drawn one character after another. */
export function strokesPerCharacter(characters: readonly string[], drawn: number): number[] {
  return characters.map((_, index) => {
    const before = strokeTotalOf(characters.slice(0, index));
    return Math.max(0, Math.min(drawn - before, strokePathsOf(characters[index] ?? "").length));
  });
}
