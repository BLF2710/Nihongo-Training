import { useSyncExternalStore } from "react";

// Which language the English course explains its grammar in: English first, with Vietnamese a switch away
// (docs/ENGLISH.md). The choice is kept in this browser.
export type ExplanationLanguage = "english" | "vietnamese";

const KEY = "english_explanation_language";
const DEFAULT_LANGUAGE: ExplanationLanguage = "english";
const listeners = new Set<() => void>();

function getExplanationLanguage(): ExplanationLanguage {
  try { return localStorage.getItem(KEY) === "vietnamese" ? "vietnamese" : DEFAULT_LANGUAGE; } catch { return DEFAULT_LANGUAGE; }
}

export function setExplanationLanguage(language: ExplanationLanguage) {
  try { localStorage.setItem(KEY, language); } catch { /* The choice then lasts only until the page is reloaded. */ }
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export const useExplanationLanguage = () => useSyncExternalStore(subscribe, getExplanationLanguage, () => DEFAULT_LANGUAGE);
