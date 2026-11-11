// The 46 basic hiragana that live in Kana Wilds, with the catalog ids the API uses (migration 000: あ = 1 … ん = 46).
// Pure data and lookups, no browser APIs, so the game rules run under node's test runner.

export type Vowel = "a" | "i" | "u" | "e" | "o";
export type WildKana = { id: number; kana: string; romaji: string; vowel: Vowel | null; row: string };

const ROWS: readonly { row: string; kana: string; romaji: string }[] = [
  { row: "vowels", kana: "あいうえお", romaji: "a i u e o" },
  { row: "k", kana: "かきくけこ", romaji: "ka ki ku ke ko" },
  { row: "s", kana: "さしすせそ", romaji: "sa shi su se so" },
  { row: "t", kana: "たちつてと", romaji: "ta chi tsu te to" },
  { row: "n", kana: "なにぬねの", romaji: "na ni nu ne no" },
  { row: "h", kana: "はひふへほ", romaji: "ha hi fu he ho" },
  { row: "m", kana: "まみむめも", romaji: "ma mi mu me mo" },
  { row: "y", kana: "やゆよ", romaji: "ya yu yo" },
  { row: "r", kana: "らりるれろ", romaji: "ra ri ru re ro" },
  { row: "w", kana: "わを", romaji: "wa wo" },
  { row: "final-n", kana: "ん", romaji: "n" },
];

const VOWELS: readonly Vowel[] = ["a", "i", "u", "e", "o"];
const vowelOfRomaji = (romaji: string): Vowel | null => VOWELS.find(vowel => romaji.endsWith(vowel)) ?? null;

export const BASIC_HIRAGANA: readonly WildKana[] = ROWS.flatMap(({ row, kana, romaji }) => {
  const readings = romaji.split(" ");
  return [...kana].map((character, index) => ({ row, kana: character, romaji: readings[index] }));
}).map((item, index) => ({ ...item, id: index + 1, vowel: vowelOfRomaji(item.romaji) }));

/** The rows in table order, each with its kana. */
export const HIRAGANA_ROWS: readonly { row: string; kana: readonly WildKana[] }[] =
  ROWS.map(({ row }) => ({ row, kana: BASIC_HIRAGANA.filter(item => item.row === row) }));

const BY_CHARACTER = new Map(BASIC_HIRAGANA.map(item => [item.kana, item]));
const BY_ID = new Map(BASIC_HIRAGANA.map(item => [item.id, item]));

export const kanaByCharacter = (character: string): WildKana | undefined => BY_CHARACTER.get(character);
export const kanaById = (id: number): WildKana | undefined => BY_ID.get(id);
export const isBasicHiragana = (character: string) => BY_CHARACTER.has(character);

export const VOWEL_IDS: readonly number[] = HIRAGANA_ROWS[0].kana.map(item => item.id);

/** The starter consonants a new player chooses from (the API keeps the same list). */
export const STARTERS = [
  { key: "ka", kanaId: 6 },
  { key: "sa", kanaId: 11 },
  { key: "ta", kanaId: 16 },
] as const;
export type Starter = (typeof STARTERS)[number]["key"];
