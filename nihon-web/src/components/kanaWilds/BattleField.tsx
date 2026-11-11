import { ENEMY_MAX_HP, PLAYER_MAX_HP, isExhausted } from "../../lib/kanaWilds/battle";
import type { BattleEvent, BattleState } from "../../lib/kanaWilds/battle";
import { beatenBy, beats } from "../../lib/kanaWilds/vowelCircle";
import { avatarUrl } from "../../lib/avatar";
import { getUserName } from "../../lib/authStorage";
import { useUserAvatar } from "../../lib/userAvatar";
import { useDelayedValue } from "./motion";
import "./battleField.css";

/** HP at or below this share shows red, as a warning. */
const LOW_HP_SHARE = 0.3;
const HALF_HP_SHARE = 0.5;

type HpBoxProps = { side: "enemy" | "player"; name: string; tag: string | null; hp: number; maxHp: number; detail?: string; impactMs: number };

function HpBox({ side, name, tag, hp, maxHp, detail, impactMs }: HpBoxProps) {
  // The number and the bar change when the blow lands, not when the answer is given.
  const shownHp = useDelayedValue(hp, impactMs);
  const share = shownHp / maxHp;
  const colour = share <= LOW_HP_SHARE ? "#ef4444" : share <= HALF_HP_SHARE ? "#f59e0b" : "#22c55e";
  return <div className={`kw-info kw-info--${side}`}>
    <div className="flex items-baseline justify-between gap-2">
      <span lang="ja" className="truncate text-sm font-black sm:text-base">{name}</span>
      {tag && <span className="shrink-0 rounded-md bg-black/10 px-1.5 text-xs font-bold">{tag}</span>}
    </div>
    <div className="mt-1 flex items-center gap-1.5">
      <span className="text-[0.65rem] font-black opacity-70">HP</span>
      <div role="meter" aria-label={`${side === "enemy" ? name : "Your"} HP`} aria-valuemin={0} aria-valuemax={maxHp} aria-valuenow={hp} className="kw-hp-track flex-1">
        <div className="kw-hp-fill" style={{ width: `${Math.round(share * 100)}%`, backgroundColor: colour, }} />
      </div>
    </div>
    <div className="mt-0.5 flex justify-between text-[0.7rem] font-semibold opacity-75"><span className="truncate max-md:hidden">{detail}</span><span>{shownHp} / {maxHp}</span></div>
  </div>;
}

function PlayerAvatar() {
  const avatar = useUserAvatar();
  const name = getUserName() ?? "";
  return <div className="kw-player-avatar" aria-hidden="true">
    {avatar ? <img src={avatarUrl(avatar)} alt="" /> : [...(name.trim() || "?")][0]?.toUpperCase()}
  </div>;
}

/** When each side's blow lands (matching --kw-impact in battleField.css), so its HP changes on impact. */
const ENEMY_IMPACT_MS = 420;
const PLAYER_IMPACT_MS = 220;

/** What the scene plays for a turn: which side moves, which is struck, and the effects. */
function cuesOf(event: BattleEvent | null) {
  if (event?.kind === "hit") return { enemy: "kw-cue-struck", player: "", burst: event.isCritical ? "critical" : event.matchup };
  if (event?.kind === "hurt") return { enemy: "kw-cue-lunge", player: "kw-cue-struck", burst: "hurt" };
  if (event?.kind === "blocked") return { enemy: "kw-cue-lunge", player: "", burst: null };
  if (event?.kind === "catch-failed") return { enemy: "kw-cue-escape", player: "", burst: null };
  return { enemy: "", player: "", burst: null };
}

/** The word the learner just played, flying at the wild kana (or fizzling out halfway when it was read wrong). */
function Projectile({ event }: { event: BattleEvent | null }) {
  if (event?.kind === "hit") return <span lang="ja" aria-hidden="true" className="kw-projectile" data-critical={event.isCritical} data-matchup={event.matchup}>{event.word}</span>;
  if (event?.kind === "fizzle") return <span lang="ja" aria-hidden="true" className="kw-projectile" data-fizzle="true">{event.word}</span>;
  return null;
}

/**
 * The battle scene: the wild kana top right, the learner bottom left, an HP box for each. Each turn plays out on it:
 * a word flies and bursts on the kana, or the kana lunges and the blow lands on the learner or a shield.
 */
type Props = { state: BattleState; cue: BattleEvent | null; turn: number; isCompact: boolean };

export function BattleField({ state, cue: lastEvent, turn, isCompact }: Props) {
  const { enemy } = state;
  const cues = cuesOf(lastEvent);
  const enemyDetail = enemy.vowel ? `weak to -${beatenBy(enemy.vowel)}, resists -${beats(enemy.vowel)}` : "no weakness";
  return <div className="kw-field" data-compact={isCompact}>
    <div className="kw-platform kw-platform--enemy" />
    <div className="kw-platform kw-platform--player" />
    {/* The sprites slide in once; everything keyed by the turn replays for each new turn. */}
    <div className="kw-sprite kw-sprite--enemy kw-enter-enemy">
      <div key={turn} className={`kw-cue ${cues.enemy}`}>
        <span lang="ja" className="kw-enemy-kana" data-exhausted={isExhausted(state)}>{enemy.kana}</span>
        {lastEvent?.kind === "hit" && <>
          <span className="kw-burst" data-variant={cues.burst} aria-hidden="true" />
          <span className="kw-damage" data-critical={lastEvent.isCritical} aria-hidden="true">−{lastEvent.damage}</span>
        </>}
      </div>
    </div>
    <div className="kw-sprite kw-sprite--player kw-enter-player">
      <div key={turn} className={`kw-cue kw-cue--player ${cues.player}`}>
        <PlayerAvatar />
        {lastEvent?.kind === "hurt" && <>
          <span className="kw-burst" data-variant="hurt" aria-hidden="true" />
          <span className="kw-damage" aria-hidden="true">−{lastEvent.damage}</span>
        </>}
        {lastEvent?.kind === "blocked" && <>
          <span className="kw-shield" aria-hidden="true" />
          <span className="kw-callout" aria-hidden="true">Blocked!</span>
        </>}
      </div>
    </div>
    <Projectile key={`projectile-${turn}`} event={lastEvent} />
    {lastEvent?.kind === "hurt" && <span key={`flash-${turn}`} className="kw-hurt-flash" aria-hidden="true" />}
    <HpBox side="enemy" name={`Wild ${enemy.kana}`} tag={enemy.vowel ? `-${enemy.vowel}` : null} hp={state.enemyHp} maxHp={ENEMY_MAX_HP} detail={enemyDetail} impactMs={ENEMY_IMPACT_MS} />
    <HpBox side="player" name={getUserName() || "You"} tag={state.stance ? `-${state.stance}` : null} hp={state.playerHp} maxHp={PLAYER_MAX_HP} detail={state.stance ? "stance" : ""} impactMs={PLAYER_IMPACT_MS} />
  </div>;
}
