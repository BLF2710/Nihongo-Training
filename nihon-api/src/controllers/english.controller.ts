import { Request, Response } from "express";

export interface EnglishWord {
  id: number;
  word: string;
  definition: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  hint?: string;
  synonym?: string;
}

export const ENGLISH_VOCABULARY: EnglishWord[] = [
  // Beginner
  { id: 1, word: "Courage", definition: "The ability to do something that frightens you", category: "Personality", difficulty: "beginner", hint: "Bravery" },
  { id: 2, word: "Delight", definition: "Great pleasure or joy", category: "Emotions", difficulty: "beginner", hint: "Happiness" },
  { id: 3, word: "Discover", definition: "To find unexpectedly or during a search", category: "Action", difficulty: "beginner", hint: "Find out" },
  { id: 4, word: "Journey", definition: "An act of traveling from one place to another", category: "Travel", difficulty: "beginner", hint: "Trip / Voyage" },
  { id: 5, word: "Patient", definition: "Able to accept delays or suffering without becoming annoyed", category: "Personality", difficulty: "beginner", hint: "Calm and enduring" },
  { id: 6, word: "Breeze", definition: "A gentle, light wind", category: "Nature", difficulty: "beginner", hint: "Light wind" },
  { id: 7, word: "Curious", definition: "Eager to know or learn something", category: "Personality", difficulty: "beginner", hint: "Inquisitive" },
  { id: 8, word: "Generous", definition: "Showing a readiness to give more than is necessary", category: "Personality", difficulty: "beginner", hint: "Giving / Unselfish" },
  { id: 9, word: "Ancient", definition: "Belonging to the very distant past", category: "History", difficulty: "beginner", hint: "Very old" },
  { id: 10, word: "Splendid", definition: "Magnificent; very impressive", category: "Descriptive", difficulty: "beginner", hint: "Wonderful" },

  // Intermediate
  { id: 11, word: "Resilient", definition: "Able to withstand or recover quickly from difficult conditions", category: "Personality", difficulty: "intermediate", hint: "Tough / Adaptable" },
  { id: 12, word: "Ambiguous", definition: "Open to more than one interpretation; unclear", category: "Language", difficulty: "intermediate", hint: "Vague / Unclear" },
  { id: 13, word: "Eloquent", definition: "Fluent or persuasive in speaking or writing", category: "Communication", difficulty: "intermediate", hint: "Articulate" },
  { id: 14, word: "Meticulous", definition: "Showing great attention to detail; very careful", category: "Work", difficulty: "intermediate", hint: "Precise / Thorough" },
  { id: 15, word: "Pragmatic", definition: "Dealing with things sensibly and realistically", category: "Philosophy", difficulty: "intermediate", hint: "Practical" },
  { id: 16, word: "Frugal", definition: "Spreading or using money and resources carefully", category: "Lifestyle", difficulty: "intermediate", hint: "Economical / Thrifty" },
  { id: 17, word: "Vulnerable", definition: "Susceptible to physical or emotional attack or harm", category: "Condition", difficulty: "intermediate", hint: "Exposed / Defenseless" },
  { id: 18, word: "Inevitable", definition: "Certain to happen; unavoidable", category: "Concept", difficulty: "intermediate", hint: "Unavoidable" },
  { id: 19, word: "Genuine", definition: "Truly what something is said to be; authentic", category: "Character", difficulty: "intermediate", hint: "Authentic / Real" },
  { id: 20, word: "Versatile", definition: "Able to adapt or be adapted to many different functions", category: "Skill", difficulty: "intermediate", hint: "All-around / Flexible" },

  // Advanced
  { id: 21, word: "Ephemeral", definition: "Lasting for a very short time; fleeting", category: "Time", difficulty: "advanced", hint: "Short-lived / Transient" },
  { id: 22, word: "Ubiquitous", definition: "Present, appearing, or found everywhere", category: "Concept", difficulty: "advanced", hint: "Omnipresent" },
  { id: 23, word: "Serendipity", definition: "The occurrence of events by chance in a happy or beneficial way", category: "Concept", difficulty: "advanced", hint: "Lucky coincidence" },
  { id: 24, word: "Cacophony", definition: "A harsh, discordant mixture of sounds", category: "Sound", difficulty: "advanced", hint: "Harsh noise" },
  { id: 25, word: "Surreptitious", definition: "Kept secret, especially because it would not be approved of", category: "Action", difficulty: "advanced", hint: "Sneaky / Stealthy" }
];

export async function getWordMatchGame(req: Request, res: Response) {
  try {
    const difficulty = (req.query.difficulty as string) || "all";
    const count = parseInt(req.query.count as string, 10) || 6;

    let pool = [...ENGLISH_VOCABULARY];
    if (difficulty !== "all") {
      pool = pool.filter((w) => w.difficulty === difficulty);
    }

    // Shuffle and pick
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    return res.json({
      pairs: selected.map((item) => ({
        id: item.id,
        word: item.word,
        definition: item.definition,
        category: item.category,
        difficulty: item.difficulty
      }))
    });
  } catch (error) {
    console.error("Error in getWordMatchGame:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getWordScrambleGame(req: Request, res: Response) {
  try {
    const count = parseInt(req.query.count as string, 10) || 8;

    const shuffled = [...ENGLISH_VOCABULARY].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const questions = selected.map((item) => {
      const letters = item.word.toUpperCase().split("");
      // Scramble letters until it differs from original
      let scrambled = [...letters].sort(() => 0.5 - Math.random()).join("");
      while (scrambled === item.word.toUpperCase() && letters.length > 1) {
        scrambled = [...letters].sort(() => 0.5 - Math.random()).join("");
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

    return res.json({ questions });
  } catch (error) {
    console.error("Error in getWordScrambleGame:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function submitGameScore(req: Request, res: Response) {
  try {
    const { gameType, score, accuracy, timeTakenSeconds } = req.body;
    const userId = (req as any).user?.userId;

    // Log score and return success
    return res.json({
      success: true,
      recordedForUser: !!userId,
      gameType,
      score,
      accuracy,
      timeTakenSeconds
    });
  } catch (error) {
    console.error("Error in submitGameScore:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
