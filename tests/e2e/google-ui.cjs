// "Sign in with Google" in the browser, with Google's script replaced by a stand-in and fixture APIs.
//   node google-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const CLIENT_ID = '123-test.apps.googleusercontent.com';
// Behaves like Google Identity Services: initialize() keeps the options, renderButton() draws a button, and a click
// returns a token whose middle part carries the nonce (and the email the test chose in window.__googleEmail).
const FAKE_GIS = `window.__gis = { inits: [] };
window.google = { accounts: { id: {
  initialize(options) { window.__gis.options = options; window.__gis.inits.push({ client_id: options.client_id, nonce: options.nonce, context: options.context, ux_mode: options.ux_mode }); },
  renderButton(parent, options) { const b = document.createElement('button'); b.type = 'button'; b.textContent = 'Continue with Google (stand-in)'; b.dataset.text = options.text;
    b.onclick = () => { const claims = { nonce: window.__gis.options.nonce, email: window.__googleEmail || 'mika@gmail.com' }; window.__gis.options.callback({ credential: 'h.' + btoa(JSON.stringify(claims)).replace(/=+$/, '').replace(/\\+/g, '-').replace(/\\//g, '_') + '.sig' }); };
    parent.appendChild(b); },
  cancel() {} } } };`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ clientId = CLIENT_ID, scriptFails = false } = {}) => {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
      const state = { nonces: [], posts: [], profile: { password: true, google: null } };
      await context.route('https://accounts.google.com/gsi/client', route => scriptFails ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: FAKE_GIS }));
      await context.route('http://localhost:5000/api/**', route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), method = request.method(), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [], googleClientId: clientId });
        if (p === '/auth/google/nonce') { const nonce = 'nonce-' + (state.nonces.length + 1); state.nonces.push(nonce); return json({ nonce }); }
        if (p === '/auth/google' || p === '/auth/google/link') {
          const claims = method === 'DELETE' ? null : JSON.parse(Buffer.from(request.postDataJSON().credential.split('.')[1], 'base64url').toString());
          state.posts.push({ p, method, claims });
          if (method === 'DELETE') { state.profile = { ...state.profile, google: null }; return json({ disconnected: true }); }
          if (claims.nonce !== state.nonces.at(-1)) return json({ message: 'This Google sign-in has expired. Please try again.' }, 401);
          if (p === '/auth/google/link') { state.profile = { ...state.profile, google: { email: claims.email } }; return json({ email: claims.email }); }
          if (claims.email === 'taken@example.com') return json({ message: 'An account already uses this email address. Sign in with your password, then connect Google in Profile → Settings → Account security.', code: 'link_required' }, 409);
          const admin = claims.email === 'boss@gmail.com';
          return json({ token: 'test.' + Buffer.from(JSON.stringify({ userId: admin ? 9 : 1 })).toString('base64url') + '.x', user: { id: 1, username: admin ? 'boss' : 'mika_sato', email: claims.email, role: admin ? 'admin' : 'learner' }, created: true });
        }
        if (p === '/admin/access') return json({ id: 9, username: 'boss', role: 'admin' });
        if (p === '/profile/me') return json({ username: 'mika_sato', display_name: 'Mika', email: 'mika@gmail.com', email_verified_at: '2026-10-26T00:00:00Z', bio: '', learning_language: 'Japanese', learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 0, level: 1, rank: 'Beginner', lessons_completed: 0, current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 100, progressPercent: 0 }, sign_in: state.profile });
        if (p === '/units') return json({ units: [] });
        if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        return json({});
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      return { context, page, state, errors };
    };
    const googleButton = page => page.getByRole('button', { name: 'Continue with Google (stand-in)' });

    // ---- Sign in: the token carries the nonce the API issued; signed in and sent to the dashboard
    let { context, page, state, errors } = await run();
    await page.goto(base + '/login'); await googleButton(page).waitFor();
    // In development React mounts twice, so more than one nonce may be issued; the button must use the newest.
    const issued = state.nonces.at(-1);
    assert.deepEqual(await page.evaluate(() => window.__gis.inits.at(-1)), { client_id: CLIENT_ID, nonce: issued, context: 'signin', ux_mode: 'popup' });
    await page.getByText('We never see your Google password.').waitFor();
    await page.screenshot({ path: shots + '/google-login.png' });
    await googleButton(page).click(); await page.waitForURL(base + '/');
    assert.deepEqual(state.posts[0], { p: '/auth/google', method: 'POST', claims: { nonce: issued, email: 'mika@gmail.com' } });
    assert.ok(await page.evaluate(() => localStorage.getItem('token'))); assert.equal(await page.evaluate(() => localStorage.getItem('user_handle')), 'mika_sato');
    // ---- An existing account that must be linked first: explained, and the button gets a fresh nonce
    await page.evaluate(() => localStorage.clear()); await page.goto(base + '/login'); await googleButton(page).waitFor();
    await page.evaluate(() => { window.__googleEmail = 'taken@example.com'; });
    await googleButton(page).click(); await page.getByRole('alert').getByText('An account already uses this email address.').waitFor();
    await page.waitForFunction(() => window.__gis.inits.length >= 2);
    const inits = await page.evaluate(() => window.__gis.inits.map(i => i.nonce)); assert.notEqual(inits.at(-1), inits.at(-2), 'a new nonce for the next attempt');
    assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
    // ---- The return address is honoured
    await page.evaluate(() => { window.__googleEmail = 'mika@gmail.com'; }); await page.goto(base + '/login?next=%2Ffriends'); await googleButton(page).waitFor();
    await page.evaluate(() => { window.__googleEmail = 'mika@gmail.com'; }); await googleButton(page).click(); await page.waitForURL('**/friends');
    // ---- Registration page offers it too ("signup" context); admins go to the admin area
    await page.evaluate(() => localStorage.clear()); await page.goto(base + '/register'); await googleButton(page).waitFor();
    assert.equal(await page.evaluate(() => window.__gis.inits.at(-1).context), 'signup');
    await page.evaluate(() => { window.__googleEmail = 'boss@gmail.com'; }); await googleButton(page).click(); await page.waitForURL('**/admin');
    // ---- Settings: connect, then disconnect (the account has a password)
    await page.evaluate(() => { localStorage.setItem('user_role', 'learner'); window.__googleEmail = 'mika.other@gmail.com'; });
    await page.goto(base + '/profile?tab=settings'); const security = page.getByRole('region', { name: 'Account security' }); await security.getByRole('heading', { name: 'Google' }).waitFor();
    await page.evaluate(() => { window.__googleEmail = 'mika.other@gmail.com'; });
    assert.equal(await page.evaluate(() => window.__gis.inits.at(-1).context), 'use');
    await googleButton(page).click(); await security.getByText('Connected mika.other@gmail.com. You can now sign in with Google.').waitFor();
    await security.getByText('Connected:').waitFor(); assert.match(await security.innerText(), /Connected:\s*mika\.other@gmail\.com/);
    await page.screenshot({ path: shots + '/google-settings.png', fullPage: true });
    await security.getByRole('button', { name: 'Disconnect Google' }).click(); await security.getByText('Google disconnected.').waitFor();
    assert.deepEqual(state.posts.filter(x => x.p === '/auth/google/link').map(x => x.method), ['POST', 'DELETE']);
    // ---- A Google-only account: can't disconnect, is pointed to adding a password
    state.profile = { password: false, google: { email: 'mika@gmail.com' } };
    await page.reload(); await security.getByText("Google is your only way to sign in, so it can't be disconnected.").waitFor();
    assert.equal(await security.getByRole('button', { name: 'Disconnect Google' }).count(), 0);
    assert.equal(await security.getByRole('link', { name: 'Set a password' }).getAttribute('href'), '/forgot-password');
    assert.equal(await security.getByLabel('Current password', { exact: true }).count(), 0, 'no change-password form without a password');
    assert.deepEqual(errors, []); await context.close();

    // ---- Not configured: no Google section at all
    ({ context, page, errors } = await run({ clientId: null }));
    await page.goto(base + '/login'); await page.getByRole('button', { name: 'Sign in' }).waitFor(); await page.waitForTimeout(500);
    assert.equal(await page.getByText('We never see your Google password.').count(), 0); assert.equal(await page.evaluate(() => !!document.querySelector('script[src*="accounts.google.com"]')), false, "Google's script isn't even loaded");
    await context.close();
    // ---- Google's script blocked (content blocker / offline): explained, password sign-in still works
    ({ context, page, errors } = await run({ scriptFails: true }));
    await page.goto(base + '/login'); await page.getByRole('alert').getByText("Google sign-in couldn't be loaded.").waitFor();
    await page.getByRole('button', { name: 'Sign in' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await context.close();
    console.log('PASS: Google button on sign-in and registration (signin/signup context, popup mode) with the client id from site settings; the token carries the nonce the API just issued; signed in and sent to the dashboard, the return address, or the admin area; "link required" explained without signing in, then a new nonce for the next attempt; settings: connect (use context) and disconnect; Google-only accounts can\'t disconnect and are pointed to adding a password, no change-password form; nothing (not even Google\'s script) when not configured; blocked script explained while password sign-in still works; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
