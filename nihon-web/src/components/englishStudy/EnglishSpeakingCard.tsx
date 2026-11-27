import { useEffect, useRef, useState } from "react";
import { matchEnglishSpeech } from "../../lib/englishSpeechMatch";
import type { EnglishSpeechAttempt } from "../../lib/englishSpeechMatch";
import type { EnglishSpeakingExercise } from "../../lib/englishSkillRounds";
import { recognizeEnglish, speakEnglish } from "../../services/englishSpeech";
import { recognitionErrorMessage } from "../../services/japaneseSpeechRecognition";
import { focusRing } from "./EnglishStudyFrame";

const button = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

/** Shows English to say aloud and checks the learner's speech against it. `canCheck` is false where the browser
 *  can't recognise speech: the learner can still hear it and practise, then move on. */
export function EnglishSpeakingCard({ exercise, isLast, canCheck, onDone }: { exercise: EnglishSpeakingExercise; isLast: boolean; canCheck: boolean; onDone: (isCorrect: boolean) => void }) {
  const [isListening, setIsListening] = useState(false);
  const [attempt, setAttempt] = useState<EnglishSpeechAttempt | null>(null);
  const [error, setError] = useState("");
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => { stop.current?.(); window.speechSynthesis?.cancel(); }, []);

  const listen = () => {
    window.speechSynthesis?.cancel();
    setError(""); setAttempt(null); setIsListening(true);
    stop.current = recognizeEnglish({
      onResult: alternatives => setAttempt(matchEnglishSpeech(exercise.target, alternatives)),
      onError: code => setError(recognitionErrorMessage(code)),
      onEnd: () => { stop.current = null; setIsListening(false); },
    });
  };
  const { lead } = exercise;

  return <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    {lead && <div className="mb-4 rounded-xl bg-gray-50 p-3">
      <p className="text-sm font-semibold text-gray-500">{lead.speaker} says</p>
      <p lang="en-GB" className="mt-1 text-lg font-semibold">{lead.english}</p>
      <button className={`${button} mt-2 text-sm`} onClick={() => speakEnglish(lead.english)}>🔊 Hear {lead.speaker}</button>
    </div>}
    <p className="text-sm font-semibold text-emerald-700">{lead ? `Answer as ${exercise.speaker}` : "Say this aloud"}</p>
    <p lang="en-GB" className="mt-1 text-2xl font-black sm:text-3xl">{exercise.target}</p>
    <p lang="vi" className="mt-1 text-gray-600">{exercise.vietnamese}</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button className={button} onClick={() => speakEnglish(exercise.target)}>🔊 Hear it</button>
      {canCheck && <button className={`${button} border-emerald-300 text-emerald-800`} disabled={isListening} onClick={listen}>{isListening ? "Listening…" : attempt ? "🎤 Try again" : "🎤 Start speaking"}</button>}
    </div>
    {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {attempt && <div role="status" className="mt-3 rounded-xl bg-gray-50 p-3">
      <p className={`font-bold ${attempt.matched ? "text-emerald-700" : "text-red-700"}`}>{attempt.matched ? "Well said!" : "Not quite: listen again and try once more."}</p>
      <p className="mt-1 text-sm text-gray-700">We heard: <span lang="en-GB" className="font-semibold">{attempt.heard || "(nothing)"}</span></p>
    </div>}
    <div className="mt-4">{attempt?.matched
      ? <button className={button} onClick={() => onDone(true)}>{isLast ? "See results →" : "Next →"}</button>
      : <button className={`${button} text-gray-600`} disabled={isListening} onClick={() => onDone(false)}>{isLast ? "Skip and see results →" : "Skip →"}</button>}</div>
  </section>;
}
