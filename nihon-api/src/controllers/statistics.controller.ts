import { getLearningOverview } from "../services/learning-statistics.service";
import * as statisticsService from "../services/statistics.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getStatistics = action(async (req, res) => {
  return res.json(await statisticsService.getStatistics(getUserId(req)));
}, { label: "Error in getStatistics:", message: "Server error" });

export const getStatisticsOverview = action(async (req, res) => res.json(await getLearningOverview(getUserId(req))),
  { label: "getStatisticsOverview", message: "Could not load your statistics." });
