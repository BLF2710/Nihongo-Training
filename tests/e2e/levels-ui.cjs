// Level filter across the learner sections, with N5 Units 1–9 and N4 Units 1–2 in a fixture API.
//   node levels-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
    const unit = (level, n, allowed = true) => ({ id: `japanese-${level}-unit-${n}`, number: n, title: `${level.toUpperCase()} title ${n}`, description: '', requiredLevel: 1, allowed, reasons: allowed ? [] : ['Complete Unit 1 first'], completedLessons: 0, totalLessons: 6, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80, lessons: [] });
    const units = [...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => unit('n5', n)), unit('n4', 1), unit('n4', 2, false)];
    await context.route('http://localhost:5000/api/**', route => { const p = new URL(route.request().url()).pathname.replace('/api', '');
      const json = data => route.fulfill({ json: data });
      if (p === '/units') return json({ units });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/profile/me') return json({ username: 'mika', display_name: 'Mika', level: 1, rank: 'Beginner', xp: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 }, current_streak: 0, achievements_count: 0 });
      if (p.startsWith('/lessons/') && p.endsWith('/access')) return json({ allowed: true, reasons: [] });
      return json({}); });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const heading = name => page.getByRole('heading', { name, exact: true });
    const badge = level => page.getByText(`🇯🇵 Japanese • ${level}`, { exact: true });
    const optionTexts = () => page.locator('main select').first().locator('option').allInnerTexts();
    const setLevel = async level => { await page.goto(base + '/levels'); await page.locator('main ol > li button').filter({ hasText: level }).first().click(); await page.waitForURL(base + '/lessons'); };

    // ---- N5 (default)
    for (const [path, title] of [['/vocabulary', 'Vocabulary'], ['/grammar', 'Grammar']]) {
      await page.goto(base + path); await heading(title).waitFor(); await badge('N5').waitFor();
      const options = await optionTexts(); assert.equal(options.length, 9, path); assert.ok(options.every(o => !/Unit \d+: .*N4/.test(o)));
    }
    await page.goto(base + '/quizzes'); await heading('Quizzes').waitFor(); await badge('N5').waitFor();
    assert.equal(await page.locator('section[aria-label$="Assessment"]').count(), 9);

    // ---- Switch to N4: every section shows N4 units only.
    await setLevel('N4'); await page.getByText('Japanese • N4 Build Basics').waitFor(); await page.getByText('N4 title 2').first().waitFor();
    assert.equal(await page.locator('section[aria-labelledby="choose-unit-heading"] > div button').count(), 2);
    const wrap = page.locator('section[aria-labelledby="wrap-up-heading"]'); await wrap.getByRole('heading', { name: 'N4 wrap-up' }).waitFor();
    assert.equal(await wrap.getByText('Mock exam').count(), 1, 'N4 has its own mock exam now');
    await page.goto(base + '/vocabulary'); await heading('Vocabulary').waitFor(); await badge('N4').waitFor();
    assert.deepEqual((await optionTexts()).map(o => o.split(':')[0]), ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Unit 6', 'Unit 7', 'Unit 8', 'Unit 9']);
    await page.getByText('Unit 1 vocabulary').waitFor(); await page.getByText('思おもう', { exact: true }).first().waitFor();
    await page.screenshot({ path: shots + '/n4-vocabulary.png' });
    await page.goto(base + '/grammar'); await heading('Grammar').waitFor(); await badge('N4').waitFor(); assert.equal((await optionTexts()).length, 9);
    await page.goto(base + '/reading'); await heading('Reading').waitFor(); await badge('N4').waitFor();
    const reading = await optionTexts(); assert.equal(reading.length, 2); assert.match(reading[1], /🔒/);
    await page.locator('main ul li a').first().click(); await page.getByText('アナさんへ').first().waitFor();
    for (const skill of ['listening', 'speaking']) {
      await page.goto(`${base}/${skill}`); await badge('N4').waitFor(); const options = await optionTexts();
      assert.equal(options.length, 2, skill); assert.match(options[0], /^Unit 1: N4 title 1/);
    }
    await page.goto(base + '/review'); await heading('Unit Review').waitFor(); await badge('N4').waitFor();
    assert.deepEqual((await optionTexts()).map(o => o.split(' —')[0]), ['N4 cumulative review', 'Unit 1: N4 title 1', 'Unit 2: N4 title 2']);
    await page.goto(base + '/quizzes'); await heading('Quizzes').waitFor(); assert.equal(await page.locator('section[aria-label$="Assessment"]').count(), 2);
    await page.goto(base + '/'); await page.getByText('🇯🇵 Japanese · N4 · Change').waitFor(); await page.getByText('N4 title 2').first().waitFor(); assert.equal(await page.locator('section[aria-labelledby="path-heading"] ol > li').count(), 2);
    // A lesson names its level, and furigana is shown.
    await page.goto(base + '/lessons/japanese/n4-unit-1-i-think'); await page.getByText('N4 · Unit 1 • Lesson 1').waitFor();
    await page.getByRole('button', { name: 'Continue →' }).click(); await heading('Useful words').waitFor(); assert.ok(await page.locator('main ruby rt').count() >= 4);
    await page.screenshot({ path: shots + '/n4-lesson-words.png' });

    // ---- A unit named in the address keeps its own level.
    await page.goto(base + '/vocabulary?unit=japanese-n5-unit-4'); await badge('N5').waitFor(); await page.getByText('Unit 4 vocabulary').waitFor(); assert.equal((await optionTexts()).length, 9);
    await page.goto(base + '/listening?unit=japanese-n5-unit-3'); await badge('N5').waitFor();
    await page.goto(base + '/review?unit=level:N5'); await badge('N5').waitFor(); assert.equal((await optionTexts())[0].split(' —')[0], 'N5 cumulative review');

    // ---- A level with no units yet.
    await setLevel('N3'); await heading('N3 lessons are coming soon').waitFor();
    await page.goto(base + '/vocabulary'); await page.getByText('N3 has no units yet.', { exact: false }).waitFor();
    await page.goto(base + '/quizzes'); await page.getByText('N3 has no unit assessments yet.').waitFor();
    await page.goto(base + '/reading'); await page.getByText('N3 has no reading passages yet. They arrive with its units.').waitFor();
    await page.goto(base + '/listening'); await page.getByText(/No unit is open for listening practice yet/).waitFor();
    // Change level returns to the page it was opened from.
    await page.goto(base + '/grammar'); await page.getByRole('link', { name: 'Change level' }).click(); await page.waitForURL(/\/levels\?next=%2Fgrammar/);
    await page.locator('main ol > li button').first().click(); await page.waitForURL(base + '/grammar'); await badge('N5').waitFor();

    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/vocabulary', '/reading', '/review', '/quizzes']) { await page.goto(base + path); await badge('N5').waitFor(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflows`); }
    assert.deepEqual(errors, []);
    console.log('PASS: N5 by default (9 units in vocabulary/grammar/quizzes); after switching to N4, Lessons, Vocabulary, Grammar, Reading, Listening, Speaking, Review (with N4 cumulative), Quizzes and the dashboard show only the 2 N4 units; N4 lesson names its level and shows furigana; unit links keep their own level; empty level messages; Change level returns to the page; mobile; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
