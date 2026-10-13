import { JAPANESE_UNIT_1_REFERENCE } from "./japaneseUnit1Reference";
import type { StudyUnit } from "./japaneseUnit1Reference";
import { IMPORTED_LESSONS, IMPORTED_UNITS } from "./importedCourse";
import { UNIT_2_3_LESSONS } from "./japaneseN5Units23";

// Vocabulary and grammar are projected from lesson content, not copied into a second catalog.
export const JAPANESE_STUDY_UNITS: StudyUnit[] = [
  JAPANESE_UNIT_1_REFERENCE,
  ...[
    { id: "japanese-n5-unit-2", number: 2, title: "People, Family, Possession & Daily Preferences", lessons: UNIT_2_3_LESSONS.filter(lesson => lesson.unitNumber === 2) },
    { id: "japanese-n5-unit-3", number: 3, title: "Food, Places, Home & Locations", lessons: UNIT_2_3_LESSONS.filter(lesson => lesson.unitNumber === 3) },
    ...IMPORTED_UNITS.map(unit => ({ id: unit.id, number: unit.number, title: unit.title, lessons: IMPORTED_LESSONS.filter(lesson => lesson.unitId === unit.id) })),
  ].map(({ id, number, title, lessons }) => {
    return {
      id, number, title, course: JAPANESE_UNIT_1_REFERENCE.course,
      lessons: lessons.map(lesson => ({
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
