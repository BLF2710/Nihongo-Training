import { useBack } from "../lib/useBack";
import { useActivity, useActivityState } from "../context/ActivityContext";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiErrorMessage } from "../api/errors";
import { submitKanaAnswer } from "../api/quiz";
import type { KanaAnswerResult } from "../api/quiz";
import KanaQuizSetup from "../components/KanaQuizSetup";
import { draw, shuffledDeck } from "../lib/kanaDeck";
import type { QuizMode } from "../lib/kanaDeck";
// Shared without changing Speed Quiz matching behavior.
import { isRomajiMatch } from "../lib/romaji";

type Kana = {
  id: number;
  kana: string;
  romaji?: string;
  type?: "hiragana" | "katakana";
};
type Miss = { id: number; kana: string; correct: string; given: string };

export default function PracticePage() {
  // Run 0 is the game found when the page opens, which may be restored; later runs always start fresh.
  return <KanaQuizSetup>{(characters, onChoose, mode, run) => <PracticeGame key={run} characters={characters} onChoose={onChoose} mode={mode} restore={run === 0} />}</KanaQuizSetup>;
}

const duration = (ms: number) => {
  const seconds = Math.max(0, Math.round(ms / 1000));
  return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
};

function PracticeGame({ characters, onChoose, mode, restore }: { characters: Kana[]; onChoose: () => void; mode: QuizMode; restore: boolean }) {
  const session = useActivity();
  const goBack = useBack();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentType = searchParams.get("type") === "katakana" ? "katakana" : "hiragana";

  const [current, setCurrent] = useActivityState<Kana | null>("current", null);
  const [answer, setAnswer] = useActivityState("answer", "");
  const [result, setResult] = useActivityState<KanaAnswerResult | null>("result", null);
  const [correctCount, setCorrectCount] = useActivityState("correctCount", 0);
  const [wrongCount, setWrongCount] = useActivityState("wrongCount", 0);
  const [streak, setStreak] = useActivityState("streak", 0);
  const [bestStreak, setBestStreak] = useActivityState("bestStreak", 0);
  const [answered, setAnswered] = useActivityState("answered", false);
  const [submissionId, setSubmissionId] = useActivityState("submissionId", "");
  // The characters still to come (round: this round only; unlimited: the rest of the current shuffle).
  const [deck, setDeck] = useActivityState<number[]>("deck", []);
  // The characters in play: everything chosen, or only the missed ones when practising mistakes.
  const [roundIds, setRoundIds] = useActivityState<number[] | null>("roundIds", null);
  const [missed, setMissed] = useActivityState<Miss[]>("missed", []);
  const [finished, setFinished] = useActivityState("finished", false);
  const [startedAt, setStartedAt] = useActivityState("startedAt", 0);
  const [finishedAt, setFinishedAt] = useActivityState("finishedAt", 0);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [loading, setLoading] = useState(!restore || (!current && !finished));
  const restored = useRef(restore && (!!current || finished));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoSubmit, setAutoSubmit] = useActivityState("autoSubmit", true);

  const inputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(true);
  const ids = roundIds ?? characters.map(item => item.id);
  const roundSize = ids.length;

  const endSession = () => {
    if (sendingRef.current) return;
    active.current = false;
    if (autoAdvanceTimeout.current) clearTimeout(autoAdvanceTimeout.current);
    // Keep earned statistics; reopening Speed Quiz should show character selection.
    session.patch({ characters: null });
    session.complete();
    goBack();
  };

  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  /** Shows the next character from the deck; in a round, an empty deck ends the round. */
  const showNext = useCallback((fromDeck: number[], pool: number[], lastId: number | null) => {
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
      autoAdvanceTimeout.current = null;
    }
    const next = draw(fromDeck, mode, pool, lastId);
    setDeck(next.deck);
    setAnswer("");
    setResult(null);
    setAnswered(false);
    setLoading(false);
    if (next.id === null) {
      setCurrent(null);
      setFinished(true);
      setFinishedAt(Date.now());
      return;
    }
    setCurrent(characters.find(item => item.id === next.id) ?? null);
    setSubmissionId(crypto.randomUUID());
    focusInput();
  }, [characters, mode, setDeck, setAnswer, setResult, setAnswered, setCurrent, setFinished, setFinishedAt, setSubmissionId]);

  /** Starts a fresh round (or a fresh unlimited run) with the given characters. */
  const startRound = useCallback((pool: number[]) => {
    setRoundIds(pool.length === characters.length ? null : pool);
    setMissed([]);
    setFinished(false);
    setFinishedAt(0);
    setStartedAt(Date.now());
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setBestStreak(0);
    showNext(shuffledDeck(pool), pool, null);
  }, [characters.length, setRoundIds, setMissed, setFinished, setFinishedAt, setStartedAt, setCorrectCount, setWrongCount, setStreak, setBestStreak, showNext]);

  const next = () => showNext(deck, ids, current?.id ?? null);

  useEffect(() => {
    active.current = true;
    if (!restored.current) {
      restored.current = true;
      startRound(characters.map(item => item.id));
    }
    return () => {
      active.current = false;
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
    };
  }, [characters, startRound]);

  const switchMode = (newType: "hiragana" | "katakana") => {
    if (newType === currentType) return;
    setSearchParams({ type: newType });
  };

  const handleSubmit = async (overrideAnswer?: string) => {
    const textToSubmit = overrideAnswer !== undefined ? overrideAnswer : answer;

    if (!current) return;
    if (!textToSubmit.trim()) return;
    if (result || sendingRef.current) return;

    setAnswered(true);
    sendingRef.current = true; setSending(true);

    try {
      const data = await submitKanaAnswer({
        type: currentType,
        kanaId: current.id,
        answer: textToSubmit.trim(), submissionId
      });
      if (!active.current) return;
      setResult(data);

      if (data.correct) {
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => { setBestStreak(best => Math.max(best, prev + 1)); return prev + 1; });

        // Auto-advance on correct
        autoAdvanceTimeout.current = setTimeout(() => {
          next();
        }, 600);
      } else {
        setWrongCount((prev) => prev + 1);
        setStreak(0);
        const miss = { id: current.id, kana: current.kana, correct: data.correctAnswer, given: textToSubmit.trim() };
        setMissed(list => list.some(item => item.id === miss.id) ? list : [...list, miss]);
      }
    } catch (error: unknown) {
      if (!active.current) return;
      console.error(error);
      setErrorMsg(apiErrorMessage(error, "Failed to submit answer. Please try again."));
    } finally { sendingRef.current = false; if (active.current) setSending(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);

    if (autoSubmit && current && !answered) {
      // Check if typed answer matches
      const expected = current.romaji || "";
      if (expected && isRomajiMatch(expected, val)) {
        handleSubmit(val);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (result) {
        // If already answered and in wrong state, Enter advances to next
        next();
        return;
      }

      handleSubmit();
    }
  };

  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 0 : ((correctCount / total) * 100).toFixed(1);
  const position = Math.min(roundSize, roundSize - deck.length);

  const isKatakana = currentType === "katakana";
  const themeColor = isKatakana ? "indigo" : "emerald";

  if (finished) return <RoundResults
    script={currentType} total={total} correct={correctCount} bestStreak={bestStreak} timeMs={finishedAt - startedAt}
    missed={missed} onRetryMissed={() => startRound(missed.map(item => item.id))} onPlayAgain={() => startRound(characters.map(item => item.id))}
    onChoose={onChoose} onEnd={endSession} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex-1 flex flex-col">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">


            {/* Mode Switcher Tabs */}
            <div className="flex bg-gray-200 p-1 rounded-xl shadow-inner">
              <button
                onClick={() => switchMode("hiragana")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  !isKatakana
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                あ Hiragana
              </button>
              <button
                onClick={() => switchMode("katakana")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  isKatakana
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ア Katakana
              </button>
            </div>
          </div>

          {/* Auto-submit switch */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition">
            <input
              type="checkbox"
              checked={autoSubmit}
              onChange={(e) => setAutoSubmit(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="font-medium">Auto-submit on match</span>
          </label>
        </div>

        {/* Stats Row */}
        <div className="mb-4 flex flex-wrap justify-between gap-3">
          <button onClick={onChoose} className="rounded-xl border bg-white px-4 py-2 font-semibold text-gray-700">← Change characters</button>
          <button onClick={endSession} disabled={sending} className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">End session</button>
        </div>
        {mode === "round" ? <div className="mb-4">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-600"><span>Character {position} of {roundSize}{roundIds ? " · practising missed characters" : ""}</span><span>Each character once</span></div>
          <progress aria-label="Round progress" value={position} max={roundSize || 1} className={`mt-2 h-2 w-full ${isKatakana ? "accent-indigo-600" : "accent-emerald-600"}`} />
        </div> : <p className="mb-4 text-sm font-semibold text-gray-600">Unlimited</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="text-sm font-medium text-gray-500">Correct</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              ✅ {correctCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="text-sm font-medium text-gray-500">Wrong</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              ❌ {wrongCount}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="text-sm font-medium text-gray-500">Accuracy</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              🎯 {accuracy}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <div className="text-sm font-medium text-gray-500">Streak</div>
            <div className="text-2xl font-bold text-orange-500 mt-1">
              🔥 {streak}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-center flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => { setErrorMsg(null); if (answered && !result) void handleSubmit(); else next(); }}
              className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Main Quiz Card */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8 max-w-xl mx-auto w-full relative overflow-hidden">
          {/* Mode Pill Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full ${
                isKatakana
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isKatakana ? "Katakana Quiz" : "Hiragana Quiz"}
            </span>
          </div>

          {loading && !current ? (
            <div className="py-20 text-gray-400 text-xl font-medium animate-pulse">
              Loading {isKatakana ? "Katakana" : "Hiragana"}...
            </div>
          ) : (
            <>
              {/* Kana Character Display */}
              <div
                className={`text-8xl sm:text-9xl font-bold select-none py-6 transition-all duration-300 ${
                  result?.correct
                    ? "text-green-600 scale-105"
                    : result && !result.correct
                    ? "text-red-500"
                    : "text-gray-800"
                }`}
              >
                {current?.kana || "..."}
              </div>

              {/* Input Box */}
              <div className="w-full max-w-xs mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={answered}
                  aria-label="Romaji"
                  className={`border-2 rounded-xl p-4 text-2xl text-center w-full font-semibold outline-none transition-all ${
                    result?.correct
                      ? "border-green-500 bg-green-50 text-green-800"
                      : result && !result.correct
                      ? "border-red-500 bg-red-50 text-red-800"
                      : `border-gray-300 focus:border-${themeColor}-500 focus:ring-4 focus:ring-${themeColor}-100`
                  }`}
                  placeholder="Type romaji..."
                  value={answer}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Action Buttons / Results */}
              <div className="mt-6 flex flex-col items-center w-full max-w-xs gap-3">
                {answered && !result && !sending && <button onClick={() => void handleSubmit()} className="rounded-xl border px-4 py-3 font-bold">Retry saving answer</button>}
                {!result ? (
                  <button
                    disabled={answered || !answer.trim()}
                    onClick={() => handleSubmit()}
                    className={`w-full py-3.5 rounded-xl font-semibold text-lg text-white transition shadow-sm ${
                      !answer.trim() || answered
                        ? "bg-gray-300 cursor-not-allowed"
                        : isKatakana
                        ? "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] cursor-pointer"
                        : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
                    }`}
                  >
                    Submit (Enter ↵)
                  </button>
                ) : result.correct ? (
                  <div className="text-center py-2">
                    <p className="text-green-600 text-2xl font-bold motion-safe:animate-bounce">
                      Correct! ✅
                    </p>
                    <button onClick={next} className="mt-3 rounded-xl border px-4 py-2 text-sm font-bold">{mode === "round" && !deck.length ? "See results →" : "Next Kana →"}</button>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <p className="text-red-600 text-xl font-bold">
                      Incorrect ❌
                    </p>
                    <p className="text-gray-700 mt-1">
                      Correct answer:{" "}
                      <span className="font-bold text-gray-900 text-lg bg-gray-100 px-2 py-0.5 rounded">
                        {result.correctAnswer}
                      </span>
                    </p>

                    <button
                      onClick={next}
                      className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-[0.98] cursor-pointer"
                    >
                      {mode === "round" && !deck.length ? "See results (Enter ↵)" : "Next Kana (Enter ↵)"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The end of an "each once" round: score, time, and the characters to practise again. */
function RoundResults({ script, total, correct, bestStreak, timeMs, missed, onRetryMissed, onPlayAgain, onChoose, onEnd }: {
  script: "hiragana" | "katakana"; total: number; correct: number; bestStreak: number; timeMs: number; missed: Miss[];
  onRetryMissed: () => void; onPlayAgain: () => void; onChoose: () => void; onEnd: () => void;
}) {
  const percent = total ? Math.round(correct * 100 / total) : 0;
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const perfect = total > 0 && correct === total;
  const button = "rounded-xl border border-gray-200 bg-white px-5 py-3 font-bold text-gray-700 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-emerald-600";
  return <div className="min-h-screen bg-gray-50 flex flex-col"><Navbar />
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
      <section aria-labelledby="round-results" className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">{script === "katakana" ? "Katakana" : "Hiragana"} Speed Quiz · round complete</p>
        <h1 id="round-results" ref={heading} tabIndex={-1} className="mt-2 text-3xl font-black focus:outline-none">{perfect ? "Perfect round! 🎉" : percent >= 80 ? "Great work!" : "Round complete"}</h1>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Score", `${correct} / ${total}`], ["Accuracy", `${percent}%`], ["Time", duration(timeMs)], ["Best streak", `🔥 ${bestStreak}`]].map(([label, value]) =>
            <div key={label} className="rounded-2xl bg-gray-50 p-4"><dt className="text-sm font-semibold text-gray-600">{label}</dt><dd className="mt-1 text-2xl font-black">{value}</dd></div>)}
        </dl>
        {missed.length > 0 ? <>
          <h2 className="mt-8 text-xl font-bold">To practise again ({missed.length})</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">{missed.map(item => <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-gray-200 p-3">
            <span lang="ja" className="w-14 text-center text-4xl font-bold">{item.kana}</span>
            <span className="text-sm"><span className="block font-bold text-gray-900">{item.correct}</span><span className="block text-gray-600">You typed: <span className="font-semibold text-red-700">{item.given}</span></span></span>
          </li>)}</ul>
        </> : <p className="mt-6 text-gray-600">You answered every character correctly.</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {missed.length > 0 && <button onClick={onRetryMissed} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600">Practise the missed ones →</button>}
          <button onClick={onPlayAgain} className={missed.length ? button : "rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"}>Play again</button>
          <button onClick={onChoose} className={button}>Change characters</button>
          <button onClick={onEnd} className={button}>End session</button>
        </div>
      </section>
    </main>
  </div>;
}
