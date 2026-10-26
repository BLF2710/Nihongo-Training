import bcrypt from "bcrypt";
import { listEarnedAchievements } from "../repositories/achievement.repository";
import { findProfileSummary, updateProfile } from "../repositories/profile.repository";
import { findIdentityOfUser } from "../repositories/identity.repository";
import { deactivateUser, findPasswordHash } from "../repositories/user.repository";
import { HttpError } from "../utils/http-error";
import { getXPProgress, getRankFromXP } from "./progression.service";

const PASSWORD_HASH_ROUNDS = 12;

const stringOrNull = (value: unknown, max: number) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

async function passwordMatches(userId: number, password: unknown): Promise<boolean> {
  const hash = await findPasswordHash(userId);
  return Boolean(hash) && typeof password === "string" && await bcrypt.compare(password, hash!);
}

export async function getProfile(userId: number) {
  const profile = await findProfileSummary(userId);
  if (!profile) throw new HttpError(404, "Profile not found");
  const xp = Number(profile.xp);
  const achievements = await listEarnedAchievements(userId);
  const xpProgress = getXPProgress(xp);
  const [hasPassword, google] = await Promise.all([findPasswordHash(userId).then(Boolean), findIdentityOfUser(userId, "google")]);
  return { ...profile, xp, level: xpProgress.level, rank: getRankFromXP(xp), xpProgress, achievements, sign_in: { password: hasPassword, google: google ? { email: google.email } : null } };
}

export async function saveProfile(userId: number, input: Record<string, unknown>) {
  const { displayName, avatar, bio, nativeLanguage, learningLanguage, learningGoal, dailyGoal, profileVisibility } = input;
  // Left out by older clients: the current setting is kept.
  const friendRequests = input.friendRequests ?? null;
  if (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 80) {
    throw new HttpError(400, "Display name is required and must be at most 80 characters.");
  }
  const daily = Number(dailyGoal);
  if (!Number.isInteger(daily) || daily < 1 || daily > 1440 || typeof profileVisibility !== "string" || !["private", "friends", "public"].includes(profileVisibility)
    || (friendRequests !== null && (typeof friendRequests !== "string" || !["everyone", "nobody"].includes(friendRequests)))) {
    throw new HttpError(400, "Invalid learning or privacy settings.");
  }
  await updateProfile(userId, {
    displayName: displayName.trim(),
    avatar: stringOrNull(avatar, 500),
    bio: typeof bio === "string" ? bio.trim().slice(0, 500) : "",
    nativeLanguage: stringOrNull(nativeLanguage, 80),
    learningLanguage: stringOrNull(learningLanguage, 80) || "Japanese",
    learningGoal: stringOrNull(learningGoal, 120),
    dailyGoal: daily,
    profileVisibility,
    friendRequests: friendRequests as string | null,
  });
}

export async function deactivateAccount(userId: number, input: Record<string, unknown>) {
  if (!(await passwordMatches(userId, input.password))) throw new HttpError(401, "Password is incorrect.");
  await deactivateUser(userId);
}
