import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PracticePage from "./pages/PracticePage";
import StatisticsPage from "./pages/StatisticsPage";

function App() {

  return (
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
          element={<PracticePage />}
        />

        <Route
          path="/statistics"
          element={<StatisticsPage />}
        />

      </Routes>

    </BrowserRouter>
  );

}

export default App;