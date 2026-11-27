import { recognizeSpeech } from "./japaneseSpeechRecognition";
import type { RecognitionHandlers } from "./japaneseSpeechRecognition";

// Reads English aloud in a British voice (the course is British English), where the browser can, and listens to the
// learner in British English.
const BRITISH = "en-GB";
/** Learners improving their English hear it a little slower than natural speech. */
const LEARNER_RATE = 0.9;

export function supportsEnglishSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Speaks `text`; false when the browser cannot. A British voice is used when one is installed. `onEnd` follows the
 *  last word, so lines can be read one after another; `onError` replaces it if speaking fails. */
export function speakEnglish(text: string, onEnd?: () => void, onError?: () => void): boolean {
  if (!supportsEnglishSpeech()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = BRITISH;
  utterance.rate = LEARNER_RATE;
  const britishVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.replace("_", "-").toLowerCase() === BRITISH.toLowerCase());
  if (britishVoice) utterance.voice = britishVoice;
  if (onEnd) utterance.onend = onEnd;
  // Cancelling (a new line, leaving the page) is not a failure.
  if (onError) utterance.onerror = event => { if (event.error !== "canceled" && event.error !== "interrupted") onError(); };
  window.speechSynthesis.speak(utterance);
  return true;
}

/** Listens for one English utterance, in British English. */
export const recognizeEnglish = (handlers: RecognitionHandlers) => recognizeSpeech(BRITISH, handlers);
