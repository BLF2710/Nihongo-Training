import { GuideNote } from "../cast/GuideNote";
import type { Mood } from "../../lib/cast";
import type { BattleState, Outcome } from "../../lib/kanaWilds/battle";
import type { CatchSave } from "../../lib/kanaWilds/useWildBattles";
import { primaryButton, secondaryButton, sheet } from "./styles";

const OUTCOME_COPY: Readonly<Record<Outcome, { title: (kana: string) => string; note: string; mood: Mood }>> = {
  caught: { title: kana => `You caught ${kana}!`, note: "Chirp chirp! New words open up with every kana you catch.", mood: "happy" },
  fled: { title: kana => `${kana} got away`, note: "So close! Show its first stroke next time and trace slowly.", mood: "worried" },
  lost: { title: kana => `${kana} won this time`, note: "Rest your wings. Reading it right blocks its attacks.", mood: "worried" },
  ran: { title: () => "You ran away", note: "Wild kana will be waiting in the grass.", mood: "calm" },
  // Only a kana already caught is won rather than caught.
  won: { title: kana => `You beat ${kana}!`, note: "It was already in your collection, but practice keeps it sharp!", mood: "happy" },
};

/** `exploreLabel` names where "explore" leads: more tall grass from the Kana Wilds page, or back to the path. */
type Props = { state: BattleState; catchSave: CatchSave; exploreLabel: string; onRematch: () => void; onExplore: () => void; onHome: () => void };

export function BattleResult({ state, catchSave, exploreLabel, onRematch, onExplore, onHome }: Props) {
  const outcome = state.outcome ?? "ran";
  const copy = OUTCOME_COPY[outcome];
  const { answered, correct } = state.readings;
  return <section className={sheet} aria-labelledby="battle-result-heading">
    <h2 id="battle-result-heading" className="text-2xl font-black" lang="ja">{copy.title(state.enemy.kana)}</h2>
    <p className="mt-1 text-gray-600">Readings right: {correct} / {answered}</p>
    {catchSave === "saving" && <p role="status" className="mt-2 text-sm text-gray-500">Adding it to your collection…</p>}
    {catchSave === "saved" && <p role="status" className="mt-2 text-sm font-semibold text-emerald-800">Added to your collection.</p>}
    {catchSave === "failed" && <p role="alert" className="mt-2 text-sm text-amber-900">The catch could not be saved. Catch it again in your next battle.</p>}
    <GuideNote character="chun" mood={copy.mood} className="mt-4"><p>{copy.note}</p></GuideNote>
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" className={primaryButton} onClick={onExplore}>{exploreLabel}</button>
      {outcome !== "caught" && <button type="button" className={secondaryButton} onClick={onRematch}>Battle <span lang="ja">{state.enemy.kana}</span> again</button>}
      <button type="button" className={secondaryButton} onClick={onHome}>Your collection</button>
    </div>
  </section>;
}
