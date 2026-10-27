import * as avatarService from "../services/avatar.service";
import { accountSecurity } from "../services/account-security.service";
import * as profileService from "../services/profile.service";
import { saveTimeZone } from "../services/streak.service";
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

// The other devices are signed out; the response carries a new token for this one.
export const changePassword = action(async (req, res) => {
  return res.json(await accountSecurity().changePassword(getUserId(req), req.body ?? {}));
}, { label: "changePassword", message: "Server error" });

export const deactivateAccount = action(async (req, res) => {
  await profileService.deactivateAccount(getUserId(req), req.body);
  return res.json({ message: "Account deactivated" });
}, { label: "deactivateAccount", message: "Server error" });

export const updateTimeZone = action(async (req, res) => res.json(await saveTimeZone(getUserId(req), req.body?.timeZone)),
  { label: "updateTimeZone", message: "Could not save your time zone." });

export const uploadMyAvatar = action(async (req, res) => {
  return res.json(await avatarService.uploadAvatar(getUserId(req), req.body));
}, { label: "uploadAvatar", message: "Could not save the picture." });

export const removeMyAvatar = action(async (req, res) => {
  return res.json(await avatarService.removeAvatar(getUserId(req)));
}, { label: "removeAvatar", message: "Could not remove the picture." });
