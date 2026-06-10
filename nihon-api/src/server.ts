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

app.listen(5000, () => {
  console.log(
    "Server running on port 5000"
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
});