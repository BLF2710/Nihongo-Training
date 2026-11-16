import { COURSE_BATTLE_WORDS } from "../../lib/kanaWilds/courseWords";
import type { WildBattles } from "../../lib/kanaWilds/useWildBattles";
import { StarterChoice } from "./StarterChoice";
import { WildBattleScreen } from "./WildBattleScreen";

type Props = { battles: WildBattles; random: () => number; backLabel: string; onBack: () => void; onCollection: () => void };

/**
 * Over a walking scene (a wild path or an island): loading the collection, asking for a starter, or the battle or
 * challenge under way and its result. `onBack` returns to walking.
 */
export function BattleOverlay({ battles, random, backLabel, onBack, onCollection }: Props) {
  const { state, retry, chooseStarter, actionError } = battles.collection;
  const hasStarter = state.status === "ready" && state.collection.starter !== null;
  return <div className="absolute inset-0 z-[950] overflow-y-auto bg-black/35 px-2 py-2 sm:px-4">
    <div className="mx-auto w-full max-w-5xl">
      {state.status === "loading" && <p role="status" className="rounded-xl bg-white p-4 text-gray-600">Loading your kana…</p>}
      {state.status === "error" && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{state.message} <button type="button" className="ml-2 font-bold underline" onClick={retry}>Try again</button></p>}
      {actionError && <p role="alert" className="mb-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{actionError}</p>}
      {state.status === "ready" && !hasStarter && <StarterChoice words={COURSE_BATTLE_WORDS} onChoose={chooseStarter} />}
      {hasStarter && <WildBattleScreen battles={battles} random={random} exploreLabel={backLabel} onExplore={onBack} onHome={onCollection} />}
    </div>
  </div>;
}
