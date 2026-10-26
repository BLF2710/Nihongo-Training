import { isSignedIn } from "../middleware/auth.middleware";
import { getSiteInfo } from "../services/site.service";
import { action } from "../utils/action";

export const getSite = action(async (req, res) => {
  res.set("Cache-Control", "private, no-store");
  return res.json(await getSiteInfo(await isSignedIn(req)));
}, { label: "Site settings", message: "Site settings are temporarily unavailable.", status: 503 });
