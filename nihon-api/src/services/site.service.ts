import { config } from "../config/env";
import { getPublicSettings } from "../repositories/site.repository";
import { getDisabledContent } from "./admin-content.service";

/**
 * Public site state: registration switch, announcement, and content an administrator has disabled.
 * An announcement for signed-in learners is not sent to guests at all (sign-in, register and guest pages).
 */
export async function getSiteInfo(signedIn: boolean) {
  const [settings, disabled] = await Promise.all([getPublicSettings(), getDisabledContent()]);
  const { announcement_audience: audience, ...rest } = settings ?? {};
  return {
    ...rest, announcement: audience === "learners" && !signedIn ? "" : rest.announcement ?? "",
    disabled: disabled.map(({ key, title, paths }) => ({ key, title, paths })),
    // A client id is public: it identifies the app to Google and is shown in every sign-in button.
    googleClientId: config().googleClientId,
  };
}
