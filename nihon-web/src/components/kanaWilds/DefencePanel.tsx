import { useEffect, useMemo, useState } from "react";
import { submitKanaAnswer } from "../../api/quiz";
import type { DefenceResult } from "../../lib/kanaWilds/battle";
import { bracedDefenceChoices, bracedReadingChoices, bracedSoundChoices, defenceChoices, lookAlikeChoices, readingChoices, soundAlikeChoices } from "../../lib/kanaWilds/choices";
import { drawnBlock, heardBlock, revealBlock } from "../../lib/kanaWilds/defenceStyles";
import type { DefenceStyle } from "../../lib/kanaWilds/defenceStyles";
import type { EnemyAttack } from "../../lib/kanaWilds/enemyAttacks";
import { kanaByCharacter, kanaByRomaji } from "../../lib/kanaWilds/gojuon";
import type { WildKana } from "../../lib/kanaWilds/gojuon";
import type { KanaMistake } from "../../lib/kanaWilds/mistakes";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { speakJapanese, supportsJapaneseSpeech } from "../../services/japaneseSpeech";
import { StrokeWord } from "./StrokeKana";
import { STROKE_DRAW_MS, strokeTotalOf, useStrokeDrawing } from "./strokeDrawing";
import { choiceButton, secondaryButton } from "./styles";

/** Pon's stroke reveal draws slowly, so reading it early is a real choice. */
const STROKE_REVEAL_MS = 900;

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

type Defend = (result: DefenceResult, mistake?: KanaMistake) => void;

/** How an attack drawn on screen is read: its choices, how fast it draws, how an answer is judged and what to say. */
type DrawnRules = {
  prompt: string;
  strokeMs: number;
  kanaChoices: (kana: WildKana, random: () => number) => string[];
  judge: (isCorrect: boolean, drawn: number, total: number) => DefenceResult;
  progressNote: (drawn: number, total: number) => string;
};

const quickNote = (drawn: number, total: number) => (drawn < total ? "Answer before it's drawn for a perfect block!" : "Drawn. Read it to block.");

const DRAWN_RULES: Readonly<Record<Exclude<DefenceStyle, "shout">, DrawnRules>> = {
  reading: { prompt: "The wild kana attacks! Read it to block.", strokeMs: STROKE_DRAW_MS, kanaChoices: defenceChoices, judge: drawnBlock, progressNote: quickNote },
  "look-alikes": { prompt: "A look-alike attack! Read it carefully to block.", strokeMs: STROKE_DRAW_MS, kanaChoices: lookAlikeChoices, judge: drawnBlock, progressNote: quickNote },
  "stroke-reveal": {
    prompt: "A stroke reveal! The earlier you read it, the better the block.", strokeMs: STROKE_REVEAL_MS, kanaChoices: defenceChoices, judge: revealBlock,
    progressNote: (drawn, total) => drawn < total / 2 ? "Read it now for a perfect block!"
      : drawn < total ? "A good block now: a quarter of the hit gets through." : "All drawn: reading it now still lets half the hit through.",
  },
  "word-attack": { prompt: "A word attack! Read the whole word to block.", strokeMs: STROKE_DRAW_MS, kanaChoices: defenceChoices, judge: drawnBlock, progressNote: quickNote },
};

type DrawnProps = { attack: EnemyAttack; rules: DrawnRules; isBraced: boolean; pool: readonly BattleWord[]; random: () => number; onDefend: Defend; onWordReading: (word: string, isCorrect: boolean) => void };

const charactersOf = (attack: EnemyAttack) => [...(attack.kind === "kana" ? attack.kana.kana : attack.word.japanese)];

/** A wrong reading of a kana attack: the kana the answer belongs to. */
const readAs = (kana: WildKana, answer: string): KanaMistake => ({ kana: kana.kana, mistakenFor: kanaByRomaji(answer)?.kana ?? answer, way: "read" });

