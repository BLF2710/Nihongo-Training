import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import ProtectedRoute
from "./components/ProtectedRoute";
import LearnerRoute from "./components/LearnerRoute";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PracticePage from "./pages/PracticePage";
import GuestPracticePage from "./pages/GuestPracticePage";
import StatisticsPage from "./pages/StatisticsPage";
import ReviewPage from "./pages/ReviewPage";
import EnglishArcadePage from "./pages/EnglishArcadePage";
import JapaneseHelloLessonPage from "./pages/JapaneseHelloLessonPage";
import ProfilePage from "./pages/ProfilePage";
import HiraganaLearningPage from "./pages/HiraganaLearningPage";
import ActivitySessionBoundary from "./components/ActivitySessionBoundary";
import SiteGate from "./components/SiteGate";

import { LanguageProvider } from "./context/LanguageProvider";

const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const KanjiPage = lazy(() => import("./pages/KanjiPage"));
const KanjiPracticePage = lazy(() => import("./pages/KanjiPracticePage"));
const StudyReferencePage = lazy(() => import("./pages/StudyReferencePage"));
const JapaneseN5LessonPage = lazy(() => import("./pages/JapaneseN5LessonPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const UnitAssessmentPage = lazy(() => import("./pages/UnitAssessmentPage"));
const SkillPracticePage = lazy(() => import("./pages/SkillPracticePage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

function LoadingPage({ label }: { label: string }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><p role="status" className="mx-auto max-w-6xl p-8">{label}</p></div>;
}

// Signed-in learner pages; lazily loaded ones show a labelled placeholder while their code arrives.
const signedIn = (page: ReactNode) => <ProtectedRoute><LearnerRoute>{page}</LearnerRoute></ProtectedRoute>;
const signedInLazy = (label: string, page: ReactNode) => signedIn(<Suspense fallback={<LoadingPage label={label} />}>{page}</Suspense>);

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <SiteGate><ActivitySessionBoundary><Routes>
          <Route path="/admin/*" element={<ProtectedRoute><Suspense fallback={<p role="status" className="mx-auto max-w-lg p-8">Loading admin…</p>}><AdminPage /></Suspense></ProtectedRoute>} />
          <Route path="/learn/kanji" element={signedInLazy("Loading Kanji…", <KanjiPage />)} />
          <Route path="/learn/kanji/practice" element={signedInLazy("Loading practice…", <KanjiPracticePage />)} />
          <Route path="/learn/kanji/:kanjiId" element={signedInLazy("Loading Kanji…", <KanjiPage />)} />
          <Route path="/quizzes" element={signedInLazy("Loading quizzes…", <QuizzesPage />)} />
          <Route path="/quizzes/:unitId" element={signedInLazy("Loading assessment…", <UnitAssessmentPage />)} />
          <Route path="/vocabulary" element={signedInLazy("Loading vocabulary…", <StudyReferencePage key="vocabulary" kind="vocabulary" />)} />
          <Route path="/grammar" element={signedInLazy("Loading grammar…", <StudyReferencePage key="grammar" kind="grammar" />)} />
          <Route path="/review/hiragana" element={signedIn(<ReviewPage key="hiragana-review" script="hiragana" />)} />
          <Route path="/review/katakana" element={signedIn(<ReviewPage key="katakana-review" script="katakana" />)} />
          <Route path="/listening" element={signedInLazy("Loading listening…", <SkillPracticePage key="listening" skill="listening" />)} />
          <Route path="/speaking" element={signedInLazy("Loading speaking…", <SkillPracticePage key="speaking" skill="speaking" />)} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/practice" element={signedIn(<PracticePage />)} />
          <Route path="/guest/practice" element={<GuestPracticePage />} />
          <Route path="/arcade" element={signedIn(<EnglishArcadePage />)} />
          <Route path="/games/english" element={signedIn(<EnglishArcadePage />)} />
          <Route path="/statistics" element={signedIn(<StatisticsPage />)} />
          <Route path="/statistics/japanese" element={signedIn(<StatisticsPage />)} />
          <Route path="/statistics/english" element={signedIn(<StatisticsPage />)} />
          <Route path="/lessons" element={signedInLazy("Loading lessons…", <LessonsPage />)} />
          <Route path="/lessons/japanese/n5-unit-1-hello" element={signedIn(<JapaneseHelloLessonPage />)} />
          <Route path="/lessons/japanese/:lessonSlug" element={signedInLazy("Loading lesson…", <JapaneseN5LessonPage />)} />
          <Route path="/profile" element={signedIn(<ProfilePage />)} />
          <Route path="/learn/hiragana" element={signedIn(<HiraganaLearningPage />)} />
          <Route path="/learn/hiragana/:characterId" element={signedIn(<HiraganaLearningPage />)} />
          <Route path="/learn/katakana" element={signedIn(<HiraganaLearningPage key="katakana" script="katakana" />)} />
          <Route path="/learn/katakana/:characterId" element={signedIn(<HiraganaLearningPage key="katakana" script="katakana" />)} />
          <Route path="/" element={<LearnerRoute><HomePage /></LearnerRoute>} />
        </Routes></ActivitySessionBoundary></SiteGate>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
