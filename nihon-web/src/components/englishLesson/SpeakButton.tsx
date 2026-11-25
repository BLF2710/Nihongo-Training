import { speakEnglish, supportsEnglishSpeech } from "../../services/englishSpeech";

/** Reads `text` aloud in a British voice; hidden where the browser cannot speak. */
export function SpeakButton({ text, label }: { text: string; label: string }) {
  if (!supportsEnglishSpeech()) return null;
  return <button type="button" onClick={() => speakEnglish(text)} aria-label={label} title={label}
    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-sm hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-emerald-600">
    <span aria-hidden="true">🔊</span>
  </button>;
}
