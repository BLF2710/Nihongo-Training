import * as kanaQuizService from "../services/kana-quiz.service";
import { action } from "../utils/action";
import { HttpError } from "../utils/http-error";
import { parseKanaScript } from "../utils/kana-script";
import type { KanaScript } from "../utils/kana-script";
import { getOptionalUserId } from "../utils/request-user";
import { isUuid } from "../utils/validation";

// Grading helper kept on the controller's public surface for the verification scripts.
export { isRomajiMatch } from "../utils/romaji";

export const getRandomKana = action(async (req, res) => {
  return res.json(await kanaQuizService.getRandomKana(parseKanaScript(req.query.type)));
}, { label: "Error in getRandomKana:", message: "Server error" });

export const getKanaCharacters = action(async (req, res) => {
  return res.json(await kanaQuizService.getKanaCharacters(parseKanaScript(req.query.type)));
}, { label: "Error in getKanaCharacters:", message: "Server error" });

export const submitAnswer = action(async (req, res) => {
  const { hiraganaId, katakanaId, kanaId, type, answer, submissionId } = req.body;
  // Older clients identify the script by which ID field they send.
  const script: KanaScript = (type === "katakana" || katakanaId !== undefined) ? "katakana" : "hiragana";
  const id = kanaId || (script === "katakana" ? katakanaId : hiraganaId);
  if (!id || answer === undefined) throw new HttpError(400, "id and answer are required");
  if (submissionId !== undefined && !isUuid(submissionId)) throw new HttpError(400, "Invalid submission ID");

  return res.json(await kanaQuizService.submitKanaAnswer({ script, kanaId: id, answer, userId: getOptionalUserId(req), submissionId }));
}, { label: "Error in submitAnswer:", message: "Server error" });
