// Builds security-api.cjs: the review-api harness plus password reset, email verification, revocable sessions,
// rate limits, CORS and security headers. Email goes to an in-memory mailer.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Account security: reset, verification, revocation, limits, CORS, headers")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("(async () => {", "process.env.MAIL_PROVIDER = 'memory'; process.env.APP_URL = 'http://app.test'; process.env.CORS_ORIGINS = 'http://app.test';\n(async () => {")
  .replace("const app = express(); app.use(express.json());", "const app = express(); const { config } = src('config/env.ts'); app.use(src('middleware/security-headers.middleware.ts').securityHeaders({ isProduction: false })); app.use(req('cors')({ origin: config().corsOrigins })); app.use(express.json());")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);", "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default); app.use('/api', src('routes/friend.routes.ts').default);");
for (const needle of ["MAIL_PROVIDER = 'memory'", 'securityHeaders', 'profile.routes', 'setInterval, clearInterval']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const security = src('services/account-security.service.ts'), limits = src('middleware/rate-limit.middleware.ts');
    const mail = security.accountSecurity().mailer.sent;
    const linkIn = message => /token=([A-Za-z0-9_-]{43})/.exec(message.text)?.[1];
    const raw = async (method, url, { token, body, origin } = {}) => { const r = await fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(origin ? { Origin: origin } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }); return { status: r.status, headers: r.headers, data: await r.json().catch(() => null) }; };
    const login = (name, password = 'password123') => raw('POST', '/auth/login', { body: { login: name + '_x1', password } });
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;

    // ---- Registration sends a confirmation link; nothing secret is stored
    assert.equal(mail.filter(m => m.to === 'learner@example.com').length, 1, 'registration sends a confirmation email');
    const welcome = mail.find(m => m.to === 'learner@example.com');
    assert.match(welcome.subject, /Confirm your email/); assert.match(welcome.text, /http:\/\/app\.test\/verify-email\?token=/);
    const stored = (await client.query("SELECT token_hash FROM account_tokens WHERE purpose = 'email_verification' AND email = 'learner@example.com'")).rows;
    assert.equal(stored.length, 1); assert.notEqual(stored[0].token_hash, linkIn(welcome)); assert.match(stored[0].token_hash, /^[0-9a-f]{64}$/, 'only a SHA-256 hash is stored');
    let me = await raw('GET', '/profile/me', { token: tokens.learner }); assert.equal(me.data.email_verified_at, null);

    // ---- Email verification
    assert.equal((await raw('POST', '/auth/email/verify', { body: { token: 'short' } })).status, 400);
    const verified = await raw('POST', '/auth/email/verify', { body: { token: linkIn(welcome) } });
    assert.deepEqual([verified.status, verified.data.verified], [200, true]);
    assert.ok((await raw('GET', '/profile/me', { token: tokens.learner })).data.email_verified_at);
    assert.equal((await raw('POST', '/auth/email/verify', { body: { token: linkIn(welcome) } })).status, 400, 'a link works once');
    assert.equal((await raw('POST', '/auth/email/resend', { token: tokens.learner })).data.alreadyVerified, true);
    assert.equal((await raw('POST', '/auth/email/resend')).status, 401);
    // Resend for an unverified account, then the per-account limit (3 an hour, the registration email included)
    const before = mail.length;
    assert.equal((await raw('POST', '/auth/email/resend', { token: tokens.admin })).data.sentTo, 'admin@example.com');
    assert.equal((await raw('POST', '/auth/email/resend', { token: tokens.admin })).status, 200);
    assert.equal((await raw('POST', '/auth/email/resend', { token: tokens.admin })).status, 429, 'at most 3 confirmation emails an hour');
    assert.equal(mail.length, before + 2);
    // Only the newest link works; earlier ones are retired
    const adminLinks = mail.filter(m => m.to === 'admin@example.com').map(linkIn);
    assert.equal((await raw('POST', '/auth/email/verify', { body: { token: adminLinks[0] } })).status, 400, 'an earlier link was retired');
    assert.equal((await raw('POST', '/auth/email/verify', { body: { token: adminLinks.at(-1) } })).status, 200);
    // A link for an address the account no longer uses doesn't confirm the new one
    await client.query("UPDATE users SET email = 'learner-new@example.com', email_verified_at = NULL WHERE username = 'learner_x1'");
    await client.query("UPDATE account_tokens SET created_at = NOW() - INTERVAL '2 hours'");
    const resend = await raw('POST', '/auth/email/resend', { token: tokens.learner }); assert.equal(resend.data.sentTo, 'learner-new@example.com');
    const newLink = linkIn(mail.at(-1));
    await client.query("UPDATE users SET email = 'learner@example.com' WHERE username = 'learner_x1'");
    assert.equal((await raw('POST', '/auth/email/verify', { body: { token: newLink } })).status, 400, 'link for an old address');

    // ---- Password reset: same answer for every address, single-use, expires, ends every session
    const generic = (await raw('POST', '/auth/password/forgot', { body: { email: 'nobody@example.com' } }));
    const real = (await raw('POST', '/auth/password/forgot', { body: { email: 'LEARNER@example.com' } }));
    assert.deepEqual([generic.status, real.status, generic.data.message], [202, 202, real.data.message], 'no hint whether an account exists');
    const resetMail = mail.at(-1); assert.equal(resetMail.to, 'learner@example.com'); assert.match(resetMail.text, /http:\/\/app\.test\/reset-password\?token=/);
    assert.ok(!mail.some(m => m.to === 'nobody@example.com'));
    const phone = (await login('learner')).data.token; const laptop = tokens.learner;
    assert.equal((await raw('GET', '/profile/me', { token: phone })).status, 200);
    assert.equal((await raw('POST', '/auth/password/reset', { body: { token: linkIn(resetMail), password: 'newpass12', confirmPassword: 'different' } })).status, 400);
    assert.equal((await raw('POST', '/auth/password/reset', { body: { token: linkIn(resetMail), password: 'short', confirmPassword: 'short' } })).status, 400);
    const reset = await raw('POST', '/auth/password/reset', { body: { token: linkIn(resetMail), password: 'newpass123', confirmPassword: 'newpass123' } });
    assert.equal(reset.status, 200);
    for (const old of [phone, laptop]) { const r = await raw('GET', '/profile/me', { token: old }); assert.deepEqual([r.status, r.data.code], [401, 'session_expired'], 'every session ended'); }
    assert.equal((await login('learner')).status, 401, 'the old password no longer works');
    let fresh = await login('learner', 'newpass123'); assert.equal(fresh.status, 200);
    assert.ok((await raw('GET', '/profile/me', { token: fresh.data.token })).data.email_verified_at, 'a reset confirms the address');
    assert.equal((await raw('POST', '/auth/password/reset', { body: { token: linkIn(resetMail), password: 'another123', confirmPassword: 'another123' } })).status, 400, 'a reset link works once');
    await raw('POST', '/auth/password/forgot', { body: { email: 'ben@example.com' } }); const benLink = linkIn(mail.at(-1));
    await client.query("UPDATE account_tokens SET expires_at = NOW() - INTERVAL '1 second' WHERE purpose = 'password_reset' AND email = 'ben@example.com'");
    assert.equal((await raw('POST', '/auth/password/reset', { body: { token: benLink, password: 'newpass123', confirmPassword: 'newpass123' } })).status, 400, 'expired link');
    await client.query("UPDATE users SET status = 'suspended' WHERE username = 'ben_x1'"); const sent = mail.length;
    await raw('POST', '/auth/password/forgot', { body: { email: 'ben@example.com' } }); assert.equal(mail.length, sent, 'no reset email for a suspended account');
    await client.query("UPDATE users SET status = 'active' WHERE username = 'ben_x1'");

    // ---- Password change: this device gets a new token, others end
    const other = (await login('learner', 'newpass123')).data.token; let current = fresh.data.token;
    assert.equal((await raw('PUT', '/profile/me/password', { token: current, body: { currentPassword: 'wrong', newPassword: 'third1234', confirmPassword: 'third1234' } })).status, 401);
    const changed = await raw('PUT', '/profile/me/password', { token: current, body: { currentPassword: 'newpass123', newPassword: 'third1234', confirmPassword: 'third1234' } });
    assert.equal(changed.status, 200); assert.ok(changed.data.token);
    assert.equal((await raw('GET', '/profile/me', { token: changed.data.token })).status, 200, 'the new token works');
    for (const old of [current, other]) assert.equal((await raw('GET', '/profile/me', { token: old })).status, 401);
    current = changed.data.token;

    // ---- Log out everywhere (also closes live streams)
    const streams = src('services/realtime.service.ts');
    const live = await fetch(base + '/events', { headers: { Authorization: 'Bearer ' + current } }); assert.equal(live.status, 200);
    const reader = live.body.getReader(); await reader.read();
    assert.equal(streams.streamCount(await uid('learner')), 1);
    assert.equal((await raw('POST', '/auth/logout-all', { token: current })).status, 200);
    assert.equal(streams.streamCount(await uid('learner')), 0, 'open live streams were closed');
    assert.equal((await raw('GET', '/profile/me', { token: current })).status, 401);
    assert.equal((await raw('GET', '/events', { token: current })).status, 401);
    assert.equal((await login('learner', 'third1234')).status, 200, 'signing in again works');
    // Tokens issued before versions existed still work while the account is at version 0
    const jwt = req('jsonwebtoken'); const legacy = jwt.sign({ userId: await uid('ben') }, process.env.JWT_SECRET, { expiresIn: '1h' });
    assert.equal((await raw('GET', '/profile/me', { token: legacy })).status, 200, 'older tokens stay valid until revoked');
    // A changed JWT_SECRET or an expired token ends the session the same way, so the web app signs out cleanly
    const otherSecret = jwt.sign({ userId: await uid('ben'), tv: 0 }, 'a-previous-secret', { expiresIn: '1h' });
    const expired = jwt.sign({ userId: await uid('ben'), tv: 0, exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET);
    for (const [stale, why] of [[otherSecret, 'signed with another secret'], [expired, 'expired']]) {
      const r = await raw('GET', '/profile/me', { token: stale }); assert.deepEqual([r.status, r.data.code], [401, 'session_expired'], why);
    }

    // ---- Rate limits
    await limits.resetRateLimits();
    const tries = []; for (let i = 0; i < 11; i++) tries.push((await login('ben', 'wrong-pass')).status);
    assert.deepEqual([tries.slice(0, 10).every(s => s === 401), tries[10]], [true, 429], 'the 11th wrong password in 15 minutes is refused');
    const limited = await login('ben', 'password123'); assert.equal(limited.status, 429, 'even the right password waits'); assert.ok(Number(limited.headers.get('retry-after')) > 0);
    assert.equal((await login('admin')).status, 200, 'other accounts are not affected');
    await limits.resetRateLimits();
    for (let i = 0; i < 10; i++) await raw('POST', '/auth/password/forgot', { body: { email: 'x' + i + '@example.com' } });
    assert.equal((await raw('POST', '/auth/password/forgot', { body: { email: 'y@example.com' } })).status, 429);
    await limits.resetRateLimits();
    for (let i = 0; i < 10; i++) await raw('POST', '/auth/register', { body: { username: 'bulk' + i, email: 'bulk' + i + '@example.com', password: 'password123', confirmPassword: 'password123' } });
    assert.equal((await raw('POST', '/auth/register', { body: { username: 'bulk99', email: 'bulk99@example.com', password: 'password123', confirmPassword: 'password123' } })).status, 429, '10 accounts an hour per address');

    // ---- CORS and security headers
    const allowed = await raw('GET', '/profile/me', { origin: 'http://app.test' }); const foreign = await raw('GET', '/profile/me', { origin: 'https://evil.example' });
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://app.test');
    assert.equal(foreign.headers.get('access-control-allow-origin'), null, 'other sites get no CORS permission');
    for (const [name, value] of [['x-content-type-options', 'nosniff'], ['x-frame-options', 'DENY'], ['referrer-policy', 'no-referrer'], ['content-security-policy', "default-src 'none'; frame-ancestors 'none'"]]) assert.equal(allowed.headers.get(name), value, name);
    const { loadConfig } = src('config/env.ts');
    assert.throws(() => loadConfig({ NODE_ENV: 'production', SMTP_URL: 'smtp://x' }), /CORS_ORIGINS/);
    assert.throws(() => loadConfig({ NODE_ENV: 'production', CORS_ORIGINS: 'https://a.example' }), /SMTP_URL/);
    assert.throws(() => loadConfig({ PORT: 'abc' }), /PORT/);
    assert.throws(() => loadConfig({ CORS_ORIGINS: 'not a url' }), /CORS_ORIGINS/);
    assert.equal(loadConfig({ PORT: '8080' }).port, 8080);
    assert.ok(!JSON.stringify(mail).includes(process.env.JWT_SECRET), 'no secrets in emails');
    console.log('PASS: registration sends a confirmation link (hash stored, not the secret); verification works once, only for the current address, only the newest link; resend limited to 3 an hour; reset answer identical for unknown addresses, no email to suspended accounts, single-use, expiring, ends every session and confirms the address; password change keeps this device (new token) and ends others; log out everywhere ends sessions and closes live streams; pre-version tokens still valid; sign-in limited to 10 tries per account per 15 min (right password waits too, Retry-After), other accounts unaffected; reset requests and registrations limited per address; CORS only for the app origin; security headers; production config checks. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'security-api.cjs'), head + tail);
console.log('written');
