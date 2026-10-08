import * as assessmentService from "../services/assessment.service";
import { getUserUnits } from "../services/unit.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const listUnits = action(async (req, res) => {
  return res.json({ units: await getUserUnits(getUserId(req)) });
}, { label: "listUnits", message: "Could not load units." });

export const getAssessment = action(async (req, res) => {
  return res.json(await assessmentService.getAssessment(getUserId(req), req.params.unitId));
}, { label: "getAssessment", message: "Could not load the assessment." });

export const submitAssessment = action(async (req, res) => {
  return res.json(await assessmentService.submitAssessment(getUserId(req), req.params.unitId, req.body));
}, { label: "submitAssessment", message: "Could not save the assessment. Please try again." });
