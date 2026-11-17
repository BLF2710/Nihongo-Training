import { COURSE_BATTLE_WORDS } from "../../lib/kanaWilds/courseWords";
import type { WildBattles } from "../../lib/kanaWilds/useWildBattles";
import { BattleArena } from "./BattleArena";
import { BattleResult } from "./BattleResult";
import { ChallengeResult } from "./ChallengeResult";
import { ChallengeScreen } from "./ChallengeScreen";

type Props = { battles: WildBattles; random: () => number; exploreLabel: string; onExplore: () => void; onHome: () => void };

/** The battle or challenge under way, or its result; nothing between battles. */
export function WildBattleScreen({ battles, random, exploreLabel, onExplore, onHome }: Props) {
  const { screen, kanaLevels, words, practice, finish, rematch, challenge, finishChallenge, hasSharpEyes } = battles;
  if (screen.kind === "battle") return <BattleArena key={screen.round} encounter={screen.encounter} kanaLevels={kanaLevels} words={words} pool={COURSE_BATTLE_WORDS} hasSharpEyes={hasSharpEyes}
    practice={practice} random={random} onEnd={ended => void finish(screen.encounter, ended)} />;
  if (screen.kind === "result") return <BattleResult state={screen.state} catchSave={screen.catchSave} exploreLabel={exploreLabel}
    onRematch={() => rematch(screen.encounter)} onExplore={onExplore} onHome={onHome} />;
  if (screen.kind === "challenge") return <ChallengeScreen key={screen.round} challenger={screen.challenger} battles={battles} random={random}
    onOver={summary => void finishChallenge(screen.challenger, summary)} />;
  if (screen.kind === "challenge-result") return <ChallengeResult challenger={screen.challenger} summary={screen.summary}
    winSave={screen.winSave} backLabel={exploreLabel} onRetry={() => challenge(screen.challenger)} onBack={onExplore} />;
  return null;
}
