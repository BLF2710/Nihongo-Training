import { listKanaWithProgress } from "../repositories/kana.repository";
import { listKanjiProgress } from "../repositories/kanji.repository";
import type { KanaScript } from "../utils/kana-script";
import { characterProgress, isWeakCharacter, WEAK_ACCURACY } from "./character-progress";
import { catalog } from "./kanji.service";

const SCRIPTS: KanaScript[] = ["hiragana", "katakana"];
const MAX_LISTED = 40;

const byAccuracy = <T extends { accuracy: number; wrongCount: number }>(a: T, b: T) => a.accuracy - b.accuracy || b.wrongCount - a.wrongCount;

async function weakKana(userId: number) {
  const scripts = await Promise.all(SCRIPTS.map(async script => (await listKanaWithProgress(script, userId))
    .map(row => ({ script, id: row.id, kana: row.kana, romaji: row.romaji, ...characterProgress(row.correctCount, row.wrongCount) }))));
  return scripts.flat().filter(item => isWeakCharacter(item.correctCount, item.wrongCount)).sort(byAccuracy).slice(0, MAX_LISTED);
}

async function weakKanji(userId: number) {
  const rows = await listKanjiProgress(userId);
  return rows.flatMap(row => {
    const kanji = catalog.kanji.find(item => item.id === row.kanji_id);
    if (!kanji || !isWeakCharacter(Number(row.correct_count), Number(row.wrong_count))) return [];
    return [{ kanjiId: kanji.id, character: kanji.character, meaning: kanji.meanings[0], ...characterProgress(Number(row.correct_count), Number(row.wrong_count)) }];
  }).sort(byAccuracy).slice(0, MAX_LISTED);
}

/** Kana and Kanji the learner has missed and still answers below the weak threshold, weakest first. */
export async function getWeakCharacters(userId: number) {
  const [kana, kanji] = await Promise.all([weakKana(userId), weakKanji(userId)]);
  return { kana, kanji, weakBelowPercent: WEAK_ACCURACY };
}
