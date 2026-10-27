import { getAvatarImage } from "../services/avatar.service";
import { action } from "../utils/action";

// A picture's address changes with every upload, so a copy can be kept for good.
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

export const getAvatar = action(async (req, res) => {
  const image = await getAvatarImage(req.params.file);
  res.set({
    "Content-Type": "image/webp",
    "Cache-Control": `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
    // The web app shows pictures from the API's address.
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  return res.send(image);
}, { label: "getAvatar", message: "Could not load the picture." });
