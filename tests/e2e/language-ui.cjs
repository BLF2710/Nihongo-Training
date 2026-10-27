// The learning-language menu in the top bar, and a sidebar that shows only the chosen language. Fixture API.
//   node language-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async viewport => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(t => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('token', t); localStorage.setItem('user_handle', 'mika'); localStorage.setItem('app_language', 'japanese'); sessionStorage.setItem('seeded', '1'); } }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
      await context.route('http://localhost:5000/api/**', route => {
        const p = new URL(route.request().url()).pathname.replace('/api', '');
        if (p === '/site') return route.fulfill({ json: { registration_enabled: true, announcement: '', disabled: [] } });
        if (p === '/units') return route.fulfill({ json: { units: [] } });
        if (p === '/inbox') return route.fulfill({ json: { direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 } });
        if (p === '/profile/me') return route.fulfill({ json: { username: 'mika', display_name: 'Mika', level: 1, rank: 'Beginner', xp: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 }, current_streak: 0, achievements_count: 0 } });
        return route.fulfill({ json: {} });
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      return { context, page, errors };
    };
    const sidebarLabels = page => page.locator('aside button').evaluateAll(buttons => buttons.map(b => b.innerText.replace(/\s+/g, ' ').trim()));

    let { context, page, errors } = await run({ width: 1366, height: 900 });
    await page.goto(base + '/lessons');
    const menuButton = page.getByRole('button', { name: 'Learning language: Japanese. Change' });
    await menuButton.waitFor(); assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
    // The lazily loaded page replaces its loading placeholder (and its header); wait for it before opening the sidebar.
    await page.getByRole('heading', { level: 1 }).first().waitFor();
    // Sidebar: the chosen language only; no language list, nothing "Soon".
    await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click();
    const aside = page.locator('aside');
    await aside.getByText('🇯🇵 Japanese').waitFor();
    assert.equal(await aside.getByText('Learning language').count(), 0);
    assert.equal(await aside.getByText('Soon').count(), 0);
    assert.equal(await aside.getByRole('button', { name: /English|Korean|Spanish/ }).count(), 0);
    for (const label of ['Lessons', 'Vocabulary', 'Kanji', 'Listening', 'Daily review', 'Mistake notebook']) assert.ok((await sidebarLabels(page)).some(text => text.endsWith(label)), label);
    await page.screenshot({ path: shots + '/sidebar-japanese.png' });
    await page.getByRole('button', { name: 'Close navigation' }).click();
    // The menu: lists every language, marks the current one, disabled ones say Soon; Escape and outside clicks close it.
    await menuButton.click(); assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
    const list = page.getByRole('list', { name: 'Learning language' });
    await list.waitFor(); assert.ok(await list.getByRole('button').count() >= 3);
    assert.equal(await list.getByRole('button', { name: /Japanese/ }).getAttribute('aria-current'), 'true');
    assert.equal(await list.getByRole('button', { name: /Korean/ }).isDisabled(), true); await list.getByText('Soon').first().waitFor();
    await page.screenshot({ path: shots + '/language-menu.png' });
    await page.keyboard.press('Escape'); await list.waitFor({ state: 'detached' });
    await menuButton.click(); await list.waitFor(); await page.mouse.click(700, 600); await list.waitFor({ state: 'detached' });
    // Choosing the current language changes nothing; another one goes to its dashboard and the sidebar follows.
    await menuButton.click(); await list.getByRole('button', { name: /Japanese/ }).click(); await list.waitFor({ state: 'detached' }); assert.ok(page.url().endsWith('/lessons'));
    await menuButton.click(); await list.getByRole('button', { name: /English/ }).click();
    await page.waitForURL(base + '/'); assert.equal(await page.evaluate(() => localStorage.getItem('app_language')), 'english');
    await page.getByRole('button', { name: 'Learning language: English. Change' }).waitFor();
    await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click(); await aside.getByText('🇬🇧 English').waitFor();
    const english = await sidebarLabels(page);
    assert.ok(english.some(text => text.endsWith('English Arcade')));
    for (const label of ['Lessons', 'Kanji', 'Quizzes', 'Hiragana Speed Quiz', 'Daily review']) assert.ok(!english.some(text => text.endsWith(label)), label + ' hidden for English');
    assert.equal(await aside.getByText('Soon').count(), 0);
    assert.deepEqual(errors, []); await context.close();

    // Phone width: the menu fits and nothing scrolls sideways.
    ({ context, page, errors } = await run({ width: 375, height: 812 }));
    await page.goto(base + '/lessons'); await page.getByRole('button', { name: /^Learning language/ }).click(); await page.getByRole('list', { name: 'Learning language' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow at phone width');
    const box = await page.getByRole('list', { name: 'Learning language' }).boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 375, 'menu fits the screen');
    await page.screenshot({ path: shots + '/language-menu-phone.png' });
    assert.deepEqual(errors, []); await context.close();
    console.log('PASS: language menu in the top bar (current marked, unavailable ones disabled with Soon, Escape/outside click close, same language keeps the page, another goes to the dashboard); sidebar shows only the chosen language (no language list, no Soon items; Japanese tools vs English Arcade); fits phones; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
