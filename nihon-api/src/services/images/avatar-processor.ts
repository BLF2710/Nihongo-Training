import sharp from "sharp";

// Small on purpose: shown at most ~80 px wide (160 px on high-density screens would gain little for a few KB more).
export const AVATAR_SIZE = 128;
const WEBP_QUALITY = 70;
// Refuses decompression bombs: a tiny file that would decode to an enormous image.
const MAX_INPUT_PIXELS = 40_000_000;

export class InvalidImageError extends Error {
  constructor() { super("That file isn't an image we can read."); this.name = "InvalidImageError"; }
}

/** Turns an uploaded image into the stored profile picture. */
export interface AvatarProcessor {
  toAvatar(input: Buffer): Promise<Buffer>;
}

/**
 * A square WebP cropped from the centre, upright (the photo's rotation applied). Re-encoding drops everything but
 * the pixels: camera details, GPS location and any other metadata. Only the first frame of an animation is kept.
 */
export const sharpAvatarProcessor: AvatarProcessor = {
  async toAvatar(input) {
    try {
      return await sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, pages: 1 })
        .rotate()
        .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "attention" })
        .webp({ quality: WEBP_QUALITY, effort: 6 })
        .toBuffer();
    } catch {
      throw new InvalidImageError();
    }
  },
};
