import { withTransaction } from "../db/transaction";
import { creditableSeconds } from "../learning/studyTimeCredit";
import * as studyTimeRepository from "../repositories/study-time.repository";
import { getLearnerToday } from "../repositories/gamification.repository";
import { HttpError } from "../utils/http-error";
import { rewardActivity } from "./gamification.service";

const SECONDS_PER_MINUTE = 60;

async function describeToday(userId: number, secondsToday: number) {
  const goalMinutes = await studyTimeRepository.getDailyGoalMinutes(userId);
  return { secondsToday, minutesToday: Math.floor(secondsToday / SECONDS_PER_MINUTE), goalMinutes, isGoalMet: secondsToday >= goalMinutes * SECONDS_PER_MINUTE };
}

/** Adds active study time reported by the browser, never more than the time that has really passed. */
export async function reportStudyTime(userId: number, seconds: unknown) {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0) throw new HttpError(400, "Report a positive number of seconds.");
  const secondsToday = await withTransaction(async client => {
    const { lastCreditedAt, now } = await studyTimeRepository.findLastCredit(client, userId);
    const credit = creditableSeconds(seconds, lastCreditedAt, now);
    if (credit > 0) return studyTimeRepository.addStudySeconds(client, userId, credit);
    await studyTimeRepository.touchLastCredited(client, userId);
    return null;
  });
  const today = await describeToday(userId, secondsToday ?? await studyTimeRepository.getSecondsToday(userId));
  // Only a report that added time can be the one that met the goal; the reward pays once per day.
  if (secondsToday !== null && today.isGoalMet) await rewardActivity(userId, "daily_goal", `goal:${await getLearnerToday(userId)}`);
  return today;
}

export async function getDailyGoalProgress(userId: number) {
  return describeToday(userId, await studyTimeRepository.getSecondsToday(userId));
}
