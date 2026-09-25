import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import ProtectedRoute
from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PracticePage from "./pages/PracticePage";
import StatisticsPage from "./pages/StatisticsPage";
import ReviewPage from "./pages/ReviewPage";
import EnglishArcadePage from "./pages/EnglishArcadePage";
import JapaneseHelloLessonPage from "./pages/JapaneseHelloLessonPage";
import JapaneseN5LessonPage from "./pages/JapaneseN5LessonPage";
import ProfilePage from "./pages/ProfilePage";
import HiraganaLearningPage from "./pages/HiraganaLearningPage";
import StudyReferencePage from "./pages/StudyReferencePage";
import { JAPANESE_UNIT_1_REFERENCE } from "./data/japaneseUnit1Reference";

import { LanguageProvider } from "./context/LanguageProvider";

const QuizzesPage = lazy(() => import("./pages/QuizzesPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const UnitAssessmentPage = lazy(() => import("./pages/UnitAssessmentPage"));

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/quizzes" element={<ProtectedRoute><Suspense fallback={<p role="status" className="p-8">Loading quizzes…</p>}><QuizzesPage /></Suspense></ProtectedRoute>} />
          <Route path="/quizzes/:unitId" element={<ProtectedRoute><Suspense fallback={<p role="status" className="p-8">Loading assessment…</p>}><UnitAssessmentPage /></Suspense></ProtectedRoute>} />
          <Route path="/vocabulary" element={<ProtectedRoute><StudyReferencePage key="vocabulary" kind="vocabulary" unit={JAPANESE_UNIT_1_REFERENCE} /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute><StudyReferencePage key="grammar" kind="grammar" unit={JAPANESE_UNIT_1_REFERENCE} /></ProtectedRoute>} />
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
                <Suspense fallback={<p role="status" className="p-8">Loading lessons…</p>}><LessonsPage /></Suspense>
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
          <Route path="/lessons/japanese/:lessonSlug" element={<ProtectedRoute><JapaneseN5LessonPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/learn/hiragana" element={<ProtectedRoute><HiraganaLearningPage /></ProtectedRoute>} />
          <Route path="/learn/hiragana/:characterId" element={<ProtectedRoute><HiraganaLearningPage /></ProtectedRoute>} />
          <Route path="/learn/katakana" element={<ProtectedRoute><HiraganaLearningPage key="katakana" script="katakana" /></ProtectedRoute>} />
          <Route path="/learn/katakana/:characterId" element={<ProtectedRoute><HiraganaLearningPage key="katakana" script="katakana" /></ProtectedRoute>} />
          <Route
            path="/"
            element={<HomePage />}
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
