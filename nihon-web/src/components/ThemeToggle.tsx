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

