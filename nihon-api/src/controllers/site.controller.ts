import { getSiteInfo } from "../services/site.service";
import { action } from "../utils/action";

export const getSite = action(async (_req, res) => {
  return res.json(await getSiteInfo());
}, { label: "Site settings", message: "Site settings are temporarily unavailable.", status: 503 });
