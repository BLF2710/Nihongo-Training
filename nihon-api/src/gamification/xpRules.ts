/** Where XP comes from. Each (learner, source, reference) pays out once. */
export type XPSource =
  | "lesson_completion" | "lesson_challenge" | "assessment" | "quiz" | "game" | "review" | "mistake" | "kanji"
  | "practice" | "mock_exam" | "mock_exam_pass" | "speaking_test" | "daily_goal" | "achievement" | "streak";

/** Sources paid by an activity; achievements pay their own reward and "streak" is kept for older XP events. */
export type ActivitySource = Exclude<XPSource, "achievement" | "streak">;

export type XpRule = { amount: number; dailyCap: number | null };

// Repeatable activities have a daily cap so XP follows real study, not grinding.
export const XP_RULES: Readonly<Record<ActivitySource, XpRule>> = {
  lesson_completion: { amount: 50, dailyCap: null },
  lesson_challenge: { amount: 25, dailyCap: null },
  assessment: { amount: 100, dailyCap: null },
  quiz: { amount: 10, dailyCap: 50 },
  game: { amount: 10, dailyCap: 50 },
  review: { amount: 2, dailyCap: 60 },
  mistake: { amount: 5, dailyCap: 50 },
  kanji: { amount: 1, dailyCap: 30 },
  practice: { amount: 15, dailyCap: 60 },
  mock_exam: { amount: 30, dailyCap: 60 },
  mock_exam_pass: { amount: 150, dailyCap: null },
  speaking_test: { amount: 20, dailyCap: 60 },
  daily_goal: { amount: 20, dailyCap: null },
};

export const ACTIVITY_SOURCES = Object.keys(XP_RULES) as ActivitySource[];

const isActivitySource = (source: XPSource): source is ActivitySource => source in XP_RULES;

/** The XP an award may still pay today: all of it, part of it up to the cap, or 0 once the cap is reached. */
export function cappedAmount(source: XPSource, amount: number, earnedToday: number): number {
  const cap = isActivitySource(source) ? XP_RULES[source].dailyCap : null;
  if (cap === null) return amount;
  return Math.max(0, Math.min(amount, cap - earnedToday));
}
