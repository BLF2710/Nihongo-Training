import type { SkillUnit } from "../data/japaneseSkillPractice";
import { sample, shuffle } from "./random";

export type Skill = "listening" | "speaking";
export type SkillSection = "vocabulary" | "sentences" | "dialogue";
export const SKILL_SECTIONS: { key: SkillSection; label: string }[] = [
  { key: "vocabulary", label: "Vocabulary" }, { key: "sentences", label: "Sentences" }, { key: "dialogue", label: "Dialogue" },
];
export const ROUND_SIZE = 10;
const CHOICES = 4;

type Reveal = { japanese: string; romaji?: string; meaning?: string };
/** Hear `audio`, then pick `answer` from `choices`. */
export type ListeningExercise = { id: string; audio: string[]; question: string; choices: string[]; answer: string; choicesInJapanese: boolean; reveal: Reveal[] };
/** Say `target`; in a dialogue `lead` is the partner's line that comes first. */
export type SpeakingExercise = Reveal & { id: string; target: string; lead?: { speaker: string; japanese: string }; speaker?: string };

// The answer plus distractors that cannot be mistaken for it, in random order.
function choicesFor(answer: string, pool: string[], random: () => number) {
  const distractors = sample([...new Set(pool)].filter(option => option !== answer), CHOICES - 1, random);
  return shuffle([answer, ...distractors], random);
}

export function buildListeningRound(unit: SkillUnit, section: SkillSection, random: () => number = Math.random): ListeningExercise[] {
  if (section === "vocabulary") {
    const meanings = unit.vocabulary.map(word => word.meaning);
    return sample(unit.vocabulary, ROUND_SIZE, random).map(word => ({
      id: word.id, audio: [word.japanese], question: "What does this word mean?", choicesInJapanese: false,
      choices: choicesFor(word.meaning, meanings, random), answer: word.meaning, reveal: [word],
    }));
  }
  if (section === "sentences") {
    const meanings = unit.sentences.map(sentence => sentence.meaning);
    return sample(unit.sentences, ROUND_SIZE, random).map(sentence => ({
      id: sentence.id, audio: [sentence.japanese], question: "What does this sentence mean?", choicesInJapanese: false,
      choices: choicesFor(sentence.meaning, meanings, random), answer: sentence.meaning, reveal: [sentence],
    }));
  }
  const replies = unit.dialogues.map(dialogue => dialogue.lines[1].japanese);
  return sample(unit.dialogues, ROUND_SIZE, random).map(dialogue => {
    const [first, reply] = dialogue.lines;
    return {
      id: dialogue.id, audio: [first.japanese, reply.japanese], question: `What does ${reply.speaker} answer?`, choicesInJapanese: true,
      choices: choicesFor(reply.japanese, replies, random), answer: reply.japanese, reveal: dialogue.lines.map(line => ({ japanese: `${line.speaker}: ${line.japanese}` })),
    };
  });
}

export function buildSpeakingRound(unit: SkillUnit, section: SkillSection, random: () => number = Math.random): SpeakingExercise[] {
  if (section === "vocabulary") return sample(unit.vocabulary, ROUND_SIZE, random).map(word => ({ ...word, target: word.japanese }));
  if (section === "sentences") return sample(unit.sentences, ROUND_SIZE, random).map(sentence => ({ ...sentence, target: sentence.japanese }));
  return sample(unit.dialogues, ROUND_SIZE, random).map(dialogue => {
    const [lead, reply] = dialogue.lines;
    return { id: dialogue.id, japanese: reply.japanese, target: reply.japanese, lead, speaker: reply.speaker };
  });
}
