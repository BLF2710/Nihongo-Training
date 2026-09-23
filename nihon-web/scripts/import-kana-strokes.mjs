// Reproducible import of unmodified KanjiVG assets; no generated stroke geometry.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const revision = '422b5538595676da918c288a4230cb5e22a1ee7e';
const source = `https://raw.githubusercontent.com/KanjiVG/kanjivg/${revision}`;
const content = await readFile(new URL('../src/data/hiraganaLearning.ts', import.meta.url), 'utf8');
const katakana = await readFile(new URL('../src/data/katakanaLearning.ts', import.meta.url), 'utf8');
const entries = [
  ...[...content.matchAll(/([ぁ-ゖ]+): e\(/gu)].map(match => match[1]),
  ...[...katakana.matchAll(/r\('[^']+', '([^']+)', '[^']+'\)/g)].flatMap(match => match[1].split(' ')),
];
const chars = [...new Set(entries.join(''))];
const directory = new URL('../public/kanjivg/', import.meta.url);
await mkdir(directory, { recursive: true });
const paths = {};
for (const character of chars) {
  const hex = character.codePointAt(0).toString(16).padStart(5, '0');
  let svg;
  try { svg = await readFile(new URL(`${hex}.svg`, directory), 'utf8'); }
  catch {
    const response = await fetch(`${source}/kanji/${hex}.svg`);
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`${hex}: ${response.status}`);
    svg = await response.text();
  }
  if (!svg.includes(`kvg:element="${character}"`)) throw new Error(`Character mismatch: ${hex}`);
  const strokes = [...svg.matchAll(/<path\s+id="[^"]+-s(\d+)"[^>]*?\sd="([^"]+)"/g)];
  if (!strokes.length || strokes.some((stroke, index) => Number(stroke[1]) !== index + 1)) throw new Error(`Invalid stroke sequence: ${hex}`);
  paths[character] = strokes.map(stroke => stroke[2]);
  await writeFile(new URL(`${hex}.svg`, directory), svg);
}
const license = await fetch(`${source}/COPYING`);
if (!license.ok) throw new Error('Could not retrieve license');
await writeFile(new URL('COPYING', directory), await license.text());
await writeFile(new URL('../src/data/kanaStrokes.json', import.meta.url), JSON.stringify({ revision, source, license: 'CC BY-SA 3.0', copyright: 'Ulrich Apel and KanjiVG contributors', paths }, null, 2) + '\n');
console.log(JSON.stringify({ characters: chars.length, supported: Object.keys(paths).length, unsupported: chars.filter(c => !paths[c]), entries: entries.length, completeEntries: entries.filter(e => [...e].every(c => paths[c])).length }));
