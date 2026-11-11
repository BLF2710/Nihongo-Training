import { ENEMY_MAX_HP } from "../../lib/kanaWilds/battle";
import type { BattleState } from "../../lib/kanaWilds/battle";
import { revealedStrokeCount } from "../../lib/kanaWilds/reveal";
import { strokePathsOf } from "../../lib/kanaWilds/strokeSamples";
import { ENEMY_IMPACT_MS, useDelayedValue } from "./motion";

/** How much of the hidden wild kana shows: its strokes so far, and whether it is all there. */
export function useEnemyReveal(state: BattleState) {
  // Follows the HP shown, so a stroke appears when the blow lands.
  const shownHp = useDelayedValue(state.enemyHp, ENEMY_IMPACT_MS);
  const total = strokePathsOf(state.enemy.kana).length;
  const shown = state.phase === "over" ? total : revealedStrokeCount(total, shownHp, ENEMY_MAX_HP);
  return { shown, total, isRevealed: shown === total };
}

export type EnemyReveal = ReturnType<typeof useEnemyReveal>;
