// Speech recognition returns standard Japanese writing (私は田中です), while course material is written
// in kana (わたしは たなかです). Both sides are reduced to kana with the course's own words before comparing.

// [written form, reading, ...alternative readings]
const READINGS: [string, string, ...string[]][] = [
  // greetings and set phrases
  ["お早う", "おはよう"], ["今日は", "こんにちは"], ["今晩は", "こんばんは"], ["有難う", "ありがとう"], ["御座います", "ございます"],
  ["済みません", "すみません"], ["又ね", "またね"], ["宜しく", "よろしく"], ["お願い", "おねがい"], ["下さい", "ください"], ["一寸", "ちょっと"],
  // people and introductions
  ["私", "わたし"], ["貴方", "あなた"], ["名前", "なまえ"], ["何歳", "なんさい"], ["何処", "どこ"], ["何", "なん", "なに"], ["誰", "だれ"],
  ["国", "くに"], ["日本人", "にほんじん"], ["日本", "にほん"], ["韓国", "かんこく"], ["人", "ひと", "じん"], ["歳", "さい"], ["才", "さい"],
  ["来ました", "きました"], ["田中", "たなか"], ["桜", "さくら"], ["先生", "せんせい"], ["学生", "がくせい"],
  // family and home
  ["家族", "かぞく"], ["父", "ちち"], ["母", "はは"], ["兄", "あに"], ["姉", "あね"], ["弟", "おとうと"], ["妹", "いもうと"],
  ["友達", "ともだち"], ["友だち", "ともだち"], ["写真", "しゃしん"], ["住んで", "すんで"], ["家", "いえ", "うち"], ["町", "まち"], ["街", "まち"],
  ["東京", "とうきょう"], ["大阪", "おおさか"], ["部屋", "へや"], ["台所", "だいどころ"], ["机", "つくえ"], ["椅子", "いす"],
  // belongings, food and drink
  ["本", "ほん"], ["鞄", "かばん"], ["傘", "かさ"], ["好き", "すき"], ["食べ物", "たべもの"], ["飲み物", "のみもの"], ["お茶", "おちゃ"], ["水", "みず"],
  ["朝ご飯", "あさごはん"], ["朝御飯", "あさごはん"], ["朝ごはん", "あさごはん"], ["ご飯", "ごはん"], ["御飯", "ごはん"], ["肉", "にく"], ["魚", "さかな"],
  ["野菜", "やさい"], ["卵", "たまご"], ["玉子", "たまご"], ["食べ", "たべ"], ["飲み", "のみ"], ["何時も", "いつも"], ["良く", "よく"], ["余り", "あまり"],
  ["店", "みせ"], ["饂飩", "うどん"], ["有り", "あり"],
  // places and positions
  ["此処", "ここ"], ["上", "うえ"], ["下", "した"], ["中", "なか"], ["前", "まえ"], ["後ろ", "うしろ"], ["右", "みぎ"], ["左", "ひだり"],
  ["教室", "きょうしつ"], ["食堂", "しょくどう"], ["会社", "かいしゃ"],
  // counters and numbers
  ["一つ", "ひとつ"], ["1つ", "ひとつ"], ["二つ", "ふたつ"], ["2つ", "ふたつ"], ["三つ", "みっつ"], ["3つ", "みっつ"], ["四つ", "よっつ"], ["4つ", "よっつ"],
  ["二十", "にじゅう"], ["20", "にじゅう"], ["十", "じゅう"], ["10", "じゅう"],
  ["一", "いち"], ["1", "いち"], ["二", "に"], ["2", "に"], ["三", "さん"], ["3", "さん"], ["四", "よん"], ["4", "よん"], ["五", "ご"], ["5", "ご"],
  ["六", "ろく"], ["6", "ろく"], ["七", "なな"], ["7", "なな"], ["八", "はち"], ["8", "はち"], ["九", "きゅう"], ["9", "きゅう"],
];
// Longer written forms first, so 日本人 is read before 日本, 本 or 人.
const BY_LENGTH = [...READINGS].sort((a, b) => b[0].length - a[0].length);
const MAX_CANDIDATES = 16;
/** Share of matching characters needed for an utterance to count as correct. */
export const MATCH_THRESHOLD = 0.8;

const toHiragana = (text: string) => text.replace(/[ァ-ヶ]/g, character => String.fromCharCode(character.charCodeAt(0) - 0x60));
const strip = (text: string) => text.normalize("NFKC").toLowerCase().replace(/[\s、。，．,.!?！？…・〜~「」『』（）()]/g, "");

/** Kana-only spellings of a phrase; more than one when a written form has several readings. */
export function kanaCandidates(text: string): string[] {
  let candidates = [strip(text)];
  for (const [written, ...readings] of BY_LENGTH) {
    if (!candidates.some(candidate => candidate.includes(written))) continue;
    candidates = candidates.flatMap(candidate => readings.map(reading => candidate.split(written).join(reading))).slice(0, MAX_CANDIDATES);
  }
  return [...new Set(candidates.map(toHiragana))];
}

function editDistance(a: string, b: string): number {
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

// A negative ending changes the meaning with only a couple of characters, so it must agree exactly.
const negations = (text: string) => (text.match(/ません|ない/g) ?? []).length;
const similarity = (a: string, b: string) => {
  if (a === b) return 1;
  if (negations(a) !== negations(b)) return 0;
  return 1 - editDistance(a, b) / Math.max(a.length, b.length, 1);
};

/** Compares what the recogniser heard (best guess first) with the phrase the learner was asked to say. */
export function matchSpeech(expected: string, heard: string[]): { matched: boolean; score: number; heard: string } {
  const targets = kanaCandidates(expected);
  let best = { score: 0, heard: heard[0] ?? "" };
  for (const alternative of heard) {
    for (const candidate of kanaCandidates(alternative)) {
      const score = Math.max(...targets.map(target => similarity(target, candidate)));
      if (score > best.score) best = { score, heard: alternative };
    }
  }
  return { matched: best.score >= MATCH_THRESHOLD, ...best };
}
