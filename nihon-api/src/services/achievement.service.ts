import { measureAchievements } from "../gamification/achievementRules";
import { findAchievement, getAchievementFacts, grantAchievement, listEarnedAchievementIds } from "../repositories/achievement.repository";
import { notifyAchievement } from "./notification.service";
import { getLevelFromXP } from "./progression.service";
import { awardXP } from "./xp.service";

export async function getLearnerFacts(userId: number) {
  const { xp, ...facts } = await getAchievementFacts(userId);
  return { ...facts, level: getLevelFromXP(xp) };
}

async function grantNewAchievements(userId: number): Promise<string[]> {
  const [facts, earned] = await Promise.all([getLearnerFacts(userId), listEarnedAchievementIds(userId)]);
  const newlyEarned: string[] = [];
  for (const { id } of measureAchievements(facts).filter(item => item.isComplete && !earned.has(item.id))) {
    if (!(await grantAchievement(userId, id))) continue;
    const achievement = await findAchievement(id);
    if (!achievement) throw new Error(`Achievement ${id} has a rule but no row; add it in a migration.`);
    await awardXP(userId, achievement.xpReward, "achievement", id);
    newlyEarned.push(id);
    // A missed notification must never undo the achievement itself.
    await notifyAchievement(userId, { id, title: achievement.title }).catch(error => console.error("Achievement notification failed", error));
  }
  return newlyEarned;
}

// Achievement XP can complete a level achievement, so checks repeat until nothing new is earned.
const MAX_PASSES = 3;

/** Grants every achievement the learner now qualifies for; returns the ids earned just now. */
export async function evaluateAchievements(userId: number): Promise<string[]> {
  const earned: string[] = [];
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const fresh = await grantNewAchievements(userId);
    if (!fresh.length) break;
    earned.push(...fresh);
  }
  return earned;
}
