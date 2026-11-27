import type { Bilingual, DialogueLine, EnglishWord } from "../../../shared/course/english/schema.ts";
import { sample, shuffle } from "./random.ts";

// English listening and speaking practice, made from the lessons' own words, example sentences and conversations.
// Listening: hear the English, choose its Vietnamese meaning (or, in a conversation, the reply you heard).
// Speaking: say the English; a conversation gives the other speaker's line first.

export type EnglishSkill = "listening" | "speaking";
export type EnglishSkillSection = "vocabulary" | "sentences" | "dialogue";
export const ENGLISH_SKILL_SECTIONS: readonly { key: EnglishSkillSection; label: string }[] = [
  { key: "vocabulary", label: "Words" }, { key: "sentences", label: "Sentences" }, { key: "dialogue", label: "Conversations" },
];
export const ENGLISH_ROUND_SIZE = 10;
const CHOICES = 4;

/** What one lesson gives the practice; `id` keeps each item's exercise id stable. */
type SkillLesson = { id: string; vocabulary: readonly EnglishWord[]; examples: readonly Bilingual[]; dialogue: readonly DialogueLine[] };
type Item = Bilingual & { id: string };
/** One exchange of a conversation: a line and the reply to it. */
type Exchange = { id: string; lead: DialogueLine; reply: DialogueLine };
export type EnglishSkillMaterial = { words: readonly Item[]; sentences: readonly Item[]; exchanges: readonly Exchange[] };

/** Hear `audio` (one line after another), then pick `answer` from `choices`. `reveal` is shown once answered. */
export type EnglishListeningExercise = { id: string; audio: readonly string[]; question: string; choices: readonly string[]; answer: string; areChoicesEnglish: boolean; reveal: readonly Bilingual[] };
/** Say `target`; in a conversation `lead` is the other speaker's line, and `speaker` is who answers. */
export type EnglishSpeakingExercise = { id: string; target: string; vietnamese: string; lead?: DialogueLine; speaker?: string };

/** The words, sentences and exchanges of the given lessons. Every pair of consecutive lines is an exchange. */
export function skillMaterialOf(lessons: readonly SkillLesson[]): EnglishSkillMaterial {
  return {
    words: lessons.flatMap(lesson => lesson.vocabulary.map(word => ({ id: `${lesson.id}:word:${word.word}`, english: word.word, vietnamese: word.vietnamese }))),
    sentences: lessons.flatMap(lesson => lesson.examples.map((example, index) => ({ ...example, id: `${lesson.id}:example-${index + 1}` }))),
    exchanges: lessons.flatMap(lesson => lesson.dialogue.slice(1).map((reply, index) => ({ id: `${lesson.id}:exchange-${index + 1}`, lead: lesson.dialogue[index], reply }))),
  };
}

export const hasSkillMaterial = (material: EnglishSkillMaterial, section: EnglishSkillSection) =>
  (section === "vocabulary" ? material.words : section === "sentences" ? material.sentences : material.exchanges).length > 0;

/** The answer and other options that can't be mistaken for it, in random order. */
function choicesFor(answer: string, pool: readonly string[], random: () => number): string[] {
  return shuffle([answer, ...sample([...new Set(pool)].filter(option => option !== answer), CHOICES - 1, random)], random);
}

function meaningExercises(items: readonly Item[], question: string, random: () => number): EnglishListeningExercise[] {
  const meanings = items.map(item => item.vietnamese);
  return sample(items, ENGLISH_ROUND_SIZE, random).map(item => ({
    id: item.id, audio: [item.english], question, areChoicesEnglish: false,
    choices: choicesFor(item.vietnamese, meanings, random), answer: item.vietnamese, reveal: [item],
  }));
}

export function buildEnglishListeningRound(material: EnglishSkillMaterial, section: EnglishSkillSection, random: () => number = Math.random): EnglishListeningExercise[] {
  if (section === "vocabulary") return meaningExercises(material.words, "What does this mean?", random);
  if (section === "sentences") return meaningExercises(material.sentences, "What does this sentence mean?", random);
  const replies = material.exchanges.map(exchange => exchange.reply.english);
  return sample(material.exchanges, ENGLISH_ROUND_SIZE, random).map(({ id, lead, reply }) => ({
    id, audio: [lead.english, reply.english], question: `What does ${reply.speaker} answer?`, areChoicesEnglish: true,
    choices: choicesFor(reply.english, replies, random), answer: reply.english,
    reveal: [lead, reply].map(line => ({ english: `${line.speaker}: ${line.english}`, vietnamese: line.vietnamese })),
  }));
}

export function buildEnglishSpeakingRound(material: EnglishSkillMaterial, section: EnglishSkillSection, random: () => number = Math.random): EnglishSpeakingExercise[] {
  if (section !== "dialogue") {
    const items = section === "vocabulary" ? material.words : material.sentences;
    return sample(items, ENGLISH_ROUND_SIZE, random).map(item => ({ id: item.id, target: item.english, vietnamese: item.vietnamese }));
  }
  return sample(material.exchanges, ENGLISH_ROUND_SIZE, random).map(({ id, lead, reply }) => ({ id, target: reply.english, vietnamese: reply.vietnamese, lead, speaker: reply.speaker }));
}
