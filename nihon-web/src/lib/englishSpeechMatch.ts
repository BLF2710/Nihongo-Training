// Speech recognition writes what it hears in its own way ("I'm", "two", "colour" or "color"), so the learner's speech
// and the course's sentence are both reduced to plain words before they are compared: lower case, no punctuation,
// contractions written out, small numbers as words, and American spellings the recogniser may prefer made British.

/** Share of the sentence's words, in order, that must be heard for it to count as said. */
export const SPEECH_MATCH_THRESHOLD = 0.8;

const CONTRACTIONS: readonly [RegExp, string][] = [
  [/\bcan't\b/g, "cannot"], [/\bwon't\b/g, "will not"], [/\bshan't\b/g, "shall not"], [/n't\b/g, " not"],
  [/'m\b/g, " am"], [/'re\b/g, " are"], [/'ve\b/g, " have"], [/'ll\b/g, " will"], [/'d\b/g, " would"],
];
const NUMBERS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
// Recognisers set to en-GB still often return American spellings; the course writes British ones.
const SPELLINGS: Readonly<Record<string, string>> = {
  color: "colour", favorite: "favourite", center: "centre", theater: "theatre", neighbor: "neighbour", traveling: "travelling",
  organize: "organise", realize: "realise", apologize: "apologise", program: "programme", gray: "grey", mom: "mum",
};

/** A sentence as the plain words compared: "I'm 12, I can't go!" → ["i", "am", "twelve", "i", "cannot", "go"]. */
export function speechWords(text: string): string[] {
  let plain = text.normalize("NFC").toLowerCase().replace(/[‘’`]/g, "'");
  for (const [pattern, replacement] of CONTRACTIONS) plain = plain.replace(pattern, replacement);
  return plain.replace(/[^\p{L}\p{N}' ]+/gu, " ").replace(/'/g, "").split(/\s+/).filter(Boolean)
    .map(word => /^\d+$/.test(word) ? NUMBERS[Number(word)] ?? word : word)
    .map(word => SPELLINGS[word] ?? word);
}

/** How many words two lists share in the same order (their longest common subsequence). */
function wordsInOrder(expected: readonly string[], heard: readonly string[]): number {
  let previous = new Array<number>(heard.length + 1).fill(0);
  for (const word of expected) {
    const current = [0];
    heard.forEach((other, index) => current.push(word === other ? previous[index] + 1 : Math.max(previous[index + 1], current[index])));
    previous = current;
  }
  return previous[heard.length];
}

/** The share (0–1) of the target's words heard in order, penalising extra words so a ramble can't pass. */
export function speechScore(target: string, heard: string): number {
  const expected = speechWords(target), said = speechWords(heard);
  if (!expected.length || !said.length) return 0;
  const shared = wordsInOrder(expected, said);
  return shared / Math.max(expected.length, said.length);
}

export type EnglishSpeechAttempt = { matched: boolean; heard: string };

/** The best of the recogniser's guesses, and whether it is close enough to the target. */
export function matchEnglishSpeech(target: string, alternatives: readonly string[]): EnglishSpeechAttempt {
  const [best] = alternatives.map(heard => ({ heard, score: speechScore(target, heard) })).toSorted((a, b) => b.score - a.score);
  return best ? { matched: best.score >= SPEECH_MATCH_THRESHOLD, heard: best.heard } : { matched: false, heard: "" };
}
