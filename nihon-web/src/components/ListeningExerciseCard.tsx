import { useEffect, useState } from "react";
import QuizChoices from "./QuizChoices";
import type { ListeningExercise } from "../lib/skillRounds";
import { speakJapanese } from "../services/japaneseSpeech";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";

/** Plays the exercise audio and checks the chosen answer. The text stays hidden until the learner has answered. */
export default function ListeningExerciseCard({ exercise, isLast, onDone }: { exercise: ListeningExercise; isLast: boolean; onDone: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState(false);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  // Dialogue lines are spoken one after another.
  const play = (index = 0) => {
    setAudioError(false);
    if (index >= exercise.audio.length) { setPlaying(false); return; }
    const started = speakJapanese(exercise.audio[index], () => play(index + 1), () => { setPlaying(false); setAudioError(true); });
    setPlaying(started);
    if (!started) setAudioError(true);
  };
  const correct = selected === exercise.answer;

  return <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="flex flex-wrap items-center gap-4">
      <button className={`${button} border-emerald-300 text-emerald-800`} disabled={playing} onClick={() => play()}>{playing ? "Playing…" : "▶ Play audio"}</button>
      <p className="text-sm text-gray-500">Listen as many times as you need, then choose.</p>
    </div>
    {audioError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">Audio could not be played in this browser.</p>}
    <h2 className="mb-4 mt-6 text-xl font-bold text-gray-900">{exercise.question}</h2>
    <div lang={exercise.choicesInJapanese ? "ja" : undefined}><QuizChoices choices={exercise.choices} selected={selected} disabled={selected !== null} onChoose={setSelected} /></div>
    {selected !== null && <div className="mt-6">
      <p role="status" className={`text-lg font-bold ${correct ? "text-emerald-700" : "text-red-700"}`}>{correct ? "Correct!" : "Not quite."}</p>
      {!correct && <p className="mt-1 text-gray-700">Correct answer: <span lang={exercise.choicesInJapanese ? "ja" : undefined} className="font-semibold">{exercise.answer}</span></p>}
      <ul className="mt-3 space-y-1 rounded-xl bg-gray-50 p-4">{exercise.reveal.map(line => <li key={line.japanese}>
        <span lang="ja" className="text-lg font-semibold text-gray-900">{line.japanese}</span>
        {line.romaji && <span className="ml-2 text-sm text-gray-500">{line.romaji}</span>}
        {line.meaning && <span className="ml-2 text-sm text-gray-600">— {line.meaning}</span>}
      </li>)}</ul>
      <button className={`${button} mt-5`} onClick={() => onDone(correct)}>{isLast ? "See results →" : "Next →"}</button>
    </div>}
  </section>;
}
