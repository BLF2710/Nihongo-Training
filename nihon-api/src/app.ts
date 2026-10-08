import express from "express";
import cors from "cors";

import { authenticate } from "./middleware/auth.middleware";
import { enforceContentAvailability } from "./middleware/content-availability.middleware";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import englishRoutes from "./routes/english.routes";
import kanjiRoutes from "./routes/kanji.routes";
import lessonRoutes from "./routes/lesson.routes";
import profileRoutes from "./routes/profile.routes";
import quizRoutes from "./routes/quiz.routes";
import siteRoutes from "./routes/site.routes";
import statisticsRoutes from "./routes/statistics.routes";
import unitRoutes from "./routes/unit.routes";
import { getRequestUser } from "./utils/request-user";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Admin and site routes stay reachable while an activity is disabled.
  app.use("/api/admin", adminRoutes);
  app.use("/api/site", siteRoutes);
  app.use("/api", enforceContentAvailability);

  app.get("/", (req, res) => {
    res.send("API Running");
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/lessons", lessonRoutes);
  app.use("/api/units", unitRoutes);
  app.use("/api/kanji", kanjiRoutes);

  app.get("/profile", authenticate, (req, res) => {
    res.json({ user: getRequestUser(req) });
  });

  app.use("/api/quiz", quizRoutes);
  app.use("/api/statistics", statisticsRoutes);
  app.use("/api/english", englishRoutes);

  return app;
}
