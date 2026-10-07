const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const ts = require('typescript');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
async function main() {
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const client = await pool.connect();
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const exports = {}; cache.set(filename, exports);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(compiled, { exports, console, require: name => {
      if (name.endsWith('/config/db')) return { pool: { connect: async () => ({ query: (sql, values) => client.query(sql === 'BEGIN' ? 'SAVEPOINT answer_request' : sql === 'COMMIT' ? 'RELEASE SAVEPOINT answer_request' : sql === 'ROLLBACK' ? 'ROLLBACK TO SAVEPOINT answer_request' : sql, values), release() {} }) } };
      return name.startsWith('.') ? load(path.resolve(path.dirname(filename), name + '.ts')) : require(name);
    } }); return exports;
  }
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE users (id INTEGER PRIMARY KEY); INSERT INTO users VALUES (1),(2)');
    for (const table of ['hiraganas','katakanas']) await client.query(`CREATE TEMP TABLE ${table} (id INTEGER PRIMARY KEY, kana TEXT, romaji TEXT); INSERT INTO ${table} VALUES (1,'a','a')`);
    for (const [table, column] of [['user_progress','hiragana_id'],['user_katakana_progress','katakana_id']]) await client.query(`CREATE TEMP TABLE ${table} (user_id INTEGER, ${column} INTEGER, correct_count INTEGER, wrong_count INTEGER, PRIMARY KEY(user_id,${column}))`);
    await client.query('CREATE TEMP TABLE user_gamification(user_id INTEGER PRIMARY KEY, xp INTEGER, updated_at TIMESTAMPTZ); INSERT INTO user_gamification VALUES (1,0,NOW()),(2,0,NOW())');
    await client.query('CREATE TEMP TABLE xp_events(id SERIAL PRIMARY KEY, user_id INTEGER, amount INTEGER, source TEXT, reference_id TEXT, UNIQUE(user_id,source,reference_id))');
    const migration = fs.readFileSync(path.resolve(__dirname, '../migrations/006_quiz_answer_receipts.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS');
    await client.query(migration); await client.query(migration);
    const { submitAnswer } = load(path.resolve(__dirname, '../src/controllers/quiz.controller.ts'));
    const submit = async (body, userId = 1) => {
      let status = 200, data;
      await submitAnswer({ body, user: { userId } }, { status(value) { status = value; return this; }, json(value) { data = value; return this; } });
      return { status, data };
    };
    for (const type of ['hiragana','katakana']) {
      for (let i = 0; i < 10; i++) {
        const body = { type, kanaId: 1, answer: 'a', submissionId: randomUUID() };
        const first = await submit(body), retry = await submit(body);
        assert.equal(first.status, 200); assert.deepEqual(JSON.parse(JSON.stringify(retry)), JSON.parse(JSON.stringify(first)));
        assert.equal((await submit({ ...body, answer: 'wrong' })).status, 409);
      }
      const wrong = { type, kanaId: 1, answer: 'wrong', submissionId: randomUUID() };
      await submit(wrong); await submit(wrong);
      const table = type === 'hiragana' ? 'user_progress' : 'user_katakana_progress';
      const row = (await client.query(`SELECT * FROM ${table} WHERE user_id=1`)).rows[0];
      assert.equal(row.correct_count, 10); assert.equal(row.wrong_count, 1);
      // Same receipt ID belongs independently to each authenticated account.
      assert.equal((await submit(wrong, 2)).status, 200);
    }
    assert.equal((await client.query('SELECT xp FROM user_gamification WHERE user_id=1')).rows[0].xp, 20);
    assert.equal(Number((await client.query('SELECT COUNT(*) FROM xp_events')).rows[0].count), 2);
    assert.equal((await submit({ kanaId: 1, answer: 'a', submissionId: 'invalid' })).status, 400);
    console.log('PASS: receipt migration repeat, correct/wrong retry idempotency, conflict rejection, per-user isolation, both scripts, exactly 10 XP per 10 correct with atomic receipts. Temporary tables rolled back.');
  } finally { await client.query('ROLLBACK'); client.release(); await pool.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
