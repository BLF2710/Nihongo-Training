import { useState } from "react";
import { CAST } from "../../lib/cast";
import { COURSE_BATTLE_WORDS, EVERY_TILE_WORD } from "../../lib/kanaWilds/courseWords";
import type { DefenceStyle } from "../../lib/kanaWilds/defenceStyles";
import type { BattleWord } from "../../lib/kanaWilds/words";
import type { WildBattles } from "../../lib/kanaWilds/useWildBattles";
import { afterRound, kanaInPlay, startChallenge, teamFor } from "../../lib/world/challenges";
import type { Challenger, ChallengeSummary } from "../../lib/world/challenges";
import { BattleArena } from "./BattleArena";

type Props = {
  challenger: Challenger; battles: WildBattles; random: () => number;
  onOver: (summary: ChallengeSummary) => void;
};

/** The words a challenger's kana attack with: Sensei's and Kurama's include evolved kana. Zen's kana don't attack with
 *  words. */
const WORD_POOLS: Readonly<Record<DefenceStyle, readonly BattleWord[]>> = {
  reading: COURSE_BATTLE_WORDS, "look-alikes": COURSE_BATTLE_WORDS, shout: COURSE_BATTLE_WORDS, "stroke-reveal": COURSE_BATTLE_WORDS, "word-attack": EVERY_TILE_WORD, recall: COURSE_BATTLE_WORDS, brush: EVERY_TILE_WORD,
};

/** A challenge under way: one battle per kana on the challenger's team, each starting with the HP the last one left. */
export function ChallengeScreen({ challenger, battles, random, onOver }: Props) {
  const [challenge, setChallenge] = useState(() => startChallenge(challenger, teamFor(challenger, { tiles: battles.tileKana, levels: battles.kanaLevels, random })));
  const { name } = CAST[challenger.character];
  const kana = kanaInPlay(challenge);
  return <BattleArena key={challenge.round} encounter={{ kana, isCatchable: false }} kanaLevels={battles.kanaLevels} words={battles.words}
      pool={WORD_POOLS[challenger.defence]} practice={battles.practice} random={random} round={{ challengerName: name, playerHp: challenge.playerHp, number: challenge.round + 1, of: challenge.team.length, defence: challenger.defence }}
      onEnd={ended => {
        const step = afterRound(challenge, ended);
        if (step.kind === "next") setChallenge(step.challenge);
        else onOver(step.summary);
      }} />;
}
