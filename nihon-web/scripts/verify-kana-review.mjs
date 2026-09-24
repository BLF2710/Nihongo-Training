import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

function load(path, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  runInNewContext(compiled, { exports, require: name => {
    assert.ok(name in dependencies, `Unexpected dependency ${name}`);
    return dependencies[name];
  }, console });
  return exports;
}
const romaji = load('../src/lib/romaji.ts');
const { selectReviewCharacters, reviewChoices } = load('../src/lib/kanaReview.ts', { './romaji': romaji });
const quotas = { 5: [3, 2, 0], 10: [6, 3, 1], 15: [9, 4, 2], 20: [12, 6, 2] };
const statuses = ['learning', 'untested', 'mastered'];
function catalog(counts, script) {
  let id = 0;
  return counts.flatMap((count, group) => Array.from({ length: count }, (_, n) => ({
    id: ++id, kana: `${script}-${id}`, romaji: ['a', 'i', 'u', 'e', 'o', 'shi', 'si', 'ji', 'zi'][n % 9],
    status: statuses[group], accuracy: n, correctCount: 0, wrongCount: 0, total: 0,
  })));
}
for (const script of ['hiragana', 'katakana']) for (const size of [5, 10, 15, 20]) {
  const data = catalog([25, 25, 25], script);
  const snapshot = JSON.stringify(data);
  const selected = selectReviewCharacters(data, size);
  assert.deepEqual(statuses.map(status => selected.filter(c => c.status === status).length), quotas[size]);
  assert.equal(JSON.stringify(data), snapshot, 'selection must not mutate statistics');
  assert.ok(selected.every(c => c.kana.startsWith(script)));
  const learning = selected.filter(c => c.status === 'learning');
  assert.equal(Math.max(...learning.map(c => c.accuracy)), quotas[size][0] - 1);
  for (const counts of [[2, 30, 30], [30, 0, 0], [0, 30, 0], [0, 0, 30], [1, 1, 1], [0, 0, 0], [30, 0, 30], [2, 1, 30]]) {
    const pool = catalog(counts, script);
    const picked = selectReviewCharacters([...pool, ...pool], size);
    assert.equal(picked.length, Math.min(size, pool.length));
    assert.equal(new Set(picked.map(c => c.id)).size, picked.length);
    if (counts[0] === 2) assert.equal(picked.filter(c => c.status === 'learning').length, 2);
  }
  for (const character of data) {
    const choices = reviewChoices(character, data);
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.equal(choices.filter(choice => romaji.isRomajiMatch(character.romaji, choice)).length, 1);
  }
}
console.log('PASS: both scripts; all sizes; quotas; lowest accuracy; shortages; deduplication; non-mutation; four unambiguous choices.');

// Optional real PostgreSQL integration. Temporary tables shadow production tables
// only on this connection; rollback removes all fixtures. No real user data changes.
if (process.argv.includes('--database')) {
  const require = createRequire(new URL('../../nihon-api/package.json', import.meta.url));
  require('dotenv').config({ path: new URL('../../nihon-api/.env', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), quiet: true });
  const { Pool } = require('pg');
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const quiz = load('../../nihon-api/src/controllers/quiz.controller.ts', { '../config/db': { pool: client }, '../services/xp.service': { awardXP: () => { throw new Error('Fixture must remain below XP milestone'); } } });
    const statistics = load('../../nihon-api/src/controllers/statistics.controller.ts', { '../config/db': { pool: client } });
    for (const [table, progress, key] of [['hiraganas', 'user_progress', 'hiragana_id'], ['katakanas', 'user_katakana_progress', 'katakana_id']]) {
      const real = (await client.query(`SELECT id, kana, romaji FROM ${table}`)).rows;
      assert.ok(real.length >= 20);
      for (const character of real) {
        const choices = reviewChoices(character, real);
        assert.equal(choices.filter(choice => quiz.isRomajiMatch(character.romaji, choice)).length, 1);
      }
      await client.query(`CREATE TEMP TABLE ${table} (id integer, kana text, romaji text) ON COMMIT DROP`);
      await client.query(`INSERT INTO ${table} VALUES ($1, $2, $3)`, [real[0].id, real[0].kana, real[0].romaji]);
      await client.query(`CREATE TEMP TABLE ${progress} (user_id integer, ${key} integer, correct_count integer, wrong_count integer) ON COMMIT DROP`);
    }
    async function call(handler, body) {
      let payload;
      const res = { json(value) { payload = value; return this; }, status(code) { assert.equal(code, 200); return this; } };
      await handler({ body, user: { userId: -987654 } }, res);
      return payload;
    }
    for (const type of ['hiragana', 'katakana']) {
      const initial = (await call(statistics.getStatistics))[type].characters[0];
      assert.equal(initial.status, 'untested');
      const post = answer => call(quiz.submitAnswer, { type, kanaId: initial.id, answer });
      await post(initial.romaji); await post(initial.romaji);
      assert.equal((await call(statistics.getStatistics))[type].characters[0].status, 'learning');
      assert.equal((await post(initial.romaji)).correct, true);
      let current = (await call(statistics.getStatistics))[type].characters[0];
      assert.equal(current.correctCount, 3); assert.equal(current.status, 'mastered'); assert.equal(current.accuracy, 100);
      assert.equal((await post('deliberately-wrong')).correct, false);
      current = (await call(statistics.getStatistics))[type].characters[0];
      assert.equal(current.wrongCount, 1); assert.equal(current.accuracy, 75); assert.equal(current.status, 'learning');
      await post(initial.romaji);
      current = (await call(statistics.getStatistics))[type].characters[0];
      assert.equal(current.correctCount, 4); assert.equal(current.accuracy, 80); assert.equal(current.status, 'mastered');
    }
    console.log('PASS: real PostgreSQL + existing answer/statistics controllers; both scripts; correct/wrong updates; status transitions; all real catalog choices match server grading.');
  } finally { await client.query('ROLLBACK'); client.release(); await pool.end(); }
}
