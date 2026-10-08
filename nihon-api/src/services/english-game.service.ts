import { ENGLISH_VOCABULARY } from "../data/english-vocabulary";
import { insertGameScore } from "../repositories/game-score.repository";
import { awardXP } from "./xp.service";

const GAME_COMPLETION_XP = 10;

export type GameResult = {
  gameType?: string;
  score?: number;
  accuracy?: number;
  timeTakenSeconds?: number;
  difficulty?: string;
  sessionId?: unknown;
};

const randomOrder = () => 0.5 - Math.random();

export function buildWordMatchGame(difficulty: string, count: number) {
  let wordPool = [...ENGLISH_VOCABULARY];
  if (difficulty !== "all") {
    wordPool = wordPool.filter((w) => w.difficulty === difficulty);
  }

  // Shuffle and pick
  const shuffled = wordPool.sort(randomOrder);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return {
    pairs: selected.map((item) => ({
      id: item.id,
      word: item.word,
      definition: item.definition,
      category: item.category,
      difficulty: item.difficulty
    }))
  };
}

export function buildWordScrambleGame(count: number) {
  const shuffled = [...ENGLISH_VOCABULARY].sort(randomOrder);
  const selected = shuffled.slice(0, count);

  const questions = selected.map((item) => {
    const letters = item.word.toUpperCase().split("");
    // Scramble letters until it differs from original
    let scrambled = [...letters].sort(randomOrder).join("");
    while (scrambled === item.word.toUpperCase() && letters.length > 1) {
      scrambled = [...letters].sort(randomOrder).join("");
    }

    return {
      id: item.id,
      wordLength: item.word.length,
      scrambledLetters: scrambled.split(""),
      originalWord: item.word,
      definition: item.definition,
      hint: item.hint,
      category: item.category,
      difficulty: item.difficulty
    };
  });

  return { questions };
}

/** Saves a signed-in player's result once per session and rewards it; guests are never recorded. */
export async function recordGameResult(userId: number | undefined, result: GameResult): Promise<boolean> {
  if (!userId) return false;
  const scoreId = await insertGameScore(userId, {
    gameType: result.gameType || "unknown",
    score: result.score || 0,
    accuracy: result.accuracy || 0,
    difficulty: result.difficulty || "all",
    timeTakenSeconds: result.timeTakenSeconds || 0,
    sessionId: typeof result.sessionId === "string" && result.sessionId.length > 0 ? result.sessionId : null
  });
  if (scoreId === null) return false;
  await awardXP(Number(userId), GAME_COMPLETION_XP, "game", `game-score:${scoreId}`);
  return true;
}
