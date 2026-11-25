// Authors write each question's correct answer first; the site must not show it there, or the first button is always
// right. Options are shuffled once, at import, seeded by the question's place in the course: the order is the same on
// every import (so the API's answer index and saved answers stay valid) and differs between questions.

/** FNV-1a: a 32-bit hash of a string, to seed the shuffle. */
const FNV_OFFSET = 0x811c9dc5, FNV_PRIME = 0x01000193;
function hashOf(text: string): number {
  let hash = FNV_OFFSET;
  for (const character of text) hash = Math.imul(hash ^ (character.codePointAt(0) ?? 0), FNV_PRIME);
  return hash >>> 0;
}

/** Mulberry32: a small seeded generator returning numbers in [0, 1). */
const MULBERRY_INCREMENT = 0x6d2b79f5, UINT32_RANGE = 2 ** 32;
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT32_RANGE;
  };
}

/** The options in a fixed order that depends only on `place` (e.g. "english-a2-unit-1-family/practice/2"). */
export function shuffledOptions(options: readonly string[], place: string): string[] {
  const random = seededRandom(hashOf(place));
  const result = [...options];
  for (let index = result.length - 1; index > 0; index--) {
    const swapWith = Math.floor(random() * (index + 1));
    [result[index], result[swapWith]] = [result[swapWith], result[index]];
  }
  return result;
}
