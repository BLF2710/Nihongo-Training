import { JAPANESE_UNIT_1_REFERENCE } from "./japaneseUnit1Reference";
import type { StudyUnit } from "./japaneseUnit1Reference";
import { UNIT_2_3_LESSONS } from "./japaneseN5Units23";

// Vocabulary and grammar are projected from lesson content, not copied into a second catalog.
export const JAPANESE_STUDY_UNITS: StudyUnit[] = [
  JAPANESE_UNIT_1_REFERENCE,
  ...[
    { number: 2, title: "People, Family, Possession & Daily Preferences" },
    { number: 3, title: "Food, Places, Home & Locations" },
  ].map(({ number, title }) => {
    const id = `japanese-n5-unit-${number}`;
    return {
      id, number, title, course: JAPANESE_UNIT_1_REFERENCE.course,
      lessons: UNIT_2_3_LESSONS.filter(lesson => lesson.unitNumber === number).map(lesson => ({
        id: lesson.id, number: lesson.lessonNumber!, title: lesson.title,
        href: `/lessons/japanese/${lesson.slug}`,
        vocabulary: lesson.vocabulary.map(([japanese, romaji, meaning]) => ({
          id: `${lesson.id}:${japanese}`, unitId: id, lessonId: lesson.id, japanese, romaji, meaning,
        })),
        grammar: (lesson.grammar ?? []).map((point, index) => ({
          ...point, id: `${lesson.id}:grammar-${index + 1}`, unitId: id, lessonId: lesson.id,
        })),
      })),
    };
  }),
];
