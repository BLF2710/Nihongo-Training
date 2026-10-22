import api from "./axios";
import { hasSession } from "../lib/authStorage";

export type PracticeKind = "listening" | "speaking" | "reading" | "mock-exam";

/**
 * Reports a finished listening, speaking, reading or mock-exam session. These are graded in the browser;
 * the server records the session and counts today toward the learner's streak. Failure is not shown:
 * the practice itself already happened, and only the streak would miss it.
 */
export function recordPractice(kind: PracticeKind, scope: string, answered: number, correct: number) {
  if (!hasSession() || answered < 1) return;
  void api.post("/activity/practice", { kind, scope, answered, correct }).catch(() => { /* see above */ });
}
