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
            path="/"
            element={<HomePage />}
          />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;