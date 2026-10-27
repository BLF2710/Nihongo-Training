// "Unlock all lessons" for one account, against TEMP copies of every table (rolled back).
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const API = ROOT + '/nihon-api';
const req = name => require(require.resolve(name, { paths: [API] }));
const ts = req('typescript'), express = req('express'), { Pool } = req('pg');
req('dotenv').config({ path: path.join(API, '.env'), quiet: true });
const eq = (actual, expected, message) => assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);
(async () => {
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const client = await pool.connect(); let server;
  let queue = Promise.resolve(); const serial = task => { const run = queue.then(task, task); queue = run.catch(() => {}); return run; };
  const guarded = (sql, values) => serial(async () => { await client.query('SAVEPOINT stmt'); try { const r = await client.query(sql, values); await client.query('RELEASE SAVEPOINT stmt'); return r; } catch (e) { await client.query('ROLLBACK TO SAVEPOINT stmt'); throw e; } });
  const fakePool = { query: guarded, connect: async () => ({ query: (sql, values) => serial(() => client.query(sql === 'BEGIN' ? 'SAVEPOINT tx' : sql === 'COMMIT' ? 'RELEASE SAVEPOINT tx' : sql === 'ROLLBACK' ? 'ROLLBACK TO SAVEPOINT tx' : sql, values)), release() {} }) };
  const cache = new Map();
  const sourceFile = p => p.endsWith('.json') ? p : fs.existsSync(p + '.ts') ? p + '.ts' : path.join(p, 'index.ts');
  function load(f) { if (f.endsWith('.json')) return JSON.parse(fs.readFileSync(f, 'utf8')); if (cache.has(f)) return cache.get(f); const exports = {}; cache.set(f, exports);
    const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(out, { exports, console: { ...console, error() {} }, process, Buffer, setTimeout, require: n => n.endsWith('/config/db') ? { pool: fakePool } : n.startsWith('.') ? load(sourceFile(path.resolve(path.dirname(f), n))) : req(n) }); return exports; }
  try {
    await client.query('BEGIN');
    for (const { table_name: table } of (await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")).rows) {
      await client.query(`CREATE TEMP TABLE ${table} (LIKE public.${table} INCLUDING ALL) ON COMMIT DROP`);
      for (const { column_name } of (await client.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_default LIKE 'nextval(%'", [table])).rows) { await client.query(`CREATE TEMP SEQUENCE ${table}_${column_name}_tmpseq`); await client.query(`ALTER TABLE pg_temp.${table} ALTER COLUMN ${column_name} SET DEFAULT nextval('pg_temp.${table}_${column_name}_tmpseq')`); }
    }
    await client.query('INSERT INTO pg_temp.achievements SELECT * FROM public.achievements'); await client.query('INSERT INTO system_settings (id) VALUES (TRUE) ON CONFLICT DO NOTHING');
    const src = n => load(path.join(API, 'src', n));
    const app = express(); app.use(express.json());
    for (const [mount, file] of [['auth', 'auth'], ['units', 'unit'], ['lessons', 'lesson'], ['review', 'review'], ['admin', 'admin']]) app.use(`/api/${mount}`, src(`routes/${file}.routes.ts`).default);
    server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
    const base = `http://127.0.0.1:${server.address().port}/api`; const tokens = {};
    const call = async (method, url, { as, body } = {}) => { const r = await fetch(base + url, { method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(as ? { Authorization: `Bearer ${tokens[as]}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); return { status: r.status, data: await r.json() }; };
    for (const name of ['admin', 'learner', 'other']) { const account = { username: `${name}_u1`, email: `${name}@example.com`, password: 'password123', confirmPassword: 'password123' }; await call('POST', '/auth/register', { body: account }); tokens[name] = (await call('POST', '/auth/login', { body: { login: account.username, password: account.password } })).data.token; }
    await client.query("UPDATE users SET role='admin' WHERE username='admin_u1'");
    const ids = Object.fromEntries((await client.query('SELECT id, username FROM users')).rows.map(r => [r.username.split('_')[0], r.id]));
    const units = async as => (await call('GET', '/units', { as })).data.units;
    const state = async () => JSON.stringify((await client.query('SELECT (SELECT COUNT(*) FROM lesson_progress) AS lessons, (SELECT COALESCE(SUM(xp),0) FROM user_gamification) AS xp, (SELECT COUNT(*) FROM xp_events) AS events, (SELECT COUNT(*) FROM user_assessment_progress) AS assessments')).rows[0]);

    // Before: normal progression.
    let before = await units('learner'); const total = before.length; assert.ok(total >= 4);
    eq(before.map(u => u.allowed), [true, ...Array(total - 1).fill(false)]); eq(before[0].lessons.map(l => l.allowed), [true, false, false, false, false, false]);
    const lockedLesson = before[total - 1].lessons[2].id;
    assert.equal((await call('GET', `/lessons/${lockedLesson}/access`, { as: 'learner' })).status, 403);
    assert.equal((await call('GET', '/admin/users', { as: 'admin' })).data.users.find(u => u.id === ids.learner).all_lessons_unlocked, false);

    // Only administrators can change it; input is validated.
    const put = (id, body, as = 'admin') => call('PUT', `/admin/users/${id}/lesson-access`, { as, body });
    assert.equal((await put(ids.learner, { unlocked: true }, 'learner')).status, 403); assert.equal((await call('PUT', `/admin/users/${ids.learner}/lesson-access`, { body: { unlocked: true } })).status, 401);
    for (const body of [{}, { unlocked: 'yes' }, { unlocked: 1 }]) assert.equal((await put(ids.learner, body)).status, 400);
    for (const id of [999999, 'abc', 0]) assert.equal((await put(id, { unlocked: true })).status, 404);
    const snapshot = await state();

    // Unlock: every unit and lesson opens for that account only; nothing is completed or awarded.
    const unlocked = await put(ids.learner, { unlocked: true }); eq([unlocked.status, unlocked.data], [200, { id: ids.learner, all_lessons_unlocked: true }]);
    const open = await units('learner');
    assert.ok(open.every(u => u.allowed && u.reasons.length === 0 && u.lessons.every(l => l.allowed && l.reasons.length === 0)));
    assert.ok(open.every(u => u.completedLessons === 0 && !u.completed && !u.assessmentUnlocked), 'completion and assessments are still earned');
    assert.equal(await state(), snapshot, 'unlocking writes no progress or XP');
    assert.equal((await call('GET', `/lessons/${lockedLesson}/access`, { as: 'learner' })).status, 200);
    assert.equal((await call('GET', `/units/${open[total - 1].id}/assessment`, { as: 'learner' })).status, 403, 'the assessment still needs the unit lessons');
    assert.equal((await call('GET', `/review/units/${open[total - 1].id}/questions`, { as: 'learner' })).status, 200);
    eq((await units('other')).map(u => u.allowed), [true, ...Array(total - 1).fill(false)], 'other accounts are unaffected');
    assert.equal((await call('GET', '/admin/users', { as: 'admin' })).data.users.find(u => u.id === ids.learner).all_lessons_unlocked, true);
    // A lesson opened this way can be completed and earns XP normally.
    const done = await call('POST', `/lessons/${lockedLesson}/complete`, { as: 'learner', body: { challengeScore: 100 } }); eq([done.status, done.data.completion.awarded], [200, true]);
    // Existing profile edits leave the switch alone.
    const edit = await call('PATCH', `/admin/users/${ids.learner}`, { as: 'admin', body: { username: 'learner_u1', email: 'learner@example.com', role: 'learner', status: 'active' } }); assert.equal(edit.status, 200);
    assert.ok((await units('learner')).every(u => u.allowed));

    // Relock: normal rules return, earned progress stays.
    eq((await put(ids.learner, { unlocked: false })).data, { id: ids.learner, all_lessons_unlocked: false });
    const after = await units('learner'); eq(after.map(u => u.allowed), [true, ...Array(total - 1).fill(false)]);
    assert.equal(after[total - 1].completedLessons, 1); assert.equal((await call('GET', `/lessons/${lockedLesson}/access`, { as: 'learner' })).status, 403);
    console.log(`PASS: admin-only and validated; unlock opens all ${total} units and every lesson for that account only; no progress or XP written; assessments still require the lessons; opened lessons complete normally; relock restores the rules and keeps earned progress. Rolled back.`);
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1200)); process.exitCode = 1; });
