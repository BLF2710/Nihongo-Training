import { useState } from "react";
import type { StudyLesson, VocabularyItem } from "../data/japaneseUnit1Reference";
import { speakJapanese, supportsJapaneseSpeech } from "../services/japaneseSpeech";

const controlClass = "rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 hover:border-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-40";

export function VocabularyFlashcard({ item, lesson }: { item: VocabularyItem; lesson: StudyLesson }) {
  const [flipped, setFlipped] = useState(false);
  const [speechStatus, setSpeechStatus] = useState("");
  const speechAvailable = supportsJapaneseSpeech();

  function listen() {
    const started = speakJapanese(item.audioText ?? item.japanese,
      () => setSpeechStatus("Pronunciation finished."),
      () => setSpeechStatus("Japanese speech could not be played on this device."));
    setSpeechStatus(started ? "Playing pronunciation…" : "Speech is not available in this browser.");
  }

  return <div>
    <button
      type="button" onClick={() => setFlipped(value => !value)} aria-pressed={flipped}
      aria-label={`${flipped ? "Hide" : "Reveal"} meaning of ${item.japanese}`}
      className={`flex min-h-80 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border p-6 text-center shadow-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 sm:min-h-96 sm:p-10 ${flipped ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"}`}
    >
      <span className="text-xs font-bold text-emerald-700">Lesson {lesson.number} · {lesson.title}</span>
      <span lang="ja" className="mt-6 w-full text-3xl font-bold leading-relaxed text-gray-900 wrap-anywhere sm:text-5xl">{item.japanese}</span>
      <span className="mt-3 font-mono text-base text-indigo-700 wrap-anywhere">{item.romaji}</span>
      {flipped && <span className="mt-6 text-xl font-semibold text-gray-800" aria-live="polite">{item.meaning}</span>}
      <span className="mt-8 text-sm text-gray-500">{flipped ? "Click to hide" : "Click to reveal"}</span>
    </button>
    <div className="mt-4 text-center">
      <button type="button" onClick={listen} disabled={!speechAvailable} aria-label={`Listen to ${item.japanese}`} className={`${controlClass} text-emerald-800`}>🔊 Listen</button>
      <p role="status" className="mt-2 min-h-5 text-xs text-gray-500">{speechAvailable ? speechStatus : "Speech is not available in this browser."}</p>
    </div>
  </div>;
}

export default function VocabularyFlashcards({ lessons }: { lessons: StudyLesson[] }) {
  // Keep references to the existing items; only this session's order changes.
  const [deck, setDeck] = useState(() => lessons.flatMap(lesson => lesson.vocabulary.map(item => ({ item, lesson }))));
  const [index, setIndex] = useState(0);
  const [shuffleVersion, setShuffleVersion] = useState(0);

  function shuffle() {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
    setIndex(0);
    setShuffleVersion(version => version + 1);
  }

  const current = deck[index];
  if (!current) return <p className="text-gray-600">No vocabulary is available for this selection.</p>;

  return <section aria-label="Vocabulary flashcards" className="mx-auto w-full max-w-2xl">
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="text-sm text-gray-500">Reveal the meaning when you are ready.</p>
      <button type="button" onClick={shuffle} className={controlClass}>Shuffle</button>
    </div>
    <VocabularyFlashcard key={`${shuffleVersion}:${current.item.id}`} item={current.item} lesson={current.lesson} />
    <nav aria-label="Flashcard navigation" className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
      <button type="button" disabled={index === 0} onClick={() => setIndex(value => Math.max(0, value - 1))} className={controlClass}>← Previous</button>
      <p role="status" aria-label={`Card ${index + 1} of ${deck.length}`} className="text-center text-sm font-bold text-gray-600">{index + 1} / {deck.length}</p>
      <button type="button" disabled={index === deck.length - 1} onClick={() => setIndex(value => Math.min(deck.length - 1, value + 1))} className={controlClass}>Next →</button>
    </nav>
  </section>;
}
