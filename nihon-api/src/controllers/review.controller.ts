import * as unitReviewService from "../services/unit-review.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getReviewQuestions = action(async (req, res) => {
  return res.json({ questions: await unitReviewService.getReviewQuestions(getUserId(req), req.params.unitId) });
}, { label: "getReviewQuestions", message: "Could not load the review." });

export const checkReviewAnswer = action(async (req, res) => {
  return res.json(await unitReviewService.checkReviewAnswer(getUserId(req), req.params.unitId, req.body?.questionId, req.body?.answer));
}, { label: "checkReviewAnswer", message: "Could not check the answer. Please try again." });
