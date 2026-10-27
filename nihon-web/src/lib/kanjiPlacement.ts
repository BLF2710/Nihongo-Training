import { introducingLessons, KANJI } from "../data/kanji";
import { JAPANESE_STUDY_UNITS } from "../data/japaneseStudyUnits";
import { levelOfId, unitIdOf } from "./courseLevel";

type Placement = { level: string | null; unit: (typeof JAPANESE_STUDY_UNITS)[number] | undefined };

// A kanji belongs to the level and unit of the first lesson that introduces it.
export const KANJI_PLACEMENT = new Map<string, Placement>(KANJI.map(item => {
  const lessonId = introducingLessons(item.id)[0];
  const unit = JAPANESE_STUDY_UNITS.find(candidate => candidate.id === (lessonId && unitIdOf(lessonId)));
  return [item.id, { level: lessonId ? levelOfId(lessonId) : null, unit }];
}));

/** True when the kanji is in the chosen level ("all" for every level) and unit ("all" for every unit). */
export const isInKanjiScope = (kanjiId: string, level: string, unitId: string) => {
  const placed = KANJI_PLACEMENT.get(kanjiId);
  return (level === "all" || placed?.level === level) && (unitId === "all" || placed?.unit?.id === unitId);
};
