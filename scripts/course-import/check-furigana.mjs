#!/usr/bin/env node
// Checks the furigana in generated lessons against dictionary data, and lists readings it cannot confirm.
//   node scripts/course-import/check-furigana.mjs <lesson file or folder>...
// One kanji: its reading must match a dictionary reading of that kanji (allowing sound changes such as
// rendaku and small っ). Several kanji: the whole word must be a dictionary word with that reading
// (kanjiapi.dev, cached between runs). Anything unconfirmed is printed for a person to check.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const facts = JSON.parse(readFileSync(join(root, "shared/course/kanji-facts.json"), "utf8"));
for (const kanji of JSON.parse(readFileSync(join(root, "shared/kanji.json"), "utf8")).kanji) {
  facts[kanji.character] ??= { onyomi: kanji.onyomi, kunyomi: kanji.kunyomi };
}
const cacheFile = join(tmpdir(), "nihonweb-kanjiapi-words.json");
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, "utf8")) : {};

const toHiragana = text => text.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const VOICED = { か: "が", き: "ぎ", く: "ぐ", け: "げ", こ: "ご", さ: "ざ", し: "じ", す: "ず", せ: "ぜ", そ: "ぞ", た: "だ", ち: "ぢ", つ: "づ", て: "で", と: "ど", は: "ばぱ", ひ: "びぴ", ふ: "ぶぷ", へ: "べぺ", ほ: "ぼぽ" };
/** A reading and the forms it takes inside words. */
function variants(reading) {
  const forms = new Set([reading]);
  for (const voiced of VOICED[reading[0]] ?? "") forms.add(voiced + reading.slice(1));
  for (const form of [...forms]) if (/[つくちき]$/.test(form) && form.length > 1) forms.add(`${form.slice(0, -1)}っ`);
  return forms;
}
function kanjiReadings(character) {
  const entry = facts[character];
  if (!entry) return null;
  const readings = new Set();
  for (const on of entry.onyomi ?? []) variants(toHiragana(on.replace(/-/g, ""))).forEach(form => readings.add(form));
  for (const kun of entry.kunyomi ?? []) {
    const clean = kun.replace(/-/g, "");
    variants(clean.split(".")[0]).forEach(form => readings.add(form));
    readings.add(clean.replace(".", ""));
  }
  return readings;
}
async function dictionaryWords(character) {
  if (cache[character]) return cache[character];
  const response = await fetch(`https://kanjiapi.dev/v1/words/${encodeURIComponent(character)}`, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`kanjiapi.dev answered ${response.status}`);
  cache[character] = (await response.json()).flatMap(word => word.variants.map(variant => `${variant.written}=${variant.pronounced}`));
  return cache[character];
}

const files = process.argv.slice(2).flatMap(target => statSync(target).isDirectory() ? readdirSync(target).filter(name => name.endsWith(".json")).map(name => join(target, name)) : [target]);
if (!files.length) { console.error("Usage: check-furigana.mjs <lesson file or folder>..."); process.exit(1); }
const pairs = new Map(); // "漢字=かんじ" -> first file it appears in
for (const file of files) {
  for (const [, base, reading] of readFileSync(file, "utf8").matchAll(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g)) {
    const key = `${base}=${reading}`;
    if (!pairs.has(key)) pairs.set(key, file);
  }
}

const unconfirmed = [], unchecked = [];
for (const [key, file] of pairs) {
  const [base, reading] = key.split("=");
  const characters = [...base];
  if (characters.length === 1) {
    const readings = kanjiReadings(base);
    if (!readings) unchecked.push(`${key} (no dictionary facts for ${base})`);
    else if (!readings.has(reading)) unconfirmed.push(`${key}  — dictionary readings: ${[...readings].slice(0, 12).join("、")}  [${file.split(/[\\/]/).pop()}]`);
    continue;
  }
  try {
    const words = await dictionaryWords(characters[0]);
    if (!words.includes(key)) unconfirmed.push(`${key}  — not a dictionary word with this reading  [${file.split(/[\\/]/).pop()}]`);
  } catch (error) { unchecked.push(`${key} (${error.message})`); }
}
mkdirSync(dirname(cacheFile), { recursive: true });
writeFileSync(cacheFile, JSON.stringify(cache));

console.log(`${pairs.size} distinct furigana pairs in ${files.length} file(s): ${pairs.size - unconfirmed.length - unchecked.length} confirmed.`);
if (unconfirmed.length) console.log(`\nNot confirmed (check by hand):\n${unconfirmed.map(line => `  ? ${line}`).join("\n")}`);
if (unchecked.length) console.log(`\nCould not be checked:\n${unchecked.map(line => `  - ${line}`).join("\n")}`);
process.exitCode = unconfirmed.length ? 1 : 0;
