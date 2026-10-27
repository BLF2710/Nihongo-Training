import { recordPracticeSession } from "../services/practice-activity.service";
import { getDailyGoalProgress, reportStudyTime } from "../services/study-time.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const recordPractice = action(async (req, res) => res.status(201).json(await recordPracticeSession(getUserId(req), req.body ?? {})),
  { label: "recordPractice", message: "Could not save the practice session." });

export const recordStudyTime = action(async (req, res) => res.json(await reportStudyTime(getUserId(req), req.body?.seconds)),
  { label: "recordStudyTime", message: "Could not save study time." });

export const getToday = action(async (req, res) => res.json(await getDailyGoalProgress(getUserId(req))),
  { label: "getToday", message: "Could not load today's progress." });
