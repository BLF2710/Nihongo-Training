// Mock exam grading, the same rules as the web app's gradeMockExam (nihon-web/src/data/mockExams.ts). Pure functions.

export type MockQuestion = { id: string; prompt: string; options: string[]; correctIndex: number; explanation: string };
export type MockSection = { id: string; title: string; groups: { questions: MockQuestion[] }[] };
export type MockExam = { id: string; level: string; minutes: number; passPercent: number; sectionMinPercent: number; sections: MockSection[] };
/** Question id -> chosen option; questions left blank are simply missing. */
export type MockAnswers = Record<string, number>;
export type SectionResult = { id: string; title: string; correct: number; total: number; percent: number; reached: boolean };
export type MockResult = { correct: number; total: number; percent: number; passed: boolean; sections: SectionResult[] };

export const questionsOf = (section: MockSection) => section.groups.flatMap(group => group.questions);
const percentOf = (correct: number, total: number) => Math.round(correct * 100 / total);

/** Passing needs the overall target and the minimum in every section, like the exam this one prepares for. */
export function gradeMockExam(exam: MockExam, answers: MockAnswers): MockResult {
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

/** The answer sheet when every entry names a question of this exam and one of its options; otherwise null. */
export function parseMockAnswers(exam: MockExam, input: unknown): MockAnswers | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return null;
  const questions = new Map(exam.sections.flatMap(questionsOf).map(question => [question.id, question]));
  const answers: MockAnswers = {};
  for (const [id, choice] of Object.entries(input)) {
    const question = questions.get(id);
    if (!question || typeof choice !== "number" || !Number.isInteger(choice) || choice < 0 || choice >= question.options.length) return null;
    answers[id] = choice;
  }
  return answers;
}
