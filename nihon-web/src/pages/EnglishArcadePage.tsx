import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

// =====================
// Types
// =====================
type MatchPair = {
  id: number;
  word: string;
  definition: string;
  category: string;
  difficulty: string;
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

type GamePhase = "lobby" | "countdown" | "playing" | "gameover";

export default function EnglishArcadePage() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage("english");
  }, [setLanguage]);

  // =====================
  // Shared state
  // =====================
  const [activeGame, setActiveGame] = useState<"match" | "scramble">("match");
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [countdownValue, setCountdownValue] = useState(3);

  // Lobby settings
  const [difficulty, setDifficulty] = useState<string>("all");
  const [timerDuration, setTimerDuration] = useState(60);

  // =====================
  // WORD MATCH STATE
  // =====================
  const [matchWords, setMatchWords] = useState<MatchPair[]>([]);
  const [matchDefs, setMatchDefs] = useState<MatchPair[]>([]);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedDefId, setSelectedDefId] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [matchScore, setMatchScore] = useState(0);
  const [matchCombo, setMatchCombo] = useState(0);
  const [matchTimeLeft, setMatchTimeLeft] = useState(60);
  const [matchAttempts, setMatchAttempts] = useState(0);
  const [matchSuccesses, setMatchSuccesses] = useState(0);
  const [wrongPairIds, setWrongPairIds] = useState<[number | null, number | null]>([null, null]);
  const [correctFlashId, setCorrectFlashId] = useState<number | null>(null);

  // =====================
  // WORD SCRAMBLE STATE
  // =====================
  const [scrambleQuestions, setScrambleQuestions] = useState<ScrambleQuestion[]>([]);
  const [currentScrambleIndex, setCurrentScrambleIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [availableLetterIndices, setAvailableLetterIndices] = useState<number[]>([]);
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleStreak, setScrambleStreak] = useState(0);
  const [scrambleTimeLeft, setScrambleTimeLeft] = useState(45);
  const [showHint, setShowHint] = useState(false);
  const [scrambleFeedback, setScrambleFeedback] = useState<"correct" | "wrong" | null>(null);
  const [scrambleSolved, setScrambleSolved] = useState(0);

  // Timers
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scoreSubmittedRef = useRef(false);
  const gameSessionIdRef = useRef<string | null>(null);
  const matchScoreRef = useRef(0);
  const matchAttemptsRef = useRef(0);
  const matchSuccessesRef = useRef(0);
  const scrambleScoreRef = useRef(0);
  const scrambleSolvedRef = useRef(0);

  const submitScore = useCallback(async (gameType: string, score: number, accuracy: number, timeTaken: number) => {
    // A timer can reach zero at the same moment a round finishes. Record one
    // result per game session even if both paths attempt to finish it.
    if (scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;

    try {
      await api.post("/english/games/score", {
        gameType,
        sessionId: gameSessionIdRef.current,
        score,
        accuracy,
        difficulty,
        timeTakenSeconds: timeTaken
      });
    } catch (err) {
      scoreSubmittedRef.current = false;
      console.log("Score submission failed:", err);
    }
  }, [difficulty]);

  // =====================
  // COUNTDOWN ANIMATION
  // =====================
  const startCountdown = useCallback(() => {
    setPhase("countdown");
    setCountdownValue(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setPhase("playing");
      } else {
        setCountdownValue(count);
      }
    }, 700);
  }, []);

  // =====================
  // WORD MATCH FUNCTIONS
  // =====================
  const loadMatchData = useCallback(async (resetGame = true) => {
    try {
      const res = await api.get("/english/games/match", {
        params: { difficulty, count: 6 }
      });
      const pairs: MatchPair[] = res.data.pairs;
      setMatchWords([...pairs].sort(() => 0.5 - Math.random()));
      setMatchDefs([...pairs].sort(() => 0.5 - Math.random()));
      setMatchedIds(new Set());
      setSelectedWordId(null);
      setSelectedDefId(null);
      if (resetGame) {
        scoreSubmittedRef.current = false;
        gameSessionIdRef.current = crypto.randomUUID();
        matchScoreRef.current = 0;
        matchAttemptsRef.current = 0;
        matchSuccessesRef.current = 0;
        setMatchScore(0);
        setMatchCombo(0);
        setMatchAttempts(0);
        setMatchSuccesses(0);
        setMatchTimeLeft(timerDuration);
      }
      setWrongPairIds([null, null]);
      setCorrectFlashId(null);
    } catch (err) {
      console.error("Error loading match data:", err);
    }
  }, [difficulty, timerDuration]);

  const startMatchGame = useCallback(async () => {
    await loadMatchData();
    startCountdown();
  }, [loadMatchData, startCountdown]);

  // Match game timer
  useEffect(() => {
    if (phase === "playing" && activeGame === "match") {
      timerRef.current = setInterval(() => {
        setMatchTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase("gameover");
            const accuracy = matchAttemptsRef.current > 0
              ? Math.round((matchSuccessesRef.current / matchAttemptsRef.current) * 100)
              : 0;
            submitScore("word_match", matchScoreRef.current, accuracy, timerDuration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, activeGame, submitScore, timerDuration]);

  const handleWordClick = (pairId: number) => {
    if (phase !== "playing" || matchedIds.has(pairId)) return;
    setSelectedWordId(pairId);
    if (selectedDefId !== null) {
      checkMatchResult(pairId, selectedDefId);
    }
  };

  const handleDefClick = (pairId: number) => {
    if (phase !== "playing" || matchedIds.has(pairId)) return;
    setSelectedDefId(pairId);
    if (selectedWordId !== null) {
      checkMatchResult(selectedWordId, pairId);
    }
  };

  const checkMatchResult = (wordPairId: number, defPairId: number) => {
    matchAttemptsRef.current += 1;
    setMatchAttempts((a) => a + 1);
    if (wordPairId === defPairId) {
      // Correct match
      const multiplier = 1 + matchCombo * 0.5;
      const points = Math.round(100 * multiplier);
      matchScoreRef.current += points;
      matchSuccessesRef.current += 1;
      setMatchScore((s) => s + points);
      setMatchCombo((c) => c + 1);
      setMatchSuccesses((s) => s + 1);
      setCorrectFlashId(wordPairId);
      setTimeout(() => {
        setMatchedIds((prev) => new Set([...prev, wordPairId]));
        setCorrectFlashId(null);
        setSelectedWordId(null);
        setSelectedDefId(null);
      }, 400);

      // Check if all matched — load next round
      setTimeout(() => {
        setMatchedIds((current) => {
          // The successful tile is already in `current` after the 400ms reveal.
          // Adding one here caused a new round after only five of six matches.
          if (current.size >= matchWords.length && matchWords.length > 0) {
            matchScoreRef.current += 500;
            setMatchScore((s) => s + 500);
            setMatchTimeLeft((t) => Math.min(t + 15, timerDuration + 30));
            // Load a fresh set of words without clearing this game's score,
            // timer, or accuracy counters.
            loadMatchData(false);
          }
          return current;
        });
      }, 500);
    } else {
      // Wrong match
      setMatchCombo(0);
      setWrongPairIds([wordPairId, defPairId]);
      setTimeout(() => {
        setWrongPairIds([null, null]);
        setSelectedWordId(null);
        setSelectedDefId(null);
      }, 500);
    }
  };

  // =====================
  // WORD SCRAMBLE FUNCTIONS
  // =====================
  const loadScrambleData = useCallback(async () => {
    try {
      const res = await api.get("/english/games/scramble", { params: { count: 10 } });
      const qs: ScrambleQuestion[] = res.data.questions;
      setScrambleQuestions(qs);
      setCurrentScrambleIndex(0);
      setScrambleScore(0);
      setScrambleStreak(0);
      setScrambleTimeLeft(timerDuration);
      setShowHint(false);
      setScrambleFeedback(null);
      setScrambleSolved(0);
      scoreSubmittedRef.current = false;
      gameSessionIdRef.current = crypto.randomUUID();
      scrambleScoreRef.current = 0;
      scrambleSolvedRef.current = 0;
      if (qs.length > 0) {
        setUserLetters([]);
        setAvailableLetterIndices(qs[0].scrambledLetters.map((_, i) => i));
      }
    } catch (err) {
      console.error("Error loading scramble data:", err);
    }
  }, [timerDuration]);

  const startScrambleGame = useCallback(async () => {
    await loadScrambleData();
    startCountdown();
  }, [loadScrambleData, startCountdown]);

  // Scramble game timer
  useEffect(() => {
    if (phase === "playing" && activeGame === "scramble") {
      timerRef.current = setInterval(() => {
        setScrambleTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase("gameover");
            submitScore("word_scramble", scrambleScoreRef.current, scrambleSolvedRef.current > 0 ? 100 : 0, timerDuration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, activeGame, submitScore, timerDuration]);

  const currentQ = scrambleQuestions[currentScrambleIndex];

  const handleLetterSelect = (letterIndex: number) => {
    if (phase !== "playing" || !currentQ) return;
    if (!availableLetterIndices.includes(letterIndex)) return;

    const letter = currentQ.scrambledLetters[letterIndex];
    const newLetters = [...userLetters, letter];
    setUserLetters(newLetters);
    setAvailableLetterIndices((prev) => prev.filter((i) => i !== letterIndex));

    if (newLetters.length === currentQ.originalWord.length) {
      const formedWord = newLetters.join("");
      if (formedWord.toUpperCase() === currentQ.originalWord.toUpperCase()) {
        setScrambleFeedback("correct");
        const points = 150 + scrambleStreak * 50;
        scrambleScoreRef.current += points;
        scrambleSolvedRef.current += 1;
        setScrambleScore((s) => s + points);
        setScrambleStreak((st) => st + 1);
        setScrambleSolved((s) => s + 1);
        setScrambleTimeLeft((t) => Math.min(t + 8, timerDuration + 30));
        setTimeout(() => advanceScramble(currentScrambleIndex + 1), 500);
      } else {
        setScrambleFeedback("wrong");
        setScrambleStreak(0);
        setTimeout(() => {
          setScrambleFeedback(null);
          setUserLetters([]);
          setAvailableLetterIndices(currentQ.scrambledLetters.map((_, i) => i));
        }, 600);
      }
    }
  };

  const handleRemoveLetter = (indexToRemove: number) => {
    if (phase !== "playing" || !currentQ) return;
    const removedLetter = userLetters[indexToRemove];
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
      setPhase("gameover");
      submitScore("word_scramble", scrambleScoreRef.current, scrambleSolvedRef.current > 0 ? 100 : 0, timerDuration);
      return;
    }
    setCurrentScrambleIndex(nextIndex);
    setUserLetters([]);
    setShowHint(false);
    setScrambleFeedback(null);
    setAvailableLetterIndices(scrambleQuestions[nextIndex].scrambledLetters.map((_, i) => i));
  };

  // =====================
  // Start game handler
  // =====================
  const handleStartGame = () => {
    if (activeGame === "match") {
      startMatchGame();
    } else {
      startScrambleGame();
    }
  };

  const handleBackToLobby = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("lobby");
  };

  // =====================
  // RENDER
  // =====================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col">

        {/* ========================================================= */}
        {/* LOBBY / PREPARATION STAGE                                 */}
        {/* ========================================================= */}
        {phase === "lobby" && (
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Back to dashboard */}
            <div className="w-full flex items-center mb-8">
              <button
                onClick={() => navigate("/")}
                className="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700 shadow-xs cursor-pointer"
              >
                ← Dashboard
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 sm:p-12 max-w-xl w-full text-center">
              {/* Game Mode Tabs */}
              <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner mb-8 mx-auto max-w-xs">
                <button
                  onClick={() => setActiveGame("match")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                    activeGame === "match"
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🧩</span> Word Match
                </button>
                <button
                  onClick={() => setActiveGame("scramble")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                    activeGame === "scramble"
                      ? "bg-white text-purple-700 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span>🔤</span> Scramble
                </button>
              </div>

              {/* Game Icon & Title */}
              <div className="text-6xl mb-4">
                {activeGame === "match" ? "🧩" : "🔤"}
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                {activeGame === "match" ? "Word Match Challenge" : "Word Scramble Arcade"}
              </h2>
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                {activeGame === "match"
                  ? "Connect English words with their definitions as fast as you can. Build combos for bonus points!"
                  : "Unscramble jumbled letters to spell vocabulary words. Use hints if you're stuck!"}
              </p>

              {/* Rules / How to Play */}
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-8 text-left">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <span>📋</span> How to Play
                </h3>
                {activeGame === "match" ? (
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">●</span>Click a <strong>word</strong> on the left, then its <strong>definition</strong> on the right</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">●</span>Correct matches earn <strong>100+ pts</strong> with combo multipliers</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">●</span>Clear all 6 pairs to unlock a <strong>+500 bonus</strong> and new words</li>
                    <li className="flex items-start gap-2"><span className="text-red-400 mt-0.5">●</span>Wrong matches break your combo streak</li>
                  </ul>
                ) : (
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">●</span>Read the <strong>definition clue</strong> and tap scrambled letters to spell the word</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">●</span>Each correct word earns <strong>150+ pts</strong> with streak bonuses</li>
                    <li className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">●</span>Correct answers add <strong>+8 seconds</strong> to your timer</li>
                    <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">●</span>Use the <strong>hint</strong> button if you're stuck (no penalty!)</li>
                  </ul>
                )}
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-sm font-bold text-gray-700 px-3 py-2.5 rounded-xl shadow-xs cursor-pointer outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Timer
                  </label>
                  <select
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    className="w-full bg-white border border-gray-200 text-sm font-bold text-gray-700 px-3 py-2.5 rounded-xl shadow-xs cursor-pointer outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={90}>90 seconds</option>
                    <option value={120}>120 seconds</option>
                  </select>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                className={`w-full py-4 text-white font-black text-lg rounded-2xl transition shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  activeGame === "match"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                🚀 Start Game
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* COUNTDOWN OVERLAY                                         */}
        {/* ========================================================= */}
        {phase === "countdown" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center animate-in zoom-in-50 duration-300">
              <div className="text-[140px] sm:text-[180px] font-black text-indigo-600 leading-none animate-pulse">
                {countdownValue}
              </div>
              <div className="text-xl font-bold text-gray-500 mt-4">Get Ready!</div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* WORD MATCH — PLAYING                                      */}
        {/* ========================================================= */}
        {phase === "playing" && activeGame === "match" && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-200">
            {/* Score Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</div>
                <div className="text-2xl font-black text-indigo-600">{matchScore}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Time</div>
                <div className={`text-2xl font-black ${matchTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"}`}>
                  ⏱️ {matchTimeLeft}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Combo</div>
                <div className="text-2xl font-black text-orange-500">🔥 {matchCombo}x</div>
              </div>
              <button
                onClick={handleBackToLobby}
                className="text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-xl transition cursor-pointer border border-gray-200"
              >
                ✕ Quit
              </button>
            </div>

            {/* Side-by-side Match Grid: Words | Definitions */}
            <div className="grid grid-cols-2 gap-6 flex-1">
              {/* LEFT: Words Column */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 text-center mb-1">
                  📝 Words
                </div>
                {matchWords.map((pair) => {
                  const isMatched = matchedIds.has(pair.id);
                  const isSelected = selectedWordId === pair.id;
                  const isWrong = wrongPairIds[0] === pair.id;
                  const isCorrectFlash = correctFlashId === pair.id;

                  if (isMatched) {
                    return (
                      <div key={`w-${pair.id}`} className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-center opacity-40 select-none min-h-[64px]">
                        <span className="text-xs font-bold text-emerald-700">✓ Matched</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`w-${pair.id}`}
                      onClick={() => handleWordClick(pair.id)}
                      className={`rounded-2xl p-4 text-center font-bold text-lg transition-all cursor-pointer shadow-xs min-h-[64px] select-none ${
                        isCorrectFlash
                          ? "bg-emerald-500 text-white border-2 border-emerald-600 scale-105"
                          : isWrong
                          ? "bg-red-100 border-2 border-red-500 text-red-900 animate-shake"
                          : isSelected
                          ? "bg-indigo-600 text-white border-2 border-indigo-700 scale-105 shadow-md"
                          : "bg-white hover:bg-indigo-50 border-2 border-indigo-100 text-gray-900 hover:border-indigo-300"
                      }`}
                    >
                      {pair.word}
                    </button>
                  );
                })}
              </div>

              {/* RIGHT: Definitions Column */}
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600 text-center mb-1">
                  📖 Definitions
                </div>
                {matchDefs.map((pair) => {
                  const isMatched = matchedIds.has(pair.id);
                  const isSelected = selectedDefId === pair.id;
                  const isWrong = wrongPairIds[1] === pair.id;
                  const isCorrectFlash = correctFlashId === pair.id;

                  if (isMatched) {
                    return (
                      <div key={`d-${pair.id}`} className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-4 flex items-center justify-center opacity-40 select-none min-h-[64px]">
                        <span className="text-xs font-bold text-emerald-700">✓ Matched</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`d-${pair.id}`}
                      onClick={() => handleDefClick(pair.id)}
                      className={`rounded-2xl p-4 text-center text-sm font-medium transition-all cursor-pointer shadow-xs min-h-[64px] select-none ${
                        isCorrectFlash
                          ? "bg-emerald-500 text-white border-2 border-emerald-600 scale-105"
                          : isWrong
                          ? "bg-red-100 border-2 border-red-500 text-red-900 animate-shake"
                          : isSelected
                          ? "bg-purple-600 text-white border-2 border-purple-700 scale-105 shadow-md"
                          : "bg-white hover:bg-purple-50 border-2 border-purple-100 text-gray-700 hover:border-purple-300"
                      }`}
                    >
                      {pair.definition}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* WORD SCRAMBLE — PLAYING                                   */}
        {/* ========================================================= */}
        {phase === "playing" && activeGame === "scramble" && (
          <div className="flex-1 flex flex-col animate-in fade-in duration-200">
            {/* Score Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Score</div>
                <div className="text-2xl font-black text-purple-600">{scrambleScore}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Time</div>
                <div className={`text-2xl font-black ${scrambleTimeLeft <= 10 ? "text-red-600 animate-pulse" : "text-gray-800"}`}>
                  ⏱️ {scrambleTimeLeft}s
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Streak</div>
                <div className="text-2xl font-black text-orange-500">🔥 {scrambleStreak}</div>
              </div>
              <button
                onClick={handleBackToLobby}
                className="text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-xl transition cursor-pointer border border-gray-200"
              >
                ✕ Quit
              </button>
            </div>

            {currentQ && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-md p-6 sm:p-10 max-w-2xl mx-auto w-full flex flex-col items-center">
                {/* Category & Progress */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs uppercase font-bold tracking-wider bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                    {currentQ.category}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    Word {currentScrambleIndex + 1} of {scrambleQuestions.length}
                  </span>
                </div>

                {/* Definition */}
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

                {/* Available Scrambled Letters */}
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

                {/* Hint & Skip */}
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
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* GAME OVER SCREEN                                          */}
        {/* ========================================================= */}
        {phase === "gameover" && (
          <div className="flex-1 flex items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 max-w-md w-full text-center">
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-3xl font-black text-gray-900 mb-1">
                {activeGame === "match" ? "Time's Up!" : "Arcade Complete!"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {activeGame === "match"
                  ? "Great vocabulary recall and speed!"
                  : "Fantastic spelling accuracy!"}
              </p>

              <div className={`rounded-2xl p-5 mb-6 border ${
                activeGame === "match"
                  ? "bg-indigo-50 border-indigo-100"
                  : "bg-purple-50 border-purple-100"
              }`}>
                <div className={`text-xs font-bold uppercase ${activeGame === "match" ? "text-indigo-600" : "text-purple-600"}`}>
                  Final Score
                </div>
                <div className={`text-4xl font-extrabold mt-1 ${activeGame === "match" ? "text-indigo-700" : "text-purple-700"}`}>
                  {activeGame === "match" ? matchScore : scrambleScore} pts
                </div>
                <div className={`text-xs mt-2 ${activeGame === "match" ? "text-indigo-500" : "text-purple-500"}`}>
                  {activeGame === "match"
                    ? `Matched ${matchSuccesses} of ${matchAttempts} attempts (${matchAttempts > 0 ? Math.round((matchSuccesses / matchAttempts) * 100) : 0}% accuracy)`
                    : `Solved ${scrambleSolved} words • Max streak: ${scrambleStreak}`}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStartGame}
                  className={`flex-1 py-3.5 text-white font-bold rounded-xl transition shadow-md cursor-pointer ${
                    activeGame === "match"
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  Play Again 🔄
                </button>
                <button
                  onClick={handleBackToLobby}
                  className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition cursor-pointer border border-gray-200"
                >
                  Lobby
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
