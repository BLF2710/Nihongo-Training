import { randomBytes } from "node:crypto";
import { deleteAvatar, findAvatarImage, saveAvatar } from "../repositories/avatar.repository";
import { HttpError } from "../utils/http-error";
import { InvalidImageError, sharpAvatarProcessor } from "./images/avatar-processor";
import type { AvatarProcessor } from "./images/avatar-processor";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// The stored picture is far smaller; this only bounds what the server will decode.
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const KEY_BYTES = 16;
const KEY_PATTERN = /^([0-9a-f]{32})\.webp$/;

const avatarPath = (key: string) => `/avatars/${key}.webp`;

/** Re-encodes and stores a new profile picture; returns its address (relative to the API). */
export async function uploadAvatar(userId: number, body: unknown, processor: AvatarProcessor = sharpAvatarProcessor) {
  if (!Buffer.isBuffer(body) || body.length === 0) throw new HttpError(400, "Choose a JPEG, PNG, WebP or GIF image.");
  let image: Buffer;
  try { image = await processor.toAvatar(body); }
  catch (error) {
    if (error instanceof InvalidImageError) throw new HttpError(400, error.message);
    throw error;
  }
  const key = randomBytes(KEY_BYTES).toString("hex");
  await saveAvatar(userId, key, image);
  return { avatar: avatarPath(key), bytes: image.length };
}

export async function removeAvatar(userId: number) {
  await deleteAvatar(userId);
  return { avatar: null };
}

/** The stored picture for a public address such as `<key>.webp`. */
export async function getAvatarImage(file: unknown): Promise<Buffer> {
  const key = typeof file === "string" ? KEY_PATTERN.exec(file)?.[1] : undefined;
  const image = key ? await findAvatarImage(key) : undefined;
  if (!image) throw new HttpError(404, "Picture not found.");
  return image;
}
