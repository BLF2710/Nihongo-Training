// Records a spoken answer and converts it to the format the server and Azure accept: WAV, PCM 16-bit, 16 kHz, mono.
// The browser records in its own format (MediaRecorder); the audio is decoded and resampled after recording.

export const TARGET_SAMPLE_RATE = 16_000;

export type Recording = { base64: string; seconds: number; playbackUrl: string };
export type RecorderSession = { stop: () => Promise<Recording>; cancel: () => void };

export class MicrophoneError extends Error {
  constructor(message: string) { super(message); this.name = "MicrophoneError"; }
}

export const supportsRecording = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined";

function microphoneMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "Microphone access is blocked. Allow the microphone for this site, then try again.";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "No microphone was found. Connect one, then try again.";
  if (name === "NotReadableError") return "The microphone is being used by another app. Close it, then try again.";
  return "The microphone couldn't be started. Please try again.";
}

/** Starts recording from the microphone. */
export async function startRecording(): Promise<RecorderSession> {
  if (!supportsRecording()) throw new MicrophoneError("This browser can't record audio. Try a recent Chrome, Edge, Firefox or Safari.");
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
  } catch (error) {
    throw new MicrophoneError(microphoneMessage(error));
  }
  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(stream);
  recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
  recorder.start();
  const release = () => stream.getTracks().forEach(track => track.stop());
  return {
    cancel: () => { if (recorder.state !== "inactive") recorder.stop(); release(); },
    stop: () => new Promise<Recording>((resolve, reject) => {
      recorder.addEventListener("stop", () => {
        release();
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        toWav(blob).then(wav => resolve({ ...wav, playbackUrl: URL.createObjectURL(blob) }), reject);
      }, { once: true });
      recorder.stop();
    }),
  };
}

async function toWav(blob: Blob): Promise<{ base64: string; seconds: number }> {
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const offline = new OfflineAudioContext(1, Math.max(1, Math.ceil(decoded.duration * TARGET_SAMPLE_RATE)), TARGET_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const samples = (await offline.startRendering()).getChannelData(0);
    return { base64: bytesToBase64(encodeWav(samples)), seconds: samples.length / TARGET_SAMPLE_RATE };
  } catch {
    throw new MicrophoneError("The recording couldn't be processed. Please record again.");
  } finally {
    void context.close();
  }
}

/** 16-bit PCM WAV (mono, 16 kHz) from samples between -1 and 1. */
export function encodeWav(samples: Float32Array): Uint8Array {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); text(8, "WAVE"); text(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, TARGET_SAMPLE_RATE, true);
  view.setUint32(28, TARGET_SAMPLE_RATE * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => { const clamped = Math.max(-1, Math.min(1, sample)); view.setInt16(44 + index * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true); });
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const STEP = 0x8000;
  for (let index = 0; index < bytes.length; index += STEP) binary += String.fromCharCode(...bytes.subarray(index, index + STEP));
  return btoa(binary);
}
