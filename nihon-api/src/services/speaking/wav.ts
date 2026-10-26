import { HttpError } from "../../utils/http-error";

// Uploaded answers must be the format Azure's short-audio API accepts: WAV, PCM 16-bit, 16 kHz, mono.
export const SAMPLE_RATE = 16_000;
const BYTES_PER_SECOND = SAMPLE_RATE * 2;
const HEADER_BYTES = 44;
/** A little slack over the 30-second answer limit for the recorder's start and stop. */
const MAX_SECONDS = 31;
export const MAX_WAV_BYTES = HEADER_BYTES + MAX_SECONDS * BYTES_PER_SECOND;

/** Checks a base64 WAV upload and returns its bytes and length in seconds. */
export function readWav(base64: unknown): { wav: Buffer; seconds: number } {
  if (typeof base64 !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) throw new HttpError(400, "Send the recording as base64 WAV audio.");
  const wav = Buffer.from(base64, "base64");
  if (wav.length > MAX_WAV_BYTES) throw new HttpError(413, "Recordings can be up to 30 seconds.");
  const isWav = wav.length > HEADER_BYTES && wav.toString("ascii", 0, 4) === "RIFF" && wav.toString("ascii", 8, 12) === "WAVE";
  if (!isWav) throw new HttpError(400, "The recording must be WAV audio.");
  const format = wav.readUInt16LE(20), channels = wav.readUInt16LE(22), sampleRate = wav.readUInt32LE(24), bits = wav.readUInt16LE(34);
  if (format !== 1 || channels !== 1 || sampleRate !== SAMPLE_RATE || bits !== 16) throw new HttpError(400, "The recording must be 16 kHz, 16-bit mono WAV.");
  return { wav, seconds: (wav.length - HEADER_BYTES) / BYTES_PER_SECOND };
}
