import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
  useParams
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
import XpToast from "./components/XpToast";
import StudyTimeTracker from "./components/StudyTimeTracker";

import { LanguageProvider } from "./context/LanguageProvider";

const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const KanjiPage = lazy(() => import("./pages/KanjiPage"));
const KanjiPracticePage = lazy(() => import("./pages/KanjiPracticePage"));
const KanjiFlashcardsPage = lazy(() => import("./pages/KanjiFlashcardsPage"));
const StudyReferencePage = lazy(() => import("./pages/StudyReferencePage"));
const JapaneseN5LessonPage = lazy(() => import("./pages/JapaneseN5LessonPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const UnitAssessmentPage = lazy(() => import("./pages/UnitAssessmentPage"));
const UnitReviewPage = lazy(() => import("./pages/UnitReviewPage"));
const ReadingPage = lazy(() => import("./pages/ReadingPage"));
const LevelPickerPage = lazy(() => import("./pages/LevelPickerPage"));
const GrammarSummaryPage = lazy(() => import("./pages/GrammarSummaryPage"));
const MockExamPage = lazy(() => import("./pages/MockExamPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const AssistantPage = lazy(() => import("./pages/AssistantPage"));
const FriendsPage = lazy(() => import("./pages/FriendsPage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const SpeakingTestPage = lazy(() => import("./pages/SpeakingTestPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const SkillPracticePage = lazy(() => import("./pages/SkillPracticePage"));
const SrsReviewPage = lazy(() => import("./pages/SrsReviewPage"));
const MistakesPage = lazy(() => import("./pages/MistakesPage"));
const AdminPage = lazy(() => import("./pages/admin/AdminPage"));

function LoadingPage({ label }: { label: string }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><p role="status" className="mx-auto max-w-6xl p-8">{label}</p></div>;
}

// Signed-in learner pages; lazily loaded ones show a labelled placeholder while their code arrives.
const signedIn = (page: ReactNode) => <ProtectedRoute><LearnerRoute>{page}</LearnerRoute></ProtectedRoute>;
const signedInLazy = (label: string, page: ReactNode) => signedIn(<Suspense fallback={<LoadingPage label={label} />}>{page}</Suspense>);

// An invite link (/add/<username>) opens that learner's profile with the invitation shown.
function InviteRedirect() {
  const { username = "" } = useParams();
  return <Navigate to={`/u/${encodeURIComponent(username)}?invite=1`} replace />;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <StudyTimeTracker />
        <XpToast />
        <SiteGate><ActivitySessionBoundary><Routes>
          <Route path="/admin/*" element={<ProtectedRoute><Suspense fallback={<p role="status" className="mx-auto max-w-lg p-8">Loading admin…</p>}><AdminPage /></Suspense></ProtectedRoute>} />
          <Route path="/learn/kanji" element={signedInLazy("Loading Kanji…", <KanjiPage />)} />
          <Route path="/learn/kanji/practice" element={signedInLazy("Loading practice…", <KanjiPracticePage />)} />
          <Route path="/learn/kanji/flashcards" element={signedInLazy("Loading flashcards…", <KanjiFlashcardsPage />)} />
          <Route path="/learn/kanji/:kanjiId" element={signedInLazy("Loading Kanji…", <KanjiPage />)} />
          <Route path="/quizzes" element={signedInLazy("Loading quizzes…", <QuizzesPage />)} />
          <Route path="/quizzes/:unitId" element={signedInLazy("Loading assessment…", <UnitAssessmentPage />)} />
          <Route path="/vocabulary" element={signedInLazy("Loading vocabulary…", <StudyReferencePage key="vocabulary" kind="vocabulary" />)} />
          <Route path="/messages" element={signedInLazy("Loading messages…", <MessagesPage />)} />
          <Route path="/messages/:conversationId" element={signedInLazy("Loading messages…", <MessagesPage />)} />
          <Route path="/support" element={signedInLazy("Loading Help & support…", <SupportPage />)} />
          <Route path="/support/:requestId" element={signedInLazy("Loading Help & support…", <SupportPage />)} />
          <Route path="/assistant" element={signedInLazy("Loading the study assistant…", <AssistantPage />)} />
          <Route path="/friends" element={signedInLazy("Loading friends…", <FriendsPage />)} />
          <Route path="/u/:username" element={signedInLazy("Loading profile…", <PublicProfilePage />)} />
          <Route path="/add/:username" element={signedIn(<InviteRedirect />)} />
          <Route path="/notifications" element={signedInLazy("Loading notifications…", <NotificationsPage />)} />
          <Route path="/achievements" element={signedInLazy("Loading achievements…", <AchievementsPage />)} />
          <Route path="/achievements/:section" element={signedInLazy("Loading achievements…", <AchievementsPage />)} />
          <Route path="/levels" element={signedInLazy("Loading levels…", <LevelPickerPage />)} />
          <Route path="/grammar/summary" element={signedInLazy("Loading grammar summary…", <GrammarSummaryPage />)} />
          <Route path="/mock-exam" element={signedInLazy("Loading mock exam…", <MockExamPage />)} />
          <Route path="/grammar" element={signedInLazy("Loading grammar…", <StudyReferencePage key="grammar" kind="grammar" />)} />
          <Route path="/review/hiragana" element={signedIn(<ReviewPage key="hiragana-review" script="hiragana" />)} />
          <Route path="/review/katakana" element={signedIn(<ReviewPage key="katakana-review" script="katakana" />)} />
          <Route path="/review" element={signedInLazy("Loading review…", <UnitReviewPage />)} />
          <Route path="/srs" element={signedInLazy("Loading your daily review…", <SrsReviewPage />)} />
          <Route path="/mistakes" element={signedInLazy("Loading your mistakes…", <MistakesPage />)} />
          <Route path="/reading" element={signedInLazy("Loading reading…", <ReadingPage />)} />
          <Route path="/listening" element={signedInLazy("Loading listening…", <SkillPracticePage key="listening" skill="listening" />)} />
          <Route path="/speaking/test" element={signedInLazy("Loading the speaking test…", <SpeakingTestPage />)} />
          <Route path="/speaking" element={signedInLazy("Loading speaking…", <SkillPracticePage key="speaking" skill="speaking" />)} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<Suspense fallback={<p role="status" className="p-8">Loading…</p>}><PrivacyPage /></Suspense>} />
          <Route path="/forgot-password" element={<Suspense fallback={<p role="status" className="p-8">Loading…</p>}><ForgotPasswordPage /></Suspense>} />
          <Route path="/reset-password" element={<Suspense fallback={<p role="status" className="p-8">Loading…</p>}><ResetPasswordPage /></Suspense>} />
          <Route path="/verify-email" element={<Suspense fallback={<p role="status" className="p-8">Loading…</p>}><VerifyEmailPage /></Suspense>} />
          <Route path="/practice" element={signedIn(<PracticePage />)} />
          <Route path="/guest/practice" element={<GuestPracticePage />} />
          <Route path="/arcade" element={signedIn(<EnglishArcadePage />)} />
          <Route path="/games/english" element={signedIn(<EnglishArcadePage />)} />
          <Route path="/statistics" element={signedIn(<StatisticsPage />)} />
          <Route path="/statistics/japanese" element={signedIn(<StatisticsPage />)} />
          <Route path="/statistics/japanese/:section" element={signedIn(<StatisticsPage />)} />
          <Route path="/statistics/english" element={signedIn(<StatisticsPage />)} />
          <Route path="/lessons" element={signedInLazy("Loading lessons…", <LessonsPage />)} />
          <Route path="/lessons/japanese/n5-unit-1-hello" element={signedIn(<JapaneseHelloLessonPage />)} />
          <Route path="/lessons/japanese/:lessonSlug" element={signedInLazy("Loading lesson…", <JapaneseN5LessonPage />)} />
          <Route path="/profile" element={signedIn(<ProfilePage />)} />
          <Route path="/settings" element={signedInLazy("Loading settings…", <SettingsPage />)} />
          <Route path="/settings/:section" element={signedInLazy("Loading settings…", <SettingsPage />)} />
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
