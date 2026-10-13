// Furigana is written inside text as <ruby>漢字<rt>かんじ</rt></ruby>. Only that exact pattern is recognised.
const RUBY = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;

export type FuriganaPart = { base: string; reading?: string };

export function parseFurigana(text: string): FuriganaPart[] {
  const parts: FuriganaPart[] = [];
  let cursor = 0;
  for (const match of text.matchAll(RUBY)) {
    if (match.index > cursor) parts.push({ base: text.slice(cursor, match.index) });
    parts.push({ base: match[1], reading: match[2] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push({ base: text.slice(cursor) });
  return parts;
}

/** The text as it is read aloud: each annotated word replaced by its reading. Used for audio and speech checking. */
export const toReading = (text: string) => text.replace(RUBY, "$2");

/** The text without its readings, for labels and other places that cannot show furigana. */
export const toPlain = (text: string) => text.replace(RUBY, "$1");
