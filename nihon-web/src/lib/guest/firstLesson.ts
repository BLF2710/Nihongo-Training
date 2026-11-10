// The guest's first lesson: the order its steps come in, and its listening rounds.

export const LESSON_STEPS = ["meet", "match", "read", "name"] as const;
export type LessonStep = (typeof LESSON_STEPS)[number];

/** The step after this one; the name step is the last. */
export function nextStep(step: LessonStep): LessonStep {
  const index = LESSON_STEPS.indexOf(step);
  return LESSON_STEPS[Math.min(index + 1, LESSON_STEPS.length - 1)];
}

export type MatchRound<T> = { answer: T; choices: readonly T[] };

/** Shuffles a copy of the items; `random` returns a number in [0, 1), so tests can pass a fixed sequence. */
export function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapWith = Math.floor(random() * (index + 1));
    [copy[index], copy[swapWith]] = [copy[swapWith], copy[index]];
  }
  return copy;
}

/** One listening round per item, in a shuffled order, each offering every item as a choice in its own shuffled order. */
export function matchRounds<T>(items: readonly T[], random: () => number): MatchRound<T>[] {
  return shuffled(items, random).map(answer => ({ answer, choices: shuffled(items, random) }));
}
