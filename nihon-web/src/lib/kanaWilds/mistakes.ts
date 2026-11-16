// The kana a player took for another during a battle, and the hints a challenger gives from them after a loss
// ("You read ね as れ twice"). Pure.

/** A kana read (shown) or heard (shouted) as another kana. */
export type KanaMistake = { kana: string; mistakenFor: string; way: "read" | "heard" };

/** A challenger names at most this many mix-ups, the most frequent first. */
export const MAX_HINTS = 3;

const timesText = (count: number) => (count === 1 ? "once" : count === 2 ? "twice" : `${count} times`);

/** One line per distinct mix-up, the most frequent first (ties in the order they first happened). */
export function mistakeHints(mistakes: readonly KanaMistake[], limit = MAX_HINTS): string[] {
  const counts = new Map<string, { mistake: KanaMistake; count: number }>();
  for (const mistake of mistakes) {
    const key = `${mistake.way}:${mistake.kana}:${mistake.mistakenFor}`;
    const seen = counts.get(key);
    counts.set(key, { mistake, count: (seen?.count ?? 0) + 1 });
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ mistake, count }) => `You ${mistake.way} ${mistake.kana} as ${mistake.mistakenFor} ${timesText(count)}.`);
}
