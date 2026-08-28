import {
  useEffect,
  useState,
  useCallback
} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/axios";

type CharacterStat = {
  id: number;
  kana: string;
  romaji: string;
  correctCount: number;
  wrongCount: number;
  total: number;
  accuracy: number;
  status: "mastered" | "learning" | "untested";
};

type ModeStats = {
  totalCorrect: number;
  totalWrong: number;
  totalAnswers: number;
  accuracy: number;
  characters: CharacterStat[];
};

type StatisticsResponse = {
  totalCorrect: number;
  totalWrong: number;
  totalAnswers: number;
  accuracy: number;
  hiragana?: ModeStats;
  katakana?: ModeStats;
};

export default function StatisticsPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hiragana" | "katakana">("hiragana");
  const [filterStatus, setFilterStatus] = useState<"all" | "mastered" | "learning" | "untested">("all");
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterStat | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get("/statistics");
      setStats(res.data);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        setErrorMsg("Your session has expired. Please sign in to view statistics.");
      } else {
        setErrorMsg(
          error.response?.data?.message ||
          "Failed to load statistics. Please ensure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const currentModeData = activeTab === "hiragana" ? stats?.hiragana : stats?.katakana;
  const characters = currentModeData?.characters || [];

  const filteredCharacters = characters.filter((c) => {
    if (filterStatus === "all") return true;
    return c.status === filterStatus;
  });

  const masteredCount = characters.filter((c) => c.status === "mastered").length;
  const learningCount = characters.filter((c) => c.status === "learning").length;
  const untestedCount = characters.filter((c) => c.status === "untested").length;

  // Keyboard navigation for modal
  const navigateCharacter = useCallback((direction: "prev" | "next") => {
    if (!selectedCharacter || characters.length === 0) return;
    const currentIndex = characters.findIndex((c) => c.id === selectedCharacter.id);
    if (currentIndex === -1) return;

    if (direction === "prev") {
      const prevIndex = (currentIndex - 1 + characters.length) % characters.length;
      setSelectedCharacter(characters[prevIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % characters.length;
      setSelectedCharacter(characters[nextIndex]);
    }
  }, [selectedCharacter, characters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCharacter) return;
      if (e.key === "Escape") {
        setSelectedCharacter(null);
      } else if (e.key === "ArrowLeft") {
        navigateCharacter("prev");
      } else if (e.key === "ArrowRight") {
        navigateCharacter("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCharacter, navigateCharacter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="border border-gray-300 bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700 shadow-sm cursor-pointer"
          >
            ← Home
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/practice?type=hiragana")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              Practice Hiragana
            </button>
            <button
              onClick={() => navigate("/practice?type=katakana")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              Practice Katakana
            </button>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          📊 Learning Progress & Statistics
        </h1>

        {/* Error State */}
        {errorMsg && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center shadow-sm">
            <p className="font-semibold text-lg">{errorMsg}</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => fetchStatistics()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer"
              >
                Try Again
              </button>
              {errorMsg.includes("sign in") && (
                <button
                  onClick={() => navigate("/login")}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition cursor-pointer"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center text-gray-400 text-xl font-medium animate-pulse">
            Loading your statistics...
          </div>
        ) : (
          stats && (
            <>
              {/* Overall Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-sm font-medium text-gray-500">Overall Accuracy</div>
                  <div className="text-3xl font-extrabold text-blue-600 mt-1">
                    {stats.accuracy}%
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-sm font-medium text-gray-500">Total Answered</div>
                  <div className="text-3xl font-extrabold text-gray-800 mt-1">
                    {stats.totalAnswers}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <div className="text-3xl mb-2">✅</div>
                  <div className="text-sm font-medium text-gray-500">Total Correct</div>
                  <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                    {stats.totalCorrect}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                  <div className="text-3xl mb-2">❌</div>
                  <div className="text-sm font-medium text-gray-500">Total Wrong</div>
                  <div className="text-3xl font-extrabold text-red-500 mt-1">
                    {stats.totalWrong}
                  </div>
                </div>
              </div>

              {/* Mode Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Hiragana Overview Card */}
                <div
                  onClick={() => setActiveTab("hiragana")}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "hiragana"
                      ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-100"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-sm opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-emerald-600">あ</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Hiragana</h2>
                        <p className="text-xs text-gray-500">46 Base + Variations</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-sm font-extrabold px-3 py-1 rounded-full">
                      {stats.hiragana?.accuracy || 0}% Acc
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Practiced</div>
                      <div className="font-bold text-gray-800">{stats.hiragana?.totalAnswers || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Correct</div>
                      <div className="font-bold text-emerald-600">{stats.hiragana?.totalCorrect || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Wrong</div>
                      <div className="font-bold text-red-500">{stats.hiragana?.totalWrong || 0}</div>
                    </div>
                  </div>
                </div>

                {/* Katakana Overview Card */}
                <div
                  onClick={() => setActiveTab("katakana")}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === "katakana"
                      ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-100"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-sm opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-indigo-600">ア</span>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Katakana</h2>
                        <p className="text-xs text-gray-500">71 Characters</p>
                      </div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-800 text-sm font-extrabold px-3 py-1 rounded-full">
                      {stats.katakana?.accuracy || 0}% Acc
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100 text-sm">
                    <div>
                      <div className="text-gray-400 text-xs">Practiced</div>
                      <div className="font-bold text-gray-800">{stats.katakana?.totalAnswers || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Correct</div>
                      <div className="font-bold text-indigo-600">{stats.katakana?.totalCorrect || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs">Wrong</div>
                      <div className="font-bold text-red-500">{stats.katakana?.totalWrong || 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Mastery Matrix */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                {/* Mastery Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span>{activeTab === "hiragana" ? "あ Hiragana" : "ア Katakana"} Character Mastery</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Click any character card to view detailed percentage, accuracy, and practice options.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                        filterStatus === "all"
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      All ({characters.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus("mastered")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        filterStatus === "mastered"
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      <span>🟢 Mastered</span> ({masteredCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus("learning")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        filterStatus === "learning"
                          ? "bg-amber-500 text-white"
                          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                      }`}
                    >
                      <span>🟡 Learning</span> ({learningCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus("untested")}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                        filterStatus === "untested"
                          ? "bg-gray-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>⚪ Untested</span> ({untestedCount})
                    </button>
                  </div>
                </div>

                {/* Character Cards Grid */}
                {filteredCharacters.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 font-medium">
                    No characters found matching this filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 pt-6">
                    {filteredCharacters.map((char) => {
                      const badgeBg =
                        char.status === "mastered"
                          ? "border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-950"
                          : char.status === "learning"
                          ? "border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-950"
                          : "border-gray-200 bg-gray-50/50 hover:bg-gray-100/70 text-gray-800";

                      return (
                        <div
                          key={char.id}
                          onClick={() => setSelectedCharacter(char)}
                          className={`border rounded-xl p-2.5 text-center flex flex-col items-center justify-between transition-all hover:scale-105 hover:shadow-md cursor-pointer shadow-xs ${badgeBg}`}
                          title={`Click to view details for ${char.kana} (${char.romaji})`}
                        >
                          <div className="text-2xl font-bold mb-0.5">
                            {char.kana}
                          </div>
                          <div className="text-xs text-gray-500 font-mono font-medium">
                            {char.romaji}
                          </div>
                          <div className="mt-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full w-full">
                            {char.total === 0 ? (
                              <span className="text-gray-400">Untested</span>
                            ) : (
                              <span
                                className={
                                  char.status === "mastered"
                                    ? "text-emerald-700"
                                    : "text-amber-700"
                                }
                              >
                                {char.accuracy}%
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>

      {/* Character Detail Modal View */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-8 relative overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header & Close Button */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full ${
                    activeTab === "hiragana"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {activeTab === "hiragana" ? "Hiragana Detail" : "Katakana Detail"}
                </span>
              </div>

              <button
                onClick={() => setSelectedCharacter(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition cursor-pointer font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Main Character Showcase */}
            <div className="flex flex-col items-center justify-center py-6">
              {/* Giant Japanese Character */}
              <div
                className={`text-8xl sm:text-9xl font-bold select-none mb-2 ${
                  selectedCharacter.status === "mastered"
                    ? "text-emerald-600"
                    : selectedCharacter.status === "learning"
                    ? "text-amber-600"
                    : "text-gray-800"
                }`}
              >
                {selectedCharacter.kana}
              </div>

              {/* Romaji */}
              <div className="text-2xl font-bold text-gray-700 tracking-wide font-mono bg-gray-100 px-4 py-1 rounded-xl">
                {selectedCharacter.romaji}
              </div>

              {/* Accuracy Percentage Badge */}
              <div className="mt-6 flex flex-col items-center">
                <div
                  className={`text-4xl font-extrabold ${
                    selectedCharacter.total === 0
                      ? "text-gray-400"
                      : selectedCharacter.accuracy >= 80
                      ? "text-emerald-600"
                      : selectedCharacter.accuracy >= 50
                      ? "text-amber-600"
                      : "text-red-500"
                  }`}
                >
                  {selectedCharacter.total === 0 ? "—" : `${selectedCharacter.accuracy}%`}
                </div>
                <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mt-1">
                  Accuracy Rate
                </div>
              </div>
            </div>

            {/* Detailed Stats Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center mb-6">
              <div>
                <div className="text-xs text-gray-500 font-medium">Correct</div>
                <div className="text-xl font-bold text-emerald-600 mt-0.5">
                  ✅ {selectedCharacter.correctCount}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 font-medium">Wrong</div>
                <div className="text-xl font-bold text-red-500 mt-0.5">
                  ❌ {selectedCharacter.wrongCount}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 font-medium">Attempts</div>
                <div className="text-xl font-bold text-gray-800 mt-0.5">
                  📝 {selectedCharacter.total}
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center mb-6">
              <span
                className={`text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 ${
                  selectedCharacter.status === "mastered"
                    ? "bg-emerald-100 text-emerald-800"
                    : selectedCharacter.status === "learning"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {selectedCharacter.status === "mastered" && "🟢 Mastered"}
                {selectedCharacter.status === "learning" && "🟡 Needs Practice"}
                {selectedCharacter.status === "untested" && "⚪ Not Practiced Yet"}
              </span>
            </div>

            {/* Navigation & Action Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => navigateCharacter("prev")}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-700 transition font-bold cursor-pointer"
                title="Previous character (Left Arrow ←)"
              >
                ← Prev
              </button>

              <button
                onClick={() => navigate(`/practice?type=${activeTab}`)}
                className={`flex-1 py-3 text-white font-bold rounded-xl transition shadow-sm cursor-pointer text-center ${
                  activeTab === "hiragana"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Practice {activeTab === "hiragana" ? "Hiragana" : "Katakana"}
              </button>

              <button
                onClick={() => navigateCharacter("next")}
                className="p-3 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-700 transition font-bold cursor-pointer"
                title="Next character (Right Arrow →)"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}