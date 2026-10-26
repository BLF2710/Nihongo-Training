import { HttpError } from "../../utils/http-error";

// Pronunciation assessment behind our own interface, so the speaking test can run with Azure, with a fake in
// tests, or without any pronunciation service (the test then grades content only; see GRADING.md section 9).

export type WordScore = { word: string; accuracy: number; errorType: string };
export type PronunciationAssessment = {
  transcript: string;
  accuracy: number;
  fluency: number;
  /** Only meaningful against a fixed passage (read-aloud). */
  completeness: number | null;
  words: WordScore[];
  durationSeconds: number;
};
export type AssessmentOutcome = { status: "assessed"; assessment: PronunciationAssessment } | { status: "no_speech" };

export interface PronunciationAssessor {
  /** A free answer: the speech is recognised first, then assessed against what was recognised. */
  assessFreeAnswer(wav: Buffer): Promise<AssessmentOutcome>;
  /** Reading a fixed passage: assessed against the passage, so skipped words lower completeness. */
  assessReading(wav: Buffer, passage: string): Promise<AssessmentOutcome>;
}

// ---- Azure Speech, REST API for short audio (WAV PCM, 16 kHz, mono; up to 30 s for pronunciation assessment)

type AzureWord = { Word?: string; AccuracyScore?: number; ErrorType?: string };
type AzureBest = { Display?: string; Lexical?: string; AccuracyScore?: number; FluencyScore?: number; CompletenessScore?: number; Words?: AzureWord[] };
type AzureResponse = { RecognitionStatus?: string; DisplayText?: string; Duration?: number; NBest?: AzureBest[] };

const TICKS_PER_SECOND = 10_000_000;
const REQUEST_TIMEOUT_MS = 30_000;
// Statuses meaning nothing usable was said; anything else that isn't Success is a service problem.
const NO_SPEECH = new Set(["NoMatch", "InitialSilenceTimeout", "BabbleTimeout"]);

export class AzurePronunciationAssessor implements PronunciationAssessor {
  constructor(private readonly endpoint: string, private readonly key: string, private readonly fetcher: typeof fetch = fetch) {}

  async assessFreeAnswer(wav: Buffer): Promise<AssessmentOutcome> {
    const recognised = await this.request(wav, null);
    const transcript = recognised.NBest?.[0]?.Display ?? recognised.DisplayText ?? "";
    if (recognised.RecognitionStatus !== "Success" || !transcript.trim()) return { status: "no_speech" };
    return this.assess(wav, transcript, false);
  }

  assessReading(wav: Buffer, passage: string): Promise<AssessmentOutcome> {
    return this.assess(wav, passage, true);
  }

  private async assess(wav: Buffer, referenceText: string, scripted: boolean): Promise<AssessmentOutcome> {
    const response = await this.request(wav, { ReferenceText: referenceText, GradingSystem: "HundredMark", Granularity: "Word", Dimension: "Comprehensive", EnableMiscue: scripted ? "True" : "False" });
    const best = response.NBest?.[0];
    if (response.RecognitionStatus !== "Success" || !best) return { status: "no_speech" };
    return {
      status: "assessed",
      assessment: {
        transcript: best.Display ?? response.DisplayText ?? referenceText,
        accuracy: best.AccuracyScore ?? 0,
        fluency: best.FluencyScore ?? 0,
        completeness: scripted ? best.CompletenessScore ?? 0 : null,
        words: (best.Words ?? []).map(word => ({ word: word.Word ?? "", accuracy: word.AccuracyScore ?? 0, errorType: word.ErrorType ?? "None" })),
        durationSeconds: (response.Duration ?? 0) / TICKS_PER_SECOND,
      },
    };
  }

  private async request(wav: Buffer, assessment: Record<string, string> | null): Promise<AzureResponse> {
    const url = `${this.endpoint}?language=ja-JP&format=detailed`;
    const headers: Record<string, string> = { "Ocp-Apim-Subscription-Key": this.key, "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000", Accept: "application/json" };
    if (assessment) headers["Pronunciation-Assessment"] = Buffer.from(JSON.stringify(assessment), "utf8").toString("base64");
    let response: Response;
    try {
      response = await this.fetcher(url, { method: "POST", headers, body: new Uint8Array(wav), signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (error) {
      console.error("Azure pronunciation assessment could not be reached", error);
      throw new HttpError(503, "Pronunciation scoring is unavailable right now. Please try again shortly.");
    }
    if (!response.ok) {
      console.error("Azure pronunciation assessment failed", response.status);
      throw new HttpError(response.status === 400 ? 400 : 503, response.status === 400 ? "The recording couldn't be read. Please record again." : "Pronunciation scoring is unavailable right now. Please try again shortly.");
    }
    const body = await response.json() as AzureResponse;
    if (body.RecognitionStatus && body.RecognitionStatus !== "Success" && !NO_SPEECH.has(body.RecognitionStatus)) {
      throw new HttpError(503, "Pronunciation scoring is unavailable right now. Please try again shortly.");
    }
    return body;
  }
}

/**
 * Azure when AZURE_SPEECH_KEY and AZURE_SPEECH_ENDPOINT are set (the endpoint is the resource's short-audio
 * recognition URL, ending in /speech/recognition/conversation/cognitiveservices/v1); otherwise none.
 */
export function pronunciationAssessorFromEnv(env: NodeJS.ProcessEnv = process.env): PronunciationAssessor | null {
  const key = env.AZURE_SPEECH_KEY?.trim(), endpoint = env.AZURE_SPEECH_ENDPOINT?.trim();
  if (!key || !endpoint) return null;
  if (!/^https:\/\//.test(endpoint)) throw new Error("AZURE_SPEECH_ENDPOINT must be an https URL.");
  return new AzurePronunciationAssessor(endpoint.replace(/\/+$/, ""), key);
}
