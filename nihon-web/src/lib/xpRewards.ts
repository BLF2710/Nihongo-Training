/** What a finished activity earned, as the API sends it in a response's `reward` field. */
export type XpReward = {
  xpEarned: number; xp: number; level: number; leveledUp: boolean; rank: string; rankedUp: boolean;
  unlocked: { id: string; title: string; icon: string }[];
};

/** What the pop-up shows: one or more rewards that arrived close together, added up. */
export type RewardToast = { xp: number; level: number | null; rank: string | null; unlocked: XpReward["unlocked"] };

const REWARD_EVENT = "lingora:xp-reward";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;
const isUnlocked = (value: unknown): value is XpReward["unlocked"][number] =>
  isRecord(value) && typeof value.id === "string" && typeof value.title === "string" && typeof value.icon === "string";

/** The reward in an API response body, or null when there is none (or it isn't shaped like one). */
export function readReward(body: unknown): XpReward | null {
  const reward = isRecord(body) ? body.reward : undefined;
  if (!isRecord(reward)) return null;
  const { xpEarned, xp, level, leveledUp, rank, rankedUp, unlocked } = reward;
  if (typeof xpEarned !== "number" || typeof xp !== "number" || typeof level !== "number" || typeof leveledUp !== "boolean") return null;
  if (typeof rank !== "string" || typeof rankedUp !== "boolean" || !Array.isArray(unlocked) || !unlocked.every(isUnlocked)) return null;
  return { xpEarned, xp, level, leveledUp, rank, rankedUp, unlocked };
}

/** A reward over a daily limit (or a repeat) earned nothing new and isn't shown. */
export const isWorthShowing = (reward: XpReward) => reward.xpEarned > 0 || reward.leveledUp || reward.rankedUp || reward.unlocked.length > 0;

/** Adds a new reward to the one on screen, so quick answers (daily review) show one growing total. */
export function addReward(current: RewardToast | null, reward: XpReward): RewardToast {
  return {
    xp: (current?.xp ?? 0) + reward.xpEarned,
    level: reward.leveledUp ? reward.level : current?.level ?? null,
    rank: reward.rankedUp ? reward.rank : current?.rank ?? null,
    unlocked: [...(current?.unlocked ?? []), ...reward.unlocked.filter(item => !current?.unlocked.some(shown => shown.id === item.id))],
  };
}

/** A level, rank or achievement stays on screen longer than XP alone. */
export const isMilestone = (toast: RewardToast) => toast.level !== null || toast.rank !== null || toast.unlocked.length > 0;

export function announceReward(reward: XpReward) {
  window.dispatchEvent(new CustomEvent<XpReward>(REWARD_EVENT, { detail: reward }));
}

/** Calls the listener for every announced reward; returns the function that stops listening. */
export function listenForRewards(listener: (reward: XpReward) => void): () => void {
  const handle = (event: Event) => { if (event instanceof CustomEvent) listener(event.detail as XpReward); };
  window.addEventListener(REWARD_EVENT, handle);
  return () => window.removeEventListener(REWARD_EVENT, handle);
}
