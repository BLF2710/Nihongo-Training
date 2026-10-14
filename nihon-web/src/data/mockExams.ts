import exams from "../../../shared/course/mock-exams.json";
import type { CourseUnit } from "../api/units";
import type { CourseLevel } from "../lib/courseLevel";

// End-of-level practice exams, written by docs/curriculum/<level>/sources/mock-exam.cjs.
export type MockQuestion = { id: string; prompt: string; options: string[]; correctIndex: number; explanation: string };
export type MockGroup = { instruction: string; passage?: string; questions: MockQuestion[] };
export type MockSection = { id: string; title: string; titleJp: string; groups: MockGroup[] };
export type MockExam = { id: string; level: string; title: string; minutes: number; passPercent: number; sectionMinPercent: number; sections: MockSection[] };

export const getMockExam = (level: CourseLevel) => (exams as Partial<Record<CourseLevel, MockExam>>)[level];
/** True once every unit of the level has been reached, which is when its mock exam opens. */
export const levelReached = (units: CourseUnit[]) => units.length > 0 && units.every(unit => unit.allowed);
export const questionsOf = (section: MockSection) => section.groups.flatMap(group => group.questions);

/** Questions are numbered straight through the exam: question id -> number. */
export const questionNumbers = (exam: MockExam) => new Map(exam.sections.flatMap(questionsOf).map((question, index) => [question.id, index + 1]));

export type MockResult = {
  correct: number; total: number; percent: number; passed: boolean;
  sections: { id: string; title: string; correct: number; total: number; percent: number; reached: boolean }[];
};

/** Passing needs the overall target and the minimum in every section, like the exam this one prepares for. */
export function gradeMockExam(exam: MockExam, answers: Record<string, number>): MockResult {
  const percentOf = (correct: number, total: number) => Math.round(correct * 100 / total);
  const sections = exam.sections.map(section => {
    const questions = questionsOf(section);
    const correct = questions.filter(question => answers[question.id] === question.correctIndex).length;
    const percent = percentOf(correct, questions.length);
    return { id: section.id, title: section.title, correct, total: questions.length, percent, reached: percent >= exam.sectionMinPercent };
  });
  const correct = sections.reduce((sum, section) => sum + section.correct, 0);
  const total = sections.reduce((sum, section) => sum + section.total, 0);
  const percent = percentOf(correct, total);
  return { correct, total, percent, sections, passed: percent >= exam.passPercent && sections.every(section => section.reached) };
}
