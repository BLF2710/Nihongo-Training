// Unit review + question bank API against TEMP copies of every table, rolled back at the end.
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const API = ROOT + '/nihon-api';
const req = name => require(require.resolve(name, { paths: [API] }));
const ts = req('typescript'), express = req('express'), { Pool } = req('pg');
req('dotenv').config({ path: path.join(API, '.env'), quiet: true });
(async () => {
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const client = await pool.connect(); let server;
  let queue = Promise.resolve();
  const serial = task => { const run = queue.then(task, task); queue = run.catch(() => {}); return run; };
  const guarded = (sql, values) => serial(async () => { await client.query('SAVEPOINT stmt'); try { const r = await client.query(sql, values); await client.query('RELEASE SAVEPOINT stmt'); return r; } catch (e) { await client.query('ROLLBACK TO SAVEPOINT stmt'); throw e; } });
  const fakePool = { query: guarded, connect: async () => ({ query: (sql, values) => serial(() => client.query(sql === 'BEGIN' ? 'SAVEPOINT tx' : sql === 'COMMIT' ? 'RELEASE SAVEPOINT tx' : sql === 'ROLLBACK' ? 'ROLLBACK TO SAVEPOINT tx' : sql, values)), release() {} }) };
  const cache = new Map();
  const sourceFile = p => p.endsWith('.json') ? p : fs.existsSync(p + '.ts') ? p + '.ts' : path.join(p, 'index.ts');
  function load(f) { if (f.endsWith('.json')) return JSON.parse(fs.readFileSync(f, 'utf8')); if (cache.has(f)) return cache.get(f); const exports = {}; cache.set(f, exports);
    const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(out, { exports, console: { ...console, error() {} }, process, Buffer, setTimeout, require: n => n.endsWith('/config/db') ? { pool: fakePool } : n.startsWith('.') ? load(sourceFile(path.resolve(path.dirname(f), n))) : req(n) }); return exports; }
  try {
    await client.query('BEGIN');
    const tables = (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")).rows.map(r => r.table_name);
    for (const table of tables) {
      await client.query(`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING ALL) ON COMMIT DROP`);
      for (const { column_name } of (await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_default LIKE 'nextval(%'", [table])).rows) {
        await client.query(`CREATE TEMP SEQUENCE ${table}_${column_name}_tmpseq`); await client.query(`ALTER TABLE pg_temp.${table} ALTER COLUMN ${column_name} SET DEFAULT nextval('pg_temp.${table}_${column_name}_tmpseq')`);
      }
    }
    await client.query('INSERT INTO pg_temp.achievements SELECT * FROM public.achievements'); await client.query('INSERT INTO system_settings (id) VALUES (TRUE) ON CONFLICT DO NOTHING');
    await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    const src = n => load(path.join(API, 'src', n));
    const app = express(); app.use(express.json());
    app.use('/api/admin', src('routes/admin.routes.ts').default); app.use('/api/auth', src('routes/auth.routes.ts').default); app.use('/api/review', src('routes/review.routes.ts').default);
    server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
    const base = `http://127.0.0.1:${server.address().port}/api`; const tokens = {};
    const call = async (method, url, { as, body } = {}) => { const r = await fetch(base + url, { method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(as ? { Authorization: `Bearer ${tokens[as]}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); return { status: r.status, data: await r.json() }; };
    for (const name of ['admin', 'learner']) {
      const account = { username: `${name}_x1`, email: `${name}@example.com`, password: 'password123', confirmPassword: 'password123' };
      assert.equal((await call('POST', '/auth/register', { body: account })).status, 201);
      tokens[name] = (await call('POST', '/auth/login', { body: { login: account.username, password: account.password } })).data.token;
    }
    await client.query("UPDATE users SET role='admin' WHERE username='admin_x1'");
    const U1 = 'japanese-n5-unit-1', U2 = 'japanese-n5-unit-2';
    const bank = async where => (await client.query(`SELECT * FROM review_questions ${where ?? ''} ORDER BY id`)).rows;

    // ---- learner review
    assert.equal((await call('GET', `/review/units/${U1}/questions`)).status, 401);
    assert.equal((await call('GET', '/review/units/nope/questions', { as: 'learner' })).status, 404);
    const locked = await call('GET', `/review/units/${U2}/questions`, { as: 'learner' }); assert.equal(locked.status, 403); assert.ok(locked.data.reasons.length);
    assert.equal((await call('POST', `/review/units/${U2}/check`, { as: 'learner', body: { questionId: 'bank:1', answer: 0 } })).status, 403);
    const review = await call('GET', `/review/units/${U1}/questions`, { as: 'learner' }); assert.equal(review.status, 200);
    const questions = review.data.questions; const unit1Bank = await bank(`WHERE unit_id='${U1}'`);
    assert.equal(questions.filter(q => !q.id.startsWith('bank:')).length, 0, 'reviews never show assessment questions');
    assert.equal(questions.filter(q => q.id.startsWith('bank:')).length, Math.min(25, unit1Bank.length));
    assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
    for (const q of questions) for (const secret of ['correctIndex', 'answer', 'pairs', 'explanation', 'solution']) assert.ok(!(secret in q), `${q.id} leaks ${secret}`);
    const { UNIT_ASSESSMENTS } = src('data/unit-assessments.ts'); const assessment = UNIT_ASSESSMENTS[0];
    const check = (id, answer, unit = U1, as = 'learner') => call('POST', `/review/units/${unit}/check`, { as, body: { questionId: id, answer } });
    let graded = 0;
    for (const q of questions) {
      const [source, key] = q.id.split(':'); const stored = source === 'bank' ? unit1Bank.find(r => r.id === Number(key)) : null;
      if (q.type === 'multiple_choice') {
        const correctIndex = stored ? stored.content.correctIndex : assessment.questions.find(a => a.id === key).correctIndex;
        const right = await check(q.id, correctIndex); assert.deepEqual([right.status, right.data.correct, right.data.solution], [200, true, q.options[correctIndex]]);
        const wrong = await check(q.id, (correctIndex + 1) % q.options.length); assert.deepEqual([wrong.data.correct, wrong.data.solution], [false, q.options[correctIndex]]);
        for (const bad of [q.options.length, -1, 1.5, '0', null]) assert.equal((await check(q.id, bad)).status, 400);
      } else if (q.type === 'word_match') {
        assert.deepEqual(q.left, stored.content.pairs.map(p => p.left)); assert.deepEqual([...q.right].sort(), stored.content.pairs.map(p => p.right).sort());
        const answer = stored.content.pairs.map(p => p.right);
        assert.equal((await check(q.id, answer)).data.correct, true); assert.equal((await check(q.id, [...answer].reverse())).data.correct, false);
        for (const bad of [answer.slice(1), 'x', [1, 2, 3]]) assert.equal((await check(q.id, bad)).status, 400);
      } else {
        assert.equal(q.type, 'word_scramble'); assert.deepEqual([...q.letters].sort(), [...stored.content.answer].sort()); assert.notEqual(q.letters.join(''), stored.content.answer);
        const right = await check(q.id, ` ${stored.content.answer} `); assert.deepEqual([right.data.correct, right.data.solution], [true, stored.content.answer]);
        assert.equal((await check(q.id, q.letters.join('') + 'x')).data.correct, false); assert.equal((await check(q.id, 5)).status, 400);
      }
      graded++;
    }
    assert.deepEqual(new Set(questions.map(q => q.type)), new Set(['multiple_choice', 'word_match', 'word_scramble']));
    const otherUnit = (await bank(`WHERE unit_id='${U2}'`))[0];
    for (const id of [`bank:${otherUnit.id}`, 'bank:999999', 'bank:abc', 'assessment:nope', `assessment:${assessment.questions[0].id}`, 'other:1', 'nocolon', 5, undefined]) assert.equal((await check(id, 0)).status, 404, String(id));
    const orders = new Set(); for (let i = 0; i < 4; i++) orders.add((await call('GET', `/review/units/${U1}/questions`, { as: 'learner' })).data.questions.map(q => q.id).join());
    assert.ok(orders.size > 1, 'each review is a fresh selection');

    // ---- admin question bank
    assert.equal((await call('GET', '/admin/questions', { as: 'learner' })).status, 403);
    assert.equal((await call('POST', '/admin/questions', { as: 'learner', body: {} })).status, 403);
    const listed = await call('GET', '/admin/questions', { as: 'admin' });
    assert.equal(listed.data.questions.length, (await bank()).length); assert.deepEqual(listed.data.units.map(u => u.number).slice(0, 3), [1, 2, 3]);
    const mc = { unitId: U1, type: 'multiple_choice', content: { prompt: ' New question? ', options: ['A', ' B ', 'C'], correctIndex: 1, explanation: 'Because B.' } };
    const invalid = [
      {}, { ...mc, unitId: 'nope' }, { ...mc, type: 'essay' }, { ...mc, content: null },
      { ...mc, content: { ...mc.content, prompt: '' } }, { ...mc, content: { ...mc.content, options: ['A'] } }, { ...mc, content: { ...mc.content, options: ['A', 'A'] } },
      { ...mc, content: { ...mc.content, correctIndex: 3 } }, { ...mc, content: { ...mc.content, correctIndex: '1' } }, { ...mc, content: { ...mc.content, options: ['A', 'x'.repeat(121)] } },
      { unitId: U1, type: 'word_match', content: { pairs: [{ left: 'a', right: 'b' }] } }, { unitId: U1, type: 'word_match', content: { pairs: [{ left: 'a', right: 'b' }, { left: 'a', right: 'c' }] } },
      { unitId: U1, type: 'word_match', content: { pairs: [{ left: 'a', right: 'b' }, { left: 'c', right: '' }] } }, { unitId: U1, type: 'word_match', content: { pairs: 'x' } },
      { unitId: U1, type: 'word_scramble', content: { answer: 'あ', hint: 'h' } }, { unitId: U1, type: 'word_scramble', content: { answer: 'あ い', hint: 'h' } }, { unitId: U1, type: 'word_scramble', content: { answer: 'ねこ' } },
    ];
    for (const body of invalid) assert.equal((await call('POST', '/admin/questions', { as: 'admin', body })).status, 400, JSON.stringify(body).slice(0, 90));
    const created = await call('POST', '/admin/questions', { as: 'admin', body: mc });
    assert.equal(created.status, 201); assert.deepEqual(created.data.content, { prompt: 'New question?', options: ['A', 'B', 'C'], correctIndex: 1, explanation: 'Because B.' }); assert.equal(created.data.enabled, true);
    const adminId = (await client.query("SELECT id FROM users WHERE username='admin_x1'")).rows[0].id;
    assert.equal((await bank(`WHERE id=${created.data.id}`))[0].created_by, adminId);
    const match = await call('POST', '/admin/questions', { as: 'admin', body: { unitId: U1, type: 'word_match', content: { pairs: [{ left: 'ねこ', right: 'cat' }, { left: 'いぬ', right: 'dog' }] } } });
    const scramble = await call('POST', '/admin/questions', { as: 'admin', body: { unitId: U1, type: 'word_scramble', enabled: false, content: { answer: 'ねこ', hint: 'cat' } } });
    assert.deepEqual([match.status, scramble.status, scramble.data.enabled], [201, 201, false]);
    assert.equal((await check(`bank:${created.data.id}`, 1)).data.explanation, 'Because B.');
    assert.equal((await check(`bank:${match.data.id}`, ['cat', 'dog'])).data.correct, true);
    assert.equal((await check(`bank:${scramble.data.id}`, 'ねこ')).status, 404, 'disabled questions are not served');
    const edited = await call('PUT', `/admin/questions/${scramble.data.id}`, { as: 'admin', body: { unitId: U2, type: 'word_scramble', enabled: true, content: { answer: 'いぬ', hint: 'dog' } } });
    assert.deepEqual([edited.status, edited.data.unitId, edited.data.content.answer, edited.data.enabled], [200, U2, 'いぬ', true]);
    assert.equal((await call('PUT', `/admin/questions/${scramble.data.id}`, { as: 'admin', body: { ...mc, content: {} } })).status, 400);
    for (const id of ['999999', 'abc']) { assert.equal((await call('PUT', `/admin/questions/${id}`, { as: 'admin', body: mc })).status, 404); assert.equal((await call('DELETE', `/admin/questions/${id}`, { as: 'admin' })).status, 404); }
    assert.equal((await call('DELETE', `/admin/questions/${created.data.id}`, { as: 'learner' })).status, 403);
    assert.equal((await call('DELETE', `/admin/questions/${created.data.id}`, { as: 'admin' })).status, 200);
    assert.equal((await check(`bank:${created.data.id}`, 1)).status, 404); assert.equal((await bank(`WHERE id=${created.data.id}`)).length, 0);
    console.log(`PASS: auth and unit lock; ${questions.length} review questions without answer keys; ${graded} graded right/wrong/invalid across 3 types; cross-unit, unknown and disabled questions refused; fresh selection per review; admin-only bank; ${invalid.length} invalid submissions rejected; create/edit/disable/delete take effect in reviews. Rolled back.`);
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1200)); process.exitCode = 1; });
