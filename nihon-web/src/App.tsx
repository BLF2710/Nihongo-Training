import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import ProtectedRoute
from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PracticePage from "./pages/PracticePage";
import StatisticsPage from "./pages/StatisticsPage";
import ReviewPage from "./pages/ReviewPage";
import EnglishArcadePage from "./pages/EnglishArcadePage";
import JapaneseHelloLessonPage from "./pages/JapaneseHelloLessonPage";
import ProfilePage from "./pages/ProfilePage";
import HiraganaLearningPage from "./pages/HiraganaLearningPage";
import ActivitySessionBoundary from "./components/ActivitySessionBoundary";

import { LanguageProvider } from "./context/LanguageProvider";

const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const KanjiPage = lazy(() => import("./pages/KanjiPage"));
const KanjiPracticePage = lazy(() => import("./pages/KanjiPracticePage"));
const StudyReferencePage = lazy(() => import("./pages/StudyReferencePage"));
const JapaneseN5LessonPage = lazy(() => import("./pages/JapaneseN5LessonPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const UnitAssessmentPage = lazy(() => import("./pages/UnitAssessmentPage"));

function LoadingPage({ label }: { label: string }) {
  return <div className="min-h-screen bg-gray-50"><Navbar /><p role="status" className="mx-auto max-w-6xl p-8">{label}</p></div>;
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ActivitySessionBoundary><Routes>
          <Route path="/learn/kanji" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading Kanji…" />}><KanjiPage /></Suspense></ProtectedRoute>} />
          <Route path="/learn/kanji/practice" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading practice…" />}><KanjiPracticePage /></Suspense></ProtectedRoute>} />
          <Route path="/learn/kanji/:kanjiId" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading Kanji…" />}><KanjiPage /></Suspense></ProtectedRoute>} />
          <Route path="/quizzes" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading quizzes…" />}><QuizzesPage /></Suspense></ProtectedRoute>} />
          <Route path="/quizzes/:unitId" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading assessment…" />}><UnitAssessmentPage /></Suspense></ProtectedRoute>} />
          <Route path="/vocabulary" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading vocabulary…" />}><StudyReferencePage key="vocabulary" kind="vocabulary" /></Suspense></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading grammar…" />}><StudyReferencePage key="grammar" kind="grammar" /></Suspense></ProtectedRoute>} />
          <Route path="/review/hiragana" element={<ProtectedRoute><ReviewPage key="hiragana-review" script="hiragana" /></ProtectedRoute>} />
          <Route path="/review/katakana" element={<ProtectedRoute><ReviewPage key="katakana-review" script="katakana" /></ProtectedRoute>} />
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <PracticePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/arcade"
            element={
              <ProtectedRoute>
                <EnglishArcadePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games/english"
            element={
              <ProtectedRoute>
                <EnglishArcadePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics/japanese"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/statistics/english"
            element={
              <ProtectedRoute>
                <StatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingPage label="Loading lessons…" />}><LessonsPage /></Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lessons/japanese/n5-unit-1-hello"
            element={
              <ProtectedRoute>
                <JapaneseHelloLessonPage />
              </ProtectedRoute>
            }
          />
          <Route path="/lessons/japanese/:lessonSlug" element={<ProtectedRoute><Suspense fallback={<LoadingPage label="Loading lesson…" />}><JapaneseN5LessonPage /></Suspense></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/learn/hiragana" element={<ProtectedRoute><HiraganaLearningPage /></ProtectedRoute>} />
          <Route path="/learn/hiragana/:characterId" element={<ProtectedRoute><HiraganaLearningPage /></ProtectedRoute>} />
          <Route path="/learn/katakana" element={<ProtectedRoute><HiraganaLearningPage key="katakana" script="katakana" /></ProtectedRoute>} />
          <Route path="/learn/katakana/:characterId" element={<ProtectedRoute><HiraganaLearningPage key="katakana" script="katakana" /></ProtectedRoute>} />
          <Route
            path="/"
            element={<HomePage />}
          />
        </Routes></ActivitySessionBoundary>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
