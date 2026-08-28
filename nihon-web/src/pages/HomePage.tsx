import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isJapanese = language === "japanese";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
            <span>✨</span> Next-Gen Language Learning Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            Master {isJapanese ? "Japanese 🇯🇵" : "English 🇬🇧"}
            <span className="block text-emerald-600 mt-1">Through Active Play</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            {isJapanese
              ? "From Hiragana & Katakana mastery to JLPT vocabulary, kanji, and grammar patterns."
              : "Level up your English vocabulary, conquer tricky grammar rules, and play interactive word games."}
          </p>

          <p className="text-sm text-gray-400">Choose a language or game from the navigation menu.</p>
        </div>

        {/* Dynamic Content based on Active Track */}
        {isJapanese ? (
          /* ======================================= */
          /*         JAPANESE LEARNING TRACK         */
          /* ======================================= */
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Category 1: Character Games */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🎮</span> Character Speed Trainers
                  </h2>
                  <p className="text-sm text-gray-500">
                    Master the Japanese phonetic writing systems with instant auto-submit.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Interactive Games
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hiragana Card */}
                <div
                  onClick={() => navigate("/practice?type=hiragana")}
                  className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-emerald-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      あ
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">Hiragana Practice</h3>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        46+ chars
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">
                      Train on base Gojūon, Dakuten, and Handakuten characters with real-time romaji recognition.
                    </p>
                    <div className="flex items-center text-emerald-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Start Hiragana Speed Run →
                    </div>
                  </div>
                </div>

                {/* Katakana Card */}
                <div
                  onClick={() => navigate("/practice?type=katakana")}
                  className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-indigo-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      ア
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">Katakana Practice</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
                        71 chars
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">
                      Master loanwords, foreign names, and onomatopoeia with full 71-character Katakana dataset.
                    </p>
                    <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Start Katakana Speed Run →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category 2: Vocabulary & Kanji */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📖</span> Vocabulary & Kanji
                  </h2>
                  <p className="text-sm text-gray-500">
                    Build your core Japanese lexicon from JLPT N5 upwards.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                  JLPT N5-N1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">🗣️</div>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                      Ready for Phase 2
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">JLPT N5 Vocabulary Core</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Learn essential daily verbs, adjectives, numbers, time, and conversation phrases.
                  </p>
                  <div className="text-xs text-gray-400 font-medium">800 Essential Words • Audio & Examples</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">漢</div>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                      Ready for Phase 2
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Kanji Stroke & Meaning Flashcards</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Master On'yomi, Kun'yomi, stroke order, and radicals for beginner Kanji.
                  </p>
                  <div className="text-xs text-gray-400 font-medium">103 N5 Kanji • Stroke Order Animations</div>
                </div>
              </div>
            </div>

            {/* Category 3: Grammar Guide */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>✍️</span> Grammar & Sentence Patterns
                  </h2>
                  <p className="text-sm text-gray-500">
                    Understand particles, verb conjugations, and natural sentence structures.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="bg-emerald-700/60 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Grammar Drills
                  </span>
                  <h3 className="text-2xl font-bold mt-3 mb-2">Japanese Particles & Conjugations</h3>
                  <p className="text-emerald-100 text-sm">
                    Master essential particles like は (wa), が (ga), を (wo), に (ni), で (de) through interactive fill-in-the-blank challenges.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/statistics/japanese")}
                  className="bg-white hover:bg-emerald-50 text-emerald-900 font-bold px-6 py-3 rounded-xl transition shadow-md cursor-pointer whitespace-nowrap"
                >
                  View Learning Stats →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================= */
          /*          ENGLISH LEARNING TRACK         */
          /* ======================================= */
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Category 1: English Mini-Games & Arcade */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>🎮</span> English Mini-Games & Arcade
                  </h2>
                  <p className="text-sm text-gray-500">
                    Engaging word games to boost your vocabulary recall and spelling speed.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  Word Arcade
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Word Match Game Card */}
                <div
                  onClick={() => navigate("/games/english")}
                  className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-indigo-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      🧩
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">Word Match Challenge</h3>
                      <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
                        Timed Game
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">
                      Race against the timer to connect English words with their definitions, synonyms, and antonyms.
                    </p>
                    <div className="flex items-center text-indigo-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Play Word Match →
                    </div>
                  </div>
                </div>

                {/* Word Scramble Card */}
                <div
                  onClick={() => navigate("/games/english")}
                  className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:border-purple-500 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-6 -mt-6 group-hover:scale-110 transition-transform" />
                  <div className="relative">
                    <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-3xl font-bold mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      🔤
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold text-gray-900">Word Scramble Arcade</h3>
                      <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                        Spelling & Speed
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-6">
                      Unscramble jumbled English letters to form correct vocabulary under pressure.
                    </p>
                    <div className="flex items-center text-purple-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
                      Start Scramble Challenge →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category 2: Vocabulary & Idioms */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📚</span> Vocabulary & Phrasal Verbs
                  </h2>
                  <p className="text-sm text-gray-500">
                    High-frequency words, academic collocations, and natural idioms.
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">
                  CEFR A1-C1
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">💼</div>
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2.5 py-0.5 rounded-full">
                      Essential Vocab
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Core 1000 English Words</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Master the top 1000 words that account for 85% of spoken and written English communication.
                  </p>
                  <div className="text-xs text-gray-400 font-medium">Daily Life • Travel • Business • Conversation</div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">💡</div>
                    <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-full">
                      Idiomatic Fluency
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Phrasal Verbs & Everyday Idioms</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Sound like a native speaker with essential phrasal verbs ("get along", "turn down", "run out of").
                  </p>
                  <div className="text-xs text-gray-400 font-medium">200+ Phrasal Verbs with Context Examples</div>
                </div>
              </div>
            </div>

            {/* Category 3: Grammar Drills */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>✍️</span> Grammar Drills & Sentence Patterns
                  </h2>
                  <p className="text-sm text-gray-500">
                    Fix common mistakes in tenses, prepositions, articles, and clause connections.
                  </p>
                </div>
              </div>

              <div className="bg-linear-to-r from-indigo-900 to-blue-900 text-white rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl">
                  <span className="bg-indigo-800/80 text-indigo-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Interactive Quizzes
                  </span>
                  <h3 className="text-2xl font-bold mt-3 mb-2">Tense Mastery & Common Errors</h3>
                  <p className="text-indigo-100 text-sm">
                    Interactive drills covering Present Perfect vs Simple Past, Conditionals (If/Would), and tricky prepositions (in/on/at).
                  </p>
                </div>
                <button
                  onClick={() => navigate("/statistics/english")}
                  className="bg-white hover:bg-indigo-50 text-indigo-900 font-bold px-6 py-3 rounded-xl transition shadow-md cursor-pointer whitespace-nowrap"
                >
                  View Learning Stats →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
