import { useSyncExternalStore } from "react";

// Light, dark, or follow the device. The choice is a per-browser display preference; index.html applies it
// before the first paint and this module keeps it in step afterwards.
export type ThemePreference = "system" | "light" | "dark";
export const THEME_LABELS: Record<ThemePreference, string> = { system: "System", light: "Light", dark: "Dark" };
const KEY = "theme";
const listeners = new Set<() => void>();
const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "system";
  } catch { return "system"; }
}

/** Whether the dark theme is showing now. */
export const isDarkActive = () => document.documentElement.classList.contains("dark");

function apply() {
  const preference = getThemePreference();
  const dark = preference === "dark" || (preference === "system" && darkQuery().matches);
  document.documentElement.classList.toggle("dark", dark);
  listeners.forEach(listener => listener());
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch { /* the choice then lasts until the page is reloaded */ }
  apply();
}

/** Follows the device setting while "System" is chosen, and changes made in another tab. */
export function watchTheme() {
  const query = darkQuery();
  const onStorage = (event: StorageEvent) => { if (event.key === KEY) apply(); };
  query.addEventListener("change", apply);
  window.addEventListener("storage", onStorage);
  apply();
  return () => { query.removeEventListener("change", apply); window.removeEventListener("storage", onStorage); };
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const useThemePreference = () => useSyncExternalStore(subscribe, getThemePreference, () => "system" as ThemePreference);
export const useDarkActive = () => useSyncExternalStore(subscribe, isDarkActive, () => false);
