import { useMemo, useState } from "react";
import { previewAttack } from "../../lib/kanaWilds/battle";
import type { BattleState } from "../../lib/kanaWilds/battle";
import { meaningChoices, readingChoices } from "../../lib/kanaWilds/choices";
import { vowelOfWord } from "../../lib/kanaWilds/vowelCircle";
import type { Matchup } from "../../lib/kanaWilds/vowelCircle";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { choiceButton, focusRing, secondaryButton } from "./styles";

export type WordPlay = { word: BattleWord; isReadingCorrect: boolean; isMeaningCorrect: boolean };
type Step = { kind: "pick" } | { kind: "reading"; word: BattleWord; choices: string[] } | { kind: "meaning"; word: BattleWord; choices: string[] };

const MATCHUP_BADGE: Readonly<Record<Matchup, { label: string; className: string }>> = {
  strong: { label: "▲ strong", className: "bg-emerald-100 text-emerald-900" },
  neutral: { label: "", className: "" },
  weak: { label: "▼ weak", className: "bg-amber-100 text-amber-900" },
};

type Props = {
  state: BattleState; hand: readonly BattleWord[]; pool: readonly BattleWord[]; random: () => number;
  onPlay: (play: WordPlay) => void; onRedraw: () => void;
};

/**
 * The attack turn: pick a word from the hand dealt, read it (and, for a critical hit, say what it means). Or redraw:
 * a new hand, but the turn goes to the enemy (with an easier block).
 */
export function AttackPanel({ state, hand, pool, random, onPlay, onRedraw }: Props) {
  const [step, setStep] = useState<Step>({ kind: "pick" });
  // Strongest first within the hand, so the choice is still tactical.
  const ranked = useMemo(() => hand
    .map(word => ({ word, ...previewAttack(word, state.enemy.vowel, state.timesPlayed[word.japanese] ?? 0) }))
    .sort((a, b) => b.damage - a.damage), [hand, state.enemy.vowel, state.timesPlayed]);

  const pick = (word: BattleWord) => setStep({ kind: "reading", word, choices: readingChoices(word, pool, random) });
  const finish = (play: WordPlay) => { setStep({ kind: "pick" }); onPlay(play); };
  const read = (word: BattleWord, romaji: string) => {
    if (romaji !== word.romaji) { finish({ word, isReadingCorrect: false, isMeaningCorrect: false }); return; }
    setStep({ kind: "meaning", word, choices: meaningChoices(word, pool, random) });
  };

  if (step.kind === "reading") return <div role="group" aria-labelledby="reading-prompt">
    <p id="reading-prompt" className="font-bold">How do you read <span lang="ja" className="text-2xl">{step.word.japanese}</span>?</p>
    <div className="mt-3 grid grid-cols-2 gap-2">{step.choices.map(choice =>
      <button key={choice} type="button" className={choiceButton} onClick={() => read(step.word, choice)}>{choice}</button>)}</div>
    <button type="button" className={`${secondaryButton} mt-3 text-sm`} onClick={() => setStep({ kind: "pick" })}>← Another word</button>
  </div>;

  if (step.kind === "meaning") return <div role="group" aria-labelledby="meaning-prompt">
    <p id="meaning-prompt" className="font-bold">Right: <span lang="ja">{step.word.japanese}</span> is {step.word.romaji}. For a critical hit, what does it mean?</p>
    <div className="mt-3 grid grid-cols-2 gap-2">{step.choices.map(choice =>
      <button key={choice} type="button" className={`${choiceButton} text-sm`} onClick={() => finish({ word: step.word, isReadingCorrect: true, isMeaningCorrect: choice === step.word.meaning })}>{choice}</button>)}</div>
    <button type="button" className={`${secondaryButton} mt-3 text-sm`} onClick={() => finish({ word: step.word, isReadingCorrect: true, isMeaningCorrect: false })}>Skip: attack now</button>
  </div>;

  return <div role="group" aria-labelledby="attack-prompt">
    <div className="flex items-center justify-between gap-2">
      <p id="attack-prompt" className="font-bold">Your turn: attack with a word</p>
      <button type="button" className={`shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-0.5 text-sm font-semibold hover:bg-gray-100 ${focusRing}`} onClick={onRedraw}
        aria-label="Redraw: new words, but you skip this attack and brace for the enemy's" title="New words, but you skip this attack and brace for the enemy's">↻ Redraw</button>
    </div>
    <ul className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">{ranked.map(({ word, damage, matchup }) => {
      const badge = MATCHUP_BADGE[matchup];
      return <li key={word.japanese}><button type="button" className={`${choiceButton} flex w-full items-center justify-between gap-1 px-2.5 py-1.5 text-left md:flex-col md:items-start md:px-3`} onClick={() => pick(word)}
        aria-label={`${word.japanese}, ${damage} damage${badge.label ? `, ${matchup} against the enemy` : ""}`}>
        <span lang="ja" className="min-w-0 truncate text-base leading-tight md:w-full md:text-lg">{word.japanese}</span>
        <span className="flex shrink-0 items-center justify-between gap-1 text-xs md:w-full">
          <span className="whitespace-nowrap text-gray-500">-{vowelOfWord(word.japanese) ?? "n"} · {damage}</span>
          {badge.label && <span aria-hidden="true" title={badge.label} className={`rounded-full px-1.5 font-bold ${badge.className}`}>{badge.label.slice(0, 1)}</span>}
        </span>
      </button></li>;
    })}</ul>
  </div>;
}
