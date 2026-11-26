import { useState } from "react";
import type { EnglishWord } from "../../../../shared/course/english/schema.ts";
import { SpeakButton } from "./SpeakButton";

/** One word in full: its British pronunciation, its meaning in Vietnamese, a short English definition and an example. */
export function WordDetail({ word }: { word: EnglishWord }) {
  return <article aria-live="polite" className="rounded-2xl border p-3 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 lang="en-GB" className="text-xl font-black sm:text-2xl">{word.word}</h3>
        <p className="mt-0.5 text-sm"><span className="font-mono text-indigo-700">{word.ipa}</span> <span className="italic text-gray-500">· {word.partOfSpeech}</span></p>
      </div>
      <SpeakButton text={word.word} label={`Hear “${word.word}”`} />
    </div>
    <p lang="vi" className="mt-1.5 font-bold text-emerald-800 sm:mt-3 sm:text-lg">{word.vietnamese}</p>
    <p lang="en-GB" className="mt-1 text-sm text-gray-700 sm:text-base">{word.definition}</p>
    <div className="mt-2 flex items-start justify-between gap-3 rounded-xl bg-emerald-50 p-2 sm:mt-4 sm:p-3">
      <p><span lang="en-GB" className="font-semibold italic text-gray-900">“{word.example.english}”</span> <span lang="vi" className="mt-1 block text-sm text-gray-600">{word.example.vietnamese}</span></p>
      <SpeakButton text={word.example.english} label="Hear the example" />
    </div>
  </article>;
}

/** The lesson's words: a list with each word's Vietnamese meaning, and the chosen word in full beside it, so any
 *  number of words fits on one screen. */
export function VocabularyStep({ words }: { words: readonly EnglishWord[] }) {
  const [chosenIndex, setChosenIndex] = useState(0);
  const chosen = words[chosenIndex] ?? words[0];
  return <div>
    <h2 className="sr-only text-xl font-black sm:not-sr-only sm:text-2xl">Useful words <span lang="vi" className="text-base font-semibold text-gray-500">· Từ vựng</span></h2>
    <div className="grid gap-2 sm:mt-3 sm:gap-3 md:grid-cols-2 md:gap-4">
      <ul aria-label="Words in this lesson" className="grid grid-cols-2 content-start gap-1.5">{words.map((word, index) => <li key={word.word}>
        <button type="button" aria-pressed={index === chosenIndex} onClick={() => setChosenIndex(index)}
          className={`w-full rounded-lg border px-2.5 py-1 text-left sm:px-3 sm:py-1.5 focus-visible:outline-2 focus-visible:outline-emerald-600 ${index === chosenIndex ? "border-emerald-500 bg-emerald-50" : "border-gray-200 bg-white hover:border-emerald-300"}`}>
          <span lang="en-GB" className="block truncate text-sm font-bold">{word.word}</span>
          <span lang="vi" className="block truncate text-xs text-gray-600">{word.vietnamese}</span>
        </button>
      </li>)}</ul>
      {chosen && <WordDetail word={chosen} />}
    </div>
  </div>;
}
