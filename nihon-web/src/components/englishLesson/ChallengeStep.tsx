import type { Question } from "../../../../shared/course/english/schema.ts";
import { GuideNote } from "../cast/GuideNote";
import { QuestionDeck } from "./QuestionDeck";

type ChallengeStepProps = {
  questions: readonly Question[]; answers: Record<number, string>; onAnswer: (index: number, option: string) => void;
  score: number | null; onFinish: () => void;
};

/** The final challenge: answers are marked only when the learner asks for the score, which completes the lesson. */
export function ChallengeStep({ questions, answers, onAnswer, score, onFinish }: ChallengeStepProps) {
  if (score !== null) return <div className="py-6 text-center">
    <h2 className="text-3xl font-black">Lesson Complete!</h2>
    <p className="mt-3 text-lg">Score: <strong>{score}%</strong></p>
    <GuideNote character="hakase" mood="happy" className="mx-auto mt-5 max-w-md text-left"><p>Well done. On to the next lesson when you are ready.</p></GuideNote>
  </div>;
  const isAllAnswered = Object.keys(answers).length === questions.length;
  return <div>
    <h2 className="text-xl font-black sm:text-2xl">Final Challenge <span lang="vi" className="text-base font-semibold text-gray-500">· Thử thách</span></h2>
    <p className="mt-1 text-sm text-gray-600">Use everything from this lesson. Your answers are checked when you ask for your score.</p>
    <div className="mt-3"><QuestionDeck questions={questions} answers={answers} onAnswer={onAnswer} showsFeedback={false} /></div>
    <button type="button" disabled={!isAllAnswered} onClick={onFinish} className="mt-4 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white disabled:bg-gray-300">{isAllAnswered ? "Check my score" : `Answer all ${questions.length} questions`}</button>
  </div>;
}
