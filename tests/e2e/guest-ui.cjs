// Guest landing page and unsaved guest Kana quiz, against fixture APIs only.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2], shots = process.argv[3];
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    const errors = [], calls = [];
    page.on('pageerror', e => errors.push(e.message));
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname.replace('/api', ''), body = request.postDataJSON();
      calls.push({ method: request.method(), path, type: url.searchParams.get('type') ?? body?.type, auth: Boolean(request.headers().authorization) });
      const json = data => route.fulfill({ json: data });
      if (path === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (path === '/quiz/characters') return json({ characters: [{ id: 1, kana: url.searchParams.get('type') === 'katakana' ? 'ア' : 'あ', romaji: 'a' }] });
      if (path === '/quiz/answer') return json({ correct: body.answer === 'a', correctAnswer: 'a', type: body.type });
      if (path === '/units') return json({ units: [] });
      if (path === '/profile/me') return json({ display_name: 'Kai', username: 'kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      return json({});
    });
    const heading = name => page.getByRole('heading', { name, exact: true });
    const storageKeys = () => page.evaluate(() => [Object.keys(localStorage).filter(k => k !== 'app_language'), Object.keys(sessionStorage)]);
    const stat = async label => (await page.locator('div.text-center').filter({ hasText: new RegExp(`^${label}`) }).first().innerText()).replace(/\s+/g, ' ');

    // Landing: guest options only.
    await page.goto(base + '/'); await heading('Learn Japanese through active play').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Toggle navigation sidebar' }).count(), 0);
    assert.equal(await page.locator('aside').count(), 0);
    assert.equal(await heading('Your path').count(), 0);
    assert.deepEqual((await page.locator('main a').evaluateAll(links => links.map(a => a.getAttribute('href')))).sort(), ['/guest/practice?type=hiragana', '/guest/practice?type=katakana', '/login', '/register']);
    assert.deepEqual(calls.filter(c => !['/site', '/site/lesson-edits'].includes(c.path)), [], 'landing makes no account requests (site settings and published lesson content only)');
    await page.screenshot({ path: shots + '/guest-landing.png' });

    // Everything else still needs an account.
    // Account pages send guests to sign in, remembering learner pages to return to (never the admin area).
    for (const path of ['/lessons', '/practice', '/statistics', '/profile', '/review/hiragana', '/admin']) {
      await page.goto(base + path); await page.waitForURL(url => url.pathname === '/login');
      const next = new URL(page.url()).searchParams.get('next');
      assert.equal(next, path === '/admin' ? null : path, 'return address for ' + path);
    }

    // Guest quiz: play, live statistics, nothing stored, no credentials sent.
    await page.goto(base + '/'); await page.getByRole('link', { name: /Hiragana Speed Quiz/ }).click();
    await heading('Hiragana Speed Quiz').waitFor(); await page.getByRole('note').filter({ hasText: 'Guest session' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Toggle navigation sidebar' }).count(), 0);
    // Unlimited mode: the running statistics are checked over several answers ("Each once" would end after one character).
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    const input = page.getByPlaceholder('Type romaji...');
    await input.fill('a'); await page.waitForTimeout(900);
    assert.match(await stat('Correct'), /1$/); assert.match(await stat('Streak'), /1$/);
    await input.fill('zz'); await input.press('Enter'); await page.waitForTimeout(300);
    assert.match(await stat('Wrong'), /1$/); assert.match(await stat('Accuracy'), /50\.0%$/); assert.match(await stat('Streak'), /0$/);
    await page.screenshot({ path: shots + '/guest-quiz.png' });
    assert.deepEqual(await storageKeys(), [[], []], 'guest play writes nothing to browser storage');
    assert.ok(calls.filter(c => c.path === '/quiz/answer').length === 2 && calls.every(c => !c.auth), 'guest requests carry no credentials');

    // Switching script stays in guest mode.
    await page.getByRole('button', { name: /Next Kana/ }).first().click();
    await page.getByRole('button', { name: '← Change characters' }).click();
    await page.getByRole('link', { name: 'Katakana', exact: true }).click(); await heading('Katakana Speed Quiz').waitFor();
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/guest/practice?type=katakana');

    // Leaving ends the session: coming back starts from the character picker with a clean score.
    await page.goto(base + '/guest/practice?type=hiragana');
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    await input.fill('a'); await page.waitForTimeout(900); assert.match(await stat('Correct'), /1$/);
    await page.getByRole('button', { name: '← Back', exact: true }).click(); await heading('Learn Japanese through active play').waitFor();
    await page.getByRole('link', { name: /Hiragana Speed Quiz/ }).click(); await heading('Hiragana Speed Quiz').waitFor();
    await page.getByRole('button', { name: 'Start Quiz →', exact: true }).waitFor(); assert.ok(await page.getByRole('button', { name: 'Start Quiz →', exact: true }).isDisabled(), 'no characters remembered');
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    assert.match(await stat('Correct'), /0$/); assert.match(await stat('Wrong'), /0$/);
    await page.reload(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).waitFor(); assert.equal(await input.count(), 0, 'reload also ends the session');
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    await page.getByRole('button', { name: 'End session' }).click(); await heading('Learn Japanese through active play').waitFor();
    assert.deepEqual(await storageKeys(), [[], []]);

    // Mobile.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/', '/guest/practice?type=katakana']) { await page.goto(base + path); await page.waitForTimeout(400); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflows on mobile`); }
    await page.screenshot({ path: shots + '/guest-landing-mobile.png' });
    await page.setViewportSize({ width: 1366, height: 900 });

    // Signed-in learners are unaffected: dashboard, sidebar, and the saved quiz.
    await page.evaluate(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); }, token);
    await page.goto(base + '/'); await heading('Your path').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Toggle navigation sidebar' }).count(), 1); assert.equal(await page.locator('aside').count(), 1);
    await page.goto(base + '/guest/practice?type=katakana'); await heading('Katakana Speed Quiz').waitFor();
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/practice?type=katakana'); assert.equal(await page.getByRole('note').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'Hiragana', exact: true }).getAttribute('href'), '/practice?type=hiragana');
    assert.deepEqual(errors, []);
    console.log('PASS: guest landing with four options and no sidebar; account pages still gated; guest quiz with live score, no credentials, no storage; script switch stays guest; leaving, going back, reloading or ending resets; mobile; signed-in dashboard/sidebar/saved quiz unchanged.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 900)); process.exitCode = 1; });
