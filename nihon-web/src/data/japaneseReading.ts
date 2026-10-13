import { N5_LESSONS } from "./japaneseN5Lessons";
import type { ReadingPassage } from "./japaneseN5Lessons";

export type UnitReading = ReadingPassage & { id: string; unitId: string; lessonTitle: string; lessonHref: string };

// Reading passages belong to lessons; this is the same content grouped for the Reading screen.
export const JAPANESE_READINGS: UnitReading[] = N5_LESSONS.flatMap(lesson => lesson.reading ? [{
  ...lesson.reading, id: `${lesson.id}:reading`, unitId: lesson.unitId ?? `japanese-n5-unit-${lesson.unitNumber ?? 1}`,
  lessonTitle: lesson.title, lessonHref: `/lessons/japanese/${lesson.slug}`,
}] : []);

export const readingsForUnit = (unitId: string) => JAPANESE_READINGS.filter(reading => reading.unitId === unitId);
