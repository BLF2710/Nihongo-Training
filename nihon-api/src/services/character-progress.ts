// Preserve the existing Kana rule: mastery uses the displayed whole-percent accuracy.
export function characterProgress(correctCount: number, wrongCount: number) {
  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 0 : Number((correctCount / total * 100).toFixed(0));
  const status = total === 0 ? "untested" : accuracy >= 80 && correctCount >= 3 ? "mastered" : "learning";
  return { correctCount, wrongCount, total, accuracy, status };
}

/** Below this accuracy a character the learner has got wrong is "weak", even when it already counts as mastered. */
export const WEAK_ACCURACY = 85;

/** Missed at least once and still answered below WEAK_ACCURACY; never-missed characters are new, not weak. */
export function isWeakCharacter(correctCount: number, wrongCount: number): boolean {
  return wrongCount > 0 && characterProgress(correctCount, wrongCount).accuracy < WEAK_ACCURACY;
}
