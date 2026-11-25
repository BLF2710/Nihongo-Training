// Reads English aloud in a British voice (the course is British English), where the browser can.
const BRITISH = "en-GB";
/** Learners improving their English hear it a little slower than natural speech. */
const LEARNER_RATE = 0.9;

export function supportsEnglishSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Speaks `text`; false when the browser cannot. A British voice is used when one is installed. */
export function speakEnglish(text: string): boolean {
  if (!supportsEnglishSpeech()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = BRITISH;
  utterance.rate = LEARNER_RATE;
  const britishVoice = window.speechSynthesis.getVoices().find(voice => voice.lang.replace("_", "-").toLowerCase() === BRITISH.toLowerCase());
  if (britishVoice) utterance.voice = britishVoice;
  window.speechSynthesis.speak(utterance);
  return true;
}
