import { GuideNote } from "../cast/GuideNote";
import { CAST } from "../../lib/cast";
import type { Mood } from "../../lib/cast";
import type { WinSave } from "../../lib/kanaWilds/useWildBattles";
import type { Challenger, ChallengeOutcome } from "../../lib/world/challenges";
import { primaryButton, secondaryButton, sheet } from "./styles";

type Props = {
  challenger: Challenger; outcome: ChallengeOutcome; readings: { answered: number; correct: number }; winSave: WinSave;
  backLabel: string; onRetry: () => void; onBack: () => void;
};

const TITLE: Readonly<Record<ChallengeOutcome, (name: string) => string>> = {
  won: name => `You beat ${name}!`,
  lost: name => `${name} won this time`,
  ran: () => "You left the challenge",
};
const MOOD: Readonly<Record<ChallengeOutcome, Mood>> = { won: "happy", lost: "calm", ran: "calm" };

/** What the challenger says: well done, or which kana to look at before trying again. */
function challengerNote(challenger: Challenger, outcome: ChallengeOutcome): string {
  if (outcome === "won") return "Well read! Come back for a rematch whenever you like: the grass on the way keeps your kana sharp.";
  const team = challenger.team.map(kana => kana.kana).join(", ");
  return `My team is ${team}, and each has a look-alike. Read them slowly, then challenge me again whenever you like.`;
}

/** How a challenge ended. Losing costs nothing, and the challenger can be challenged again at once, won or lost. */
export function ChallengeResult({ challenger, outcome, readings, winSave, backLabel, onRetry, onBack }: Props) {
  const { name } = CAST[challenger.character];
  return <section className={sheet} aria-labelledby="challenge-result-heading">
    <h2 id="challenge-result-heading" className="text-2xl font-black">{TITLE[outcome](name)}</h2>
    <p className="mt-1 text-gray-600">Readings right: {readings.correct} / {readings.answered}</p>
    {winSave === "saving" && <p role="status" className="mt-2 text-sm text-gray-500">Saving your win…</p>}
    {winSave === "failed" && <p role="alert" className="mt-2 text-sm text-amber-900">Your win could not be saved. Challenge {name} again to open the next path.</p>}
    <GuideNote character={challenger.character} mood={MOOD[outcome]} className="mt-4"><p>{challengerNote(challenger, outcome)}</p></GuideNote>
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" className={primaryButton} onClick={onBack}>{backLabel}</button>
      <button type="button" className={secondaryButton} onClick={onRetry}>Challenge {name} again</button>
    </div>
  </section>;
}
