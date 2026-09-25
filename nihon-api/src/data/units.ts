import { LESSONS } from "../services/lesson.service";

export type UnitDefinition = {
  id: string;
  number: number;
  title: string;
  description: string;
  requiredLevel: number;
  lessonIds: string[];
  assessmentId?: string;
  isPlaceholder?: boolean;
  placeholderLessons?: { id: string; title: string; description: string; isPlaceholder: true }[];
  previousUnitId?: string;
};

export const UNITS: UnitDefinition[] = [{
  id: "japanese-n5-unit-1", number: 1, title: "Greetings & Introductions",
  description: "Greetings, introductions, origin, questions, age, and everyday objects.",
  requiredLevel: 1,
  lessonIds: LESSONS.filter(lesson => lesson.unit === "Japanese N5 Unit 1").map(lesson => lesson.id),
  assessmentId: "japanese-n5-unit-1-assessment",
}, {
  id: "japanese-n5-unit-2", number: 2, title: "Everyday Japanese",
  description: "Unit 2 content is currently being prepared.", requiredLevel: 3,
  previousUnitId: "japanese-n5-unit-1", lessonIds: [], isPlaceholder: true,
  placeholderLessons: [{ id: "japanese-n5-unit-2-coming-soon", title: "Coming Soon", description: "Unit 2 content is not implemented yet.", isPlaceholder: true }],
}, {
  id: "japanese-n5-unit-3", number: 3, title: "Building Conversations",
  description: "Unit 3 content is currently being prepared.", requiredLevel: 5,
  previousUnitId: "japanese-n5-unit-2", lessonIds: [], isPlaceholder: true,
  placeholderLessons: [{ id: "japanese-n5-unit-3-coming-soon", title: "Coming Soon", description: "Unit 3 content is not implemented yet.", isPlaceholder: true }],
}];
