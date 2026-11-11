import { useEffect, useRef, useState } from "react";
import { MAX_CATCH_TRIES, attemptCatch, canCatch, catchTolerance, defend, isExhausted, playWord, runAway, startBattle } from "../../lib/kanaWilds/battle";
import type { BattleEvent, BattleState } from "../../lib/kanaWilds/battle";
import type { Encounter } from "../../lib/kanaWilds/encounters";
import type { BattleWord } from "../../lib/kanaWilds/words";
import { AttackPanel } from "./AttackPanel";
import { BattleField } from "./BattleField";
import type { WordPlay } from "./AttackPanel";
import { CatchPanel } from "./CatchPanel";
import { DefencePanel } from "./DefencePanel";
import { prefersReducedMotion } from "./motion";
import { primaryButton, secondaryButton, sheet } from "./styles";

type Props = { encounter: Encounter; words: readonly BattleWord[]; pool: readonly BattleWord[]; random: () => number; onEnd: (state: BattleState) => void };

const MATCHUP_NOTE = { strong: " It's strong against it!", neutral: "", weak: " It's weak against it…" } as const;

function describeEvent(event: BattleEvent | null, enemy: string): string {
  if (!event) return `A wild ${enemy} jumps out of the tall grass!`;
  switch (event.kind) {
    case "hit": return `${event.word} hits for ${event.damage}${event.isCritical ? ", a critical hit" : ""}.${MATCHUP_NOTE[event.matchup]}`;
    case "fizzle": return `${event.word} was read wrong and fizzles.`;
    case "blocked": return `You read ${enemy} right and block its attack.`;
    case "hurt": return `${enemy} hits you for ${event.damage}.${event.matchup === "strong" ? " Your stance was weak against it." : event.matchup === "weak" ? " Your stance softened the blow." : ""}`;
    case "catch-failed": return `${enemy} broke free! ${event.triesLeft} ${event.triesLeft === 1 ? "try" : "tries"} left.`;
    case "ended": return "";
  }
}

/** How long a turn's animation runs (the longest sequence in battleField.css); the menu waits this long. */
const BATTLE_CUE_MS = 850;


/** The event to animate for a move. A battle's last event is "ended", so a losing blow is rebuilt from the HP lost. */
function cueOf(before: BattleState, after: BattleState): BattleEvent | null {
  if (after.lastEvent?.kind !== "ended") return after.lastEvent;
  if (after.outcome !== "lost") return null;
  return { kind: "hurt", damage: before.playerHp - after.playerHp, matchup: "neutral" };
}

/** One battle: the scene on top, then the text box (with catch and run) beside the current turn's menu. */
export function BattleArena({ encounter, words, pool, random, onEnd }: Props) {
  const [state, setState] = useState(() => startBattle(encounter.kana, encounter.isCatchable));
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
    const delay = nextCue && !prefersReducedMotion() ? BATTLE_CUE_MS : 0;
    setState(next);
    setCue(nextCue);
    if (next.phase !== "attack") setIsCatching(false);
    if (delay) { setIsAnimating(true); later(() => setIsAnimating(false), delay); }
    // The result screen waits for the last blow to land.
    if (next.phase === "over") later(() => onEnd(next), delay);
  };
  const play = (wordPlay: WordPlay) => advance(playWord(state, wordPlay));

  // Bumped each turn, so the scene replays a hit or a block once.
  const turn = state.readings.answered + state.catchTries;
  return <section className={`${sheet} space-y-3`} aria-label={`Battle against ${enemy.kana}`} data-animating={isAnimating}>
    {/* While tracing on a phone the kana is in the tracing box, so the scene makes room for it. */}
    <div className={isCatching ? "max-md:hidden" : ""}><BattleField state={state} cue={cue} turn={turn} isCompact={isCatching} /></div>
    {isCatching ? <CatchPanel enemy={enemy} tolerance={catchTolerance(state)} triesLeft={MAX_CATCH_TRIES - state.catchTries} random={random}
      onAttempt={isAccepted => advance(attemptCatch(state, isAccepted))} onCancel={() => setIsCatching(false)} />
    : <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="kw-textbox flex items-center justify-between gap-2 p-2.5 md:flex-col md:items-stretch md:p-3">
        <p role="status" className="text-sm font-bold sm:text-base md:min-h-10"><span lang="ja">{describeEvent(state.lastEvent, enemy.kana)}</span></p>
        {state.phase === "attack" && <div inert={isAnimating} className="flex shrink-0 flex-wrap justify-end gap-2 md:justify-start">
          {canCatch(state) && <button type="button" className={`${primaryButton} py-2 text-sm`} onClick={() => setIsCatching(true)}>Catch it!</button>}
          {isExhausted(state) && !state.isCatchable
            ? <button type="button" className={`${primaryButton} py-2 text-sm`} onClick={() => advance(runAway(state))}>Finish the battle</button>
            : <button type="button" className={`${secondaryButton} py-1.5 text-sm`} onClick={() => advance(runAway(state))}>Run away</button>}
        </div>}
      </div>
      {/* Held while the turn plays out, so the next question comes after the blow lands. */}
      <div inert={isAnimating}>
        {state.phase === "defend" && <DefencePanel key={state.readings.answered} enemy={enemy} random={random} onDefend={isBlocked => advance(defend(state, isBlocked))} />}
        {state.phase === "attack" && !isExhausted(state) && <AttackPanel state={state} words={words} pool={pool} random={random} onPlay={play} />}
        {state.phase === "attack" && isExhausted(state) && <p className="font-bold" lang="ja">{state.isCatchable ? `${enemy.kana} is worn out. Catch it now!` : `${enemy.kana} is worn out. You won!`}</p>}
      </div>
    </div>}
  </section>;
}
