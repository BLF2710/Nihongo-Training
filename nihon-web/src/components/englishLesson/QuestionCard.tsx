import type { Question } from "../../../../shared/course/english/schema.ts";

type QuestionCardProps = { question: Question; number: number; chosen: string | undefined; onChoose: (option: string) => void; showsFeedback: boolean };

/** One multiple-choice question. In practice the answer is marked at once; in the challenge only when it is scored. */
export function QuestionCard({ question, number, chosen, onChoose, showsFeedback }: QuestionCardProps) {
  const isRight = chosen === question.correct;
  return <article className="rounded-2xl border p-4">
    <p className="font-bold">{number}. <span lang="en-GB">{question.prompt}</span></p>
    <div role="group" aria-label={`Answers to question ${number}`} className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map(option => {
      const isChosen = chosen === option, isMarkedRight = showsFeedback && isChosen && isRight;
      return <button key={option} type="button" aria-pressed={isChosen} onClick={() => onChoose(option)}
        className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold focus-visible:outline-2 focus-visible:outline-emerald-600 ${isMarkedRight ? "border-emerald-500 bg-emerald-50" : isChosen ? "border-indigo-500 bg-indigo-50" : "border-gray-200 bg-white hover:border-indigo-300"}`}>
        <span lang="en-GB">{option}</span>{isMarkedRight && " ✓"}
      </button>;
    })}</div>
    {showsFeedback && chosen !== undefined && <p role="status" className="mt-2 rounded-xl bg-gray-50 p-3 text-sm text-gray-700">{isRight ? "✓ Correct!" : `Not quite. ${question.explanation}`}</p>}
  </article>;
}
