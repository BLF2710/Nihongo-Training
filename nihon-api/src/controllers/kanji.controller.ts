import * as kanjiPracticeService from "../services/kanji-practice.service";
import { action } from "../utils/action";
import { HttpError } from "../utils/http-error";
import { getUserId } from "../utils/request-user";
import { isUuid } from "../utils/validation";

const CHOICES_PER_QUESTION = 4;

export const getProgress = action(async (req, res) => {
  return res.json({ progress: await kanjiPracticeService.getKanjiProgress(getUserId(req)) });
}, { label: "Kanji progress", message: "Could not load Kanji progress." });

export const startPractice = action(async (req, res) => {
  const size: unknown = req.body?.size;
  const kanjiId: unknown = req.body?.kanjiId;
  if (typeof size !== "number" || !kanjiPracticeService.PRACTICE_SIZES.includes(size) || (kanjiId !== undefined && typeof kanjiId !== "string")) {
    throw new HttpError(400, "Choose 3, 5, or 10 questions and a valid Kanji.");
  }
  return res.json({ questions: await kanjiPracticeService.startKanjiPractice(getUserId(req), size, kanjiId) });
}, { label: "Kanji practice", message: "Could not start practice." });

export const submitAnswer = action(async (req, res) => {
  const { questionId, answerIndex } = req.body ?? {};
  if (!isUuid(questionId) || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= CHOICES_PER_QUESTION) {
    throw new HttpError(400, "Choose one of the four answers.");
  }
  return res.json(await kanjiPracticeService.answerKanjiQuestion(getUserId(req), questionId, answerIndex));
}, { label: "Kanji answer", message: "Could not save the answer. You can safely retry." });
