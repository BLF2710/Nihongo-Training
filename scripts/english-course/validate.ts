// The rules every English unit must pass before it is imported. Pure: each check returns its problems as messages.
import { PARTS_OF_SPEECH } from "../../shared/course/english/schema.ts";
import type { Bilingual, Question } from "../../shared/course/english/schema.ts";
import { americanSpellingsIn } from "./britishSpelling.ts";
import type { BlueprintUnit, LessonSource, UnitSource } from "./source.ts";

export const CONTENT_LESSONS_PER_UNIT = 5;
export const ASSESSMENT_QUESTIONS = 15;
export const MIN_PRACTICE_QUESTIONS = 4;
export const MIN_CHALLENGE_QUESTIONS = 5;
const MIN_OPTIONS = 3, MAX_OPTIONS = 4;
/** British IPA between slashes, as dictionaries print it: /ˈkæsl/. */
const IPA = /^\/[^/\s][^/]*\/$/;

const isBlank = (text: string) => text.trim().length === 0;

/** Every string anywhere in `value`, with where it is ("lessons[2].vocabulary[0].word"). */
function stringsIn(value: unknown, path: string): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) return value.flatMap((item, index) => stringsIn(item, `${path}[${index}]`));
  if (typeof value === "object" && value !== null) return Object.entries(value).flatMap(([key, item]) => stringsIn(item, `${path}.${key}`));
  return [];
}

/** Text must be written in composed form (NFC), so answers compare equal however they were typed. */
function textErrors(value: unknown, path: string): string[] {
  return stringsIn(value, path).flatMap(({ path: at, text }) => [
    ...(isBlank(text) ? [`${at} is empty`] : []),
    ...(text !== text.normalize("NFC") ? [`${at} is not in composed (NFC) form`] : []),
  ]);
}

function bilingualErrors(text: Bilingual, path: string): string[] {
  return text.english.trim() === text.vietnamese.trim() ? [`${path}: the Vietnamese is the same as the English`] : [];
}

export function questionErrors(question: Question, path: string): string[] {
  const { options, correct } = question;
  return [
    ...(options.length < MIN_OPTIONS || options.length > MAX_OPTIONS ? [`${path} has ${options.length} options (${MIN_OPTIONS}–${MAX_OPTIONS})`] : []),
    ...(new Set(options).size !== options.length ? [`${path} repeats an option`] : []),
    ...(!options.includes(correct) ? [`${path}: the correct answer is not one of the options`] : []),
  ];
}

/** The English a learner reads as correct: a question's wrong options and a mistake's wrong form are left out. */
function correctEnglishOf(lesson: LessonSource): string[] {
  const questions = [...lesson.practice, ...lesson.challenge].flatMap(question => [question.prompt, question.correct, question.explanation]);
  return [
    lesson.title, ...lesson.objectives,
    ...lesson.vocabulary.flatMap(word => [word.word, word.definition, word.example.english]),
    ...lesson.grammar.flatMap(point => [point.title, point.pattern, point.explanation.english, ...point.examples.map(example => example.english), ...(point.mistake ? [point.mistake.right, point.mistake.why.english] : [])]),
    ...lesson.examples.map(example => example.english), ...lesson.dialogue.map(line => line.english), ...questions,
  ];
}

