import { useEffect, useRef, useState } from "react";
import type { SpeakingExercise } from "../lib/skillRounds";
import { matchSpeech } from "../lib/speechMatch";
import { speakJapanese } from "../services/japaneseSpeech";
import { recognitionErrorMessage, recognizeJapanese } from "../services/japaneseSpeechRecognition";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
type Attempt = { matched: boolean; heard: string };

/** Shows a phrase to say aloud and checks the learner's speech against it. `canCheck` is false when the browser cannot recognise speech. */
export default function SpeakingExerciseCard({ exercise, isLast, canCheck, onDone }: { exercise: SpeakingExercise; isLast: boolean; canCheck: boolean; onDone: (correct: boolean) => void }) {
  const [listening, setListening] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [error, setError] = useState("");
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => { stop.current?.(); window.speechSynthesis?.cancel(); }, []);

  const listen = () => {
    window.speechSynthesis?.cancel();
    setError(""); setAttempt(null); setListening(true);
    stop.current = recognizeJapanese({
      onResult: alternatives => setAttempt(matchSpeech(exercise.target, alternatives)),
      onError: code => setError(recognitionErrorMessage(code)),
      onEnd: () => { stop.current = null; setListening(false); },
    });
  };

  return <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    {exercise.lead && <div className="mb-5 rounded-xl bg-gray-50 p-4">
      <p className="text-sm font-semibold text-gray-500">{exercise.lead.speaker} says</p>
      <p lang="ja" className="mt-1 text-xl font-semibold text-gray-900">{exercise.lead.japanese}</p>
      <button className={`${button} mt-3 text-sm`} onClick={() => speakJapanese(exercise.lead!.japanese)}>🔊 Hear {exercise.lead.speaker}</button>
    </div>}
    <p className="text-sm font-semibold text-emerald-700">{exercise.lead ? `Answer as ${exercise.speaker}` : "Say this aloud"}</p>
    <p lang="ja" className="mt-2 text-3xl font-black text-gray-900">{exercise.japanese}</p>
    {exercise.romaji && <p className="mt-1 text-gray-500">{exercise.romaji}</p>}
    {exercise.meaning && <p className="mt-1 text-gray-600">{exercise.meaning}</p>}
    <div className="mt-6 flex flex-wrap gap-3">
      <button className={button} onClick={() => speakJapanese(exercise.target)}>🔊 Hear it</button>
      {canCheck && <button className={`${button} border-emerald-300 text-emerald-800`} disabled={listening} onClick={listen}>{listening ? "Listening…" : attempt ? "🎤 Try again" : "🎤 Start speaking"}</button>}
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {attempt && <div role="status" className="mt-5 rounded-xl bg-gray-50 p-4">
      <p className={`text-lg font-bold ${attempt.matched ? "text-emerald-700" : "text-red-700"}`}>{attempt.matched ? "Correct!" : "Not quite — listen again and retry."}</p>
      <p className="mt-1 text-gray-700">We heard: <span lang="ja" className="font-semibold">{attempt.heard || "(nothing)"}</span></p>
    </div>}
    <div className="mt-6 flex flex-wrap gap-3">
      {attempt?.matched
        ? <button className={button} onClick={() => onDone(true)}>{isLast ? "See results →" : "Next →"}</button>
        : <button className={`${button} text-gray-600`} disabled={listening} onClick={() => onDone(false)}>{isLast ? "Skip and see results →" : "Skip →"}</button>}
    </div>
  </section>;
}
