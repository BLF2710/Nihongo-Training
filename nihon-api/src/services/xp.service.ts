import type { PoolClient } from "pg";
import { withTransaction } from "../db/transaction";
import { cappedAmount } from "../gamification/xpRules";
import type { XPSource } from "../gamification/xpRules";
import { addXp, insertXpEvent, lockXp, sumXpToday } from "../repositories/gamification.repository";
import { getLevelFromXP, getRankFromXP } from "./progression.service";
import { recordLearningActivity } from "./streak.service";

export type { XPSource } from "../gamification/xpRules";

export type XpAward = { awarded: boolean; amount: number; oldXp: number; xp: number; oldLevel: number; level: number; oldRank: string; rank: string };

async function applyAward(client: PoolClient, userId: number, requested: number, source: XPSource, referenceId: string): Promise<XpAward> {
  const oldXp = await lockXp(userId, client);
  if (oldXp === null) throw new Error("Gamification profile not found");
  // The row lock above also serialises the daily-cap check for this learner.
  const amount = cappedAmount(source, requested, await sumXpToday(client, userId, source));
  // Each (source, reference) pays out once; a repeat, or an award over today's cap, reports the unchanged totals.
  const awarded = amount > 0 && await insertXpEvent(client, userId, amount, source, referenceId);
  const xp = awarded ? await addXp(client, userId, amount) : oldXp;
  // Learning work counts toward the daily streak (repeating a lesson too); automatic rewards do not.
  if (source !== "achievement" && source !== "streak") await recordLearningActivity(userId, client);
  return { awarded, amount: awarded ? amount : 0, oldXp, xp, oldLevel: getLevelFromXP(oldXp), level: getLevelFromXP(xp), oldRank: getRankFromXP(oldXp), rank: getRankFromXP(xp) };
}

export async function awardXP(userId: number, amount: number, source: XPSource, referenceId: string, transaction?: PoolClient): Promise<XpAward> {
  if (!Number.isInteger(amount) || amount <= 0 || !referenceId) throw new Error("Invalid XP award");
  // Answer receipts and their reward can share one transaction when needed.
  if (transaction) return applyAward(transaction, userId, amount, source, referenceId);
  return withTransaction(client => applyAward(client, userId, amount, source, referenceId));
}
