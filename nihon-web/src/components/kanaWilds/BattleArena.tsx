import { useEffect, useRef, useState } from "react";
import { MAX_CATCH_TRIES, attemptCatch, canCatch, catchChance, catchTolerance, defend, isExhausted, playWord, redraw, runAway, startBattle } from "../../lib/kanaWilds/battle";
import { dealHand } from "../../lib/kanaWilds/hand";
import { pickEnemyAttack } from "../../lib/kanaWilds/enemyAttacks";
import type { EnemyAttack } from "../../lib/kanaWilds/enemyAttacks";
import type { BattleEvent, BattleState } from "../../lib/kanaWilds/battle";
import type { Encounter } from "../../lib/kanaWilds/encounters";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { AttackPanel } from "./AttackPanel";
import { BattleField } from "./BattleField";
import { useEnemyReveal } from "./enemyReveal";
import type { WordPlay } from "./AttackPanel";
import { CatchPanel } from "./CatchPanel";
import { DefencePanel } from "./DefencePanel";
import { prefersReducedMotion } from "./motion";
import { primaryButton, secondaryButton, sheet } from "./styles";

/** What the hands are dealt from: the new words (latest catches) and the missed words get a slot each. */
export type WordPractice = { newWords: ReadonlySet<string>; missedWords: ReadonlySet<string>; noteReading: (word: string, isCorrect: boolean) => void };

type Props = {
  encounter: Encounter; words: readonly BattleWord[]; pool: readonly BattleWord[]; practice: WordPractice; random: () => number;
  onEnd: (state: BattleState) => void;
};

const MATCHUP_NOTE = { strong: " It's strong against it!", neutral: "", weak: " It's weak against it…" } as const;

const triesLeftText = (tries: number) => `${tries} ${tries === 1 ? "try" : "tries"} left.`;

/** The text box line for a turn. `enemy` is the kana once it has shown itself, until then "the wild kana". */
function describeEvent(event: BattleEvent | null, enemy: string): string {
  const Enemy = enemy.charAt(0).toUpperCase() + enemy.slice(1);
  if (!event) return "A wild kana jumps out of the tall grass!";
  switch (event.kind) {
    case "hit": return `${event.word} hits for ${event.damage}${event.isCritical ? ", a critical hit" : ""}.${MATCHUP_NOTE[event.matchup]}`;
    case "fizzle": return `${event.word} was read wrong and fizzles.`;
    case "blocked": return event.counterDamage > 0 ? `Perfect block! You hit back for ${event.counterDamage}.` : "You read it right and block the attack.";
    case "hurt": return `${Enemy} hits you for ${event.damage}.${event.wasBraced ? " Bracing softened it." : event.matchup === "strong" ? " Your stance was weak against it." : event.matchup === "weak" ? " Your stance softened the blow." : ""}`;
    case "redrew": return `You draw new words and brace yourself. ${Enemy} attacks!`;
    case "catch-failed": return event.reason === "broke-out"
      ? `Good trace, but ${enemy} broke out! ${triesLeftText(event.triesLeft)}`
      : `Your trace missed and ${enemy} slipped away! ${triesLeftText(event.triesLeft)}`;
    case "ended": return "";
  }
}

/** How long a turn's animation runs (the longest sequence in battleField.css); the menu waits this long. */
const BATTLE_CUE_MS = 850;
/** The events the scene animates; the others (a redraw) need no wait. */
const ANIMATED_EVENTS: ReadonlySet<BattleEvent["kind"]> = new Set(["hit", "fizzle", "hurt", "blocked", "catch-failed"]);


/** The event to animate for a move. A battle's last event is "ended", so a losing blow is rebuilt from the HP lost. */
function cueOf(before: BattleState, after: BattleState): BattleEvent | null {
  if (after.lastEvent?.kind !== "ended") return after.lastEvent;
  if (after.outcome !== "lost") return null;
  return { kind: "hurt", damage: before.playerHp - after.playerHp, matchup: "neutral", wasBraced: before.isBraced };
}

