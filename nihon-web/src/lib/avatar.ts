import { API_URL } from "../api/axios";

/** The full address of a profile picture, from the path the API returns (e.g. /avatars/<key>.webp). */
export const avatarUrl = (path: string) => `${API_URL}${path}`;

// Big enough for the server to make a sharp 128-pixel picture; small enough that a phone photo uploads in a moment.
const UPLOAD_SIZE = 256;
const UPLOAD_QUALITY = 0.85;

export class UnreadableImageError extends Error {
  constructor() { super("That file isn't an image this browser can read."); this.name = "UnreadableImageError"; }
}

/** A square crop from the centre of the image, shrunk to 256 × 256 before upload (the server re-encodes it anyway). */
export async function shrinkForUpload(file: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file); }
  catch { throw new UnreadableImageError(); }
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(UPLOAD_SIZE, side);
  canvas.getContext("2d")?.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", UPLOAD_QUALITY));
  if (!blob) throw new UnreadableImageError();
  return blob;
}
