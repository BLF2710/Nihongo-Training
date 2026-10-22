import { recordPracticeSession } from "../services/practice-activity.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const recordPractice = action(async (req, res) => res.status(201).json(await recordPracticeSession(getUserId(req), req.body ?? {})),
  { label: "recordPractice", message: "Could not save the practice session." });
