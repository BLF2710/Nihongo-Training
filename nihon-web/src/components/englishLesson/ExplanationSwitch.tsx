import { setExplanationLanguage, useExplanationLanguage } from "../../lib/explanationLanguage";

/** Switches grammar explanations between English (the default) and Vietnamese. */
export function ExplanationSwitch() {
  const language = useExplanationLanguage();
  const isVietnamese = language === "vietnamese";
  return <button type="button" aria-pressed={isVietnamese} onClick={() => setExplanationLanguage(isVietnamese ? "english" : "vietnamese")}
    className={`rounded-full border px-3 py-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-emerald-600 ${isVietnamese ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-400"}`}>
    <span lang="vi">Tiếng Việt</span>{isVietnamese ? " ✓" : ""}
  </button>;
}
