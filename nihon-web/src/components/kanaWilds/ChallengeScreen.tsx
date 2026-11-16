import { useState } from "react";
import { CAST } from "../../lib/cast";
import { COURSE_BATTLE_WORDS } from "../../lib/kanaWilds/courseWords";
import type { WildBattles } from "../../lib/kanaWilds/useWildBattles";
import { afterRound, kanaInPlay, startChallenge } from "../../lib/world/challenges";
import type { Challenger, ChallengeSummary } from "../../lib/world/challenges";
import { BattleArena } from "./BattleArena";

type Props = {
  challenger: Challenger; battles: WildBattles; random: () => number;
  onOver: (summary: ChallengeSummary) => void;
};

/** A challenge under way: one battle per kana on the challenger's team, each starting with the HP the last one left. */
export function ChallengeScreen({ challenger, battles, random, onOver }: Props) {
  const [challenge, setChallenge] = useState(() => startChallenge(challenger));
  const { name } = CAST[challenger.character];
  const kana = kanaInPlay(challenge);
  return <BattleArena key={challenge.round} encounter={{ kana, isCatchable: false }} kanaLevels={battles.kanaLevels} words={battles.words}
      pool={COURSE_BATTLE_WORDS} practice={battles.practice} random={random} round={{ challengerName: name, playerHp: challenge.playerHp, number: challenge.round + 1, of: challenger.team.length, defence: challenger.defence }}
      onEnd={ended => {
        const step = afterRound(challenge, ended);
        if (step.kind === "next") setChallenge(step.challenge);
        else onOver(step.summary);
      }} />;
}
