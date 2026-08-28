import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

// Types
type MatchPair = {
  id: number;
  word: string;
  definition: string;
  category: string;
  difficulty: string;
};

type Tile = {
  id: string; // unique tile id
  pairId: number;
  type: "word" | "definition";
  text: string;
  category: string;
  matched: boolean;
};

type ScrambleQuestion = {
  id: number;
  wordLength: number;
  scrambledLetters: string[];
  originalWord: string;
  definition: string;
  hint?: string;
  category: string;
  difficulty: string;
};

export default function EnglishArcadePage() {
  const navigate = useNavigate();

  // Mode: "match" | "scramble"
  const [activeGame, setActiveGame] = useState<"match" | "scramble">("match");
  const [difficulty, setDifficulty] = useState<string>("all");

  // ==========================================
  // GAME 1: WORD MATCH CHALLENGE STATE
  // ==========================================
  const [matchTiles, setMatchTiles] = useState<Tile[]>([]);
  const [selectedWordTile, setSelectedWordTile] = useState<Tile | null>(null);
  const [selectedDefTile, setSelectedDefTile] = useState<Tile | null>(null);
  const [matchScore, setMatchScore] = useState(0);
  const [matchCombo, setMatchCombo] = useState(0);
  const [matchTimeLeft, setMatchTimeLeft] = useState(60);
  const [matchGameActive, setMatchGameActive] = useState(false);
  const [matchGameOver, setMatchGameOver] = useState(false);
  const [matchAttempts, setMatchAttempts] = useState(0);
  const [matchSuccesses, setMatchSuccesses] = useState(0);
  const [wrongShakePair, setWrongShakePair] = useState<string[]>([]);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // ==========================================
  // GAME 2: WORD SCRAMBLE ARCADE STATE
  // ==========================================
  const [scrambleQuestions, setScrambleQuestions] = useState<ScrambleQuestion[]>([]);
  const [currentScrambleIndex, setCurrentScrambleIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [availableLetterIndices, setAvailableLetterIndices] = useState<number[]>([]);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleStreak, setScrambleStreak] = useState(0);
  const [scrambleTimeLeft, setScrambleTimeLeft] = useState(45);
  const [scrambleGameActive, setScrambleGameActive] = useState(false);
  const [scrambleGameOver, setScrambleGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [scrambleFeedback, setScrambleFeedback] = useState<"correct" | "wrong" | null>(null);
  const [loadingScramble, setLoadingScramble] = useState(false);

  // Timers
  const matchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrambleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ==========================================
  // WORD MATCH FUNCTIONS
  // ==========================================
  const startMatchGame = useCallback(async () => {
    try {
      setLoadingMatch(true);
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);

      const res = await api.get("/english/games/match", {
        params: { difficulty, count: 6 }
      });

      const pairs: MatchPair[] = res.data.pairs;

      const words: Tile[] = pairs.map((p) => ({
        id: `w-${p.id}`,
        pairId: p.id,
        type: "word",
        text: p.word,
        category: p.category,
        matched: false
      }));

      const defs: Tile[] = pairs.map((p) => ({
        id: `d-${p.id}`,
        pairId: p.id,
        type: "definition",
        text: p.definition,
        category: p.category,
        matched: false
      }));

      // Shuffle separately
      const shuffledWords = [...words].sort(() => 0.5 - Math.random());
      const shuffledDefs = [...defs].sort(() => 0.5 - Math.random());

      // Combine side-by-side or interleaved
      setMatchTiles([...shuffledWords, ...shuffledDefs]);
      setSelectedWordTile(null);
      setSelectedDefTile(null);
      setMatchScore(0);
      setMatchCombo(0);
      setMatchAttempts(0);
      setMatchSuccesses(0);
      setMatchTimeLeft(60);
      setMatchGameOver(false);
      setMatchGameActive(true);
    } catch (error) {
      console.error("Error starting match game:", error);
    } finally {
      setLoadingMatch(false);
    }
  }, [difficulty]);

  // Match Game Timer
  useEffect(() => {
    if (matchGameActive && !matchGameOver) {
      matchTimerRef.current = setInterval(() => {
        setMatchTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(matchTimerRef.current!);
            setMatchGameOver(true);
            setMatchGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    };
  }, [matchGameActive, matchGameOver]);

  const handleTileClick = (tile: Tile) => {
    if (!matchGameActive || tile.matched) return;

    if (tile.type === "word") {
      if (selectedWordTile?.id === tile.id) {
        setSelectedWordTile(null);
        return;
      }
      setSelectedWordTile(tile);

      if (selectedDefTile) {
        checkMatch(tile, selectedDefTile);
      }
    } else {
      if (selectedDefTile?.id === tile.id) {
        setSelectedDefTile(null);
        return;
      }
      setSelectedDefTile(tile);

      if (selectedWordTile) {
        checkMatch(selectedWordTile, tile);
      }
    }
  };

  const checkMatch = (wordTile: Tile, defTile: Tile) => {
    setMatchAttempts((prev) => prev + 1);

    if (wordTile.pairId === defTile.pairId) {
      // MATCH!
      const multiplier = 1 + matchCombo * 0.5;
      const points = Math.round(100 * multiplier);

      setMatchScore((prev) => prev + points);
      setMatchCombo((prev) => prev + 1);
      setMatchSuccesses((prev) => prev + 1);

      setMatchTiles((prev) =>
        prev.map((t) =>
          t.id === wordTile.id || t.id === defTile.id ? { ...t, matched: true } : t
        )
      );

      setSelectedWordTile(null);
      setSelectedDefTile(null);

      // Check if all matched
      setTimeout(() => {
        setMatchTiles((currentTiles) => {
          const allMatched = currentTiles.every((t) => t.matched);
          if (allMatched && currentTiles.length > 0) {
            // Give bonus points and load new round!
            setMatchScore((s) => s + 500);
            setMatchTimeLeft((t) => Math.min(t + 15, 60));
            startMatchGame();
          }
          return currentTiles;
        });
      }, 300);
    } else {
      // WRONG
      setMatchCombo(0);
      setWrongShakePair([wordTile.id, defTile.id]);

      setTimeout(() => {
        setWrongShakePair([]);
        setSelectedWordTile(null);
        setSelectedDefTile(null);
      }, 500);
    }
  };

  // ==========================================
  // WORD SCRAMBLE FUNCTIONS
  // ==========================================
  const startScrambleGame = useCallback(async () => {
    try {
      setLoadingScramble(true);
      if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);

      const res = await api.get("/english/games/scramble", {
        params: { count: 10 }
      });

      const qs: ScrambleQuestion[] = res.data.questions;
      setScrambleQuestions(qs);
      setCurrentScrambleIndex(0);
      setScrambleScore(0);
      setScrambleStreak(0);
      setScrambleTimeLeft(45);
      setScrambleGameOver(false);
      setScrambleGameActive(true);
      setShowHint(false);
      setScrambleFeedback(null);

      if (qs.length > 0) {
        setUserLetters([]);
        setAvailableLetterIndices(qs[0].scrambledLetters.map((_, i) => i));
      }
    } catch (error) {
      console.error("Error starting scramble game:", error);
    } finally {
      setLoadingScramble(false);
    }
  }, []);

  // Scramble Timer
  useEffect(() => {
    if (scrambleGameActive && !scrambleGameOver) {
      scrambleTimerRef.current = setInterval(() => {
        setScrambleTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(scrambleTimerRef.current!);
            setScrambleGameOver(true);
            setScrambleGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (scrambleTimerRef.current) clearInterval(scrambleTimerRef.current);
    };
  }, [scrambleGameActive, scrambleGameOver]);

  const currentQ = scrambleQuestions[currentScrambleIndex];

  const handleLetterSelect = (letterIndex: number) => {
    if (!scrambleGameActive || !currentQ) return;
    if (!availableLetterIndices.includes(letterIndex)) return;

    const letter = currentQ.scrambledLetters[letterIndex];
    const newLetters = [...userLetters, letter];
    setUserLetters(newLetters);
    setAvailableLetterIndices((prev) => prev.filter((i) => i !== letterIndex));

    // Check if word completed
    if (newLetters.length === currentQ.originalWord.length) {
      const formedWord = newLetters.join("");
      if (formedWord.toUpperCase() === currentQ.originalWord.toUpperCase()) {
        // Correct!
        setScrambleFeedback("correct");
        const points = 150 + scrambleStreak * 50;
        setScrambleScore((s) => s + points);
        setScrambleStreak((st) => st + 1);
        setScrambleTimeLeft((t) => Math.min(t + 8, 60));

        setTimeout(() => {
          advanceScramble(currentScrambleIndex + 1);
        }, 500);
      } else {
        // Incorrect
        setScrambleFeedback("wrong");
        setScrambleStreak(0);
        setTimeout(() => {
          setScrambleFeedback(null);
          // Return letters
          setUserLetters([]);
          setAvailableLetterIndices(currentQ.scrambledLetters.map((_, i) => i));
        }, 600);
      }
    }
  };

  const handleRemoveLetter = (indexToRemove: number) => {
    if (!scrambleGameActive || !currentQ) return;
    const removedLetter = userLetters[indexToRemove];

    // Find the first index in scrambledLetters matching removedLetter not currently in availableLetterIndices
    const restoredIndex = currentQ.scrambledLetters.findIndex(
      (l, i) => l === removedLetter && !availableLetterIndices.includes(i)
    );

    setUserLetters((prev) => prev.filter((_, i) => i !== indexToRemove));
    if (restoredIndex !== -1) {
      setAvailableLetterIndices((prev) => [...prev, restoredIndex]);
    }
  };

  const advanceScramble = (nextIndex: number) => {
    if (nextIndex >= scrambleQuestions.length) {
      // Finished all questions!
      setScrambleGameOver(true);
      setScrambleGameActive(false);
      return;
    }

    setCurrentScrambleIndex(nextIndex);
    setUserLetters([]);
    setShowHint(false);
    setScrambleFeedback(null);
    setAvailableLetterIndices(scrambleQuestions[nextIndex].scrambledLetters.map((_, i) => i));
  };

  // Auto-start active game on mount
  useEffect(() => {
    if (activeGame === "match") {
      startMatchGame();
    } else {
      startScrambleGame();
    }
  }, [activeGame, startMatchGame, startScrambleGame]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col">
        {/* Top Controls & Game Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700 shadow-xs cursor-pointer"
            >
              ← Dashboard
            </button>

            {/* Game Mode Tabs */}
            <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => setActiveGame("match")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeGame === "match"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🧩</span>
                <span>Word Match</span>
              </button>

              <button
                onClick={() => setActiveGame("scramble")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeGame === "scramble"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span>🔤</span>
                <span>Word Scramble</span>
              </button>
            </div>
          </div>

          {/* Difficulty Dropdown */}
          {activeGame === "match" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Difficulty:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-white border border-gray-200 text-xs font-bold text-gray-700 px-3 py-1.5 rounded-lg shadow-xs cursor-pointer outline-none focus:border-indigo-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* GAME 1: WORD MATCH CHALLENGE VIEW                         */}
        {/* ========================================================= */}
        {activeGame === "match" && (
          <div className="flex-1 flex flex-col">
            {/* Score & Timer Header */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</div>
                <div className="text-2xl font-black text-indigo-600 mt-0.5">{matchScore}</div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Time Left</div>
                <div
                  className={`text-2xl font-black mt-0.5 ${
                    matchTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"
                  }`}
                >
                  ⏱️ {matchTimeLeft}s
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Combo Streak</div>
                <div className="text-2xl font-black text-orange-500 mt-0.5">
                  🔥 {matchCombo}x
                </div>
              </div>
            </div>

            {/* Match Grid */}
            {loadingMatch ? (
              <div className="py-24 text-center text-gray-400 text-xl font-medium animate-pulse">
                Loading Word Match Game...
              </div>
            ) : matchGameOver ? (
              /* Game Over Screen */
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-md mx-auto w-full text-center animate-in zoom-in-95 duration-200 my-auto">
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Time's Up!</h2>
                <p className="text-sm text-gray-500 mb-6">Great speed and vocabulary recall!</p>

                <div className="bg-indigo-50 rounded-2xl p-4 mb-6 border border-indigo-100">
                  <div className="text-xs text-indigo-600 font-bold uppercase">Final Score</div>
                  <div className="text-4xl font-extrabold text-indigo-700 mt-1">{matchScore} pts</div>
                  <div className="text-xs text-indigo-500 mt-1">
                    Matched {matchSuccesses} of {matchAttempts} attempts (
                    {matchAttempts > 0 ? Math.round((matchSuccesses / matchAttempts) * 100) : 0}% accuracy)
                  </div>
                </div>

                <button
                  onClick={startMatchGame}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Play Again 🔄
                </button>
              </div>
            ) : (
              /* Tiles Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 flex-1">
                {matchTiles.map((tile) => {
                  const isWord = tile.type === "word";
                  const isSelected =
                    (isWord && selectedWordTile?.id === tile.id) ||
                    (!isWord && selectedDefTile?.id === tile.id);
                  const isWrong = wrongShakePair.includes(tile.id);

                  if (tile.matched) {
                    return (
                      <div
                        key={tile.id}
                        className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-center text-center opacity-40 select-none"
                      >
                        <span className="text-xs font-bold text-emerald-700">✓ Matched</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile)}
                      className={`rounded-2xl p-4.5 text-center flex flex-col items-center justify-center transition-all cursor-pointer shadow-xs min-h-[110px] select-none ${
                        isWrong
                          ? "bg-red-100 border-2 border-red-500 text-red-900 animate-shake"
                          : isSelected
                          ? "bg-indigo-600 text-white border-2 border-indigo-700 scale-105 shadow-md"
                          : isWord
                          ? "bg-white hover:bg-indigo-50/60 border-2 border-indigo-100 text-gray-900 hover:border-indigo-300"
                          : "bg-white hover:bg-purple-50/60 border-2 border-purple-100 text-gray-700 hover:border-purple-300"
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isWord
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-purple-50 text-purple-700"
                        }`}
                      >
                        {isWord ? "Word" : "Definition"}
                      </span>

                      <span className={`leading-snug ${isWord ? "text-lg font-bold" : "text-xs font-medium"}`}>
                        {tile.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* GAME 2: WORD SCRAMBLE ARCADE VIEW                         */}
        {/* ========================================================= */}
        {activeGame === "scramble" && (
          <div className="flex-1 flex flex-col">
            {/* Score & Progress Header */}
            <div className="grid grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</div>
                <div className="text-2xl font-black text-purple-600 mt-0.5">{scrambleScore}</div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Time Left</div>
                <div
                  className={`text-2xl font-black mt-0.5 ${
                    scrambleTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"
                  }`}
                >
                  ⏱️ {scrambleTimeLeft}s
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Streak</div>
                <div className="text-2xl font-black text-orange-500 mt-0.5">
                  🔥 {scrambleStreak}
                </div>
              </div>
            </div>

            {loadingScramble ? (
              <div className="py-24 text-center text-gray-400 text-xl font-medium animate-pulse">
                Loading Word Scramble Arcade...
              </div>
            ) : scrambleGameOver ? (
              /* Game Over Screen */
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-md mx-auto w-full text-center animate-in zoom-in-95 duration-200 my-auto">
                <div className="text-5xl mb-3">🔤</div>
                <h2 className="text-3xl font-black text-gray-900 mb-1">Arcade Complete!</h2>
                <p className="text-sm text-gray-500 mb-6">Fantastic spelling speed and accuracy!</p>

                <div className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-100">
                  <div className="text-xs text-purple-600 font-bold uppercase">Total Score</div>
                  <div className="text-4xl font-extrabold text-purple-700 mt-1">{scrambleScore} pts</div>
                  <div className="text-xs text-purple-500 mt-1">
                    Solved words with {scrambleStreak} max streak
                  </div>
                </div>

                <button
                  onClick={startScrambleGame}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Play Again 🔄
                </button>
              </div>
            ) : (
              currentQ && (
                /* Active Scramble Puzzle Card */
                <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-10 max-w-2xl mx-auto w-full flex flex-col items-center">
                  {/* Category & Clue */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase font-bold tracking-wider bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {currentQ.category}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">
                      Word {currentScrambleIndex + 1} of {scrambleQuestions.length}
                    </span>
                  </div>

                  {/* Definition Prompt */}
                  <p className="text-base sm:text-lg text-center text-gray-700 font-medium max-w-lg mb-8">
                    "{currentQ.definition}"
                  </p>

                  {/* User Answer Slots */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 min-h-[56px]">
                    {Array.from({ length: currentQ.originalWord.length }).map((_, i) => {
                      const letter = userLetters[i];
                      return (
                        <button
                          key={i}
                          disabled={!letter}
                          onClick={() => letter && handleRemoveLetter(i)}
                          className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl flex items-center justify-center transition-all ${
                            scrambleFeedback === "correct"
                              ? "bg-emerald-500 text-white border-2 border-emerald-600 scale-105"
                              : scrambleFeedback === "wrong"
                              ? "bg-red-500 text-white border-2 border-red-600 animate-shake"
                              : letter
                              ? "bg-purple-600 text-white border-2 border-purple-700 shadow-md hover:bg-purple-700 cursor-pointer"
                              : "bg-gray-100 border-2 border-dashed border-gray-300 text-transparent"
                          }`}
                        >
                          {letter || "_"}
                        </button>
                      );
                    })}
                  </div>

                  {/* Available Scrambled Letter Tiles */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8">
                    {currentQ.scrambledLetters.map((letter, i) => {
                      const isUsed = !availableLetterIndices.includes(i);
                      return (
                        <button
                          key={i}
                          disabled={isUsed}
                          onClick={() => handleLetterSelect(i)}
                          className={`w-11 h-13 sm:w-13 sm:h-15 rounded-xl font-bold text-xl sm:text-2xl flex items-center justify-center transition-all ${
                            isUsed
                              ? "bg-gray-100 text-gray-300 border border-gray-200 opacity-30 cursor-not-allowed"
                              : "bg-white hover:bg-purple-50 text-gray-800 border-2 border-purple-200 shadow-xs hover:scale-105 cursor-pointer active:scale-95"
                          }`}
                        >
                          {letter}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hint & Skip Controls */}
                  <div className="flex items-center gap-4">
                    {currentQ.hint && (
                      <button
                        onClick={() => setShowHint(true)}
                        className="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1"
                      >
                        <span>💡</span>
                        <span>{showHint ? `Hint: ${currentQ.hint}` : "Show Hint"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => advanceScramble(currentScrambleIndex + 1)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
                    >
                      Skip Word →
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
