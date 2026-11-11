import { JAPANESE_STUDY_UNITS } from "../../data/japaneseStudyUnits";
import { collectBattleWords } from "./words";

/** Every word of the course (all levels) that basic hiragana can spell: the words Kana Wilds can be played with. */
export const COURSE_BATTLE_WORDS = collectBattleWords(
  JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.flatMap(lesson => lesson.vocabulary)),
);
