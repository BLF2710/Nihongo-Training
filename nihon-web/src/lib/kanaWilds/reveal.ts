// A wild kana hides at first and shows itself stroke by stroke as it weakens, so wearing it down is how the player
// learns what they are about to catch.

/** At or below this share of its HP the wild kana tells how many strokes it has: a clue even before any shows. */
export const STROKE_COUNT_HP_SHARE = 0.8;

export const isStrokeCountShown = (hp: number, maxHp: number) => hp <= maxHp * STROKE_COUNT_HP_SHARE;

/** How many of the kana's strokes (in stroke order) are shown at this HP: none at full HP, all at 0. */
export function revealedStrokeCount(strokeCount: number, hp: number, maxHp: number): number {
  if (hp <= 0) return strokeCount;
  return Math.max(0, Math.min(strokeCount, Math.floor(strokeCount * (1 - hp / maxHp))));
}
