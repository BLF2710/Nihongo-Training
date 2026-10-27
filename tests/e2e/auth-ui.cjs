// Sign-in and registration pages against fixture APIs.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2], shots = process.argv[3];
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage(); const errors = [], dialogs = [], posts = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
    await context.route('http://localhost:5000/api/**', async route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), body = request.postDataJSON();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (request.method() === 'POST') posts.push({ path: p, body });
      if (p === '/auth/login') { await new Promise(r => setTimeout(r, 150)); return body.password === 'wrongpass' ? json({ message: 'Invalid email or password' }, 401) : body.login === 'offline' ? route.abort() : json({ token, user: { id: 1, username: 'kai', email: 'kai@example.com', role: body.login === 'boss' ? 'admin' : 'learner' } }); }
      if (p === '/auth/register') return body.username === 'taken_name' ? json({ message: 'Username already exists' }, 400) : body.username === 'closed_reg' ? json({ message: 'New account registration is currently closed.' }, 403) : json({ message: 'Register success' }, 201);
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/quiz/characters') return json({ characters: [{ id: 1, kana: 'あ', romaji: 'a' }] });
      if (p === '/units') return json({ units: [] });
      if (p === '/profile/me') return json({ display_name: 'Kai', username: 'kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      if (p === '/admin/access') return json({ id: 1, username: 'boss', role: 'admin' });
      if (p === '/admin/analytics') return json({ generatedAt: '2026-10-12T00:00:00.000Z', learners: { total: 0, newLast30Days: 0, activeToday: 0, activeLast7Days: 0, activeLast30Days: 0 }, dailyActive: [], funnel: [], dropOffs: [], practice: [] });
      if (p === '/admin/overview') return json({ users: { total: 1, active: 1, admins: 1 }, database: 'connected', databaseLatencyMs: 3, uptimeSeconds: 60, checkedAt: '2026-10-12T00:00:00.000Z', latestMigration: null });
      return json({});
    });
    const heading = name => page.getByRole('heading', { name, exact: true });
    const noOverflow = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows`);

    // ---- sign in
    await page.goto(base + '/login'); await heading('Welcome back').waitFor();
    await page.getByRole('complementary', { name: 'About LingoHub' }).waitFor();
    assert.ok(await page.getByLabel('Email or username').evaluate(el => el === document.activeElement), 'first field is focused');
    await page.screenshot({ path: shots + '/login.png' });
    await page.getByRole('button', { name: 'Sign in' }).click(); assert.equal(posts.length, 0, 'empty form is not submitted');
    const password = page.getByLabel('Password', { exact: true });
    await page.getByLabel('Email or username').fill('kai'); await password.fill('wrongpass');
    assert.equal(await password.getAttribute('type'), 'password');
    await page.getByRole('button', { name: 'Show password' }).click(); assert.equal(await password.getAttribute('type'), 'text'); assert.equal(await password.inputValue(), 'wrongpass');
    await page.getByRole('button', { name: 'Show password' }).click(); assert.equal(await password.getAttribute('type'), 'password');
    await password.press('Enter');                                           // Enter submits
    await page.getByRole('button', { name: 'Signing in…' }).waitFor(); assert.ok(await page.getByRole('button', { name: 'Signing in…' }).isDisabled());
    await page.getByRole('alert').filter({ hasText: 'Invalid email or password' }).waitFor();
    assert.equal(await page.getByLabel('Email or username').inputValue(), 'kai', 'input is kept after an error');
    await page.getByLabel('Email or username').fill('offline'); await password.fill('anything1'); await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByRole('alert').filter({ hasText: 'Sign-in failed. Check your connection' }).waitFor();
    await page.getByLabel('Email or username').fill('kai'); await password.fill('goodpass1'); await page.getByRole('button', { name: 'Sign in' }).click();
    await heading('Your path').waitFor();
    assert.deepEqual(await page.evaluate(() => ['token', 'user_name', 'user_email', 'user_role'].map(k => localStorage.getItem(k))), [token, 'kai', 'kai@example.com', 'learner']);
    await page.evaluate(() => localStorage.clear()); await page.goto(base + '/login');
    await page.getByLabel('Email or username').fill('boss'); await password.fill('goodpass1'); await page.getByRole('button', { name: 'Sign in' }).click();
    await heading('Overview').waitFor(); assert.equal(new URL(page.url()).pathname, '/admin');
    await page.evaluate(() => localStorage.clear());

    // ---- register
    await page.goto(base + '/login'); await page.getByRole('link', { name: 'Create an account' }).click(); await heading('Create your account').waitFor();
    await page.screenshot({ path: shots + '/register.png' });
    const fill = async (username, pass, confirm, email = 'kai@example.com') => {
      await page.getByLabel('Username').fill(username); await page.getByLabel('Display name').fill('Kai K'); await page.getByLabel('Email').fill(email);
      await page.getByLabel('Password', { exact: true }).fill(pass); await page.getByRole('textbox', { name: 'Confirm password' }).fill(confirm); await page.getByRole('button', { name: 'Create account' }).click();
    };
    const before = posts.length;
    await fill('ab', 'password1', 'password1'); await fill('kai_k', 'short', 'short'); await fill('kai_k', 'password1', 'password1', 'not-an-email');
    assert.equal(posts.length, before, 'the browser blocks an invalid username, short password and bad email');
    await fill('kai_k', 'password1', 'password2'); await page.getByRole('alert').filter({ hasText: 'Passwords do not match.' }).waitFor(); assert.equal(posts.length, before);
    await fill('taken_name', 'password1', 'password1'); await page.getByRole('alert').filter({ hasText: 'Username already exists' }).waitFor();
    await fill('closed_reg', 'password1', 'password1'); await page.getByRole('alert').filter({ hasText: 'registration is currently closed' }).waitFor();
    await fill('kai_k', 'password1', 'password1');
    await heading('Welcome back').waitFor(); await page.getByRole('status').filter({ hasText: 'Your account is ready' }).waitFor();
    assert.deepEqual(posts.at(-1), { path: '/auth/register', body: { username: 'kai_k', displayName: 'Kai K', email: 'kai@example.com', password: 'password1', confirmPassword: 'password1' } });
    await page.reload(); await heading('Welcome back').waitFor();
    await page.getByRole('link', { name: '← Back to home' }).click(); await heading('Learn Japanese through active play').waitFor();
    await page.goto(base + '/register'); await page.getByRole('link', { name: /Try a Kana speed quiz as a guest/ }).click(); await heading('Hiragana Speed Quiz').waitFor();

    // ---- small screens: form only, no overflow
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [path, title] of [['/login', 'Welcome back'], ['/register', 'Create your account']]) {
      await page.goto(base + path); await heading(title).waitFor(); await noOverflow(path);
      assert.ok(!(await page.getByRole('complementary', { name: 'About LingoHub' }).isVisible()));
      await page.screenshot({ path: `${shots}${path}-mobile.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 768, height: 1024 }); await page.goto(base + '/register'); await noOverflow('tablet register');
    assert.deepEqual(dialogs, [], 'no browser alert dialogs'); assert.deepEqual(errors, []);
    console.log('PASS: sign-in (focus, required fields, show/hide password, Enter submits, busy state, server and network errors inline, learner and admin destinations); registration (browser validation, mismatch, server messages, success notice on sign-in page, exact payload); home and guest links; mobile and tablet; no alert dialogs.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1000)); process.exitCode = 1; });
