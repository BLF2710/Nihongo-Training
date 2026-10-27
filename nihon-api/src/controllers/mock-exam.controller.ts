import * as mockExamService from "../services/mock-exam.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const submitMockExam = action(async (req, res) => res.status(201).json(await mockExamService.submitMockExam(getUserId(req), req.params.level, req.body ?? {})),
  { label: "submitMockExam", message: "Could not save the mock exam. Please try again." });

export const getMockExamHistory = action(async (req, res) => res.json(await mockExamService.getMockHistory(getUserId(req), req.params.level)),
  { label: "getMockExamHistory", message: "Could not load your mock exam results." });
