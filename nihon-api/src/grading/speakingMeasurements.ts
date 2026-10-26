// Measurements of a spoken answer, computed in code and given to the AI to anchor its judgement (GRADING.md section 8).

export type SpeakingMeasurements = {
  durationSeconds: number;
  reachedMinimum: boolean;
  characters: number;
  charactersPerSecond: number;
  sentences: number;
  politeSentences: number;
  plainSentences: number;
};

const SENTENCE_END = /[。！？!?]+/;
const POLITE_ENDING = /(です|ます|でした|ました|ません|ましょう|ませんか|でしょう|ください)(か|ね|よ)?$/;
const IGNORED = /[\s、。，．,.!?！？…・「」『』（）()]/g;

/** Sentences of a transcript; a transcript without end punctuation counts as one sentence. */
export function splitSentences(transcript: string): string[] {
  return transcript.split(SENTENCE_END).map(sentence => sentence.trim()).filter(Boolean);
}

export function measureAnswer(transcript: string, durationSeconds: number, minSeconds: number): SpeakingMeasurements {
  const sentences = splitSentences(transcript);
  const characters = transcript.replace(IGNORED, "").length;
  const politeSentences = sentences.filter(sentence => POLITE_ENDING.test(sentence.replace(IGNORED, ""))).length;
  const duration = Math.max(0, Math.round(durationSeconds * 10) / 10);
  return {
    durationSeconds: duration,
    reachedMinimum: duration >= minSeconds,
    characters,
    charactersPerSecond: duration > 0 ? Math.round((characters / duration) * 10) / 10 : 0,
    sentences: sentences.length,
    politeSentences,
    plainSentences: sentences.length - politeSentences,
  };
}
