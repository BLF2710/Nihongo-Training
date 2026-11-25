import { useSyncExternalStore } from "react";
import type { EnglishLevel } from "../../../shared/course/english/schema.ts";

// The course level a learner is currently browsing. It is a viewing preference kept in this browser, one per course
// language: it filters what the Lessons and Kanji pages show and never changes saved progress. COURSE_LEVELS are the
// Japanese course's (JLPT); ENGLISH_COURSE_LEVELS the English course's (CEFR, docs/ENGLISH.md).
export const COURSE_LEVELS = [
  { id: "N5", title: "Start Here", blurb: "Learn hiragana and katakana with games. Your first words and kanji.", action: "Start N5" },
  { id: "N4", title: "Build Basics", blurb: "Continue with foundational grammar, kanji and everyday expressions.", action: "Practice N4" },
  { id: "N3", title: "Get Comfortable", blurb: "Practise longer sentences, intermediate grammar and everyday reading.", action: "Level up" },
  { id: "N2", title: "Go Advanced", blurb: "Work with more complex grammar, kanji and formal written material.", action: "Push to N2" },
  { id: "N1", title: "Study Advanced Material", blurb: "Practise advanced vocabulary, grammar and demanding reading passages.", action: "Explore N1" },
] as const;
export type CourseLevel = typeof COURSE_LEVELS[number]["id"];

export const ENGLISH_COURSE_LEVELS = [
  { id: "A2", title: "Refresh the Basics", blurb: "Make everyday English accurate: tenses, -s endings, articles and the British forms.", action: "Start A2" },
  { id: "B1", title: "Get Confident", blurb: "Hold longer conversations, tell stories and explain your opinions clearly.", action: "Practise B1" },
  { id: "B2", title: "Speak Naturally", blurb: "Use phrasal verbs, collocations and the right register for work and study.", action: "Push to B2" },
  { id: "C1", title: "Master the Details", blurb: "Read and write demanding texts and express fine shades of meaning.", action: "Explore C1" },
] as const satisfies readonly { id: EnglishLevel; title: string; blurb: string; action: string }[];
export type EnglishCourseLevel = typeof ENGLISH_COURSE_LEVELS[number]["id"];
/** A level of either course. */
export type StudyLevel = CourseLevel | EnglishCourseLevel;
export type StudyLevelInfo = { id: StudyLevel; title: string; blurb: string; action: string };

/** The course languages with levels. Any other language has no course yet. */
export type CourseLanguage = "japanese" | "english";
export const isCourseLanguage = (language: string): language is CourseLanguage => language === "japanese" || language === "english";

const KEY = "course_level";
const DEFAULT_LEVEL: CourseLevel = "N5";
const listeners = new Set<() => void>();
export const isCourseLevel = (value: unknown): value is CourseLevel => COURSE_LEVELS.some(level => level.id === value);

export function getCourseLevel(): CourseLevel {
  try {
    const saved = localStorage.getItem(KEY);
    return isCourseLevel(saved) ? saved : DEFAULT_LEVEL;
  } catch { return DEFAULT_LEVEL; }
}

export function setCourseLevel(level: CourseLevel) {
  try { localStorage.setItem(KEY, level); } catch { /* The choice then lasts only until the page is reloaded. */ }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => { listeners.delete(listener); window.removeEventListener("storage", listener); };
}

export const useCourseLevel = () => useSyncExternalStore(subscribe, getCourseLevel, () => DEFAULT_LEVEL);

/** Unit and lesson ids carry their level: `japanese-n5-unit-4`, `japanese-n4-unit-1-…`. */
export function levelOfId(id: string): CourseLevel | null {
  const level = /^japanese-(n[1-5])-unit-/.exec(id)?.[1].toUpperCase();
  return isCourseLevel(level) ? level : null;
}

/** `japanese-n5-unit-4-telling-time` → `japanese-n5-unit-4`. */
export const unitIdOf = (id: string) => /^japanese-n[1-5]-unit-\d+/.exec(id)?.[0] ?? null;

/** The level a page shows: a unit named in the address decides it, so links to a unit always open it. */
export function useShownLevel(unitIdInAddress?: string | null): CourseLevel {
  const chosen = useCourseLevel();
  return (unitIdInAddress && levelOfId(unitIdInAddress)) || chosen;
}

/** Keeps the items (units, lessons) that belong to one level. */
export const inLevel = (level: CourseLevel) => (item: { id: string }) => levelOfId(item.id) === level;

/** "N4 Unit 1": unit numbers restart at each level, so a label outside a level-filtered page names both. */
export const unitLabel = (unit: { id: string; number: number }) => `${levelOfId(unit.id) ?? ""} Unit ${unit.number}`.trim();

// ---- The English course: its own saved level, so switching course language keeps each choice.
const ENGLISH_KEY = "course_level_english";
const DEFAULT_ENGLISH_LEVEL: EnglishCourseLevel = "A2";
export const isEnglishCourseLevel = (value: unknown): value is EnglishCourseLevel => ENGLISH_COURSE_LEVELS.some(level => level.id === value);

export function getEnglishCourseLevel(): EnglishCourseLevel {
  try {
    const saved = localStorage.getItem(ENGLISH_KEY);
    return isEnglishCourseLevel(saved) ? saved : DEFAULT_ENGLISH_LEVEL;
  } catch { return DEFAULT_ENGLISH_LEVEL; }
}

export function setEnglishCourseLevel(level: EnglishCourseLevel) {
  try { localStorage.setItem(ENGLISH_KEY, level); } catch { /* The choice then lasts only until the page is reloaded. */ }
  listeners.forEach(listener => listener());
}

export const useEnglishCourseLevel = () => useSyncExternalStore(subscribe, getEnglishCourseLevel, () => DEFAULT_ENGLISH_LEVEL);

/** English ids carry their level too: `english-a2-unit-1-introductions`. */
export function englishLevelOfId(id: string): EnglishCourseLevel | null {
  const level = /^english-(a2|b1|b2|c1)-unit-/.exec(id)?.[1].toUpperCase();
  return isEnglishCourseLevel(level) ? level : null;
}

/** The level of a unit or lesson of either course. */
export const studyLevelOfId = (id: string): StudyLevel | null => levelOfId(id) ?? englishLevelOfId(id);

/** The levels of a course language, in order. */
export const levelsOf = (language: CourseLanguage): readonly StudyLevelInfo[] => language === "english" ? ENGLISH_COURSE_LEVELS : COURSE_LEVELS;

/** The level being browsed in a course language. */
export function useStudyLevel(language: CourseLanguage): StudyLevel {
  const japanese = useCourseLevel(), english = useEnglishCourseLevel();
  return language === "english" ? english : japanese;
}

/** Chooses the level to browse in its own course. */
export function setStudyLevel(level: StudyLevel) {
  if (isEnglishCourseLevel(level)) setEnglishCourseLevel(level);
  else setCourseLevel(level);
}
