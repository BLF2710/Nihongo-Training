// Builds google-api.cjs: the security harness (in-memory email) plus "Sign in with Google" with a fake verifier.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'generated', 'security-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf("    const security = src('services/account-security.service.ts')"));
head = head.replace("// Account security: reset, verification, revocation, limits, CORS, headers", "// Sign in with Google: linking rules, nonce, account states (fake Google verifier)")
  .replace("app.use('/api', src('routes/friend.routes.ts').default);", `app.use('/api', src('routes/friend.routes.ts').default); app.use('/api/site', src('routes/site.routes.ts').default);
    const { createGoogleSignInService } = src('services/google/google-sign-in.service.ts'); const nonces = src('services/google/sign-in-nonce.ts'); const { action } = src('utils/action.ts'); const { authenticate } = src('middleware/auth.middleware.ts'); const { getUserId } = src('utils/request-user.ts');
    // A fake Google: the "credential" carries its claims in the middle part, like a JWT, and verifies when the last part is "ok".
    const fakeGoogle = { async verify(credential) { const [, body, signature] = credential.split('.'); if (signature !== 'ok') throw new Error('bad signature'); return JSON.parse(Buffer.from(body, 'base64url').toString()); } };
    const google = createGoogleSignInService(fakeGoogle), off = createGoogleSignInService(null);
    app.get('/api/g/nonce', action(async (_q, res) => res.json(await google.nonce())));
    app.post('/api/g/sign-in', action(async (q, res) => res.json(await google.signIn(q.body?.credential))));
    app.post('/api/g/link', authenticate, action(async (q, res) => res.json(await google.link(getUserId(q), q.body?.credential))));
    app.delete('/api/g/link', authenticate, action(async (q, res) => res.json(await google.unlink(getUserId(q)))));
    app.post('/api/g-off/sign-in', action(async (q, res) => res.json(await off.signIn(q.body?.credential))));`);
