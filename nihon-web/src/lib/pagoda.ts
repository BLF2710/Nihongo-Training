import type { Point } from "./svgPath";

// The Lessons pagoda, in the island's drawing units. It keeps its height as it gains tiers (3, 4, then 5), so the spire
// stays inside the drawing; the tiers stand at PAGODA_BASE on the podium.
const PAGODA_HEIGHT = 60;
export const PAGODA_BASE = { x: 2, y: 4 } as const;
// The gilded ball that tops the spire: its height above the top roof's peak, and its radius.
export const PAGODA_FINIAL = { rise: 41, radius: 3.2 } as const;

/** The pagoda's tiers at a growth stage: how many, their spacing, the scale of their roofs, and where the top roof peaks. */
export function pagodaShape(stage: number) {
  const tierCount = 3 + Math.min(stage, 2);
  const spacing = PAGODA_HEIGHT / (tierCount - 1);
  const k = spacing / 30;
  const topY = -8 - (tierCount - 1) * spacing;
  return { tierCount, spacing, k, peak: topY - 34 * k };
}

/** The top of the pagoda's finial, which drops as tiers are added: where the carrier pigeon perches on Lessons. */
export function pagodaFinialTop(stage: number): Point {
  return { x: PAGODA_BASE.x, y: PAGODA_BASE.y + pagodaShape(stage).peak - PAGODA_FINIAL.rise - PAGODA_FINIAL.radius };
}
