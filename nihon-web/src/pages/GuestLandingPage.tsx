import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600";
const quizzes = [
  { title: "Hiragana Speed Quiz", mark: "あ", href: "/guest/practice?type=hiragana", description: "Pick the characters you want, then type their romaji as fast as you can." },
  { title: "Katakana Speed Quiz", mark: "ア", href: "/guest/practice?type=katakana", description: "Single, contracted, and extended Katakana — choose your own practice set." },
];
const accountBenefits = [
  "Structured N5 lessons, vocabulary, grammar, and Kanji",
  "Progress, XP, and character mastery saved across sessions",
  "Reviews that focus on the characters you are still learning",
];

export default function GuestLandingPage() {
  return <div className="min-h-screen bg-gray-50 text-gray-900"><Navbar />
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">🇯🇵 Japanese · N5 foundations</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Learn Japanese through active play</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">Try a Kana speed quiz right now — no account needed. Sign in when you want lessons and saved progress.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/register" className={`rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700 ${focus}`}>Create a free account</Link>
          <Link to="/login" className={`rounded-xl border border-gray-200 bg-white px-5 py-3 font-bold text-gray-700 hover:border-emerald-400 ${focus}`}>Sign in</Link>
        </div>
      </header>

      <section aria-labelledby="guest-quiz-heading" className="mt-12">
        <h2 id="guest-quiz-heading" className="text-2xl font-black">Play as a guest</h2>
        <p className="mt-1 text-sm text-gray-500">Your score is shown while you play. Guest sessions are not saved and end when you leave the quiz.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{quizzes.map(quiz => <Link key={quiz.href} to={quiz.href} className={`group rounded-2xl border border-gray-200 bg-white p-6 transition hover:border-emerald-400 hover:shadow-sm ${focus}`}>
          <span aria-hidden="true" lang="ja" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl font-bold text-emerald-800">{quiz.mark}</span>
          <h3 className="mt-3 text-lg font-bold">{quiz.title} <span className="text-emerald-600">→</span></h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{quiz.description}</p>
        </Link>)}</div>
      </section>

      <section aria-labelledby="account-heading" className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <h2 id="account-heading" className="text-xl font-bold">With an account</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">{accountBenefits.map(benefit => <li key={benefit}>✓ {benefit}</li>)}</ul>
      </section>
    </main>
  </div>;
}