for (const needle of ['createGoogleSignInService', 'site.routes']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const security = src('services/account-security.service.ts'); const mail = security.accountSecurity().mailer.sent;
    const linkIn = message => /token=([A-Za-z0-9_-]{43})/.exec(message.text)?.[1];
    const raw = async (method, url, { token, body } = {}) => { const r = await fetch(base + url, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) }); return { status: r.status, data: await r.json().catch(() => null) }; };
    const nonce = async () => (await raw('GET', '/g/nonce')).data.nonce;
    const credential = (claims, signature = 'ok') => ['h', Buffer.from(JSON.stringify(claims)).toString('base64url'), signature].join('.');
    const person = (sub, email, extra = {}) => ({ subject: sub, email, emailVerified: true, name: 'Mika Sato', ...extra });
    const signIn = async (identity, options = {}) => raw('POST', '/g/sign-in', { body: { credential: credential({ nonce: 'useNonce' in options ? options.useNonce : await nonce(), ...identity }) } });
    const users = async () => (await client.query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n;

    // ---- Not configured
    assert.equal((await raw('POST', '/g-off/sign-in', { body: { credential: 'a.b.ok' } })).status, 404);
    assert.equal((await raw('GET', '/auth/google/nonce')).status, 404, 'the real route is off without GOOGLE_CLIENT_ID');
    assert.equal((await raw('GET', '/site')).data.googleClientId, null);

    // ---- A new Google user gets an account: no password, email confirmed, Google linked
    const created = await signIn(person('g-mika', 'mika.sato@gmail.com'));
    assert.equal(created.status, 200); assert.equal(created.data.created, true);
    assert.deepEqual([created.data.user.username, created.data.user.email, created.data.user.role], ['mika_sato', 'mika.sato@gmail.com', 'learner']);
    const mikaToken = created.data.token;
    const profile = (await raw('GET', '/profile/me', { token: mikaToken })).data;
    assert.deepEqual([profile.display_name, Boolean(profile.email_verified_at), profile.sign_in], ['Mika Sato', true, { password: false, google: { email: 'mika.sato@gmail.com' } }]);
    assert.equal((await client.query("SELECT password FROM users WHERE username = 'mika_sato'")).rows[0].password, null);
    // The same Google account signs in again — even with a changed address at Google (matched by account id)
    const again = await signIn(person('g-mika', 'mika.new@gmail.com')); assert.deepEqual([again.status, again.data.created, again.data.user.username], [200, false, 'mika_sato']);
    assert.equal((await client.query("SELECT email FROM user_identities WHERE provider_subject = 'g-mika'")).rows[0].email, 'mika.new@gmail.com', 'the shown Google address is refreshed');

    // ---- Verification failures
    const n = await users();
    assert.equal((await raw('POST', '/g/sign-in', { body: { credential: credential({ nonce: await nonce(), ...person('g-x', 'x@gmail.com') }, 'forged') } })).status, 401, 'bad signature');
    for (const bad of ['not-a-jwt', '', 'a'.repeat(5000), 42]) assert.equal((await raw('POST', '/g/sign-in', { body: { credential: bad } })).status, 401);
    assert.equal((await signIn(person('g-x', 'x@gmail.com'), { useNonce: 'never-issued' })).status, 401, 'unknown nonce');
    assert.equal((await signIn(person('g-x', 'x@gmail.com'), { useNonce: null })).status, 401, 'no nonce');
    const once = await nonce(); assert.equal((await signIn(person('g-y', 'y@gmail.com'), { useNonce: once })).status, 200);
    assert.equal((await signIn(person('g-y', 'y@gmail.com'), { useNonce: once })).status, 401, 'a captured token cannot be replayed');
    assert.equal((await signIn(person('g-z', 'z@gmail.com', { emailVerified: false }))).status, 403, 'Google must have verified the email');
    assert.equal(await users(), n + 1, 'only the one valid sign-in created an account');

    // ---- Existing accounts with the same email
    // learner_x1 (registered with a password) hasn't confirmed their email: no automatic link
    const notConfirmed = await signIn(person('g-learner', 'learner@example.com'));
    assert.deepEqual([notConfirmed.status, notConfirmed.data.code], [409, 'link_required']);
    await client.query("UPDATE users SET email_verified_at = NOW() WHERE username IN ('learner_x1', 'admin_x1')");
    const linked = await signIn(person('g-learner', 'learner@example.com'));
    assert.deepEqual([linked.status, linked.data.created, linked.data.user.username], [200, false, 'learner_x1'], 'both sides confirmed: linked');
    // Administrators are never linked automatically
    assert.equal((await signIn(person('g-admin', 'admin@example.com'))).data.code, 'link_required');

    // ---- Account states
    await client.query("UPDATE users SET status = 'suspended' WHERE username = 'mika_sato'");
    assert.equal((await signIn(person('g-mika', 'mika.new@gmail.com'))).status, 403, 'suspended');
    await client.query("UPDATE users SET status = 'active' WHERE username = 'mika_sato'");
    await client.query('UPDATE system_settings SET registration_enabled = FALSE');
    assert.equal((await signIn(person('g-new', 'new@gmail.com'))).status, 403, 'registration closed: no new accounts');
    assert.equal((await signIn(person('g-mika', 'mika.new@gmail.com'))).status, 200, '...but existing Google users still sign in');
    await client.query('UPDATE system_settings SET registration_enabled = TRUE');
    // "Sign out everywhere" also ends Google sessions; signing in again gives a working token
    assert.equal((await raw('POST', '/auth/logout-all', { token: mikaToken })).status, 200);
    assert.equal((await raw('GET', '/profile/me', { token: mikaToken })).status, 401);
    assert.equal((await raw('GET', '/profile/me', { token: (await signIn(person('g-mika', 'mika.new@gmail.com'))).data.token })).status, 200);

    // ---- Connecting and disconnecting from settings
    const benToken = tokens.ben;
    const connected = await raw('POST', '/g/link', { token: benToken, body: { credential: credential({ nonce: await nonce(), ...person('g-ben', 'ben.private@gmail.com') }) } });
    assert.deepEqual([connected.status, connected.data.email], [200, 'ben.private@gmail.com'], 'any Google address can be connected by the signed-in owner');
    assert.equal((await signIn(person('g-ben', 'ben.private@gmail.com'))).data.user.username, 'ben_x1');
    assert.equal((await raw('POST', '/g/link', { token: benToken, body: { credential: credential({ nonce: await nonce(), ...person('g-mika', 'mika.new@gmail.com') }) } })).status, 409, 'already connected to another account');
    assert.equal((await raw('POST', '/g/link', { token: benToken, body: { credential: credential({ nonce: await nonce(), ...person('g-ben-2', 'ben2@gmail.com') }) } })).status, 409, 'one Google account per account');
    assert.equal((await raw('POST', '/g/link', { body: { credential: 'a.b.ok' } })).status, 401, 'signed in only');
    assert.equal((await raw('DELETE', '/g/link', { token: benToken })).status, 200, 'ben has a password, so Google can be disconnected');
    assert.equal((await raw('GET', '/profile/me', { token: benToken })).data.sign_in.google, null);

    // ---- A Google-only account: no password sign-in, can't lock itself out, can add a password by email
    const mikaNow = (await signIn(person('g-mika', 'mika.new@gmail.com'))).data.token;
    assert.equal((await raw('DELETE', '/g/link', { token: mikaNow })).status, 400, 'Google is the only way in: not removed');
    const pw = await raw('POST', '/auth/login', { body: { login: 'mika_sato', password: 'anything1' } });
    assert.equal(pw.status, 401); assert.match(pw.data.message, /Continue with Google/);
    await raw('POST', '/auth/password/forgot', { body: { email: 'mika.sato@gmail.com' } });
    assert.equal((await raw('POST', '/auth/password/reset', { body: { token: linkIn(mail.at(-1)), password: 'mikapass1', confirmPassword: 'mikapass1' } })).status, 200);
    const both = await raw('POST', '/auth/login', { body: { login: 'mika_sato', password: 'mikapass1' } }); assert.equal(both.status, 200, 'a password was added through the reset email');
    assert.deepEqual((await raw('GET', '/profile/me', { token: both.data.token })).data.sign_in, { password: true, google: { email: 'mika.new@gmail.com' } });
    console.log('PASS: off without GOOGLE_CLIENT_ID (route 404, no client id in site settings); new Google users get an account without a password, confirmed email and a clean username; matched by Google account id even when the address changes; forged, malformed, nonce-less, unknown-nonce and replayed tokens refused; unverified Google email refused; no automatic link to an unconfirmed account or any admin (link_required), automatic link when both sides are confirmed; suspended refused; closed registration blocks only new accounts; sign out everywhere ends Google sessions; connect from settings (any address, owner only, one per account, not someone else\'s), disconnect only with a password; Google-only accounts get a hint on password sign-in and can add a password by email. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'google-api.cjs'), head + tail);
console.log('written');
