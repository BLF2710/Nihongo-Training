import { getSystemStatus as systemStatus } from "../services/system-status.service";
import { accountSecurity } from "../services/account-security.service";
import * as adminService from "../services/admin.service";
import { getLearningAnalytics } from "../services/analytics.service";
import * as questionBankService from "../services/question-bank.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getAccess = action(async (req, res) => {
  return res.json(await adminService.getAccess(getUserId(req)));
}, { label: "Admin access", message: "Account access is unavailable.", status: 503 });

export const getAnalytics = action(async (_req, res) => res.json(await getLearningAnalytics()),
  { label: "Admin analytics", message: "Learning analytics are unavailable right now." });

export const getOverview = action(async (_req, res) => {
  return res.json(await adminService.getOverview());
}, { label: "Admin overview", message: "System status is unavailable. Check the database connection.", status: 503 });

export const listUsers = action(async (req, res) => {
  return res.json(await adminService.listUsers(req.query.search, req.query.page));
}, { label: "Admin users", message: "Could not load users." });

export const updateUser = action(async (req, res) => {
  return res.json(await adminService.updateUser(getUserId(req), Number(req.params.id), req.body ?? {}));
}, { label: "Admin user update", message: "Could not update the user." });

export const getSystemStatus = action(async (_req, res) => res.json(await systemStatus()),
  { label: "Admin system status", message: "System status is unavailable. Check the database connection.", status: 503 });

export const sendPasswordReset = action(async (req, res) => {
  return res.json(await accountSecurity().sendResetLinkForUser(getUserId(req), req.params.id, req.body?.signOut));
}, { label: "Admin password reset", message: "Could not send the reset link." });

export const updateLessonAccess = action(async (req, res) => {
  return res.json(await adminService.setLessonAccess(getUserId(req), req.params.id, req.body?.unlocked));
}, { label: "Admin lesson access", message: "Could not change lesson access." });

export const getSettings = action(async (_req, res) => {
  return res.json(await adminService.getSystemSettings());
}, { label: "Admin settings", message: "Could not load settings." });

export const updateSettings = action(async (req, res) => {
  return res.json(await adminService.saveSettings(getUserId(req), req.body ?? {}));
}, { label: "Admin settings update", message: "Could not save settings." });

export const listContent = action(async (_req, res) => {
  return res.json(await adminService.listContent());
}, { label: "Admin content", message: "Could not load content." });

export const listQuestions = action(async (_req, res) => {
  return res.json(await questionBankService.getQuestionBank());
}, { label: "Admin questions", message: "Could not load the question bank." });

export const createQuestion = action(async (req, res) => {
  return res.status(201).json(await questionBankService.addQuestion(getUserId(req), req.body ?? {}));
}, { label: "Admin question create", message: "Could not save the question." });

export const updateQuestion = action(async (req, res) => {
  return res.json(await questionBankService.editQuestion(getUserId(req), req.params.id, req.body ?? {}));
}, { label: "Admin question update", message: "Could not save the question." });

export const deleteQuestion = action(async (req, res) => {
  await questionBankService.removeQuestion(getUserId(req), req.params.id);
  return res.json({ deleted: true });
}, { label: "Admin question delete", message: "Could not delete the question." });

export const updateContent = action(async (req, res) => {
  return res.json(await adminService.setContentEnabled(getUserId(req), String(req.params.key), req.body?.enabled));
}, { label: "Admin content update", message: "Could not update content availability." });
