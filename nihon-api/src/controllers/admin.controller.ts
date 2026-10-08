import * as adminService from "../services/admin.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getAccess = action(async (req, res) => {
  return res.json(await adminService.getAccess(getUserId(req)));
}, { label: "Admin access", message: "Account access is unavailable.", status: 503 });

export const getOverview = action(async (_req, res) => {
  return res.json(await adminService.getOverview());
}, { label: "Admin overview", message: "System status is unavailable. Check the database connection.", status: 503 });

export const listUsers = action(async (req, res) => {
  return res.json(await adminService.listUsers(req.query.search, req.query.page));
}, { label: "Admin users", message: "Could not load users." });

export const updateUser = action(async (req, res) => {
  return res.json(await adminService.updateUser(getUserId(req), Number(req.params.id), req.body ?? {}));
}, { label: "Admin user update", message: "Could not update the user." });

export const getSettings = action(async (_req, res) => {
  return res.json(await adminService.getSystemSettings());
}, { label: "Admin settings", message: "Could not load settings." });

export const updateSettings = action(async (req, res) => {
  return res.json(await adminService.saveSettings(getUserId(req), req.body ?? {}));
}, { label: "Admin settings update", message: "Could not save settings." });

export const listContent = action(async (_req, res) => {
  return res.json(await adminService.listContent());
}, { label: "Admin content", message: "Could not load content." });

export const updateContent = action(async (req, res) => {
  return res.json(await adminService.setContentEnabled(getUserId(req), String(req.params.key), req.body?.enabled));
}, { label: "Admin content update", message: "Could not update content availability." });
