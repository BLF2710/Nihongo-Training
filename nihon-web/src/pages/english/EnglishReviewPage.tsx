import { useState } from "react";
import { Link } from "react-router-dom";
import { recordPractice } from "../../api/activity";
import { apiErrorMessage } from "../../api/errors";
import { checkEnglishReviewAnswer } from "../../api/review";
import type { EnglishReviewGrade, EnglishReviewQuestion } from "../../api/review";
import { QuestionCard } from "../../components/englishLesson/QuestionCard";
import { ALL_UNITS, EmptyNotice, EnglishStudyFrame, focusRing, UnitChooser } from "../../components/englishStudy/EnglishStudyFrame";
import { useActivityTitle } from "../../context/ActivityContext";
import { useEnglishReviewRound } from "./useEnglishReviewRound";
import { useEnglishStudyScope } from "./useEnglishStudyScope";

// The English review (/english/review): a round of questions the server draws from the practice and challenge of the
// learner's completed lessons and the meanings of their words, for one unit or, as a cumulative review, the whole
// level. Each answer is graded by the server, which notes it in the English mistake notebook; a finished round is
// saved as a review session for the English statistics.
const primary = `rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-50 ${focusRing}`;

export default function EnglishReviewPage() {
  useActivityTitle("English review");
  const { level, units, unitId, chooseUnit } = useEnglishStudyScope();
  const [roundNumber, setRoundNumber] = useState(0);
  const scope = unitId === ALL_UNITS ? `english-${level.toLowerCase()}` : unitId;
  const { questions, error } = useEnglishReviewRound(scope, roundNumber);
  const again = () => setRoundNumber(value => value + 1);
  return <EnglishStudyFrame title="Review" titleVi="Ôn tập" level={level} intro={unitId === ALL_UNITS ? `A cumulative review: questions and words from every ${level} lesson you have completed.` : "Questions and words from this unit's completed lessons."}
    controls={<UnitChooser units={units} value={unitId} onChange={id => { chooseUnit(id); again(); }} />}>
    {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
    {!questions && !error && <p role="status" className="text-gray-500">Loading your review…</p>}
    {questions && !questions.length && <EmptyNotice>Complete a lesson {unitId === ALL_UNITS ? `of ${level}` : "of this unit"} first: its practice questions then appear here. <Link to="/lessons" className="font-bold text-emerald-700 underline">Go to lessons →</Link></EmptyNotice>}
    {questions && questions.length > 0 && <ReviewRound key={`${scope}:${roundNumber}`} scope={scope} questions={questions} onAgain={again} />}
  </EnglishStudyFrame>;
}

type ReviewRoundProps = { scope: string; questions: readonly EnglishReviewQuestion[]; onAgain: () => void };
type GradedAnswer = { given: string; grade: EnglishReviewGrade };

/** One round: each answer is sent to the server and marked when its grade comes back. */
function ReviewRound({ scope, questions, onAgain }: ReviewRoundProps) {
  const [graded, setGraded] = useState<Readonly<Record<number, GradedAnswer>>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [position, setPosition] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const question = questions[position];
  const answers = Object.values(graded);
  const correct = answers.filter(answer => answer.grade.correct).length;
  const choose = async (option: string) => {
    if (!question || pending !== null || graded[position]) return;
    setPending(option);
    setError("");
    try {
      const grade = await checkEnglishReviewAnswer(question.id, option);
      setGraded(current => ({ ...current, [position]: { given: option, grade } }));
    } catch (failure) {
      setError(apiErrorMessage(failure, "Your answer could not be checked. Please try again."));
    } finally {
      setPending(null);
    }
  };
  const finish = () => { recordPractice("review", scope, answers.length, correct); setIsFinished(true); };
  if (isFinished) return <section aria-labelledby="round-done" className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
    <h2 id="round-done" className="text-2xl font-black">{correct} / {questions.length} correct</h2>
    <p className="mt-1 text-gray-600">{correct === questions.length ? "Perfect round!" : "Wrong answers are in your mistake notebook, so you can practise them again."}</p>
    <div className="mt-4 flex flex-wrap justify-center gap-3"><button type="button" onClick={onAgain} className={primary}>Another round →</button>
      <Link to="/mistakes" className={`rounded-xl border border-gray-200 bg-white px-5 py-2.5 font-semibold ${focusRing}`}>Mistake notebook</Link></div>
  </section>;
  if (!question) return null;
  const answer = graded[position], isLast = position === questions.length - 1;
  // Until the server's grade arrives the card has no answer to mark, so the chosen option only shows as chosen.
  const card = { prompt: question.prompt, options: question.options, correct: answer?.grade.solution ?? "", explanation: answer?.grade.explanation ?? "" };
  return <section aria-label="Review question" className="mx-auto max-w-3xl">
    <p className="flex justify-between text-sm font-semibold text-gray-600"><span>Question {position + 1} of {questions.length}</span><span>{question.level} Unit {question.unitNumber} · {question.lessonTitle}</span></p>
    <progress aria-label="Round progress" value={position + (answer ? 1 : 0)} max={questions.length} className="mt-1 h-2 w-full accent-emerald-600" />
    <div className="mt-2 rounded-2xl bg-white shadow-sm"><QuestionCard key={question.id} question={card} number={position + 1} chosen={answer?.given ?? pending ?? undefined}
      onChoose={option => { void choose(option); }} showsFeedback={answer !== undefined} /></div>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {answer && !answer.grade.correct && <p className="mt-2 text-sm text-gray-700">Answer: <strong lang="en-GB">{answer.grade.solution}</strong></p>}
    {answer && <div className="mt-3 flex justify-end">{isLast
      ? <button type="button" onClick={finish} className={primary}>See my score →</button>
      : <button type="button" onClick={() => setPosition(position + 1)} className={primary}>Next question →</button>}</div>}
  </section>;
}
