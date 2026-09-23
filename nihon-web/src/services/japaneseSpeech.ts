export function supportsJapaneseSpeech(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function speakJapanese(text: string, onEnd?: () => void, onError?: () => void): boolean {
  if (!supportsJapaneseSpeech()) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.75;
  const japaneseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("ja"));
  if (japaneseVoice) utterance.voice = japaneseVoice;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onError?.();
  window.speechSynthesis.speak(utterance);
  return true;
}
