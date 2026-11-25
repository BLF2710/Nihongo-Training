// Turns the English course's blueprints and unit sources into the site's data. Pure: the importer
// (scripts/import-english-course.ts) reads the sources and writes the result.
import { ENGLISH_LEVELS } from "../../shared/course/english/schema.ts";
import type { EnglishAssessment, EnglishLesson, EnglishLevel, EnglishUnit, Question } from "../../shared/course/english/schema.ts";
import { shuffledOptions } from "./optionOrder.ts";
import type { LessonSource, LevelBlueprint, UnitSource } from "./source.ts";
import { unitErrors } from "./validate.ts";

/** Units are ordered across levels by sequence: a level's units come after every unit of the levels before it. */
const UNITS_PER_LEVEL_SPAN = 100;
const PASS_PERCENT = 80;
const LESSON_KEY = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type EnglishCourse = { units: EnglishUnit[]; lessons: EnglishLesson[]; assessments: EnglishAssessment[] };
export type BuildResult = { course: EnglishCourse; errors: string[] };

export const unitIdOf = (level: EnglishLevel, number: number) => `english-${level.toLowerCase()}-unit-${number}`;
export const lessonIdOf = (level: EnglishLevel, number: number, key: string) => `${unitIdOf(level, number)}-${key}`;
const slugOf = (level: EnglishLevel, number: number, key: string) => `${level.toLowerCase()}-unit-${number}-${key}`;
const assessmentIdOf = (level: EnglishLevel, number: number) => `${unitIdOf(level, number)}-assessment`;

function blueprintErrors(blueprint: LevelBlueprint): string[] {
  const numbers = blueprint.units.map(unit => unit.number);
  return [
    ...(new Set(numbers).size !== numbers.length ? [`${blueprint.level} blueprint: unit numbers repeat`] : []),
    ...blueprint.units.flatMap(unit => unit.lessons.filter(lesson => !LESSON_KEY.test(lesson.key))
      .map(lesson => `${blueprint.level} blueprint Unit ${unit.number}: lesson key "${lesson.key}" must be lower-case words joined by hyphens`)),
  ];
}

const withShuffledOptions = (question: Question, place: string): Question => ({ ...question, options: shuffledOptions(question.options, place) });

function toLesson(source: LessonSource, unit: UnitSource, lessonNumber: number): EnglishLesson {
  const { key, isReview = false, practice, challenge, ...content } = source;
  const id = lessonIdOf(unit.level, unit.number, key);
  return {
    id, slug: slugOf(unit.level, unit.number, key), unitId: unitIdOf(unit.level, unit.number),
    level: unit.level, unitNumber: unit.number, lessonNumber, isReview, ...content,
    practice: practice.map((question, index) => withShuffledOptions(question, `${id}/practice/${index}`)),
    challenge: challenge.map((question, index) => withShuffledOptions(question, `${id}/challenge/${index}`)),
  };
}

function toAssessment(unit: UnitSource): EnglishAssessment {
  const id = assessmentIdOf(unit.level, unit.number);
  return {
    id, passPercent: PASS_PERCENT,
    questions: unit.assessment.map(question => {
      const options = shuffledOptions(question.options, `${id}/${question.id}`);
      return { id: question.id, prompt: question.prompt, options, correctIndex: options.indexOf(question.correct), explanation: question.explanation };
    }),
  };
}

/** Every unit of every blueprint, published once its source is in and passes; lessons and assessments of the
 *  published units only. */
export function buildEnglishCourse(blueprints: readonly LevelBlueprint[], sources: readonly UnitSource[]): BuildResult {
  const errors = blueprints.flatMap(blueprintErrors);
  const passing = sources.filter(source => {
    const blueprint = blueprints.find(item => item.level === source.level)?.units.find(unit => unit.number === source.number);
    const problems = unitErrors(source, blueprint, `${source.level} Unit ${source.number}`);
    errors.push(...problems);
    return problems.length === 0;
  });
  const units = blueprints.flatMap(blueprint => blueprint.units.map((unit): EnglishUnit => ({
    id: unitIdOf(blueprint.level, unit.number), level: blueprint.level, number: unit.number,
    sequence: ENGLISH_LEVELS.indexOf(blueprint.level) * UNITS_PER_LEVEL_SPAN + unit.number,
    title: unit.title, titleVi: unit.titleVi, description: unit.description,
    lessonIds: unit.lessons.map(lesson => lessonIdOf(blueprint.level, unit.number, lesson.key)),
    assessmentId: assessmentIdOf(blueprint.level, unit.number),
    published: passing.some(source => source.level === blueprint.level && source.number === unit.number),
  }))).sort((a, b) => a.sequence - b.sequence);
  return {
    errors,
    course: {
      units,
      lessons: passing.flatMap(unit => unit.lessons.map((lesson, index) => toLesson(lesson, unit, index + 1))),
      assessments: passing.map(toAssessment),
    },
  };
}
