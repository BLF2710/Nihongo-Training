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
import EnglishArcadePage from "./pages/EnglishArcadePage";
import LessonsPage from "./pages/LessonsPage";
import JapaneseHelloLessonPage from "./pages/JapaneseHelloLessonPage";
import JapaneseN5LessonPage from "./pages/JapaneseN5LessonPage";
import ProfilePage from "./pages/ProfilePage";
import HiraganaLearningPage from "./pages/HiraganaLearningPage";

import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
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
                <LessonsPage />
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
