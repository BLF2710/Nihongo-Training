// Character-level similarity for comparing a recognised transcript with a passage (read-aloud without Azure).

const IGNORED = /[\s、。，．,.!?！？…・「」『』（）()]/g;
const toHiragana = (text: string) => text.replace(/[ァ-ヶ]/g, character => String.fromCharCode(character.charCodeAt(0) - 0x60));

/** NFC/NFKC-normalised, punctuation-free, katakana folded to hiragana. */
export function normalizeJapanese(text: string): string {
  return toHiragana(text.normalize("NFKC").replace(IGNORED, ""));
}

export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** 0–100: how closely `heard` matches the best of the expected spellings (for example the kanji text and its reading). */
export function similarityScore(expectedSpellings: readonly string[], heard: string): number {
  const candidate = normalizeJapanese(heard);
  const best = Math.max(0, ...expectedSpellings.map(expected => {
    const target = normalizeJapanese(expected);
    const longest = Math.max(target.length, candidate.length, 1);
    return 1 - editDistance(target, candidate) / longest;
  }));
  return Math.round(best * 100);
}
