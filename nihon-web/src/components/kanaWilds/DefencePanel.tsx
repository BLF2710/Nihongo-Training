import { useMemo, useState } from "react";
import { submitKanaAnswer } from "../../api/quiz";
import { defenceChoices } from "../../lib/kanaWilds/choices";
import type { WildKana } from "../../lib/kanaWilds/gojuon";
import { choiceButton } from "./styles";

/**
 * Graded by the server, so a defence counts toward the kana's progress and the mistake notebook like any kana quiz.
 * If the request fails the battle still goes on, graded here.
 */
async function gradeReading(enemy: WildKana, answer: string): Promise<boolean> {
  try {
    const result = await submitKanaAnswer({ type: "hiragana", kanaId: enemy.id, answer, submissionId: crypto.randomUUID() });
    return result.correct;
  } catch {
    return answer === enemy.romaji;
  }
}

/** The enemy's turn: read the wild kana right to block its attack. */
export function DefencePanel({ enemy, random, onDefend }: { enemy: WildKana; random: () => number; onDefend: (isBlocked: boolean) => void }) {
  const choices = useMemo(() => defenceChoices(enemy, random), [enemy, random]);
  const [isGrading, setIsGrading] = useState(false);
  const choose = async (answer: string) => {
    setIsGrading(true);
    const isBlocked = await gradeReading(enemy, answer);
    setIsGrading(false);
    onDefend(isBlocked);
  };
  return <div role="group" aria-labelledby="defence-prompt">
    <p id="defence-prompt" className="font-bold"><span lang="ja">{enemy.kana}</span> attacks! Read it to block.</p>
    <div className="mt-3 grid grid-cols-2 gap-2">{choices.map(choice =>
      <button key={choice} type="button" disabled={isGrading} className={`${choiceButton} text-lg`} onClick={() => void choose(choice)}>{choice}</button>)}</div>
  </div>;
}
