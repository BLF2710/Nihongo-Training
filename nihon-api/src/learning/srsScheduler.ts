// Spaced repetition scheduling (an SM-2 variant with four grades). Pure functions: no database, clock or framework.

export const SRS_GRADES = ["again", "hard", "good", "easy"] as const;
export type SrsGrade = (typeof SRS_GRADES)[number];
export type CardState = { ease: number; intervalDays: number; repetitions: number; lapses: number };
export type ScheduledCard = CardState & { dueAt: Date };

export const NEW_CARD: CardState = { ease: 2.5, intervalDays: 0, repetitions: 0, lapses: 0 };
const MIN_EASE = 1.3;
const MAX_EASE = 3.5;
/** A forgotten card comes back in the same session after this many minutes. */
const RELEARN_MINUTES = 10;
/** First successful intervals, in days, before the ease factor takes over. */
const FIRST_INTERVAL_DAYS = 1;
const SECOND_INTERVAL_DAYS = 3;
const HARD_FACTOR = 1.2;
const EASY_BONUS = 1.3;
const MAX_INTERVAL_DAYS = 365;
/** A card with an interval of this many days or more counts as "mature" (well remembered). */
export const MATURE_INTERVAL_DAYS = 21;
const DAY_MS = 24 * 60 * 60 * 1000;

const clampEase = (ease: number) => Math.round(Math.min(MAX_EASE, Math.max(MIN_EASE, ease)) * 100) / 100;
const roundDays = (days: number) => Math.round(Math.min(MAX_INTERVAL_DAYS, days) * 100) / 100;

export const isSrsGrade = (value: unknown): value is SrsGrade => SRS_GRADES.some(grade => grade === value);

/** The next state of a card after a review with the given grade. */
export function scheduleReview(card: CardState, grade: SrsGrade, now: Date): ScheduledCard {
  if (grade === "again") {
    const ease = clampEase(card.ease - 0.2);
    return { ease, intervalDays: 0, repetitions: 0, lapses: card.lapses + (card.repetitions > 0 ? 1 : 0), dueAt: new Date(now.getTime() + RELEARN_MINUTES * 60 * 1000) };
  }
  const repetitions = card.repetitions + 1;
  let ease = card.ease;
  let intervalDays: number;
  if (card.repetitions === 0) intervalDays = grade === "easy" ? SECOND_INTERVAL_DAYS : FIRST_INTERVAL_DAYS;
  else if (card.repetitions === 1) intervalDays = grade === "hard" ? FIRST_INTERVAL_DAYS * HARD_FACTOR : grade === "easy" ? SECOND_INTERVAL_DAYS * EASY_BONUS : SECOND_INTERVAL_DAYS;
  else if (grade === "hard") intervalDays = Math.max(card.intervalDays + 1, card.intervalDays * HARD_FACTOR);
  else if (grade === "easy") intervalDays = card.intervalDays * card.ease * EASY_BONUS;
  else intervalDays = card.intervalDays * card.ease;
  if (grade === "hard") ease = clampEase(card.ease - 0.15);
  if (grade === "easy") ease = clampEase(card.ease + 0.15);
  const days = roundDays(intervalDays);
  return { ease, intervalDays: days, repetitions, lapses: card.lapses, dueAt: new Date(now.getTime() + days * DAY_MS) };
}

/** How long until the card is due again for each grade, for the buttons ("10 min", "1 d", "3 d"…). */
export function previewIntervals(card: CardState, now: Date): Record<SrsGrade, number> {
  return Object.fromEntries(SRS_GRADES.map(grade => [grade, scheduleReview(card, grade, now).dueAt.getTime() - now.getTime()])) as Record<SrsGrade, number>;
}
