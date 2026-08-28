import express from "express";
import cors from "cors";
import authRoutes
from "./routes/auth.routes";

import {
  authenticate
} from "./middleware/auth.middleware";

import quizRoutes
from "./routes/quiz.routes";

import statisticsRoutes
from "./routes/statistics.routes";

import englishRoutes
from "./routes/english.routes";

// Auto-create game scores table on startup
import "./services/games.seed";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use(
  "/api/auth",
  authRoutes
);

app.get(
  "/profile",
  authenticate,
  (req, res) => {
    res.json({
      user: (req as any).user
    });
  }
);

app.use(
  "/api/quiz",
  quizRoutes
);

app.use(
  "/api/statistics",
  statisticsRoutes
);

app.use(
  "/api/english",
  englishRoutes
);

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
  );
});