export function lessonErrors(lesson: LessonSource, path: string): string[] {
  const bilinguals: [Bilingual, string][] = [
    ...lesson.vocabulary.map((word, index): [Bilingual, string] => [word.example, `${path}.vocabulary[${index}].example`]),
    ...lesson.grammar.flatMap((point, index): [Bilingual, string][] => [[point.explanation, `${path}.grammar[${index}].explanation`], ...point.examples.map((example, at): [Bilingual, string] => [example, `${path}.grammar[${index}].examples[${at}]`])]),
    ...lesson.examples.map((example, index): [Bilingual, string] => [example, `${path}.examples[${index}]`]),
    ...lesson.dialogue.map((line, index): [Bilingual, string] => [line, `${path}.dialogue[${index}]`]),
  ];
  const spellings = americanSpellingsIn(correctEnglishOf(lesson).join(" "));
  return [
    ...textErrors(lesson, path),
    ...lesson.vocabulary.flatMap((word, index) => [
      ...(!IPA.test(word.ipa) ? [`${path}.vocabulary[${index}].ipa "${word.ipa}" is not IPA between slashes`] : []),
      ...(!PARTS_OF_SPEECH.includes(word.partOfSpeech) ? [`${path}.vocabulary[${index}].partOfSpeech "${word.partOfSpeech}" is not known`] : []),
    ]),
    ...bilinguals.flatMap(([text, at]) => bilingualErrors(text, at)),
    ...(lesson.objectives.length === 0 ? [`${path} has no objectives`] : []),
    ...(lesson.practice.length < MIN_PRACTICE_QUESTIONS ? [`${path} has ${lesson.practice.length} practice questions (at least ${MIN_PRACTICE_QUESTIONS})`] : []),
    ...(lesson.challenge.length < MIN_CHALLENGE_QUESTIONS ? [`${path} has ${lesson.challenge.length} challenge questions (at least ${MIN_CHALLENGE_QUESTIONS})`] : []),
    ...lesson.practice.flatMap((question, index) => questionErrors(question, `${path}.practice[${index}]`)),
    ...lesson.challenge.flatMap((question, index) => questionErrors(question, `${path}.challenge[${index}]`)),
    ...(spellings.length ? [`${path} uses American spelling: ${spellings.join(", ")}`] : []),
  ];
}

/** A unit: its lessons as the blueprint names them (content lessons, then one review), a full assessment, words
 *  taught once, and a review that only revisits words taught earlier in the unit. */
export function unitErrors(unit: UnitSource, blueprint: BlueprintUnit | undefined, path: string): string[] {
  if (!blueprint) return [`${path}: the blueprint has no ${unit.level} Unit ${unit.number}`];
  const reviews = unit.lessons.filter(lesson => lesson.isReview);
  const content = unit.lessons.filter(lesson => !lesson.isReview);
  const taught = content.flatMap(lesson => lesson.vocabulary.map(word => word.word.toLowerCase()));
  const repeated = [...new Set(taught.filter((word, index) => taught.indexOf(word) !== index))];
  const ids = unit.assessment.map(question => question.id);
  return [
    ...(content.length !== CONTENT_LESSONS_PER_UNIT ? [`${path} has ${content.length} content lessons (${CONTENT_LESSONS_PER_UNIT})`] : []),
    ...(reviews.length !== 1 || !unit.lessons.at(-1)?.isReview ? [`${path} must end with exactly one review lesson`] : []),
    ...(unit.lessons.map(lesson => lesson.key).join() !== blueprint.lessons.map(lesson => lesson.key).join() ? [`${path}: its lessons are not the blueprint's (${blueprint.lessons.map(lesson => lesson.key).join(", ")})`] : []),
    ...unit.lessons.flatMap((lesson, index) => {
      const planned = blueprint.lessons[index];
      return planned && (planned.title !== lesson.title || planned.titleVi !== lesson.titleVi) ? [`${path}.lessons[${index}]: its title differs from the blueprint's "${planned.title}" / "${planned.titleVi}"`] : [];
    }),
    ...unit.lessons.flatMap((lesson, index) => lessonErrors(lesson, `${path}.lessons[${index}]`)),
    ...(repeated.length ? [`${path} teaches these words twice: ${repeated.join(", ")}`] : []),
    ...reviews.flatMap(review => review.vocabulary.filter(word => !taught.includes(word.word.toLowerCase())).map(word => `${path}: the review lists "${word.word}", which no lesson of the unit teaches`)),
    ...(unit.assessment.length !== ASSESSMENT_QUESTIONS ? [`${path} has ${unit.assessment.length} assessment questions (${ASSESSMENT_QUESTIONS})`] : []),
    ...(new Set(ids).size !== ids.length ? [`${path}: assessment question ids repeat`] : []),
    ...textErrors(unit.assessment, `${path}.assessment`),
    ...unit.assessment.flatMap((question, index) => questionErrors(question, `${path}.assessment[${index}]`)),
  ];
}
