// Days are calendar dates written as YYYY-MM-DD, each learner's own day (see activity_days).
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dayBefore = (day: string) => new Date(Date.parse(`${day}T00:00:00Z`) - MS_PER_DAY).toISOString().slice(0, 10);

/**
 * How many days in a row two friends were both active, ending today. A run that ended yesterday still counts,
 * because today is not over yet; it breaks once a whole day passes without both of them studying.
 */
export function friendStreak(myDays: readonly string[], theirDays: readonly string[], today: string): number {
  const theirs = new Set(theirDays);
  const shared = new Set(myDays.filter(day => theirs.has(day)));
  let day = shared.has(today) ? today : dayBefore(today);
  let streak = 0;
  while (shared.has(day)) { streak++; day = dayBefore(day); }
  return streak;
}
