export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Up to `count` distinct items in random order. */
export const sample = <T>(items: readonly T[], count: number, random: () => number = Math.random): T[] =>
  shuffle(items, random).slice(0, count);
