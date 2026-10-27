// Two real API processes with SHARED_STATE=postgres, as behind a load balancer: a live update caused through one
// process reaches a stream held by the other, and failed sign-ins are counted across both. Creates accounts, so it
// runs only on a throwaway database (DISPOSABLE_DATABASE=1, as in CI); the accounts are deleted afterwards.
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { randomBytes } = require('node:crypto');
const API = path.join(ROOT, 'nihon-api');
const req = name => require(require.resolve(name, { paths: [API] }));
req('dotenv').config({ path: path.join(API, '.env'), quiet: true });
const { Pool } = req('pg');

if (process.env.DISPOSABLE_DATABASE !== '1') { console.error(`Refusing to run: this test creates accounts. Set DISPOSABLE_DATABASE=1 only for a throwaway database (now ${process.env.DB_NAME}).`); process.exit(1); }

const PORTS = [5191, 5192];
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function startServer(port) {
  const child = spawn(process.execPath, ['-r', 'ts-node/register/transpile-only', 'src/server.ts'], {
    cwd: API, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port), SHARED_STATE: 'postgres', MAIL_PROVIDER: 'memory', NODE_ENV: 'development', GOOGLE_CLIENT_ID: '', JWT_SECRET: process.env.JWT_SECRET || 'multi-process-test-secret' },
  });
  let output = ''; child.stdout.on('data', chunk => { output += chunk; }); child.stderr.on('data', chunk => { output += chunk; });
  return { child, port, output: () => output };
}

async function waitUntilUp(server) {
  const end = Date.now() + 60_000;
  while (Date.now() < end) {
    try { if ((await fetch(`http://127.0.0.1:${server.port}/`)).ok) return; } catch { /* not listening yet */ }
    if (server.child.exitCode !== null) break;
    await pause(300);
  }
  throw new Error(`API on port ${server.port} did not start:\n${server.output().slice(-1500)}`);
}

(async () => {
  const tag = 'mp' + randomBytes(4).toString('hex');
  const servers = PORTS.map(startServer);
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const abort = new AbortController();
  try {
    await Promise.all(servers.map(waitUntilUp));
    const [a, b] = servers.map(server => `http://127.0.0.1:${server.port}/api`);
    const call = async (base, method, url, { token, body } = {}) => {
      const response = await fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
      return { status: response.status, data: await response.json().catch(() => null) };
    };
    const account = name => ({ username: `${tag}_${name}`, email: `${tag}_${name}@example.com`, password: 'password123', confirmPassword: 'password123' });
    const tokens = {};
    for (const [name, base] of [['mika', a], ['ken', b]]) {
      assert.equal((await call(base, 'POST', '/auth/register', { body: account(name) })).status, 201);
      tokens[name] = (await call(base, 'POST', '/auth/login', { body: { login: account(name).username, password: 'password123' } })).data.token;
    }

    // ---- Mika's tab is connected to process B; Ken sends a friend request through process A.
    const stream = await fetch(`${b}/events`, { headers: { Authorization: `Bearer ${tokens.mika}` }, signal: abort.signal });
    assert.equal(stream.status, 200);
    const reader = stream.body.getReader(), decoder = new TextDecoder();
    let received = '';
    const readUntil = async (pattern, ms) => {
      const end = Date.now() + ms;
      while (!pattern.test(received)) {
        const remaining = end - Date.now(); if (remaining <= 0) return false;
        const chunk = await Promise.race([reader.read(), pause(remaining).then(() => null)]);
        if (!chunk || chunk.done) return pattern.test(received);
        received += decoder.decode(chunk.value);
      }
      return true;
    };
    assert.ok(await readUntil(/event: ready/, 5000), 'stream opened');
    await pause(500); // process B's listener is set up when the first stream opens
    assert.equal((await call(a, 'POST', '/friends/requests', { token: tokens.ken, body: { username: account('mika').username } })).status, 201);
    assert.ok(await readUntil(/event: friends\ndata: \{"type":"friends","reason":"request"/, 5000), `the request reached the stream on the other process; got: ${received.slice(0, 300)}`);
    assert.ok(await readUntil(/event: notifications/, 5000), 'and the notification bell too');

    // ---- "Sign out everywhere" through process A ends the stream held by process B.
    assert.equal((await call(a, 'POST', '/auth/logout-all', { token: tokens.mika })).status, 200);
    const ended = await Promise.race([(async () => { while (!(await reader.read()).done); return true; })(), pause(5000).then(() => false)]);
    assert.ok(ended, 'the stream on the other process was closed');

    // ---- Sign-in attempts for one account are counted across both processes (limit: 10 per 15 minutes).
    // A new account that has never signed in, so every attempt below is one of its ten.
    assert.equal((await call(b, 'POST', '/auth/register', { body: account('ana') })).status, 201);
    const statuses = [];
    for (let attempt = 0; attempt < 11; attempt++) statuses.push((await call(attempt % 2 ? b : a, 'POST', '/auth/login', { body: { login: account('ana').username, password: 'wrong-password' } })).status);
    assert.deepEqual(statuses.slice(0, 10), Array(10).fill(401));
    assert.equal(statuses[10], 429, 'the 11th attempt is refused even though each process saw only 5 or 6');

    console.log('PASS: two API processes on one PostgreSQL: a friend request made through one reached a live stream held by the other (friends and notifications events); signing out everywhere through one closed the stream on the other; failed sign-ins were counted across both (10 allowed, the 11th refused with 429).');
  } finally {
    abort.abort();
    for (const server of servers) server.child.kill();
    await pool.query("DELETE FROM users WHERE username LIKE $1", [tag + '\\_%']).catch(error => console.error('cleanup:', error.message));
    await pool.query("DELETE FROM rate_limit_windows WHERE id LIKE $1", ['%' + tag + '%']).catch(() => {});
    await pool.end();
  }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
