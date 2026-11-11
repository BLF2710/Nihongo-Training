import { GuideNote } from "../cast/GuideNote";
import type { Mood } from "../../lib/cast";
import type { BattleState, Outcome } from "../../lib/kanaWilds/battle";
import { primaryButton, secondaryButton, sheet } from "./styles";

/** Whether the catch reached the server: the result screen says so rather than promising a kana that wasn't saved. */
export type CatchSave = "not-caught" | "saving" | "saved" | "failed";

const OUTCOME_COPY: Readonly<Record<Outcome, { title: (kana: string) => string; note: string; mood: Mood }>> = {
  caught: { title: kana => `You caught ${kana}!`, note: "Chirp chirp! New words open up with every kana you catch.", mood: "happy" },
  fled: { title: kana => `${kana} got away`, note: "So close! Show its first stroke next time and trace slowly.", mood: "worried" },
  lost: { title: kana => `${kana} won this time`, note: "Rest your wings. Reading it right blocks its attacks.", mood: "worried" },
  ran: { title: () => "You ran away", note: "Wild kana will be waiting in the grass.", mood: "calm" },
};

type Props = { state: BattleState; catchSave: CatchSave; onRematch: () => void; onExplore: () => void; onHome: () => void };

export function BattleResult({ state, catchSave, onRematch, onExplore, onHome }: Props) {
  const outcome = state.outcome ?? "ran";
  // A kana already caught can't be caught again, so wearing it out ends the battle as a win.
  const hasWon = outcome === "ran" && state.enemyHp === 0 && !state.isCatchable;
  const copy = OUTCOME_COPY[outcome];
  const { answered, correct } = state.readings;
  return <section className={sheet} aria-labelledby="battle-result-heading">
    <h2 id="battle-result-heading" className="text-2xl font-black" lang="ja">{hasWon ? `You beat ${state.enemy.kana}!` : copy.title(state.enemy.kana)}</h2>
    <p className="mt-1 text-gray-600">Readings right: {correct} / {answered}</p>
    {catchSave === "saving" && <p role="status" className="mt-2 text-sm text-gray-500">Adding it to your collection…</p>}
    {catchSave === "saved" && <p role="status" className="mt-2 text-sm font-semibold text-emerald-800">Added to your collection.</p>}
    {catchSave === "failed" && <p role="alert" className="mt-2 text-sm text-amber-900">The catch could not be saved. Catch it again in your next battle.</p>}
    <GuideNote character="chun" mood={hasWon ? "happy" : copy.mood} className="mt-4"><p>{hasWon ? "It was already in your collection, but practice keeps it sharp!" : copy.note}</p></GuideNote>
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" className={primaryButton} onClick={onExplore}>Explore the grass</button>
      {outcome !== "caught" && <button type="button" className={secondaryButton} onClick={onRematch}>Battle <span lang="ja">{state.enemy.kana}</span> again</button>}
      <button type="button" className={secondaryButton} onClick={onHome}>Your collection</button>
    </div>
  </section>;
}
