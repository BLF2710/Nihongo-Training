import { useState } from "react";
import type { Question } from "../../../../shared/course/english/schema.ts";
import { QuestionCard } from "./QuestionCard";

type QuestionDeckProps = {
  questions: readonly Question[]; answers: Record<number, string>; onAnswer: (index: number, option: string) => void; showsFeedback: boolean;
};

/** A set of questions shown one at a time, with a numbered button for each (marked once answered), so the set fits
 *  on one screen. */
export function QuestionDeck({ questions, answers, onAnswer, showsFeedback }: QuestionDeckProps) {
  const [shownIndex, setShownIndex] = useState(0);
  const shown = questions[shownIndex];
  const isLast = shownIndex === questions.length - 1;
  return <div>
    <ol aria-label="Questions" className="flex flex-wrap gap-2">{questions.map((question, index) => {
      const isAnswered = answers[index] !== undefined;
      return <li key={question.prompt}><button type="button" aria-current={index === shownIndex ? "step" : undefined} onClick={() => setShownIndex(index)}
        aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ""}`}
        className={`h-9 w-9 rounded-full border text-sm font-bold focus-visible:outline-2 focus-visible:outline-emerald-600 ${index === shownIndex ? "border-indigo-600 bg-indigo-600 text-white" : isAnswered ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-gray-200 bg-white text-gray-700"}`}>
        {isAnswered && index !== shownIndex ? "✓" : index + 1}
      </button></li>;
    })}</ol>
    {shown && <div className="mt-3"><QuestionCard question={shown} number={shownIndex + 1} chosen={answers[shownIndex]}
      onChoose={option => onAnswer(shownIndex, option)} showsFeedback={showsFeedback} /></div>}
    {!isLast && answers[shownIndex] !== undefined && <button type="button" onClick={() => setShownIndex(shownIndex + 1)}
      className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-800 hover:bg-indigo-100">Next question →</button>}
  </div>;
}
