// Preserve the existing Kana rule: mastery uses the displayed whole-percent accuracy.
export function characterProgress(correctCount: number, wrongCount: number) {
  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 0 : Number((correctCount / total * 100).toFixed(0));
  const status = total === 0 ? "untested" : accuracy >= 80 && correctCount >= 3 ? "mastered" : "learning";
  return { correctCount, wrongCount, total, accuracy, status };
}
