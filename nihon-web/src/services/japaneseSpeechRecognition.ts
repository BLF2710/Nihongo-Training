// Thin wrapper over the browser's Web Speech recognition (available in Chromium-based browsers and Safari).
type RecognitionResultEvent = { resultIndex?: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> };
type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous?: boolean;
  onresult: ((event: RecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; abort(): void; stop?(): void;
};
type RecognitionWindow = { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

const recognitionConstructor = () => {
  if (typeof window === "undefined") return undefined;
  const speech = window as unknown as RecognitionWindow;
  return speech.SpeechRecognition ?? speech.webkitSpeechRecognition;
};

export const supportsSpeechRecognition = () => Boolean(recognitionConstructor());

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "Microphone access is blocked. Allow the microphone for this site, then try again.",
  "service-not-allowed": "Microphone access is blocked. Allow the microphone for this site, then try again.",
  "audio-capture": "No microphone was found. Connect one, then try again.",
  "no-speech": "We did not hear anything. Try again and speak a little louder.",
  "network": "The speech recognition service could not be reached. Check your connection and try again.",
};
export const recognitionErrorMessage = (code: string) => ERROR_MESSAGES[code] ?? "Speech recognition stopped unexpectedly. Please try again.";

/**
 * Listens for one Japanese utterance. `onResult` receives the recogniser's guesses, best first;
 * `onEnd` always fires last. Returns a function that cancels listening.
 */
export function recognizeJapanese(handlers: { onResult: (alternatives: string[]) => void; onError: (code: string) => void; onEnd: () => void }): () => void {
  const Constructor = recognitionConstructor();
  if (!Constructor) { handlers.onError("unsupported"); handlers.onEnd(); return () => undefined; }
  const recognition = new Constructor();
  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;
  recognition.onresult = event => handlers.onResult(Array.from(event.results[0] ?? [], alternative => alternative.transcript));
  // "aborted" is our own cancellation, not a failure the learner needs to hear about.
  recognition.onerror = event => { if (event.error !== "aborted") handlers.onError(event.error); };
  recognition.onend = handlers.onEnd;
  recognition.start();
  return () => recognition.abort();
}

/**
 * Transcribes a longer answer (the speaking test without a pronunciation service): listens until `stop` is called
 * and resolves with everything recognised. Browsers may end a session after a pause, so it is restarted until stopped.
 */
export function transcribeJapanese(onError: (code: string) => void): { stop: () => Promise<string> } {
  const Constructor = recognitionConstructor();
  if (!Constructor) { onError("unsupported"); return { stop: async () => "" }; }
  const parts: string[] = [];
  let stopped = false, finish: ((text: string) => void) | null = null;
  const recognition = new Constructor();
  recognition.lang = "ja-JP";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;
  recognition.onresult = event => {
    for (let index = event.resultIndex ?? 0; index < event.results.length; index++) {
      const transcript = event.results[index]?.[0]?.transcript?.trim();
      if (transcript) parts.push(transcript);
    }
  };
  recognition.onerror = event => { if (event.error !== "aborted" && event.error !== "no-speech") onError(event.error); };
  recognition.onend = () => {
    if (!stopped) { try { recognition.start(); return; } catch { /* could not restart: finish with what was heard */ } }
    finish?.(parts.join(""));
  };
  recognition.start();
  return {
    stop: () => new Promise<string>(resolve => {
      stopped = true; finish = resolve;
      if (recognition.stop) recognition.stop(); else recognition.abort();
    }),
  };
}
