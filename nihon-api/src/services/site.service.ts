import { getPublicSettings } from "../repositories/site.repository";
import { getDisabledContent } from "./admin-content.service";

/** Public site state: registration switch, announcement, and content an administrator has disabled. */
export async function getSiteInfo() {
  const [settings, disabled] = await Promise.all([getPublicSettings(), getDisabledContent()]);
  return { ...settings, disabled: disabled.map(({ key, title, paths }) => ({ key, title, paths })) };
}
