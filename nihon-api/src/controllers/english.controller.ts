import * as englishGameService from "../services/english-game.service";
import { action } from "../utils/action";
import { getOptionalUserId } from "../utils/request-user";

const DEFAULT_MATCH_PAIRS = 6;
const DEFAULT_SCRAMBLE_WORDS = 8;

export const getWordMatchGame = action(async (req, res) => {
  const difficulty = (req.query.difficulty as string) || "all";
  const count = parseInt(req.query.count as string, 10) || DEFAULT_MATCH_PAIRS;
  return res.json(englishGameService.buildWordMatchGame(difficulty, count));
}, { label: "Error in getWordMatchGame:", message: "Server error" });

export const getWordScrambleGame = action(async (req, res) => {
  const count = parseInt(req.query.count as string, 10) || DEFAULT_SCRAMBLE_WORDS;
  return res.json(englishGameService.buildWordScrambleGame(count));
}, { label: "Error in getWordScrambleGame:", message: "Server error" });

export const submitGameScore = action(async (req, res) => {
  const { gameType, score, accuracy, timeTakenSeconds } = req.body;
  const recordedForUser = await englishGameService.recordGameResult(getOptionalUserId(req), req.body);
  return res.json({ success: true, recordedForUser, gameType, score, accuracy, timeTakenSeconds });
}, { label: "Error in submitGameScore:", message: "Server error" });
