// The shrine pieces standing about an island drawn in 3D: gates, lanterns, guardians, a drum, a water basin and so
// on, set out by the island's content. Each blocks the ground it stands on, except a gate, which is walked through:
// only its two pillars, at either end of its long side, are in the way. Pure (no three.js, no browser).
import type { Direction } from "../errands/movement.ts";
import type { Rect } from "../errands/townMap.ts";

export type ShrinePropKind =
  | "torii" | "stone-lantern" | "komainu" | "taiko" | "temizuya" | "ema-rack" | "hokora" | "bell-tower" | "gate";

/** A shrine piece on its ground, facing the way its front looks (south, towards the viewer, unless said). */
export type IslandProp = { kind: ShrinePropKind; at: Rect; facing?: Direction };

/** Pieces that are walked through, between pillars at the ends of their long side. */
const WALKED_THROUGH: ReadonlySet<ShrinePropKind> = new Set<ShrinePropKind>(["torii", "gate"]);

export const propModel = (kind: ShrinePropKind): string => `prop:${kind}`;
export const isWalkedThrough = (prop: IslandProp): boolean => WALKED_THROUGH.has(prop.kind);

/** The ground a piece takes up, which nobody can walk on: all of it, or a gate's two pillar tiles. */
export function groundBlockedBy(prop: IslandProp): Rect[] {
  if (!isWalkedThrough(prop)) return [prop.at];
  const { x, y, width, height } = prop.at;
  return width >= height
    ? [{ x, y, width: 1, height }, { x: x + width - 1, y, width: 1, height }]
    : [{ x, y, width, height: 1 }, { x, y: y + height - 1, width, height: 1 }];
}
