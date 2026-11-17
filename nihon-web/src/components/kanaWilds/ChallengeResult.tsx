import { GuideNote } from "../cast/GuideNote";
import { WILD_ROUTES } from "../../data/world/routes";
import { CAST } from "../../lib/cast";
import type { Mood } from "../../lib/cast";
import type { DefenceStyle } from "../../lib/kanaWilds/defenceStyles";
import { mistakeHints } from "../../lib/kanaWilds/mistakes";
import type { WinSave } from "../../lib/kanaWilds/useWildBattles";
import { EVOLVE_AT_LEVEL } from "../../lib/kanaWilds/evolution";
import type { Challenger, ChallengeOutcome, ChallengeSummary, ChallengerReward } from "../../lib/world/challenges";
import { routeRewardedBy, rowNames } from "../../lib/world/routes";
import { primaryButton, secondaryButton, sheet } from "./styles";

type Props = {
  challenger: Challenger; summary: ChallengeSummary; winSave: WinSave;
  backLabel: string; onRetry: () => void; onBack: () => void;
};

const TITLE: Readonly<Record<ChallengeOutcome, (name: string) => string>> = {
  won: name => `You beat ${name}!`,
  lost: name => `${name} won this time`,
  ran: () => "You left the challenge",
};
const MOOD: Readonly<Record<ChallengeOutcome, Mood>> = { won: "happy", lost: "calm", ran: "calm" };

/** How to get better at the challenger's signature defence. */
const DEFENCE_TIP: Readonly<Record<DefenceStyle, string>> = {
  reading: "Read each kana slowly.",
  "look-alikes": "Each has a look-alike, so read them slowly.",
  shout: "Listen to the whole sound, the vowel too, before you pick.",
  "stroke-reveal": "Watch the first strokes: they tell look-alikes apart early.",
  "word-attack": "Read every kana of the word, the voiced ones too: が is ga, not ka.",
  recall: "These are your weakest kana: practise them in the grass, then say each reading to yourself before you type.",
  brush: "A brush joins and thickens strokes: look for each kana's shape, not its printed lines.",
};

/** What a challenger's own reward does, said after a win. */
const REWARD_TEXT: Readonly<Record<ChallengerReward, string>> = {
  "sharp-eyes": "You learned Sharp Eyes: wild kana show how many strokes they have from the start.",
  "voiced-evolution": `Your kana can evolve now: か becomes が, た becomes だ, は becomes ば (then ぱ) once you reach level ${EVOLVE_AT_LEVEL} with them.`,
  "katakana-wilds": "You beat the whole island cast! Your win is kept: when the katakana wilds open, you go in first.",
  "small-kana-evolution": `Your kana can take small kana now: き becomes きゃ, きゅ and きょ, し becomes しゃ, しゅ and しょ, once you reach level ${EVOLVE_AT_LEVEL} with them.`,
};

/** What the challenger says: well done, or which kana to look at before trying again. */
function challengerNote(challenger: Challenger, { outcome, team: kana }: ChallengeSummary): string {
  if (outcome === "won") return "Well read! Come back for a rematch whenever you like: the grass on the way keeps your kana sharp.";
  const team = kana.map(item => item.kana).join(", ");
  return `My team is ${team}. ${DEFENCE_TIP[challenger.defence]} Challenge me again whenever you like.`;
}

/** What beating the challenger gives: rows in a path's grass, or a title. */
function rewardText(challenger: Challenger): string | null {
  const route = routeRewardedBy(WILD_ROUTES, challenger.id);
  if (route) return `The ${rowNames(route.rewardRows.rows)} rows now live in the tall grass of ${route.name.charAt(0).toLowerCase()}${route.name.slice(1)}.`;
  return challenger.reward ? REWARD_TEXT[challenger.reward] : null;
}

/** After a loss, the kana the player mixed up, most often first; none after a win. */
function ChallengerHints({ summary }: { summary: ChallengeSummary }) {
  const hints = summary.outcome === "won" ? [] : mistakeHints(summary.mistakes);
  if (!hints.length) return null;
  return <ul className="mt-2 space-y-0.5" aria-label="What tripped you up">
    {hints.map(hint => <li key={hint} className="font-bold">{hint}</li>)}
  </ul>;
}

/** How a challenge ended. Losing costs nothing, and the challenger can be challenged again at once, won or lost. */
export function ChallengeResult({ challenger, summary, winSave, backLabel, onRetry, onBack }: Props) {
  const { name } = CAST[challenger.character];
  const { outcome, readings } = summary;
  return <section className={sheet} aria-labelledby="challenge-result-heading">
    <h2 id="challenge-result-heading" className="text-2xl font-black">{TITLE[outcome](name)}</h2>
    <p className="mt-1 text-gray-600">Readings right: {readings.correct} / {readings.answered}</p>
    {winSave === "saving" && <p role="status" className="mt-2 text-sm text-gray-500">Saving your win…</p>}
    {winSave === "saved" && rewardText(challenger) && <p className="mt-2 font-bold text-emerald-800">{rewardText(challenger)}</p>}
    {winSave === "failed" && <p role="alert" className="mt-2 text-sm text-amber-900">Your win could not be saved. Challenge {name} again to claim it.</p>}
    <GuideNote character={challenger.character} mood={MOOD[outcome]} className="mt-4"><p>{challengerNote(challenger, summary)}</p><ChallengerHints summary={summary} /></GuideNote>
    <div className="mt-5 flex flex-wrap gap-2">
      <button type="button" className={primaryButton} onClick={onBack}>{backLabel}</button>
      <button type="button" className={secondaryButton} onClick={onRetry}>Challenge {name} again</button>
    </div>
  </section>;
}
