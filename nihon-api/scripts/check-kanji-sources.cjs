// Read-only upstream validation. No files or database rows are modified.
const assert = require('node:assert/strict');
const catalog = require('../../shared/kanji.json');
async function main() {
  for (const k of catalog.kanji) {
    const response = await fetch(k.source, { signal: AbortSignal.timeout(30000) });
    assert.ok(response.ok, k.source);
    const source = await response.json();
    assert.equal(source.kanji, k.character);
    assert.equal(source.stroke_count, k.strokeCount, k.character);
    assert.deepEqual(source.meanings, k.meanings, k.character);
    assert.deepEqual(source.on_readings, k.onyomi, k.character);
    assert.deepEqual(source.kun_readings, k.kunyomi, k.character);
  }
  for (const form of catalog.vocabularyForms) {
    const response = await fetch(form.source, { signal: AbortSignal.timeout(30000) });
    assert.ok(response.ok, form.source);
    const source = await response.json();
    assert.ok(source.some(word => word.variants.some(v => v.written === form.written && v.pronounced === form.reading)), form.written);
  }
  console.log('PASS: bundled Kanji meanings/readings/counts and all course word spellings/readings match upstream.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
