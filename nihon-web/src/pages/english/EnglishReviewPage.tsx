import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiErrorMessage } from "../../api/errors";
import { recordLessonAnswers } from "../../api/mistakes";
import { fetchUnits } from "../../api/units";
import { QuestionCard } from "../../components/englishLesson/QuestionCard";
import { EmptyNotice, EnglishStudyFrame, focusRing, UnitChooser } from "../../components/englishStudy/EnglishStudyFrame";
import { useActivityTitle } from "../../context/ActivityContext";
import { pickRandom, studyQuestionsOf } from "../../lib/englishStudy";
import type { StudyQuestion } from "../../lib/englishStudy";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// The English review bank (/english/review): a round of questions drawn from the practice and challenge of the
// learner's completed lessons, for one unit or the whole level. Answers are marked at once, and the round's answers
// go to the mistake notebook like a lesson's challenge.
const QUESTIONS_PER_ROUND = 10;
const primary = `rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focusRing}`;

function useCompletedLessonIds() {
  const [completed, setCompleted] = useState<ReadonlySet<string> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetchUnits(controller.signal).then(units => setCompleted(new Set(units.flatMap(unit => unit.lessons.filter(lesson => lesson.completed).map(lesson => lesson.id)))))
      .catch(failure => { if (!controller.signal.aborted) setError(apiErrorMessage(failure, "Your progress could not be loaded.")); });
    return () => controller.abort();
  }, []);
  return { completed, error };
}

export default function EnglishReviewPage() {
  useActivityTitle("English review");
  const { level, units, unitId, lessons, chooseUnit } = useEnglishStudyScope();
  const { completed, error } = useCompletedLessonIds();
  const bank = useMemo(() => completed ? studyQuestionsOf(lessons.filter(lesson => completed.has(lesson.id))) : [], [completed, lessons]);
  const [round, setRound] = useState(0);
  return <EnglishStudyFrame title="Review" titleVi="Ôn tập" level={level} intro="Mixed questions from the lessons you have completed."
    controls={<UnitChooser units={units} value={unitId} onChange={id => { chooseUnit(id); setRound(value => value + 1); }} />}>
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    {!completed && !error && <p role="status" className="text-gray-500">Loading your lessons…</p>}
    {completed && !bank.length && <EmptyNotice>Complete a lesson {unitId === "all" ? `of ${level}` : "of this unit"} first: its practice questions then appear here. <Link to="/lessons" className="font-bold text-emerald-700 underline">Go to lessons →</Link></EmptyNotice>}
    {bank.length > 0 && <ReviewRound key={`${unitId}:${round}`} bank={bank} onAgain={() => setRound(value => value + 1)} />}
  </EnglishStudyFrame>;
}

/** Sends a finished round to the mistake notebook, one request per lesson. Failure isn't shown: it's only a record. */
function recordRound(questions: readonly StudyQuestion[], answers: Record<number, string>) {
  const byLesson = new Map<string, Parameters<typeof recordLessonAnswers>[1]>();
  questions.forEach((question, index) => {
    const given = answers[index];
    if (given === undefined) return;
    const entry = { prompt: question.prompt, options: [...question.options], answer: question.correct, given, correct: given === question.correct, explanation: question.explanation };
    byLesson.set(question.lessonId, [...(byLesson.get(question.lessonId) ?? []), entry]);
  });
  byLesson.forEach((entries, lessonId) => { void recordLessonAnswers(lessonId, entries).catch(() => { /* see above */ }); });
}

/** One round: its questions are drawn once, when it starts; a new round (or a new unit) remounts it with a fresh draw. */
function ReviewRound({ bank, onAgain }: { bank: readonly StudyQuestion[]; onAgain: () => void }) {
  const [questions] = useState(() => pickRandom(bank, QUESTIONS_PER_ROUND));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [position, setPosition] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const question = questions[position];
  const correct = questions.filter((item, index) => answers[index] === item.correct).length;
  const finish = () => { recordRound(questions, answers); setIsFinished(true); };
  if (isFinished) return <section aria-labelledby="round-done" className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
    <h2 id="round-done" className="text-2xl font-black">{correct} / {questions.length} correct</h2>
    <p className="mt-1 text-gray-600">{correct === questions.length ? "Perfect round!" : "Wrong answers are in your mistake notebook, so you can practise them again."}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-3"><button type="button" onClick={onAgain} className={primary}>Another round →</button>
      <Link to="/mistakes" className={`rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-semibold ${focusRing}`}>Mistake notebook</Link></div>
  </section>;
  if (!question) return null;
  const isAnswered = answers[position] !== undefined, isLast = position === questions.length - 1;
  return <section aria-label="Review question" className="mx-auto max-w-3xl">
    <p className="flex justify-between text-sm font-semibold text-gray-600"><span>Question {position + 1} of {questions.length}</span><span>{question.level} Unit {question.unitNumber} · {question.lessonTitle}</span></p>
    <progress aria-label="Round progress" value={position + (isAnswered ? 1 : 0)} max={questions.length} className="mt-1 h-2 w-full accent-emerald-600" />
    <div className="mt-2 rounded-2xl bg-white shadow-sm"><QuestionCard key={question.id} question={question} number={position + 1} chosen={answers[position]}
      onChoose={option => { if (!isAnswered) setAnswers({ ...answers, [position]: option }); }} showsFeedback /></div>
    {isAnswered && <div className="mt-3 flex justify-end">{isLast
      ? <button type="button" onClick={finish} className={primary}>See my score →</button>
      : <button type="button" onClick={() => setPosition(position + 1)} className={primary}>Next question →</button>}</div>}
  </section>;
}
