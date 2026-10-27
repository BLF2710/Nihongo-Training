import type { ReviewQuestion } from "../api/review";
import type { SkillUnit } from "../data/japaneseSkillPractice";
import { shuffle } from "./random";
import { buildListeningRound, buildSpeakingRound } from "./skillRounds";
import type { ListeningExercise, SpeakingExercise } from "./skillRounds";

export type ReviewItem =
  | { kind: "bank"; id: string; question: ReviewQuestion }
  | { kind: "vocabulary"; id: string; exercise: ListeningExercise }
  | { kind: "listening"; id: string; exercise: ListeningExercise }
  | { kind: "speaking"; id: string; exercise: SpeakingExercise };

export const REVIEW_SIZE = 12;
const VOCABULARY_QUESTIONS = 2;
const LISTENING_QUESTIONS = 2;
const SPEAKING_QUESTIONS = 2;
const SPARE_VOCABULARY_QUESTIONS = 2;

/**
 * Mixes server-graded question-bank questions with vocabulary, listening and speaking drawn from the unit's
 * lessons. When a unit has few bank questions, extra vocabulary questions fill the round. `reserve` holds
 * replacements for questions the learner cannot do.
 */
export function buildReviewSession(
  questions: ReviewQuestion[], unit: SkillUnit, can: { hear: boolean; speak: boolean }, random: () => number = Math.random, size = REVIEW_SIZE,
): { items: ReviewItem[]; reserve: ReviewItem[] } {
  const vocabulary = buildListeningRound(unit, "vocabulary", random)
    .map((exercise): ReviewItem => ({ kind: "vocabulary", id: `vocabulary:${exercise.id}`, exercise }));
  const listening = can.hear ? buildListeningRound(unit, "sentences", random).slice(0, LISTENING_QUESTIONS)
    .map((exercise): ReviewItem => ({ kind: "listening", id: `listening:${exercise.id}`, exercise })) : [];
  const speaking = can.speak ? [...buildSpeakingRound(unit, "vocabulary", random).slice(0, 1), ...buildSpeakingRound(unit, "sentences", random).slice(0, SPEAKING_QUESTIONS - 1)]
    .map((exercise): ReviewItem => ({ kind: "speaking", id: `speaking:${exercise.id}`, exercise })) : [];
  const skills = [...vocabulary.slice(0, VOCABULARY_QUESTIONS), ...listening, ...speaking];
  const bank = questions.map((question): ReviewItem => ({ kind: "bank", id: question.id, question }));
  const bankShare = Math.max(0, size - skills.length);
  const fromBank = bank.slice(0, bankShare);
  const extraVocabulary = vocabulary.slice(VOCABULARY_QUESTIONS, VOCABULARY_QUESTIONS + bankShare - fromBank.length);
  const spareFrom = VOCABULARY_QUESTIONS + extraVocabulary.length;
  return {
    items: shuffle([...skills, ...fromBank, ...extraVocabulary], random),
    reserve: [...bank.slice(bankShare), ...vocabulary.slice(spareFrom, spareFrom + SPARE_VOCABULARY_QUESTIONS)],
  };
}
