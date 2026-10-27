// Shared state in PostgreSQL (SHARED_STATE=postgres), as two API processes would use it: each "process" has its
// own connections. Rate-limit windows and nonces use unique test keys that are deleted afterwards; the realtime
// bus uses its own channel. Needs migration 023.
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const API = path.join(ROOT, 'nihon-api');
const req = name => require(require.resolve(name, { paths: [API] }));
req('dotenv').config({ path: path.join(API, '.env'), quiet: true });
req('ts-node').register({ transpileOnly: true, compilerOptions: { module: 'commonjs' } });
const { Pool } = req('pg');
const { PostgresRateLimitStore } = require(path.join(API, 'src/shared-state/rate-limit-store.ts'));
const { PostgresNonceStore } = require(path.join(API, 'src/shared-state/nonce-store.ts'));
const { PostgresRealtimeBus } = require(path.join(API, 'src/shared-state/realtime-bus.ts'));

const options = { host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const until = async (check, label, ms = 5000) => { const end = Date.now() + ms; while (!check()) { if (Date.now() > end) throw new Error('timed out waiting for ' + label); await pause(20); } };

(async () => {
  const tag = 'test-' + randomBytes(6).toString('hex');
  const poolA = new Pool(options), poolB = new Pool(options);
  const buses = [];
  try {
    // ---- Rate limits: both processes count into the same window, which ends on the database's clock
    const limitsA = new PostgresRateLimitStore(poolA), limitsB = new PostgresRateLimitStore(poolB);
    const id = tag + ':login';
    const first = await limitsA.hit(id, 1500);
    assert.equal(first.count, 1); assert.ok(first.resetAt > Date.now() && first.resetAt <= Date.now() + 1600, 'window end on this clock');
    assert.equal((await limitsB.hit(id, 1500)).count, 2, 'counted across processes');
    assert.equal((await limitsA.hit(id, 1500)).count, 3);
    const parallel = await Promise.all(Array.from({ length: 10 }, (_, i) => (i % 2 ? limitsA : limitsB).hit(id, 1500)));
    assert.deepEqual(parallel.map(hit => hit.count).sort((a, b) => a - b), [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 'concurrent uses are each counted once');
    assert.equal((await limitsB.hit(tag + ':other', 1500)).count, 1, 'keys are separate');
    await pause(1600);
    assert.equal((await limitsB.hit(id, 1500)).count, 1, 'a window that ended starts again');

    // ---- Nonces: issued on one process, usable once on any
    const noncesA = new PostgresNonceStore(poolA), noncesB = new PostgresNonceStore(poolB);
    await noncesA.save(tag + '-n1', 60_000);
    assert.equal(await noncesB.use(tag + '-n1'), true, 'used on another process');
    assert.equal(await noncesA.use(tag + '-n1'), false, 'not twice');
    assert.equal(await noncesA.use(tag + '-unknown'), false);
    await noncesA.save(tag + '-n2', 60_000);
    assert.deepEqual((await Promise.all([noncesA.use(tag + '-n2'), noncesB.use(tag + '-n2')])).sort(), [false, true], 'exactly one of two simultaneous uses succeeds');
    await noncesB.save(tag + '-n3', 100); await pause(250);
    assert.equal(await noncesA.use(tag + '-n3'), false, 'expired');

    // ---- Realtime bus: a message sent by either process reaches both; garbage on the channel is ignored
    const channel = 'lingohub_' + tag.replace(/-/g, '_');
    const busA = new PostgresRealtimeBus(poolA, options, channel), busB = new PostgresRealtimeBus(poolB, options, channel);
    buses.push(busA, busB);
    const seenA = [], seenB = [];
    busA.onMessage(message => seenA.push(message)); busB.onMessage(message => seenB.push(message));
    await busA.ready(); await busB.ready();
    await busA.send({ kind: 'event', userId: 5, event: { type: 'inbox' } });
    await busB.send({ kind: 'close', userId: 9 });
    await poolA.query('SELECT pg_notify($1, $2)', [channel, 'not json']);
    await poolA.query('SELECT pg_notify($1, $2)', [channel, JSON.stringify({ kind: 'event', userId: 'x' })]);
    await busA.send({ kind: 'event', userId: 6, event: { type: 'notifications' } });
    for (const seen of [seenA, seenB]) {
      await until(() => seen.length >= 3, 'three messages');
      assert.deepEqual(seen, [{ kind: 'event', userId: 5, event: { type: 'inbox' } }, { kind: 'close', userId: 9 }, { kind: 'event', userId: 6, event: { type: 'notifications' } }]);
    }
    // A listener that loses its connection reconnects and keeps receiving.
    const killed = await poolA.query("SELECT pg_terminate_backend(pid) AS ok FROM pg_stat_activity WHERE query = $1 AND pid <> pg_backend_pid()", [`LISTEN ${channel}`]).catch(() => null);
    let reconnectChecked = false;
    if (killed && killed.rows.some(row => row.ok)) {
      const before = seenB.length;
      const errors = console.error; console.error = () => {};
      try {
        const end = Date.now() + 8000;
        while (seenB.length === before && Date.now() < end) { await busA.send({ kind: 'event', userId: 7, event: { type: 'inbox' } }); await pause(400); }
      } finally { console.error = errors; }
      assert.ok(seenB.length > before, 'messages arrive again after reconnecting');
      reconnectChecked = true;
    }
    console.log(`PASS: rate limits counted across two processes (including 10 concurrent uses), separate keys, windows end on the database clock; nonces usable once on any process, one of two simultaneous uses wins, expiry; realtime bus delivers events and close requests to both processes in order and ignores malformed messages${reconnectChecked ? '; a listener reconnects after its connection is killed' : ' (reconnect not checked: no permission to end the listener connection)'}.`);
  } finally {
    for (const bus of buses) await bus.close();
    await poolA.query('DELETE FROM rate_limit_windows WHERE id LIKE $1', [tag + '%']).catch(() => {});
    await poolA.query('DELETE FROM sign_in_nonces WHERE nonce LIKE $1', [tag + '%']).catch(() => {});
    await poolA.end(); await poolB.end();
  }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
