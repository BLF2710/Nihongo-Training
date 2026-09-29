// Shared with Kana Review: preserve its button layout, selection, focus, and disabled states.
const quizButton = "rounded-xl border border-gray-200 px-5 py-3 font-semibold hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed";
export default function QuizChoices({ choices, selected, disabled, onChoose }: {
  choices: string[]; selected: string | null; disabled: boolean; onChoose: (choice: string) => void;
}) {
  return <div className="grid grid-cols-2 gap-3">{choices.map(choice =>
    <button key={choice} disabled={disabled} onClick={() => onChoose(choice)} className={`${quizButton} ${selected === choice ? "border-emerald-500 bg-emerald-50" : ""}`}>{choice}</button>)}</div>;
}
