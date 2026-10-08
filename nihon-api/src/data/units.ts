import { LESSONS } from "./lessons";

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
  id: "japanese-n5-unit-2", number: 2, title: "People, Family, Possession & Daily Preferences",
  description: "Introduce family, say where you live, identify belongings, and describe food preferences and habits.", requiredLevel: 3,
  previousUnitId: "japanese-n5-unit-1",
  lessonIds: LESSONS.filter(lesson => lesson.unit === "Japanese N5 Unit 2").map(lesson => lesson.id),
  assessmentId: "japanese-n5-unit-2-assessment",
}, {
  id: "japanese-n5-unit-3", number: 3, title: "Food, Places, Home & Locations",
  description: "Order food, make choices, describe your home, and locate people and everyday objects.", requiredLevel: 5,
  previousUnitId: "japanese-n5-unit-2",
  lessonIds: LESSONS.filter(lesson => lesson.unit === "Japanese N5 Unit 3").map(lesson => lesson.id),
  assessmentId: "japanese-n5-unit-3-assessment",
}];
