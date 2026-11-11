import { useMemo, useState } from "react";
import { submitKanaAnswer } from "../../api/quiz";
import type { DefenceResult } from "../../lib/kanaWilds/battle";
import { bracedDefenceChoices, bracedReadingChoices, defenceChoices, readingChoices } from "../../lib/kanaWilds/choices";
import type { EnemyAttack } from "../../lib/kanaWilds/enemyAttacks";
import type { WildKana } from "../../lib/kanaWilds/gojuon";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { StrokeWord } from "./StrokeKana";
import { strokeTotalOf, useStrokeDrawing } from "./strokeDrawing";
import { choiceButton } from "./styles";

/**
 * Graded by the server, so a kana attack counts toward that kana's progress and the mistake notebook like any kana
 * quiz. If the request fails the battle still goes on, graded here.
 */
async function gradeKana(kana: WildKana, answer: string): Promise<boolean> {
  try {
    const result = await submitKanaAnswer({ type: "hiragana", kanaId: kana.id, answer, submissionId: crypto.randomUUID() });
    return result.correct;
  } catch {
    return answer === kana.romaji;
  }
}

const charactersOf = (attack: EnemyAttack) => [...(attack.kind === "kana" ? attack.kana.kana : attack.word.japanese)];

function choicesFor(attack: EnemyAttack, isBraced: boolean, pool: readonly BattleWord[], random: () => number): string[] {
  if (attack.kind === "kana") return (isBraced ? bracedDefenceChoices : defenceChoices)(attack.kana, random);
  return (isBraced ? bracedReadingChoices : readingChoices)(attack.word, pool, random);
}

type Props = {
  attack: EnemyAttack; isBraced: boolean; pool: readonly BattleWord[]; random: () => number;
  onDefend: (result: DefenceResult) => void; onWordReading: (word: string, isCorrect: boolean) => void;
};

/**
 * The enemy's turn: it attacks with a kana or a word, drawn stroke by stroke. Read it right to block; read it before
 * it is fully drawn for a perfect block. Braced (after a redraw) the choices are two, with no look-alikes.
 */
export function DefencePanel({ attack, isBraced, pool, random, onDefend, onWordReading }: Props) {
  const characters = charactersOf(attack);
  const total = strokeTotalOf(characters);
  const drawn = useStrokeDrawing(total);
  const choices = useMemo(() => choicesFor(attack, isBraced, pool, random), [attack, isBraced, pool, random]);
  const [isGrading, setIsGrading] = useState(false);

  const choose = async (answer: string) => {
    const wasDrawn = drawn >= total;
    setIsGrading(true);
    const isCorrect = attack.kind === "kana" ? await gradeKana(attack.kana, answer) : answer === attack.word.romaji;
    if (attack.kind === "word") onWordReading(attack.word.japanese, isCorrect);
    setIsGrading(false);
    onDefend(!isCorrect ? "missed" : wasDrawn ? "blocked" : "perfect");
  };

  return <div role="group" aria-labelledby="defence-prompt">
    <p id="defence-prompt" className="font-bold">The wild kana attacks! Read it to block.{isBraced && <span className="ml-1 rounded-md bg-sky-100 px-1.5 text-sm text-sky-900">Braced: easier, softer</span>}</p>
    <div className="mt-2 flex items-center gap-3">
      {/* Screen readers get the characters at once: the drawing is a sighted player's clue, not a puzzle for them. */}
      <div role="img" aria-label={characters.join("")} lang="ja" className="kw-attack-card flex h-16 shrink-0 items-center gap-0.5 px-2">
        <StrokeWord characters={characters} drawn={drawn} className="h-12 w-12" />
      </div>
      <p className="text-xs text-gray-600">{drawn < total ? "Answer before it's drawn for a perfect block!" : "Drawn. Read it to block."}</p>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{choices.map(choice =>
      <button key={choice} type="button" disabled={isGrading} className={`${choiceButton} py-2 text-lg`} onClick={() => void choose(choice)}>{choice}</button>)}</div>
  </div>;
}
