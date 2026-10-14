import { useSyncExternalStore } from "react";

// The course level a learner is currently browsing. It is a viewing preference kept in this browser:
// it filters what the Lessons and Kanji pages show and never changes saved progress.
export const COURSE_LEVELS = [
  { id: "N5", title: "Start Here", blurb: "Learn hiragana and katakana with games. Your first words and kanji.", action: "Start N5" },
  { id: "N4", title: "Build Basics", blurb: "Continue with foundational grammar, kanji and everyday expressions.", action: "Practice N4" },
  { id: "N3", title: "Get Comfortable", blurb: "Practise longer sentences, intermediate grammar and everyday reading.", action: "Level up" },
  { id: "N2", title: "Go Advanced", blurb: "Work with more complex grammar, kanji and formal written material.", action: "Push to N2" },
  { id: "N1", title: "Study Advanced Material", blurb: "Practise advanced vocabulary, grammar and demanding reading passages.", action: "Explore N1" },
] as const;
export type CourseLevel = typeof COURSE_LEVELS[number]["id"];

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
