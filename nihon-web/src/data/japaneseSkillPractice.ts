import { N5_LESSONS } from "./japaneseN5Lessons";
import { JAPANESE_STUDY_UNITS } from "./japaneseStudyUnits";

// Speaking and Listening material for one unit. This is the whole contract the practice screens
// depend on, so another source (for example generated material) only has to produce this shape.
export type SkillWord = { id: string; japanese: string; romaji: string; meaning: string };
export type SkillSentence = { id: string; japanese: string; meaning: string };
export type SkillDialogue = { id: string; topic: string; lines: { speaker: string; japanese: string }[] };
export type SkillUnit = { unitId: string; number: number; title: string; vocabulary: SkillWord[]; sentences: SkillSentence[]; dialogues: SkillDialogue[] };

const uniqueBy = <T>(items: T[], key: (item: T) => string) => [...new Map(items.map(item => [key(item), item])).values()];

// Material is projected from the lessons a learner has already completed, not copied into a second catalog.
export const JAPANESE_SKILL_UNITS: SkillUnit[] = JAPANESE_STUDY_UNITS.map(unit => {
  const lessons = N5_LESSONS.filter(lesson => (lesson.unitNumber ?? 1) === unit.number);
  return {
    unitId: unit.id, number: unit.number, title: unit.title,
    // Affixes such as 〜じん are not words that can be said or recognised on their own.
    vocabulary: uniqueBy(
      unit.lessons.flatMap(lesson => lesson.vocabulary).filter(word => !word.japanese.startsWith("〜"))
        .map(({ id, japanese, romaji, meaning }) => ({ id, japanese, romaji, meaning })),
      word => word.japanese),
    sentences: uniqueBy(
      lessons.flatMap(lesson => lesson.examples.map(([japanese, meaning], index) => ({ id: `${lesson.id}:sentence-${index + 1}`, japanese, meaning }))),
      sentence => sentence.japanese),
    dialogues: lessons.flatMap(lesson => lesson.dialogue.map(([speakerA, lineA, speakerB, lineB], index) => ({
      id: `${lesson.id}:dialogue-${index + 1}`, topic: lesson.title,
      lines: [{ speaker: speakerA, japanese: lineA }, { speaker: speakerB, japanese: lineB }],
    }))),
  };
});

export const getSkillUnit = (unitId: string) => JAPANESE_SKILL_UNITS.find(unit => unit.unitId === unitId);
