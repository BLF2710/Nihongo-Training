import * as profileService from "../services/profile.service";
import { action } from "../utils/action";
import { getUserId } from "../utils/request-user";

export const getMyProfile = action(async (req, res) => {
  return res.json(await profileService.getProfile(getUserId(req)));
}, { label: "getMyProfile", message: "Server error" });

export const updateMyProfile = action(async (req, res) => {
  const userId = getUserId(req);
  await profileService.saveProfile(userId, req.body);
  return res.json(await profileService.getProfile(userId));
}, { label: "updateMyProfile", message: "Server error" });

export const changePassword = action(async (req, res) => {
  await profileService.changePassword(getUserId(req), req.body);
  return res.json({ message: "Password updated" });
}, { label: "changePassword", message: "Server error" });

export const deactivateAccount = action(async (req, res) => {
  await profileService.deactivateAccount(getUserId(req), req.body);
  return res.json({ message: "Account deactivated" });
}, { label: "deactivateAccount", message: "Server error" });
