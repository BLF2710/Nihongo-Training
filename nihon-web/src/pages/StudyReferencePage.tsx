import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { GrammarCard, VocabularyCard } from "../components/StudyReferenceCards";
import VocabularyFlashcards from "../components/VocabularyFlashcard";
import type { StudyUnit } from "../data/japaneseUnit1Reference";

export default function StudyReferencePage({ kind, unit }: { kind: "vocabulary" | "grammar"; unit: StudyUnit }) {
  const [selectedLesson, setSelectedLesson] = useState("all");
  const [view, setView] = useState<"list" | "flashcards">("list");
  const title = kind === "vocabulary" ? "Vocabulary" : "Grammar";
  const lessons = unit.lessons.filter(lesson => lesson[kind].length > 0);
  const visible = lessons.filter(lesson => selectedLesson === "all" || lesson.id === selectedLesson);
  return <div className="min-h-screen bg-gray-50 flex flex-col">
    <Navbar />
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <Link to="/lessons" className="text-sm font-semibold text-gray-600 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-emerald-600">← Lessons</Link>
      <header className="mt-6 mb-8">
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">🇯🇵 {unit.course}</span>
        <h1 className="mt-3 text-3xl font-black text-gray-900 sm:text-4xl">{title}</h1>
        <p className="mt-2 text-lg font-semibold text-gray-700">Unit {unit.number} {kind}</p>
        <p className="mt-1 text-gray-600">{unit.title} · Revisit the {kind === "vocabulary" ? "words and expressions" : "sentence patterns"} from your lessons.</p>
        <p className="mt-3 text-sm text-gray-500">Browse at any time. Linked lessons keep their usual completion requirements.</p>
      </header>
      {kind === "vocabulary" && <div role="group" aria-label="Vocabulary view" className="mb-4 flex gap-2">
        {(["list", "flashcards"] as const).map(mode => <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${view === mode ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}
        >{mode === "list" ? "List" : "Flashcards"}</button>)}
      </div>}
      <nav aria-label="Filter by lesson" className="mb-8 flex flex-wrap gap-2">
        {[{ id: "all", label: "All" }, ...lessons.map(lesson => ({ id: lesson.id, label: `Lesson ${lesson.number}` }))].map(filter => <button
          key={filter.id} type="button" aria-pressed={selectedLesson === filter.id} onClick={() => setSelectedLesson(filter.id)}
          className={`rounded-xl border px-4 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${selectedLesson === filter.id ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300"}`}
        >{filter.label}</button>)}
      </nav>
      {kind === "vocabulary" && view === "flashcards" ? <VocabularyFlashcards key={`${unit.id}:${selectedLesson}`} lessons={visible} /> : <div className="space-y-10">
        {visible.map(lesson => <section key={lesson.id} aria-labelledby={`heading-${lesson.id}`}>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Unit {unit.number} · Lesson {lesson.number}</p>
            <h2 id={`heading-${lesson.id}`} className="mt-1 text-2xl font-black text-gray-900">{lesson.title}</h2>
          </div>
          {kind === "vocabulary" ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{lesson.vocabulary.map(item => <VocabularyCard key={item.id} item={item} lesson={lesson} />)}</div>
            : <div className="space-y-5">{lesson.grammar.map(point => <GrammarCard key={point.id} point={point} lesson={lesson} />)}</div>}
        </section>)}
      </div>}
    </main>
  </div>;
}
