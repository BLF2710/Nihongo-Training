import type { PoolClient } from "pg";
import { withTransaction } from "../db/transaction";
import { addXp, insertXpEvent, lockXp } from "../repositories/gamification.repository";
import { getLevelFromXP, getRankFromXP } from "./progression.service";

export type XPSource = "lesson_completion" | "lesson_challenge" | "quiz" | "game" | "achievement" | "streak";

async function applyAward(client: PoolClient, userId: number, amount: number, source: XPSource, referenceId: string) {
  const oldXp = await lockXp(userId, client);
  if (oldXp === null) throw new Error("Gamification profile not found");
  // Each (source, reference) pays out once; a repeat reports the unchanged totals.
  const awarded = await insertXpEvent(client, userId, amount, source, referenceId);
  const xp = awarded ? await addXp(client, userId, amount) : oldXp;
  return { awarded, oldXp, xp, oldLevel: getLevelFromXP(oldXp), level: getLevelFromXP(xp), oldRank: getRankFromXP(oldXp), rank: getRankFromXP(xp) };
}

export async function awardXP(userId: number, amount: number, source: XPSource, referenceId: string, transaction?: PoolClient) {
  if (!Number.isInteger(amount) || amount <= 0 || !referenceId) throw new Error("Invalid XP award");
  // Answer receipts and their reward can share one transaction when needed.
  if (transaction) return applyAward(transaction, userId, amount, source, referenceId);
  return withTransaction(client => applyAward(client, userId, amount, source, referenceId));
}
