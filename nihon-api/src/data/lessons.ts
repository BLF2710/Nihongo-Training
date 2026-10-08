import { UNIT_2_3_LESSONS } from "./unit23-lessons";

export type LessonDefinition = { id: string; slug: string; title: string; unit: string; previousLessonId?: string; minimumLevel?: number; minimumRank?: string };

const UNIT_1_LESSONS: LessonDefinition[] = [
  { id: "japanese-n5-unit-1-hello", slug: "n5-unit-1-hello", title: "How to Say Hello", unit: "Japanese N5 Unit 1" },
  { id: "japanese-n5-unit-1-introductions", slug: "n5-unit-1-introductions", title: "Introducing Yourself", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-hello", minimumLevel: 2 },
  { id: "japanese-n5-unit-1-origin", slug: "n5-unit-1-origin", title: "Where Are You From?", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-introductions" },
  { id: "japanese-n5-unit-1-questions", slug: "n5-unit-1-questions", title: "Basic Questions", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-origin" },
  { id: "japanese-n5-unit-1-numbers-age", slug: "n5-unit-1-numbers-age", title: "Numbers & Age", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-questions" },
  { id: "japanese-n5-unit-1-demonstratives", slug: "n5-unit-1-demonstratives", title: "This, That & Those", unit: "Japanese N5 Unit 1", previousLessonId: "japanese-n5-unit-1-numbers-age" }
];

export const LESSONS: LessonDefinition[] = [...UNIT_1_LESSONS, ...UNIT_2_3_LESSONS];
