import { ENEMY_MAX_HP } from "../../lib/kanaWilds/battle";
import type { BattleState } from "../../lib/kanaWilds/battle";
import { isStrokeCountShown, revealedStrokeCount } from "../../lib/kanaWilds/reveal";
import { strokePathsOf } from "../../lib/kanaWilds/strokeSamples";
import { ENEMY_IMPACT_MS, useDelayedValue } from "./motion";

/** How much of the hidden wild kana shows: its strokes so far, and whether it is all there. A kana that isn't hidden
 *  (a challenger's) shows in full from the start. With Sharp Eyes (Pon's reward) the stroke count shows from the
 *  start too. */
export function useEnemyReveal(state: BattleState, hasSharpEyes: boolean) {
  // Follows the HP shown, so a stroke appears when the blow lands.
  const shownHp = useDelayedValue(state.enemyHp, ENEMY_IMPACT_MS);
  const total = strokePathsOf(state.enemy.kana).length;
  const isOver = state.phase === "over" || !state.isHidden;
  const shown = isOver ? total : revealedStrokeCount(total, shownHp, ENEMY_MAX_HP);
  return { shown, total, isRevealed: shown === total, isCountShown: isOver || hasSharpEyes || isStrokeCountShown(shownHp, ENEMY_MAX_HP) };
}

export type EnemyReveal = ReturnType<typeof useEnemyReveal>;
