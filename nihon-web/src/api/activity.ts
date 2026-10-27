import api, { API_URL } from "./axios";
import { getToken, hasSession } from "../lib/authStorage";

export type PracticeKind = "listening" | "speaking" | "reading" | "mock-exam";
export type DailyGoalProgress = { secondsToday: number; minutesToday: number; goalMinutes: number; isGoalMet: boolean };

/**
 * Reports a finished listening, speaking, reading or mock-exam session. These are graded in the browser;
 * the server records the session and counts today toward the learner's streak. Failure is not shown:
 * the practice itself already happened, and only the streak would miss it.
 */
export function recordPractice(kind: PracticeKind, scope: string, answered: number, correct: number) {
  if (!hasSession() || answered < 1) return;
  void api.post("/activity/practice", { kind, scope, answered, correct }).catch(() => { /* see above */ });
}

export async function fetchTodayProgress(signal?: AbortSignal) {
  return (await api.get<DailyGoalProgress>("/activity/today", { signal })).data;
}

/**
 * Reports active study time. Sent with `keepalive`, so the last report still arrives when the tab closes.
 * Resolves to today's progress, or null when it couldn't be saved (a missed minute is not worth an error).
 */
export async function reportStudyTime(seconds: number): Promise<DailyGoalProgress | null> {
  const token = getToken();
  if (!token || seconds <= 0) return null;
  try {
    const response = await fetch(`${API_URL}/activity/study-time`, {
      method: "POST", keepalive: true, body: JSON.stringify({ seconds }),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return response.ok ? await response.json() as DailyGoalProgress : null;
  } catch {
    return null;
  }
}
