// Bands, weights and scores for writing and speaking, aligned with the JF Standard (see GRADING.md).
// Pure functions only: no database, network or framework imports, so the rules can be tested on their own.

export const JF_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type JfLevel = (typeof JF_LEVELS)[number];

export const COURSE_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

/** The course's JLPT levels mapped to JF target levels. A course design choice: there is no official table. */
export const JF_LEVEL_FOR_COURSE_LEVEL: Record<CourseLevel, JfLevel> = { N5: "A1", N4: "A2", N3: "B1", N2: "B2", N1: "C1" };

export type Band = 1 | 2 | 3 | 4;
export const BANDS: Record<Band, { label: string; romaji: string; meaning: string; points: number }> = {
  1: { label: "がんばろう", romaji: "ganbarou", meaning: "Not yet at the target level", points: 25 },
  2: { label: "もうすこし", romaji: "mou sukoshi", meaning: "Partly meets the target level", points: 50 },
  3: { label: "できました", romaji: "dekimashita", meaning: "Meets the target level", points: 75 },
  4: { label: "すばらしい", romaji: "subarashii", meaning: "Clearly exceeds the target level", points: 100 },
};

/** Lowest score for each overall band, highest band first. */
const OVERALL_BAND_FROM: [Band, number][] = [[4, 88], [3, 63], [2, 38], [1, 0]];
/** The target is met from this overall band. */
export const TARGET_MET_BAND: Band = 3;

/** Azure 0–100 score needed for bands 2, 3 and 4, by target level (pronunciation, fluency, completeness). */
const SPEECH_THRESHOLDS: Record<JfLevel, [number, number, number]> = {
  A1: [40, 55, 70], A2: [45, 60, 75], B1: [55, 70, 82], B2: [60, 75, 87], C1: [65, 80, 92], C2: [70, 85, 95],
};

/** The 0–100 speech scores needed for bands 2, 3 and 4 at a target level. */
export function speechThresholds(level: JfLevel): { band2: number; band3: number; band4: number } {
  const [band2, band3, band4] = SPEECH_THRESHOLDS[level];
  return { band2, band3, band4 };
}

export function isBand(value: unknown): value is Band {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

/** Turns a 0–100 speech score into a band for the target level. */
export function bandForSpeechScore(score: number, level: JfLevel): Band {
  if (!Number.isFinite(score)) throw new RangeError("A speech score must be a number.");
  const [band2, band3, band4] = SPEECH_THRESHOLDS[level];
  if (score >= band4) return 4;
  if (score >= band3) return 3;
  if (score >= band2) return 2;
  return 1;
}

export function overallBandForScore(score: number): Band {
  return OVERALL_BAND_FROM.find(([, from]) => score >= from)?.[0] ?? 1;
}

/** A criterion's weight, and its band, or null when it couldn't be assessed. */
export type CriterionGrade = { id: string; weight: number; band: Band | null };
export type GradeResult = { score: number; band: Band; met: boolean; assessed: string[]; notAssessed: string[] };

/**
 * Weighted score from criterion bands. Criteria that couldn't be assessed are left out and the remaining weights
 * are scaled up to 100 %, so the score stays on the same 25–100 scale.
 */
export function gradeFromCriteria(criteria: readonly CriterionGrade[]): GradeResult {
  const assessed = criteria.filter((criterion): criterion is CriterionGrade & { band: Band } => criterion.band !== null);
  const totalWeight = assessed.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (!assessed.length || totalWeight <= 0) throw new RangeError("At least one criterion must be assessed.");
  const weighted = assessed.reduce((sum, criterion) => sum + BANDS[criterion.band].points * criterion.weight, 0);
  const score = Math.round(weighted / totalWeight);
  const band = overallBandForScore(score);
  return { score, band, met: band >= TARGET_MET_BAND, assessed: assessed.map(item => item.id), notAssessed: criteria.filter(item => item.band === null).map(item => item.id) };
}
