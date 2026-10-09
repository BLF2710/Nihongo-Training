import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import ListeningExerciseCard from "../components/ListeningExerciseCard";
import SpeakingExerciseCard from "../components/SpeakingExerciseCard";
import { fetchUnits } from "../api/units";
import type { CourseUnit } from "../api/units";
import { getSkillUnit } from "../data/japaneseSkillPractice";
import type { SkillUnit } from "../data/japaneseSkillPractice";
import { buildListeningRound, buildSpeakingRound, SKILL_SECTIONS } from "../lib/skillRounds";
import type { ListeningExercise, Skill, SkillSection, SpeakingExercise } from "../lib/skillRounds";
import { supportsJapaneseSpeech } from "../services/japaneseSpeech";
import { supportsSpeechRecognition } from "../services/japaneseSpeechRecognition";

const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50";
const COPY: Record<Skill, { title: string; intro: string }> = {
  listening: { title: "Listening", intro: "Hear words, sentences, and short dialogues from the units you have reached, then choose what you heard." },
  speaking: { title: "Speaking", intro: "Say words, sentences, and dialogue replies from the units you have reached. Your speech is checked against the phrase." },
};

export default function SkillPracticePage({ skill }: { skill: Skill }) {
  const [params, setParams] = useSearchParams();
  const [units, setUnits] = useState<CourseUnit[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [section, setSection] = useState<SkillSection>("vocabulary");
  const [round, setRound] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(data => { setUnits(data); setError(false); }).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [retry]);

  const { title, intro } = COPY[skill];
  // Only units with practice material are offered; a unit opens here at the same moment its lessons open.
  const course = (units ?? []).filter(unit => !unit.isPlaceholder && getSkillUnit(unit.id));
  const cleared = course.filter(unit => unit.allowed);
  const selected = cleared.find(unit => unit.id === params.get("unit")) ?? cleared[0];
  const material = selected && getSkillUnit(selected.id);
  const audioAvailable = supportsJapaneseSpeech();
  const canCheckSpeech = supportsSpeechRecognition();

  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar /><main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
    <h1 className="mt-6 text-3xl font-black">{title}</h1>
    <p className="mt-2 text-gray-600">{intro}</p>
    {error && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Your units could not be loaded. <button className="ml-2 font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry</button></p>}
    {!units && !error && <p role="status" className="mt-5 text-gray-500">Loading your units…</p>}
    {units && !cleared.length && <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-bold">No unit is open for {title.toLowerCase()} practice yet</h2>
      <p className="mt-2 text-gray-600">A unit appears here as soon as you reach it on the Lessons page, with its own vocabulary, sentences, and dialogues.</p>
      <Link to="/lessons" className="mt-5 inline-block rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Go to lessons →</Link>
    </section>}
    {material && <>
      <label className="mt-6 block max-w-md text-sm font-bold text-gray-700">Choose a unit
        <select value={material.unitId} onChange={event => { setParams({ unit: event.target.value }); setRound(1); }} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 text-gray-900 focus:outline-2 focus:outline-emerald-600">
          {course.map(unit => <option key={unit.id} value={unit.id} disabled={!unit.allowed}>Unit {unit.number}: {unit.title}{unit.allowed ? "" : ` — 🔒 ${unit.reasons.join(" + ")}`}</option>)}
        </select>
      </label>
      <div role="group" aria-label="Practice type" className="my-5 flex flex-wrap gap-3">{SKILL_SECTIONS.map(({ key, label }) =>
        <button key={key} aria-pressed={section === key} onClick={() => { setSection(key); setRound(1); }} className={`rounded-xl border px-4 py-2 font-bold focus-visible:outline-2 focus-visible:outline-emerald-600 ${section === key ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white"}`}>{label}</button>)}
      </div>
      {!audioAvailable && <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This browser cannot play Japanese audio, so {skill === "listening" ? "listening practice is unavailable here" : "model pronunciation cannot be played"}.</p>}
      {skill === "speaking" && !canCheckSpeech && <p role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This browser has no speech recognition, so your speaking cannot be checked here. Use Chrome or Edge on a device with a microphone to have it checked.</p>}
      <PracticeRound key={`${skill}:${material.unitId}:${section}:${round}`} skill={skill} unit={material} section={section} canCheckSpeech={canCheckSpeech} onRestart={() => setRound(value => value + 1)} />
    </>}
  </main></div>;
}

function PracticeRound({ skill, unit, section, canCheckSpeech, onRestart }: { skill: Skill; unit: SkillUnit; section: SkillSection; canCheckSpeech: boolean; onRestart: () => void }) {
  // Built once per round so the questions and their choice order stay put while answering.
  const [exercises] = useState<(ListeningExercise | SpeakingExercise)[]>(() => skill === "listening" ? buildListeningRound(unit, section) : buildSpeakingRound(unit, section));
  const [results, setResults] = useState<boolean[]>([]);
  const index = results.length;
  const exercise = exercises[index];
  const record = (correct: boolean) => setResults(previous => [...previous, correct]);
  const correct = results.filter(Boolean).length;

  if (!exercises.length) return <p className="rounded-xl bg-white p-6 text-gray-600">This unit has no {section} practice yet.</p>;
  if (!exercise) return <section aria-label="Round results" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="text-2xl font-bold">Round complete</h2>
    <p className="mt-3 text-lg">You got <span className="font-black text-emerald-700">{correct} / {exercises.length}</span> correct.</p>
    <p className="mt-1 text-sm text-gray-500">Practice rounds are for training: they do not change your XP or statistics.</p>
    <button className={`${button} mt-5`} onClick={onRestart}>Practice again</button>
  </section>;

  const isLast = index === exercises.length - 1;
  return <>
    <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-600"><span>Question {index + 1} / {exercises.length}</span><span>{correct} correct</span></div>
    {skill === "listening"
      ? <ListeningExerciseCard key={exercise.id} exercise={exercise as ListeningExercise} isLast={isLast} onDone={record} />
      : <SpeakingExerciseCard key={exercise.id} exercise={exercise as SpeakingExercise} isLast={isLast} canCheck={canCheckSpeech} onDone={record} />}
  </>;
}
