import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

// Run the actual typed catalog without adding a test/runtime dependency.
const source = await readFile(new URL('../src/data/katakanaLearning.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { buildKatakanaCatalog, KATAKANA_SECTIONS } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const catalog = buildKatakanaCatalog([]);
const counts = Object.fromEntries(KATAKANA_SECTIONS.map(section => [section.key, catalog.filter(c => c.category === section.key).length]));
assert.deepEqual(counts, { basic: 46, dakuten: 20, handakuten: 5, yoon: 33, extended: 38 });
assert.equal(new Set(catalog.map(c => c.kana)).size, 142);
assert.equal(new Set(catalog.map(c => c.id)).size, 142);
assert.deepEqual(catalog.map(c => c.order), Array.from({ length: 142 }, (_, i) => i + 1));
// Assert every requested combination, independently of the production grouping.
const yoon = 'キャ キュ キョ シャ シュ ショ チャ チュ チョ ニャ ニュ ニョ ヒャ ヒュ ヒョ ミャ ミュ ミョ リャ リュ リョ ギャ ギュ ギョ ジャ ジュ ジョ ビャ ビュ ビョ ピャ ピュ ピョ'.split(' ');
const extended = 'ウィ ウェ ウォ ティ トゥ ディ ドゥ チェ ファ フィ フェ フォ フュ ジェ シェ イェ ヴァ ヴィ ヴェ ヴォ ヴュ ツァ ツィ ツェ ツォ クァ クィ クェ クォ グァ スィ ズィ テュ デュ ニェ ヒェ ミェ リェ'.split(' ');
for (const [group, expected] of [['yoon', yoon], ['extended', extended]]) assert.deepEqual(catalog.filter(c => c.category === group).map(c => c.kana), expected);
const requested = 'ア:a カ:ka シ:shi ツ:tsu ヤ:ya ヲ:wo ン:n ガ:ga ジ:ji ダ:da バ:ba パ:pa キャ:kya シャ:sha チャ:cha ニャ:nya ヒャ:hya ミャ:mya リャ:rya ギャ:gya ジャ:ja ビャ:bya ピャ:pya ファ:fa フィ:fi フェ:fe フォ:fo ティ:ti ディ:di ヴァ:va'.split(' ');
const { paths } = JSON.parse(await readFile(new URL('../src/data/kanaStrokes.json', import.meta.url), 'utf8'));
for (const c of catalog) {
  assert.equal(c.audioText, c.kana);
  assert.ok(c.romaji && c.exampleWord.meaning);
  if (c.exampleWord.japanese) { assert.ok(c.exampleWord.japanese.includes(c.kana), c.kana); assert.ok(c.exampleWord.romaji); }
  for (const part of c.kana) assert.ok(paths[part]?.length, `Missing stroke data for ${part}`);
}
for (const pair of requested) {
  const [kana, romaji] = pair.split(':');
  const c = catalog.find(c => c.kana === kana);
  assert.equal(c?.romaji, romaji);
  assert.ok(c.exampleWord.japanese && c.exampleWord.romaji, kana);
}
// Preserve old routes, and keep teaching order despite shuffled database IDs.
const existing = catalog.slice(0, 71).map((c, i) => ({ id: i + 1, kana: c.kana, romaji: c.romaji })).reverse();
const merged = buildKatakanaCatalog(existing);
assert.deepEqual(merged.map(c => c.kana), catalog.map(c => c.kana));
assert.equal(merged[0].id, 1);
assert.equal(merged[70].id, 71);
assert.equal(merged[71].kana, 'キャ');
assert.equal(merged[103].kana, 'ピョ');
assert.equal(merged[104].kana, 'ウィ');
assert.equal(merged.at(-1).kana, 'リェ');
// Every extracted path exactly matches its locally bundled upstream SVG.
for (const [character, strokes] of Object.entries(paths)) {
  const hex = character.codePointAt(0).toString(16).padStart(5, '0');
  const svg = await readFile(new URL(`../public/kanjivg/${hex}.svg`, import.meta.url), 'utf8');
  assert.ok(svg.includes(`kvg:element="${character}"`));
  const matches = [...svg.matchAll(/<path\s+id="[^"]+-s(\d+)"[^>]*?\sd="([^"]+)"/g)];
  assert.deepEqual(matches.map(m => Number(m[1])), strokes.map((_, i) => i + 1));
  assert.deepEqual(matches.map(m => m[2]), strokes);
}
console.log('Passed: 142 entries, all 30 requested samples, category coverage, examples, audio inputs, stable routes, ordered navigation, and exact upstream stroke geometry.');
