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
    // A full page load is a new visit, so the opening plays again; start it and skip the pull-back.
    const skipOpening = async () => { await page.getByRole('button', { name: 'Click anywhere to start' }).click(); await page.getByRole('button', { name: 'Skip the opening' }).click(); };
    const storageKeys = () => page.evaluate(() => [Object.keys(localStorage).filter(k => k !== 'app_language'), Object.keys(sessionStorage)]);
    const stat = async label => (await page.locator('div.text-center').filter({ hasText: new RegExp(`^${label}`) }).first().innerText()).replace(/\s+/g, ' ');

    // Landing: guest options only.
    // The opening: close on the traveller's boat at sea until the visitor starts it; a second press skips the pull-back.
    await page.goto(base + '/');
    const prompt = page.getByRole('button', { name: 'Click anywhere to start' }); await prompt.waitFor();
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Click anywhere to start', 'the prompt has focus');
    assert.equal(await heading('Read your first Japanese in a minute').isVisible(), false, 'the welcome waits for the island');
    await page.screenshot({ path: shots + '/guest-opening.png' });
    await page.keyboard.press('Enter'); await page.getByRole('button', { name: 'Skip the opening' }).click();
    await heading('Read your first Japanese in a minute').waitFor();
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Start the first lesson', 'focus moves to the welcome');
    assert.equal(await page.getByRole('button', { name: 'Toggle navigation sidebar' }).count(), 0);
    assert.equal(await page.locator('aside').count(), 0);
    // No site bar: signing in is in the welcome.
    assert.equal(await page.getByRole('banner').count(), 0, 'no header on the guest landing');
    assert.equal(await page.getByRole('heading', { name: 'Read your first Japanese in a minute' }).locator('..').getByRole('link', { name: 'Sign in' }).getAttribute('href'), '/login');
    assert.equal(await heading('Your path').count(), 0);
    assert.deepEqual((await page.locator('main a').evaluateAll(links => links.map(a => a.getAttribute('href')))).sort(), ['/login']);
    // Only the island: the page fits the screen with nothing below it.
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), 'the landing fits one screen');
    assert.equal(await page.getByRole('heading', { name: 'Meet the island' }).count(), 0, 'the cast waits behind Home');
    // The island in fog: only Home and Kana are clear; the cast introduces the rest.
    const fogged = await page.getByRole('list', { name: 'Islands' }).getByRole('button').evaluateAll(buttons => buttons.filter(b => !b.getAttribute('aria-label').includes('in fog')).map(b => b.getAttribute('aria-label')));
    assert.deepEqual(fogged.sort(), ['Home', 'Kana']);
    // Home opens the cast's introductions; closing them goes back to Home.
    await page.getByRole('button', { name: 'Home', exact: true }).click();
    await page.getByRole('region', { name: 'Home' }).getByRole('button', { name: 'Meet the island' }).click();
    const cast = page.getByRole('region', { name: 'Meet the island' });
    assert.equal(await cast.getByRole('listitem').count(), 10);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Close Meet the island', 'focus moves into the cast');
    await page.screenshot({ path: shots + '/guest-cast.png' });
    await page.keyboard.press('Escape'); assert.equal(await cast.count(), 0);
    await page.getByRole('region', { name: 'Home' }).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Kanji · in fog' }).click();
    const panel = page.getByRole('region', { name: 'Kanji' }); await panel.getByText('In fog for now').waitFor();
    await page.keyboard.press('Escape'); assert.equal(await panel.count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Kanji · in fog', 'focus returns to the island');

    // The first lesson, from the Kana island: meet, match (a wrong pick first), read あい, then the name card.
    await page.getByRole('button', { name: 'Kana', exact: true }).click(); await page.getByRole('region', { name: 'Kana' }).getByRole('button', { name: 'Start the first lesson' }).click();
    const lesson = page.getByRole('region', { name: 'Your first lesson' });
    await lesson.getByRole('heading', { name: 'Meet あ, い and う' }).waitFor();
    await lesson.getByRole('button', { name: 'Hear う, u' }).click(); await lesson.getByText('Pursed lips').waitFor();
    await lesson.getByRole('button', { name: 'Test my ears →' }).click();
    const KANA = { a: 'あ', i: 'い', u: 'う' };
    for (let round = 0; round < 3; round++) {
      const romaji = (await lesson.getByRole('heading', { level: 2 }).innerText()).match(/“(.)”/)[1];
      const choices = lesson.getByRole('list', { name: 'Choices' });
      if (round === 0) {
        const wrong = Object.values(KANA).find(kana => kana !== KANA[romaji]);
        await choices.getByRole('button', { name: wrong }).click(); await lesson.getByText('Not quite').waitFor();
        assert.equal(await lesson.getByRole('button', { name: 'Next sound →' }).count(), 0, 'a wrong pick does not move on');
      }
      await choices.getByRole('button', { name: KANA[romaji] }).click(); await lesson.getByText('せいかい！').waitFor();
      await lesson.getByRole('button', { name: round === 2 ? 'Now read a word →' : 'Next sound →' }).click();
    }
    await lesson.getByRole('heading', { name: 'Read this word' }).waitFor(); await lesson.getByText('ai · “love”').waitFor();
    await lesson.getByRole('button', { name: 'Keep going →' }).click();
    const nameBox = lesson.getByRole('textbox', { name: 'Your name' });
    await lesson.getByRole('button', { name: 'Create my account →' }).click(); await lesson.getByRole('alert').getByText('Write your name to continue.').waitFor();
    await page.screenshot({ path: shots + '/guest-name-card.png' });
    await nameBox.fill('  Kai  '); await lesson.getByRole('button', { name: 'Create my account →' }).click();
    await page.waitForURL(url => url.pathname === '/register' && url.search === '');
    await page.getByText('Nice to meet you, Kai!').waitFor(); assert.equal(await page.getByLabel('Display name').inputValue(), 'Kai');
    await page.goBack(); await heading('Read your first Japanese in a minute').waitFor();
    assert.equal(await prompt.count(), 0, 'the opening plays once per visit');
    // Leaving the lesson returns to the welcome.
    await page.getByRole('button', { name: 'Start the first lesson' }).click(); await lesson.getByRole('button', { name: 'Leave' }).click();
    assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Start the first lesson', 'focus returns to the start button');
    assert.deepEqual(await storageKeys(), [[], []], 'the lesson writes nothing to browser storage');
    assert.deepEqual(calls.filter(c => !['/site', '/site/lesson-edits'].includes(c.path)), [], 'the lesson makes no account requests');
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
    // The speed quizzes are on the Kana island.
    const openKanaQuiz = async () => { await page.getByRole('button', { name: 'Kana', exact: true }).click(); await page.getByRole('region', { name: 'Kana' }).getByRole('link', { name: /Hiragana Speed Quiz/ }).click(); };
    await page.goto(base + '/'); await skipOpening(); await openKanaQuiz();
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
    await page.getByRole('button', { name: '← Back', exact: true }).click(); await skipOpening(); await heading('Read your first Japanese in a minute').waitFor();
    await openKanaQuiz(); await heading('Hiragana Speed Quiz').waitFor();
    await page.getByRole('button', { name: 'Start Quiz →', exact: true }).waitFor(); assert.ok(await page.getByRole('button', { name: 'Start Quiz →', exact: true }).isDisabled(), 'no characters remembered');
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    assert.match(await stat('Correct'), /0$/); assert.match(await stat('Wrong'), /0$/);
    await page.reload(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).waitFor(); assert.equal(await input.count(), 0, 'reload also ends the session');
    await page.getByRole('button', { name: 'Select all', exact: true }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check(); await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    await page.getByRole('button', { name: 'End session' }).click(); await skipOpening(); await heading('Read your first Japanese in a minute').waitFor();
    assert.deepEqual(await storageKeys(), [[], []]);

    // Mobile.
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/', '/guest/practice?type=katakana']) { await page.goto(base + path); await page.waitForTimeout(400); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflows on mobile`); }
    await page.goto(base + '/'); await page.getByRole('button', { name: 'Click anywhere to start' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), 'the island fits a phone screen');
    await page.screenshot({ path: shots + '/guest-landing-mobile.png' });
    await page.setViewportSize({ width: 1366, height: 900 });

    // Reduced motion: no opening, straight to the island.
    const calm = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
    await calm.route('http://localhost:5000/api/**', route => route.fulfill({ json: route.request().url().includes('/site') ? { registration_enabled: true, announcement: '', disabled: [] } : {} }));
    const calmPage = await calm.newPage(); await calmPage.goto(base + '/');
    await calmPage.getByRole('heading', { name: 'Read your first Japanese in a minute', exact: true }).waitFor();
    assert.equal(await calmPage.getByRole('button', { name: 'Click anywhere to start' }).count(), 0); await calm.close();

    // Signed-in learners are unaffected: dashboard, sidebar, and the saved quiz.
    await page.evaluate(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); }, token);
    await page.goto(base + '/dashboard'); await heading('Your path').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Toggle navigation sidebar' }).count(), 1); assert.equal(await page.locator('aside').count(), 1);
    await page.goto(base + '/guest/practice?type=katakana'); await heading('Katakana Speed Quiz').waitFor();
    assert.equal(new URL(page.url()).pathname + new URL(page.url()).search, '/practice?type=katakana'); assert.equal(await page.getByRole('note').count(), 0);
    assert.equal(await page.getByRole('link', { name: 'Hiragana', exact: true }).getAttribute('href'), '/practice?type=hiragana');
    assert.deepEqual(errors, []);
    console.log('PASS: guest opening (boat close-up, focused prompt, Enter starts, click skips, once per visit, none with reduced motion); guest landing with no header (sign in from the welcome): island in fog but Home and Kana, fogged panel closes with Escape, only the island on one screen, ten cast introductions behind Home, speed quizzes on Kana, the first lesson (meet, a wrong then right match, read あい, empty and filled name card → register with the name), leave the lesson, nothing stored or requested; account pages still gated; guest quiz with live score, no credentials, no storage; script switch stays guest; leaving, going back, reloading or ending resets; mobile; signed-in dashboard/sidebar/saved quiz unchanged.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 900)); process.exitCode = 1; });
