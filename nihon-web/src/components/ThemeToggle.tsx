import { THEME_LABELS, setThemePreference, useDarkActive, useThemePreference } from "../lib/theme";
import type { ThemePreference } from "../lib/theme";

const ORDER: ThemePreference[] = ["system", "light", "dark"];
const ICONS: Record<ThemePreference, string> = { system: "🖥️", light: "☀️", dark: "🌙" };

/** A compact button that cycles System → Light → Dark. */
export function ThemeButton({ className = "" }: { className?: string }) {
  const preference = useThemePreference();
  const dark = useDarkActive();
  const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
  return <button type="button" onClick={() => setThemePreference(next)} title={`Theme: ${THEME_LABELS[preference]}`}
    aria-label={`Theme: ${THEME_LABELS[preference]}${preference === "system" ? ` (${dark ? "dark" : "light"})` : ""}. Switch to ${THEME_LABELS[next]}`}
    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-lg hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 ${className}`}>
    <span aria-hidden="true">{ICONS[preference]}</span>
  </button>;
}

/** All three choices side by side, for menus and settings. */
export function ThemeChoice() {
  const preference = useThemePreference();
  return <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
    {ORDER.map(option => <button key={option} type="button" role="radio" aria-checked={preference === option} onClick={() => setThemePreference(option)}
      className={`rounded-lg px-2 py-1.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-emerald-600 ${preference === option ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
      <span aria-hidden="true">{ICONS[option]} </span>{THEME_LABELS[option]}
    </button>)}
  </div>;
}