/** One battle: the scene on top, then the text box (with catch and run) beside the current turn's menu. */
export function BattleArena({ encounter, words, pool, practice, random, onEnd }: Props) {
  const [state, setState] = useState(() => startBattle(encounter.kana, encounter.isCatchable));
  /** Leaves out `skipped` words when it can: those played this battle, and on a redraw the hand being swapped. */
  const deal = (skipped: Iterable<string>) => dealHand({
    words, enemyVowel: encounter.kana.vowel, newWords: practice.newWords, missedWords: practice.missedWords, recentlyPlayed: new Set(skipped),
  }, random);
  const [hand, setHand] = useState(() => deal([]));
  // What the wild kana attacks with on its turn: picked as its turn starts.
  const [enemyAttack, setEnemyAttack] = useState<EnemyAttack | null>(null);
  const [isCatching, setIsCatching] = useState(false);
  // What the scene animates: the turn's event, or the final blow when it ended the battle.
  const [cue, setCue] = useState<BattleEvent | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(timer => window.clearTimeout(timer)), []);
  const { enemy } = state;

  const later = (task: () => void, delay: number) => { timers.current.push(window.setTimeout(task, delay)); };
  const advance = (next: BattleState) => {
    const nextCue = cueOf(state, next);
    const delay = nextCue && ANIMATED_EVENTS.has(nextCue.kind) && !prefersReducedMotion() ? BATTLE_CUE_MS : 0;
    setState(next);
    setCue(nextCue);
    if (next.phase === "defend") setEnemyAttack(pickEnemyAttack(next.enemy, pool, random));
    if (next.phase !== "attack") setIsCatching(false);
    if (delay) { setIsAnimating(true); later(() => setIsAnimating(false), delay); }
    // The result screen waits for the last blow to land.
    if (next.phase === "over") later(() => onEnd(next), delay);
  };
  const play = (wordPlay: WordPlay) => {
    const next = playWord(state, wordPlay);
    practice.noteReading(wordPlay.word.japanese, wordPlay.isReadingCorrect);
    setHand(deal(Object.keys(next.timesPlayed)));
    advance(next);
  };
  const swapHand = () => {
    setHand(deal([...Object.keys(state.timesPlayed), ...hand.map(word => word.japanese)]));
    advance(redraw(state));
  };

  // Bumped each turn, so the scene replays a hit or a block once.
  const turn = state.readings.answered + state.catchTries;
  const reveal = useEnemyReveal(state);
  const enemyName = reveal.isRevealed ? enemy.kana : "the wild kana";
  return <section className={`${sheet} space-y-3`} aria-label="Battle against a wild kana" data-animating={isAnimating}>
    {/* While tracing on a phone the kana is in the tracing box, so the scene makes room for it. */}
    <div className={isCatching ? "max-md:hidden" : ""}><BattleField state={state} reveal={reveal} cue={cue} turn={turn} isCompact={isCatching} /></div>
    {isCatching ? <CatchPanel enemy={enemy} shownStrokes={reveal.shown} tolerance={catchTolerance(state)} chance={catchChance(state)} triesLeft={MAX_CATCH_TRIES - state.catchTries}
      random={random} onAttempt={isAccepted => advance(attemptCatch(state, isAccepted, random()))} onCancel={() => setIsCatching(false)} />
    : <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="kw-textbox flex items-center justify-between gap-2 p-2.5 md:flex-col md:items-stretch md:p-3">
        <p role="status" className="text-sm font-bold sm:text-base md:min-h-10"><span lang="ja">{describeEvent(state.lastEvent, enemyName)}</span></p>
        {state.phase === "attack" && <div inert={isAnimating} className="flex shrink-0 flex-wrap justify-end gap-2 md:justify-start">
          {canCatch(state) && <button type="button" className={`${primaryButton} py-2 text-sm`} onClick={() => setIsCatching(true)}>Catch it! ({Math.round(catchChance(state) * 100)}%)</button>}
          {isExhausted(state) && !state.isCatchable
            ? <button type="button" className={`${primaryButton} py-2 text-sm`} onClick={() => advance(runAway(state))}>Finish the battle</button>
            : <button type="button" className={`${secondaryButton} py-1.5 text-sm`} onClick={() => advance(runAway(state))}>Run away</button>}
        </div>}
      </div>
      {/* Held while the turn plays out, so the next question comes after the blow lands. */}
      <div inert={isAnimating}>
        {state.phase === "defend" && enemyAttack && <DefencePanel key={state.readings.answered} attack={enemyAttack} isBraced={state.isBraced} pool={pool} random={random}
          onDefend={result => advance(defend(state, result))} onWordReading={practice.noteReading} />}
        {state.phase === "attack" && !isExhausted(state) && <AttackPanel state={state} hand={hand} pool={pool} random={random} onPlay={play} onRedraw={swapHand} />}
        {state.phase === "attack" && isExhausted(state) && <p className="font-bold" lang="ja">{state.isCatchable ? `${enemy.kana} is worn out. Catch it now!` : `${enemy.kana} is worn out. You won!`}</p>}
      </div>
    </div>}
  </section>;
}
