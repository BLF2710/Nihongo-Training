import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { recordPractice } from "../../api/activity";
import { EmptyNotice, EnglishStudyFrame, focusRing, UnitChooser } from "../../components/englishStudy/EnglishStudyFrame";
import { EnglishListeningCard } from "../../components/englishStudy/EnglishListeningCard";
import { EnglishSpeakingCard } from "../../components/englishStudy/EnglishSpeakingCard";
import { useActivityTitle } from "../../context/ActivityContext";
import { buildEnglishListeningRound, buildEnglishSpeakingRound, ENGLISH_SKILL_SECTIONS, hasSkillMaterial, skillMaterialOf } from "../../lib/englishSkillRounds";
import type { EnglishSkill, EnglishSkillMaterial, EnglishSkillSection } from "../../lib/englishSkillRounds";
import { supportsEnglishSpeech } from "../../services/englishSpeech";
import { supportsSpeechRecognition } from "../../services/japaneseSpeechRecognition";
import { useCompletedLessonIds } from "./useCompletedLessonIds";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// English listening and speaking (/english/listening, /english/speaking): rounds made from the words, example
// sentences and conversations of the learner's completed lessons, for one unit or the whole level. A finished round
// counts toward the daily streak, like the Japanese practice.

const COPY: Record<EnglishSkill, { title: string; titleVi: string; intro: string }> = {
  listening: { title: "Listening", titleVi: "Nghe", intro: "Hear words, sentences and conversations from your lessons, then choose what you heard." },
  speaking: { title: "Speaking", titleVi: "Nói", intro: "Say words, sentences and replies from your lessons aloud. Your speech is checked in British English." },
};
const SKILLS: readonly EnglishSkill[] = ["listening", "speaking"];
const tab = (isChosen: boolean) => `rounded-xl border px-3 py-1.5 text-sm font-bold ${focusRing} ${isChosen ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-200 bg-white hover:border-emerald-300"}`;

export default function EnglishSkillPage({ skill }: { skill: EnglishSkill }) {
  const { title, titleVi, intro } = COPY[skill];
  useActivityTitle(`English ${title.toLowerCase()}`);
  const { level, units, unitId, lessons, chooseUnit } = useEnglishStudyScope();
  const { completed, error } = useCompletedLessonIds();
  const material = useMemo(() => skillMaterialOf(completed ? lessons.filter(lesson => completed.has(lesson.id)) : []), [completed, lessons]);
  const [section, setSection] = useState<EnglishSkillSection>("vocabulary");
  const [round, setRound] = useState(0);
  const canHear = supportsEnglishSpeech(), canCheck = supportsSpeechRecognition();
  // What a finished round is saved as: the unit practised, or the whole level.
  const scope = unitId === "all" ? `english-${level.toLowerCase()}` : unitId;

  return <EnglishStudyFrame title={title} titleVi={titleVi} level={level} intro={intro}
    controls={<div className="flex flex-wrap items-end gap-3"><SkillSwitch skill={skill} /><UnitChooser units={units} value={unitId} onChange={id => { chooseUnit(id); setRound(value => value + 1); }} /></div>}>
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    {!completed && !error && <p role="status" className="text-gray-500">Loading your lessons…</p>}
    {completed && !hasSkillMaterial(material, "vocabulary") && <EmptyNotice>Complete a lesson {unitId === "all" ? `of ${level}` : "of this unit"} first: its words, sentences and conversations then appear here. <Link to="/lessons" className="font-bold text-emerald-700 underline">Go to lessons →</Link></EmptyNotice>}
    {hasSkillMaterial(material, "vocabulary") && <>
      <div role="group" aria-label="What to practise" className="mb-3 flex flex-wrap gap-2">{ENGLISH_SKILL_SECTIONS.map(({ key, label }) =>
        <button key={key} type="button" aria-pressed={section === key} disabled={!hasSkillMaterial(material, key)} onClick={() => { setSection(key); setRound(value => value + 1); }} className={tab(section === key)}>{label}</button>)}
      </div>
      {!canHear && <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This browser can't read English aloud, so {skill === "listening" ? "listening practice won't work here" : "you can't hear the model pronunciation"}.</p>}
      {skill === "speaking" && !canCheck && <p role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This browser can't recognise speech, so your speaking isn't checked here. Use Chrome or Edge with a microphone to have it checked.</p>}
      <SkillRound key={`${unitId}:${section}:${round}`} skill={skill} material={material} section={section} scope={scope} canCheck={canCheck} onAgain={() => setRound(value => value + 1)} />
    </>}
  </EnglishStudyFrame>;
}

/** Listening or speaking, keeping the unit; one island door (the bell tower) opens both. */
function SkillSwitch({ skill }: { skill: EnglishSkill }) {
  const [params] = useSearchParams();
  const query = params.toString() ? `?${params.toString()}` : "";
  return <nav aria-label="Skill" className="flex gap-1 rounded-xl bg-gray-100 p-1">{SKILLS.map(item =>
    <Link key={item} to={`/english/${item}${query}`} aria-current={item === skill ? "page" : undefined}
      className={`rounded-lg px-3 py-1.5 text-sm font-bold ${focusRing} ${item === skill ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>{COPY[item].title}</Link>)}
  </nav>;
}

type RoundProps = { skill: EnglishSkill; material: EnglishSkillMaterial; section: EnglishSkillSection; scope: string; canCheck: boolean; onAgain: () => void };

/** One round: its exercises are drawn once, when it starts; a new round remounts it with a fresh draw. */
function SkillRound({ skill, material, section, scope, canCheck, onAgain }: RoundProps) {
  const [listening] = useState(() => skill === "listening" ? buildEnglishListeningRound(material, section) : []);
  const [speaking] = useState(() => skill === "speaking" ? buildEnglishSpeakingRound(material, section) : []);
  const [results, setResults] = useState<boolean[]>([]);
  const total = listening.length + speaking.length;
  const correct = results.filter(Boolean).length;
  const isFinished = total > 0 && results.length === total;
  const isReported = useRef(false);
  useEffect(() => {
    if (!isFinished || isReported.current) return;
    isReported.current = true;
    recordPractice(skill, scope, results.length, correct);
  }, [isFinished, skill, scope, results.length, correct]);
  const record = (isCorrect: boolean) => setResults(previous => [...previous, isCorrect]);

  if (isFinished) return <section aria-label="Round results" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h2 className="text-2xl font-black">Round complete</h2>
    <p className="mt-2 text-lg">You got <span className="font-black text-emerald-700">{correct} / {total}</span>.</p>
    <p className="mt-1 text-sm text-gray-500">A finished round counts toward your daily streak.</p>
    <button type="button" onClick={onAgain} className={`mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 ${focusRing}`}>Another round</button>
  </section>;

  const index = results.length, isLast = index === total - 1;
  return <>
    <p className="mb-2 flex justify-between text-sm font-semibold text-gray-600"><span>{index + 1} / {total}</span><span>{correct} correct</span></p>
    {listening[index] && <EnglishListeningCard key={listening[index].id} exercise={listening[index]} isLast={isLast} onDone={record} />}
    {speaking[index] && <EnglishSpeakingCard key={speaking[index].id} exercise={speaking[index]} isLast={isLast} canCheck={canCheck} onDone={record} />}
  </>;
}
