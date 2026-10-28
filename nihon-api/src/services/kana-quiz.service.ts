import type { PoolClient } from "pg";
import { withTransaction } from "../db/transaction";
import { countCorrectAnswers, findKanaById, findRandomKana, listKana, recordKanaAnswer } from "../repositories/kana.repository";
import { findReceipt, insertReceipt, lockKanaSubmissions } from "../repositories/quiz-receipt.repository";
import { recordLearningActivity } from "./streak.service";
import { HttpError } from "../utils/http-error";
import type { KanaScript } from "../utils/kana-script";
import { isRomajiMatch } from "../utils/romaji";
import { XP_RULES } from "../gamification/xpRules";
import { celebrateSavedWork } from "./gamification.service";
import { awardXP } from "./xp.service";
import type { XpAward } from "./xp.service";

const CORRECT_ANSWERS_PER_REWARD = 10;

export type KanaAnswer = { script: KanaScript; kanaId: unknown; answer: unknown; userId?: number; submissionId?: string };

export async function getRandomKana(script: KanaScript) {
  const kana = await findRandomKana(script);
  if (!kana) throw new HttpError(404, "No kana found");
  return { id: kana.id, kana: kana.kana, romaji: kana.romaji, type: script };
}

export async function getKanaCharacters(script: KanaScript) {
  return { type: script, characters: await listKana(script) };
}

// XP is based on durable progress, not on frontend state. Each ten correct
// answers earns one unique event, even though these quizzes have no end screen.
async function rewardMilestone(client: PoolClient, script: KanaScript, userId: number): Promise<XpAward | null> {
  const milestone = Math.floor(await countCorrectAnswers(script, userId, client) / CORRECT_ANSWERS_PER_REWARD);
  return milestone > 0 ? awardXP(Number(userId), XP_RULES.quiz.amount, "quiz", `${script}:correct-${milestone * CORRECT_ANSWERS_PER_REWARD}`, client) : null;
}

/**
 * Grades one answer. Signed-in users also get progress, milestone XP and, when the client sends a
 * submission ID, a receipt in the same transaction so a retried request replays the saved result.
 */
export async function submitKanaAnswer({ script, kanaId, answer, userId, submissionId }: KanaAnswer) {
  const milestones: XpAward[] = [];
  const response = await withTransaction(async client => {
    if (userId && submissionId) {
      await lockKanaSubmissions(userId, client);
      const saved = await findReceipt(userId, submissionId, client);
      if (saved) {
        if (saved.character_type !== script || saved.kana_id !== Number(kanaId) || saved.answer !== String(answer)) {
          throw new HttpError(409, "This submission was already saved with another answer.");
        }
        return saved.response;
      }
    }

    const kana = await findKanaById(script, kanaId, client);
    if (!kana) throw new HttpError(404, "Kana not found");
    const correct = isRomajiMatch(kana.romaji, String(answer));

    if (userId) {
      await recordKanaAnswer(client, script, userId, kanaId, correct);
      await recordLearningActivity(Number(userId), client);
      const milestone = correct ? await rewardMilestone(client, script, userId) : null;
      if (milestone?.awarded) milestones.push(milestone);
    }

    const response = { correct, correctAnswer: kana.romaji, type: script };
    if (userId && submissionId) {
      await insertReceipt(client, { userId, submissionId, script, kanaId, answer: String(answer), response });
    }
    return response;
  });
  // Achievements and level-ups are checked once the answer is saved.
  if (userId && milestones.length) await celebrateSavedWork(Number(userId), milestones);
  return response;
}
