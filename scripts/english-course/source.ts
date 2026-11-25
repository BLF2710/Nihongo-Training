// How English course content is written (docs/curriculum/english/<level>/): a blueprint per level naming its units
// and lessons, then one source file per unit with the lessons and the unit assessment in full. Ids and slugs are
// made from the level, unit number and each lesson's `key`, so authors never write them.
import type { Bilingual, DialogueLine, EnglishLevel, EnglishWord, GrammarPoint, Question } from "../../shared/course/english/schema.ts";

export type BlueprintLesson = { key: string; title: string; titleVi: string };
export type BlueprintUnit = { number: number; title: string; titleVi: string; description: string; lessons: readonly BlueprintLesson[] };
export type LevelBlueprint = { level: EnglishLevel; units: readonly BlueprintUnit[] };

export type LessonSource = BlueprintLesson & {
  isReview?: boolean;
  objectives: readonly string[];
  vocabulary: readonly EnglishWord[];
  grammar: readonly GrammarPoint[];
  examples: readonly Bilingual[];
  dialogue: readonly DialogueLine[];
  practice: readonly Question[];
  challenge: readonly Question[];
};

export type AssessmentQuestionSource = Question & { id: string };
export type UnitSource = { level: EnglishLevel; number: number; lessons: readonly LessonSource[]; assessment: readonly AssessmentQuestionSource[] };
