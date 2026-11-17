import { measureAchievements } from "../gamification/achievementRules";
import { ACTIVITY_SOURCES, XP_RULES } from "../gamification/xpRules";
import type { ActivitySource } from "../gamification/xpRules";
import { listAchievementCatalog, listAchievementsByIds } from "../repositories/achievement.repository";
import { getLearnerToday, getXp, listRecentXpEvents, listXpTodayBySource } from "../repositories/gamification.repository";
import { findProfileSummary } from "../repositories/profile.repository";
import { evaluateAchievements, getLearnerFacts } from "./achievement.service";
import { notifyLevelUp } from "./notification.service";
import { getLevelFromXP, getNextRank, getRankFromXP, getXPProgress, RANK_THRESHOLDS } from "./progression.service";
import { awardXP } from "./xp.service";
import type { XpAward } from "./xp.service";

const RECENT_XP_EVENTS = 15;

/** What a finished activity earned, for the client to celebrate. */
export type Reward = {
  xpEarned: number; xp: number; level: number; leveledUp: boolean; rank: string; rankedUp: boolean;
  /** Ids of the achievements earned just now; `unlocked` has their titles and icons for display. */
  achievements: string[]; unlocked: { id: string; title: string; icon: string }[];
};

const NOTHING_NEW = (xp: number): Reward => ({ xpEarned: 0, xp, level: getLevelFromXP(xp), leveledUp: false, rank: getRankFromXP(xp), rankedUp: false, achievements: [], unlocked: [] });

/**
 * After XP was paid: grants any achievements the learner now qualifies for and announces a new level.
 * The awards are in the order they were paid; null stands for an award that wasn't due.
 */
export async function celebrate(userId: number, awards: (XpAward | null)[]): Promise<Reward> {
  const paid = awards.filter((award): award is XpAward => award !== null);
  const startXp = paid[0]?.oldXp ?? await getXp(userId);
  const achievements = await evaluateAchievements(userId);
  // Achievement XP can add a level too, so the level is read after the achievements.
  const xp = await getXp(userId);
  const level = getLevelFromXP(xp), rank = getRankFromXP(xp);
  const leveledUp = level > getLevelFromXP(startXp);
  if (leveledUp) await notifyLevelUp(userId, level).catch(error => console.error("Level-up notification failed", error));
  const unlocked = achievements.length ? await listAchievementsByIds(achievements) : [];
  return { xpEarned: paid.reduce((total, award) => total + award.amount, 0), xp, level, leveledUp, rank, rankedUp: rank !== getRankFromXP(startXp), achievements, unlocked };
}

/** celebrate() for work that is already saved: a failure is logged, and null stands for "nothing to celebrate". */
export async function celebrateSavedWork(userId: number, awards: (XpAward | null)[]): Promise<Reward | null> {
  try {
    return await celebrate(userId, awards);
  } catch (error) {
    console.error("Achievement check failed", error);
    return null;
  }
}

export type ActivityReward = { source: ActivitySource; referenceId: string };

/**
 * Pays activities' XP (each once per reference) and celebrates them. The activity itself is already saved, so a
 * failed reward is logged and the learner keeps their work; null then stands for "no reward this time".
 */
export async function rewardActivities(userId: number, rewards: ActivityReward[]): Promise<Reward | null> {
  try {
    const awards: XpAward[] = [];
    for (const { source, referenceId } of rewards) awards.push(await awardXP(userId, XP_RULES[source].amount, source, referenceId));
    const last = awards[awards.length - 1];
    // Nothing new (a repeat, or today's cap reached): there is nothing to check or celebrate.
    if (!last || !awards.some(award => award.awarded)) return NOTHING_NEW(last?.xp ?? 0);
    return await celebrate(userId, awards);
  } catch (error) {
    console.error("XP reward failed", error);
    return null;
  }
}

export const rewardActivity = (userId: number, source: ActivitySource, referenceId: string) => rewardActivities(userId, [{ source, referenceId }]);

/** Everything the Achievements page shows: level, rank, today's XP by activity, achievements with progress, recent XP. */
export async function getGamificationSummary(userId: number) {
  const [profile, facts, catalog, today, earnedToday, recent] = await Promise.all([
    findProfileSummary(userId), getLearnerFacts(userId), listAchievementCatalog(userId), getLearnerToday(userId), listXpTodayBySource(userId), listRecentXpEvents(userId, RECENT_XP_EVENTS),
  ]);
  const xp = Number(profile?.xp ?? 0);
  const progress = new Map(measureAchievements(facts).map(item => [item.id, item]));
  const earnedBySource = new Map(earnedToday.map(row => [row.source, row.earned]));
  return {
    xp, level: getXPProgress(xp), rank: getRankFromXP(xp), nextRank: getNextRank(xp), ranks: RANK_THRESHOLDS,
    streak: { current: Number(profile?.current_streak ?? 0), longest: Number(profile?.longest_streak ?? 0) },
    today: {
      date: today, xp: earnedToday.reduce((total, row) => total + row.earned, 0),
      activities: ACTIVITY_SOURCES.map(source => ({ source, ...XP_RULES[source], earned: earnedBySource.get(source) ?? 0 })),
    },
    // An achievement without a rule (none today) shows as a one-step goal.
    achievements: catalog.map(item => {
      const measured = progress.get(item.id);
      const goal = measured?.goal ?? 1;
      return { ...item, goal, progress: item.earnedAt ? goal : measured?.progress ?? 0 };
    }),
    recent,
  };
}
