import { findSocialSettings, saveSocialSettings } from "../repositories/social-settings.repository";
import type { SocialSettings } from "../repositories/social-settings.repository";
import { HttpError } from "../utils/http-error";

export const getSocialSettings = (userId: number) => findSocialSettings(userId);

/** Friend suggestions, activity sharing and "studying now". Fields left out keep their current value. */
export async function updateSocialSettings(userId: number, input: Record<string, unknown>): Promise<SocialSettings> {
  const current = await findSocialSettings(userId);
  const choose = (name: keyof SocialSettings) => {
    const value = input[name];
    if (value === undefined) return current[name];
    if (typeof value !== "boolean") throw new HttpError(400, "Invalid privacy settings.");
    return value;
  };
  const next = { suggestMe: choose("suggestMe"), shareActivity: choose("shareActivity"), showStudyingNow: choose("showStudyingNow") };
  await saveSocialSettings(userId, next);
  return next;
}
