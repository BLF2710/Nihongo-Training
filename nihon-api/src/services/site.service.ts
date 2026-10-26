import { getPublicSettings } from "../repositories/site.repository";
import { getDisabledContent } from "./admin-content.service";

/**
 * Public site state: registration switch, announcement, and content an administrator has disabled.
 * An announcement for signed-in learners is not sent to guests at all (sign-in, register and guest pages).
 */
export async function getSiteInfo(signedIn: boolean) {
  const [settings, disabled] = await Promise.all([getPublicSettings(), getDisabledContent()]);
  const { announcement_audience: audience, ...rest } = settings ?? {};
  return { ...rest, announcement: audience === "learners" && !signedIn ? "" : rest.announcement ?? "", disabled: disabled.map(({ key, title, paths }) => ({ key, title, paths })) };
}
