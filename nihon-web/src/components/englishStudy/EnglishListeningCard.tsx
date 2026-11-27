import { useEffect, useState } from "react";
import QuizChoices from "../QuizChoices";
import type { EnglishListeningExercise } from "../../lib/englishSkillRounds";
import { speakEnglish } from "../../services/englishSpeech";
import { focusRing } from "./EnglishStudyFrame";

const button = `rounded-xl border border-gray-200 bg-white px-4 py-2 font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

/** Plays the English and checks the chosen answer; the text stays hidden until the learner has answered. */
export function EnglishListeningCard({ exercise, isLast, onDone }: { exercise: EnglishListeningExercise; isLast: boolean; onDone: (isCorrect: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudioFailed, setHasAudioFailed] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // Conversation lines are read one after another.
  const play = (index = 0) => {
    setHasAudioFailed(false);
    if (index >= exercise.audio.length) { setIsPlaying(false); return; }
    const isStarted = speakEnglish(exercise.audio[index], () => play(index + 1), () => { setIsPlaying(false); setHasAudioFailed(true); });
    setIsPlaying(isStarted);
    if (!isStarted) setHasAudioFailed(true);
  };
  const isCorrect = selected === exercise.answer;
  const choiceLanguage = exercise.areChoicesEnglish ? "en-GB" : "vi";

  return <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-center gap-3">
      <button className={`${button} border-emerald-300 text-emerald-800`} disabled={isPlaying} onClick={() => play()}>{isPlaying ? "Playing…" : "▶ Play"}</button>
      <p className="text-sm text-gray-500">Listen as often as you like, then choose.</p>
    </div>
    {hasAudioFailed && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">This browser could not play the audio.</p>}
    <h2 className="mb-3 mt-4 text-lg font-bold">{exercise.question}</h2>
    <div lang={choiceLanguage}><QuizChoices choices={[...exercise.choices]} selected={selected} disabled={selected !== null} onChoose={setSelected} /></div>
    {selected !== null && <div className="mt-4">
      <p role="status" className={`font-bold ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>{isCorrect ? "Correct!" : <>Not quite. The answer is <span lang={choiceLanguage}>{exercise.answer}</span>.</>}</p>
      <ul className="mt-2 space-y-1 rounded-xl bg-gray-50 p-3 text-sm">{exercise.reveal.map(line => <li key={line.english}>
        <span lang="en-GB" className="font-semibold">{line.english}</span> <span lang="vi" className="text-gray-600">— {line.vietnamese}</span>
      </li>)}</ul>
      <button className={`${button} mt-3`} onClick={() => onDone(isCorrect)}>{isLast ? "See results →" : "Next →"}</button>
    </div>}
  </section>;
}
