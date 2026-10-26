import express from "express";
import cors from "cors";

import { config } from "./config/env";
import { authenticate } from "./middleware/auth.middleware";
import { securityHeaders } from "./middleware/security-headers.middleware";
import { enforceContentAvailability } from "./middleware/content-availability.middleware";
import activityRoutes from "./routes/activity.routes";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import communicationRoutes from "./routes/communication.routes";
import englishRoutes from "./routes/english.routes";
import friendRoutes from "./routes/friend.routes";
import kanjiRoutes from "./routes/kanji.routes";
import lessonRoutes from "./routes/lesson.routes";
import profileRoutes from "./routes/profile.routes";
import quizRoutes from "./routes/quiz.routes";
import reviewRoutes from "./routes/review.routes";
import siteRoutes from "./routes/site.routes";
import { createDefaultSpeakingTestRouter, SPEAKING_BODY_LIMIT } from "./routes/speaking-test.routes";
import statisticsRoutes from "./routes/statistics.routes";
import unitRoutes from "./routes/unit.routes";
import { getRequestUser } from "./utils/request-user";

export function createApp() {
  const settings = config();
  const app = express();
  app.disable("x-powered-by");
  // Behind a proxy, the client address (used by rate limits) comes from X-Forwarded-For, trusted for this many hops.
  if (settings.trustProxyHops > 0) app.set("trust proxy", settings.trustProxyHops);
  app.use(securityHeaders({ isProduction: settings.isProduction }));
  // Browsers may call the API only from the web app's own address(es). Requests without an Origin header
  // (server-to-server, curl) aren't affected by CORS.
  app.use(cors({ origin: settings.corsOrigins, maxAge: 600 }));
  // Spoken answers carry a recording; every other route keeps the default body limit.
  app.use("/api/speaking-tests", express.json({ limit: SPEAKING_BODY_LIMIT }));
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
  app.use("/api/review", reviewRoutes);
  app.use("/api/activity", activityRoutes);
  app.use("/api", communicationRoutes);
  app.use("/api", friendRoutes);
  app.use("/api/speaking-tests", createDefaultSpeakingTestRouter());

  return app;
}
