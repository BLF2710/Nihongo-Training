import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

// Check the reference against the actual lessons and render both page variants
// with the real components. No requests or progress writes are needed.
const require = createRequire(import.meta.url);
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename);
  const source = readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  cache.set(filename, exports);
  runInNewContext(compiled, {
    exports, localStorage: { getItem: () => null }, console,
    require: name => {
      if (!name.startsWith('.')) return require(name);
      const target = ['.ts', '.tsx'].map(extension => resolve(dirname(filename), `${name}${extension}`)).find(existsSync);
      assert.ok(target, `Missing local module ${name}`);
      return load(target);
    },
  });
  return exports;
}
const root = fileURLToPath(new URL('../', import.meta.url));
const { JAPANESE_UNIT_1_REFERENCE: unit } = load(resolve(root, 'src/data/japaneseUnit1Reference.ts'));
const { N5_LESSONS } = load(resolve(root, 'src/data/japaneseN5Lessons.ts'));
assert.equal(unit.lessons.map(l => l.number).join(','), '1,2,3,4,5');
assert.equal(unit.lessons.reduce((sum, l) => sum + l.vocabulary.length, 0), 38);
assert.equal(unit.lessons.reduce((sum, l) => sum + l.grammar.length, 0), 8);
assert.equal(unit.lessons[0].grammar.length, 0);

const hello = ts.createSourceFile('hello.tsx', readFileSync(resolve(root, 'src/pages/JapaneseHelloLessonPage.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let sourceGreetings;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(hello) === 'expressions') {
    sourceGreetings = node.initializer.elements.map(row => row.elements.map(value => value.text));
  }
  ts.forEachChild(node, visit);
}
visit(hello);
assert.equal(sourceGreetings.length, unit.lessons[0].vocabulary.length);
sourceGreetings.forEach(([japanese, romaji, meaning], index) => {
  const word = unit.lessons[0].vocabulary[index];
  assert.deepEqual([word.japanese, word.romaji, word.meaning], [japanese, romaji, meaning]);
});
const ids = new Set();
for (const lesson of unit.lessons) {
  if (lesson.number > 1) {
    const source = N5_LESSONS.find(l => l.id === lesson.id);
    assert.ok(source);
    assert.equal(lesson.title, source.title);
    assert.equal(lesson.href, `/lessons/japanese/${source.slug}`);
    for (const [japanese, romaji, meaning] of source.vocabulary) {
      const word = lesson.vocabulary.find(w => w.japanese === japanese);
      assert.ok(word);
      assert.deepEqual([word.romaji, word.meaning], [romaji, meaning]);
    }
  }
  for (const item of [...lesson.vocabulary, ...lesson.grammar]) {
    assert.ok(!ids.has(item.id), `Duplicate reference ID ${item.id}`);
    ids.add(item.id);
    assert.equal(item.unitId, unit.id);
    assert.equal(item.lessonId, lesson.id);
  }
  for (const point of lesson.grammar) {
    assert.ok(point.pattern && point.explanation && point.examples.length);
    assert.ok(point.examples.every(e => e.japanese && e.romaji && e.meaning));
  }
}
assert.ok(!unit.lessons.flatMap(l => l.vocabulary).some(w => w.japanese === 'あれ'));
assert.equal(unit.lessons[4].grammar[0].examples.find(e => e.japanese.includes('20さい')).romaji, 'Watashi wa hatachi desu.');

const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');
const { LanguageProvider } = load(resolve(root, 'src/context/LanguageProvider.tsx'));
const { default: Page } = load(resolve(root, 'src/pages/StudyReferencePage.tsx'));
for (const kind of ['vocabulary', 'grammar']) {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, {},
    React.createElement(LanguageProvider, {}, React.createElement(Page, { kind, unit }))));
  assert.ok(html.includes(`Unit 1 ${kind}`));
  assert.equal((html.match(/<article/g) ?? []).length, kind === 'vocabulary' ? 38 : 8);
  assert.equal((html.match(/aria-pressed=/g) ?? []).length, kind === 'vocabulary' ? 8 : 5);
  assert.ok(html.includes('/lessons/japanese/n5-unit-1-numbers-age'));
  assert.ok(!html.includes('n5-unit-1-demonstratives'));
  for (const lesson of unit.lessons.filter(l => l[kind].length)) assert.ok(html.includes(lesson.href));
}
console.log('PASS: 38 vocabulary entries, 8 grammar points, Lessons 1–5 source alignment, unique IDs, lesson links, readings, both rendered pages and filters.');