/** The attack drawn stroke by stroke: read it right to block, and early for a better block. */
function DrawnDefence({ attack, rules, isBraced, pool, random, onDefend, onWordReading }: DrawnProps) {
  const characters = charactersOf(attack);
  const total = strokeTotalOf(characters);
  const drawn = useStrokeDrawing(total, rules.strokeMs);
  const choices = useMemo(() => {
    if (attack.kind === "kana") return (isBraced ? bracedDefenceChoices : rules.kanaChoices)(attack.kana, random);
    return (isBraced ? bracedReadingChoices : readingChoices)(attack.word, pool, random);
  }, [attack, isBraced, pool, random, rules]);
  const [isGrading, setIsGrading] = useState(false);

  const choose = async (answer: string) => {
    const drawnWhenAnswered = drawn;
    setIsGrading(true);
    const isCorrect = attack.kind === "kana" ? await gradeKana(attack.kana, answer) : answer === attack.word.romaji;
    if (attack.kind === "word") onWordReading(attack.word.japanese, isCorrect);
    setIsGrading(false);
    onDefend(rules.judge(isCorrect, drawnWhenAnswered, total), !isCorrect && attack.kind === "kana" ? readAs(attack.kana, answer) : undefined);
  };

  return <div role="group" aria-labelledby="defence-prompt">
    <p id="defence-prompt" className="font-bold">{rules.prompt}{isBraced && <BracedTag />}</p>
    <div className="mt-2 flex items-center gap-3">
      {/* Screen readers get the characters at once: the drawing is a sighted player's clue, not a puzzle for them. */}
      <div role="img" aria-label={characters.join("")} lang="ja" className="kw-attack-card flex h-16 shrink-0 items-center gap-0.5 px-2">
        <StrokeWord characters={characters} drawn={drawn} className="h-12 w-12" />
      </div>
      <p className="text-xs text-gray-600">{rules.progressNote(drawn, total)}</p>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{choices.map(choice =>
      <button key={choice} type="button" disabled={isGrading} className={`${choiceButton} py-2 text-lg`} onClick={() => void choose(choice)}>{choice}</button>)}</div>
  </div>;
}

const BracedTag = () => <span className="ml-1 rounded-md bg-sky-100 px-1.5 text-sm text-sky-900">Braced: easier, softer</span>;

type ShoutProps = { kana: WildKana; isBraced: boolean; random: () => number; onDefend: Defend };

/**
 * Tama's signature: the kana shouts instead of showing itself. Pick the kana you heard; right on the first hearing is a
 * perfect block. The caption (on from the start where the browser can't speak) shows the sound in romaji.
 */
function ShoutDefence({ kana, isBraced, random, onDefend }: ShoutProps) {
  const choices = useMemo(() => (isBraced ? bracedSoundChoices : soundAlikeChoices)(kana, random), [kana, isBraced, random]);
  const canSpeak = supportsJapaneseSpeech();
  const [timesHeard, setTimesHeard] = useState(1);
  const [isCaptioned, setIsCaptioned] = useState(!canSpeak);
  const [isGrading, setIsGrading] = useState(false);
  useEffect(() => { speakJapanese(kana.kana); }, [kana]);

  const hearAgain = () => { if (speakJapanese(kana.kana)) setTimesHeard(count => count + 1); };
  const choose = async (answer: string) => {
    setIsGrading(true);
    const isCorrect = await gradeKana(kana, kanaByCharacter(answer)?.romaji ?? answer);
    setIsGrading(false);
    onDefend(heardBlock(isCorrect, timesHeard), isCorrect ? undefined : { kana: kana.kana, mistakenFor: answer, way: "heard" });
  };

  return <div role="group" aria-labelledby="defence-prompt">
    <p id="defence-prompt" className="font-bold">The kana shouts! Pick the one you heard.{isBraced && <BracedTag />}</p>
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {canSpeak && <button type="button" className={`${secondaryButton} py-1.5 text-sm`} onClick={hearAgain}>Hear it again</button>}
      {canSpeak && <button type="button" aria-pressed={isCaptioned} className={`${secondaryButton} py-1.5 text-sm`} onClick={() => setIsCaptioned(shown => !shown)}>Caption</button>}
      {isCaptioned && <p className="text-sm font-bold">Shouted: “{kana.romaji}!”</p>}
      <p className="text-xs text-gray-600">{timesHeard <= 1 ? "Pick it on the first hearing for a perfect block!" : "Heard again: a right pick still blocks."}</p>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">{choices.map(choice =>
      <button key={choice} type="button" lang="ja" disabled={isGrading} className={`${choiceButton} py-2 text-2xl`} onClick={() => void choose(choice)}>{choice}</button>)}</div>
  </div>;
}

type Props = {
  style: DefenceStyle; attack: EnemyAttack; isBraced: boolean; pool: readonly BattleWord[]; random: () => number;
  onDefend: Defend; onWordReading: (word: string, isCorrect: boolean) => void;
};

/**
 * The enemy's turn: it attacks with a kana or a word, and the player reads it to block, in the battle's defence style
 * (docs/KANA-BATTLE.md section 6). Braced (after a redraw) the choices are two and easy to tell apart.
 */
export function DefencePanel({ style, attack, ...rest }: Props) {
  if (style === "shout" && attack.kind === "kana") return <ShoutDefence kana={attack.kana} isBraced={rest.isBraced} random={rest.random} onDefend={rest.onDefend} />;
  return <DrawnDefence attack={attack} rules={DRAWN_RULES[style === "shout" ? "reading" : style]} {...rest} />;
}
