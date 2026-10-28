import { getGamificationSummary } from "../services/gamification.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getMyGamification = action(async (req, res) => {
  return res.json(await getGamificationSummary(getUserId(req)));
}, { label: "getMyGamification", message: "Server error" });
