import express, { Router } from "express";
import { speakingTestHandlers } from "../controllers/speaking-test.controller";
import { authenticate } from "../middleware/auth.middleware";
import { contentGraderFromEnv } from "../services/speaking/content-grader";
import { pronunciationAssessorFromEnv } from "../services/speaking/pronunciation-assessor";
import { createSpeakingTestService } from "../services/speaking/speaking-test.service";
import type { SpeakingTestService } from "../services/speaking/speaking-test.service";

// A 30-second WAV recording is about 1.3 MB once base64-encoded, above the app's default JSON limit.
export const SPEAKING_BODY_LIMIT = "1.5mb";

/** Mounted at /api/speaking-tests. Switched off with the "speaking" content key, like speaking practice. */
export function createSpeakingTestRouter(service: SpeakingTestService): Router {
  const handlers = speakingTestHandlers(service);
  const router = Router();
  router.use(authenticate);
  router.get("/", handlers.listTasks);
  router.get("/tasks/:taskId/attempts", handlers.listAttempts);
  router.post("/tasks/:taskId/attempts", express.json({ limit: SPEAKING_BODY_LIMIT }), handlers.submitAnswer);
  router.get("/attempts/:attemptId", handlers.getAttempt);
  router.post("/attempts/:attemptId/report", handlers.reportAttempt);
  return router;
}

export const createDefaultSpeakingTestRouter = () =>
  createSpeakingTestRouter(createSpeakingTestService({ assessor: pronunciationAssessorFromEnv(), grader: contentGraderFromEnv() }));
