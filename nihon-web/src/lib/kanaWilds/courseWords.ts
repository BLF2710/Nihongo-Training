import { JAPANESE_STUDY_UNITS } from "../../data/japaneseStudyUnits";
import { isTileKana } from "./gojuon";
import { collectBattleWords } from "./words";

const COURSE_VOCABULARY = JAPANESE_STUDY_UNITS.flatMap(unit => unit.lessons.flatMap(lesson => lesson.vocabulary));

/** Every word of the course (all levels) that basic hiragana can spell: what wild kana attack with, and their pool. */
export const COURSE_BATTLE_WORDS = collectBattleWords(COURSE_VOCABULARY);

/** Every word of the course that tiles can spell once kana evolve: basic and voiced hiragana. */
export const EVERY_TILE_WORD = collectBattleWords(COURSE_VOCABULARY, isTileKana);
