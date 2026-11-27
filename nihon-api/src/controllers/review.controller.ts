import * as englishReviewService from "../services/english-review.service";
import * as unitReviewService from "../services/unit-review.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getReviewQuestions = action(async (req, res) => {
  return res.json({ questions: await unitReviewService.getReviewQuestions(getUserId(req), req.params.unitId) });
}, { label: "getReviewQuestions", message: "Could not load the review." });

export const getLevelReviewQuestions = action(async (req, res) => {
  return res.json({ questions: await unitReviewService.getLevelReviewQuestions(getUserId(req), req.params.level) });
}, { label: "getLevelReviewQuestions", message: "Could not load the review." });

export const checkReviewAnswer = action(async (req, res) => {
  return res.json(await unitReviewService.checkReviewAnswer(getUserId(req), req.params.unitId, req.body?.questionId, req.body?.answer));
}, { label: "checkReviewAnswer", message: "Could not check the answer. Please try again." });

export const getEnglishReviewQuestions = action(async (req, res) => {
  return res.json({ questions: await englishReviewService.getEnglishReviewRound(getUserId(req), req.params.scope) });
}, { label: "getEnglishReviewQuestions", message: "Could not load the review." });

export const checkEnglishReviewAnswer = action(async (req, res) => {
  return res.json(await englishReviewService.checkEnglishReviewAnswer(getUserId(req), req.body?.questionId, req.body?.answer));
}, { label: "checkEnglishReviewAnswer", message: "Could not check the answer. Please try again." });
