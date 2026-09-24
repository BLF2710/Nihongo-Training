import { useState } from "react";
import { Link } from "react-router-dom";
import type { GrammarPoint, StudyLesson, VocabularyItem } from "../data/japaneseUnit1Reference";
import { speakJapanese, supportsJapaneseSpeech } from "../services/japaneseSpeech";

function LessonReference({ lesson }: { lesson: StudyLesson }) {
  return <Link to={lesson.href} className="text-xs font-semibold text-emerald-700 hover:underline focus-visible:outline-2 focus-visible:outline-emerald-600">
    Lesson {lesson.number} · {lesson.title} →
  </Link>;
}

export function VocabularyCard({ item, lesson }: { item: VocabularyItem; lesson: StudyLesson }) {
  const [speechStatus, setSpeechStatus] = useState("");
  const speechAvailable = supportsJapaneseSpeech();
  function listen() {
    const started = speakJapanese(item.audioText ?? item.japanese,
      () => setSpeechStatus("Pronunciation finished."),
      () => setSpeechStatus("Japanese speech could not be played on this device."));
    setSpeechStatus(started ? "Playing pronunciation…" : "Speech is not available in this browser.");
  }
  return <article className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    <LessonReference lesson={lesson} />
    <h3 lang="ja" className="mt-4 text-2xl font-bold leading-relaxed text-gray-900 wrap-anywhere">{item.japanese}</h3>
    <p className="mt-1 font-mono text-sm text-indigo-700 wrap-anywhere">{item.romaji}</p>
    <p className="mt-3 font-semibold text-gray-700">{item.meaning}</p>
    {item.note && <p className="mt-3 text-sm leading-6 text-gray-500">{item.note}</p>}
    <div className="mt-auto pt-5">
      <button type="button" onClick={listen} disabled={!speechAvailable} aria-label={`Listen to ${item.japanese}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 enabled:hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">🔊 Listen</button>
      {!speechAvailable && <p className="mt-2 text-xs text-gray-500">Speech is not available in this browser.</p>}
      <p role="status" className="mt-2 text-xs text-gray-500">{speechStatus}</p>
    </div>
  </article>;
}

export function GrammarCard({ point, lesson }: { point: GrammarPoint; lesson: StudyLesson }) {
  return <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <LessonReference lesson={lesson} />
    <h3 className="mt-3 text-xl font-bold text-gray-900 sm:text-2xl">{point.title}</h3>
    <div className="mt-5 rounded-2xl bg-emerald-50 p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Pattern</p>
      <p className="mt-2 text-xl font-semibold leading-relaxed text-gray-900 wrap-anywhere">{point.pattern}</p>
    </div>
    <p className="mt-5 leading-7 text-gray-600">{point.explanation}</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      {point.examples.map(example => <div key={example.japanese} className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4">
        <p lang="ja" className="text-xl font-bold leading-relaxed text-gray-900 wrap-anywhere">{example.japanese}</p>
        <p className="mt-2 font-mono text-sm text-indigo-700">{example.romaji}</p>
        <p className="mt-2 text-sm text-gray-600">{example.meaning}</p>
      </div>)}
    </div>
    {point.notes && <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-600">{point.notes.map(note => <li key={note}>{note}</li>)}</ul>}
  </article>;
}
