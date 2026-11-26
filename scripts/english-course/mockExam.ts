// An English level's mock exam (docs/curriculum/english/<level>/mock-exam.ts): sections of question groups, some
// with a reading passage. Like the units, authors write each question's correct answer, and the import shuffles the
// options and stores the answer's index. Pure: the checks return their problems as messages.
import type { EnglishLevel, EnglishMockExam, Question } from "../../shared/course/english/schema.ts";
import { americanSpellingsIn } from "./britishSpelling.ts";
import { shuffledOptions } from "./optionOrder.ts";
import { questionErrors } from "./validate.ts";

export type MockQuestionSource = Question & { id: string };
export type MockGroupSource = { instruction: string; passage?: string; questions: readonly MockQuestionSource[] };
export type MockSectionSource = { id: string; title: string; titleVi: string; groups: readonly MockGroupSource[] };
export type MockExamSource = { level: EnglishLevel; minutes: number; passPercent: number; sectionMinPercent: number; sections: readonly MockSectionSource[] };

export const MIN_QUESTIONS_PER_SECTION = 6;
const MAX_PERCENT = 100;

export const mockExamIdOf = (level: EnglishLevel) => `english-${level.toLowerCase()}-mock-exam`;
const questionsOf = (section: MockSectionSource) => section.groups.flatMap(group => group.questions);
const isPercent = (value: number) => Number.isInteger(value) && value > 0 && value <= MAX_PERCENT;

export function mockExamErrors(exam: MockExamSource, path: string): string[] {
  const questions = exam.sections.flatMap(questionsOf);
  const ids = questions.map(question => question.id);
  const sectionIds = exam.sections.map(section => section.id);
  const english = [
    ...exam.sections.flatMap(section => [section.title, ...section.groups.flatMap(group => [group.instruction, group.passage ?? ""])]),
    ...questions.flatMap(question => [question.prompt, question.correct, question.explanation]),
  ];
  const spellings = [...new Set(english.flatMap(americanSpellingsIn))];
  return [
    ...(!Number.isInteger(exam.minutes) || exam.minutes <= 0 ? [`${path}.minutes must be a whole number above 0`] : []),
    ...(!isPercent(exam.passPercent) || !isPercent(exam.sectionMinPercent) ? [`${path}: passPercent and sectionMinPercent must be 1–100`] : []),
    ...(new Set(ids).size !== ids.length ? [`${path} repeats a question id`] : []),
    ...(new Set(sectionIds).size !== sectionIds.length ? [`${path} repeats a section id`] : []),
    ...exam.sections.flatMap((section, index) => questionsOf(section).length < MIN_QUESTIONS_PER_SECTION
      ? [`${path}.sections[${index}] has ${questionsOf(section).length} questions (at least ${MIN_QUESTIONS_PER_SECTION})`] : []),
    ...exam.sections.flatMap((section, index) => section.groups.flatMap((group, at) => group.questions.flatMap((question, number) =>
      questionErrors(question, `${path}.sections[${index}].groups[${at}].questions[${number}]`)))),
    ...(spellings.length ? [`${path} uses American spelling: ${spellings.join(", ")}`] : []),
  ];
}

/** The exam as the site and the server read it, with each question's options shuffled and its answer's index. */
export function buildMockExam(exam: MockExamSource): EnglishMockExam {
  const id = mockExamIdOf(exam.level);
  return {
    id, level: exam.level, title: `${exam.level} Mock Exam`, minutes: exam.minutes, passPercent: exam.passPercent, sectionMinPercent: exam.sectionMinPercent,
    sections: exam.sections.map(section => ({
      id: section.id, title: section.title, titleVi: section.titleVi,
      groups: section.groups.map(group => ({
        instruction: group.instruction, ...(group.passage ? { passage: group.passage } : {}),
        questions: group.questions.map(question => {
          const options = shuffledOptions(question.options, `${id}/${question.id}`);
          return { id: question.id, prompt: question.prompt, options, correctIndex: options.indexOf(question.correct), explanation: question.explanation };
        }),
      })),
    })),
  };
}
