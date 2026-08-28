import {
  useEffect,
  useState,
  useRef,
  useCallback
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

type Kana = {
  id: number;
  kana: string;
  romaji?: string;
  type?: "hiragana" | "katakana";
};

type AnswerResult = {
  correct: boolean;
  correctAnswer: string;
  type?: "hiragana" | "katakana";
};

// Common romaji variations/aliases for Hepburn, Kunrei-shiki, and Nihon-shiki
const ROMAJI_ALIASES: Record<string, string[]> = {
  shi: ["si", "shi"],
  si: ["si", "shi"],
  chi: ["ti", "chi"],
  ti: ["ti", "chi"],
  tsu: ["tu", "tsu"],
  tu: ["tu", "tsu"],
  fu: ["hu", "fu"],
  hu: ["hu", "fu"],
  ji: ["zi", "ji"],
  zi: ["zi", "ji"],
  sha: ["sya", "sha"],
  shu: ["syu", "shu"],
  sho: ["syo", "sho"],
  cha: ["tya", "cha"],
  chu: ["tyu", "chu"],
  cho: ["tyo", "cho"],
  ja: ["zya", "ja", "jya"],
  ju: ["zyu", "ju", "jyu"],
  jo: ["zyo", "jo", "jyo"]
};

function isRomajiMatch(expected: string, given: string): boolean {
  const normExpected = expected.trim().toLowerCase();
  const normGiven = given.trim().toLowerCase();

  if (normExpected === normGiven) return true;

  const valid = ROMAJI_ALIASES[normExpected];
  if (valid && valid.includes(normGiven)) {
    return true;
  }

  return false;
}

export default function PracticePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentType = searchParams.get("type") === "katakana" ? "katakana" : "hiragana";

  const [current, setCurrent] = useState<Kana | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const autoAdvanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const fetchKana = useCallback(async (typeToFetch = currentType) => {
    try {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
        autoAdvanceTimeout.current = null;
      }

      setLoading(true);
      setErrorMsg(null);

      const res = await api.get("/quiz/random", {
        params: { type: typeToFetch }
      });
      setCurrent(res.data);
      setAnswer("");
      setResult(null);
      setAnswered(false);
      focusInput();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(
        error.response?.data?.message ||
        `Could not load ${typeToFetch}. Please check if the server is running.`
      );
    } finally {
      setLoading(false);
    }
  }, [currentType]);

  useEffect(() => {
    fetchKana(currentType);
    return () => {
      if (autoAdvanceTimeout.current) {
        clearTimeout(autoAdvanceTimeout.current);
      }
    };
  }, [currentType, fetchKana]);

  const switchMode = (newType: "hiragana" | "katakana") => {
    if (newType === currentType) return;
    setSearchParams({ type: newType });
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
  };

  const handleSubmit = async (overrideAnswer?: string) => {
    const textToSubmit = overrideAnswer !== undefined ? overrideAnswer : answer;

    if (!current) return;
    if (!textToSubmit.trim()) return;
    if (answered) return;

    setAnswered(true);

    try {
      const res = await api.post("/quiz/answer", {
        type: currentType,
        kanaId: current.id,
        answer: textToSubmit.trim()
      });

      const data: AnswerResult = res.data;
      setResult(data);

      if (data.correct) {
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => prev + 1);

        // Auto-advance on correct
        autoAdvanceTimeout.current = setTimeout(() => {
          fetchKana(currentType);
        }, 600);
      } else {
        setWrongCount((prev) => prev + 1);
        setStreak(0);
      }
    } catch (error: any) {
      console.error(error);
      setAnswered(false);
      setErrorMsg(
        error.response?.data?.message ||
        "Failed to submit answer. Please try again."
      );
    }
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
        fetchKana(currentType);
        return;
      }

      handleSubmit();
    }
  };

  const total = correctCount + wrongCount;
  const accuracy = total === 0 ? 0 : ((correctCount / total) * 100).toFixed(1);

  const isKatakana = currentType === "katakana";
  const themeColor = isKatakana ? "indigo" : "emerald";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex-1 flex flex-col">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => navigate("/")}
              className="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700 shadow-sm"
            >
              ← Home
            </button>

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
              onClick={() => fetchKana(currentType)}
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
                  disabled={answered && result?.correct}
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
                  <div className="text-center py-2 animate-bounce">
                    <p className="text-green-600 text-2xl font-bold">
                      Correct! ✅
                    </p>
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
                      onClick={() => fetchKana(currentType)}
                      className="mt-4 w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-[0.98] cursor-pointer"
                    >
                      Next Kana (Enter ↵)
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