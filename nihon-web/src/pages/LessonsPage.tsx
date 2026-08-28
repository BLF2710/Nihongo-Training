import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LessonsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex-1">
        <button onClick={() => navigate("/")} className="text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer">← Dashboard</button>
        <div className="mt-6 mb-8">
          <span className="inline-flex bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">🇯🇵 Japanese • N5 Beginner</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900">Lessons</h1>
          <p className="mt-2 text-gray-600">Build practical Japanese step by step.</p>
        </div>
        <button onClick={() => navigate("/lessons/japanese/n5-unit-1-hello")} className="w-full text-left bg-white rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition p-6 sm:p-8 cursor-pointer">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl font-bold">1</div>
            <div className="flex-1"><p className="text-xs font-bold tracking-wider uppercase text-emerald-700">Unit 1 • Lesson 1 • 5–10 min</p><h2 className="mt-1 text-2xl font-black text-gray-900">How to Say Hello</h2><p className="mt-1 text-sm text-gray-600">Learn eight everyday greetings, when to use them, and casual versus polite Japanese.</p></div>
            <span className="text-emerald-700 font-bold">Start lesson →</span>
          </div>
        </button>
      </main>
    </div>
  );
}
