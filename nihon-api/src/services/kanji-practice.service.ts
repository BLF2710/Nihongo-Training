import { randomUUID } from "crypto";
import { withTransaction } from "../db/transaction";
import {
  findKanjiProgress, insertPracticeQuestion, listKanjiProgress, lockPracticeQuestion, recordKanjiAnswer, savePracticeAnswer,
} from "../repositories/kanji.repository";
import { HttpError } from "../utils/http-error";
import { characterProgress } from "./character-progress";
import { catalog, makeKanjiQuestion, shuffled, PracticeKind } from "./kanji.service";

export const PRACTICE_SIZES = [3, 5, 10];
const PRACTICE_KINDS: PracticeKind[] = ["meaning", "reading", "vocabulary"];

export async function getKanjiProgress(userId: number) {
  const saved = await listKanjiProgress(userId);
  return catalog.kanji.map(kanji => {
    const row = saved.find(item => item.kanji_id === kanji.id);
    return { kanjiId: kanji.id, ...characterProgress(Number(row?.correct_count ?? 0), Number(row?.wrong_count ?? 0)), lastPracticedAt: row?.last_practiced_at ?? null };
  });
}

/** Creates a practice set for one Kanji, or a shuffled mix when none is chosen. Answer keys stay on the server. */
export async function startKanjiPractice(userId: number, size: number, kanjiId: string | undefined) {
  const available = kanjiId !== undefined ? catalog.kanji.filter(kanji => kanji.id === kanjiId) : shuffled(catalog.kanji);
  if (!available.length) throw new HttpError(404, "Kanji not found.");
  return withTransaction(async client => {
    const questions = [];
    for (let i = 0; i < size; i++) {
      const { correctIndex, ...question } = makeKanjiQuestion(available[i % available.length].id, PRACTICE_KINDS[i % PRACTICE_KINDS.length]);
      const id = randomUUID();
      await insertPracticeQuestion(client, { id, userId, kanjiId: question.kanjiId, kind: question.kind, options: question.options, correctIndex });
      questions.push({ id, ...question });
    }
    return questions;
  });
}

/** Grades a practice question once; repeating the same answer is safe, changing it is rejected. */
export async function answerKanjiQuestion(userId: number, questionId: string, answerIndex: number) {
  return withTransaction(async client => {
    const question = await lockPracticeQuestion(questionId, userId, client);
    if (!question) throw new HttpError(404, "Question not found.");
    if (question.answer_index !== null && question.answer_index !== answerIndex) {
      throw new HttpError(409, "This question already has a saved answer.");
    }
    const correct = answerIndex === question.correct_index;
    if (question.answer_index === null) {
      await recordKanjiAnswer(client, userId, question.kanji_id, correct);
      await savePracticeAnswer(client, questionId, answerIndex);
    }
    const saved = await findKanjiProgress(userId, question.kanji_id, client);
    return {
      correct, correctAnswer: question.options[question.correct_index],
      progress: { kanjiId: question.kanji_id, ...characterProgress(saved.correct_count, saved.wrong_count), lastPracticedAt: saved.last_practiced_at },
    };
  });
}
