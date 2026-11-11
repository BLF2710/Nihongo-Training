// A wild kana hides at first and shows itself stroke by stroke as it weakens, so wearing it down is how the player
// learns what they are about to catch.

/** How many of the kana's strokes (in stroke order) are shown at this HP: none at full HP, all at 0. */
export function revealedStrokeCount(strokeCount: number, hp: number, maxHp: number): number {
  if (hp <= 0) return strokeCount;
  return Math.max(0, Math.min(strokeCount, Math.floor(strokeCount * (1 - hp / maxHp))));
}
