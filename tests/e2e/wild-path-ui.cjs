// The wild path (docs/WORLD.md): its marker on the island map's bridge from Home to Kana; walking the path; a battle
// starting in the tall grass, run from, and the grass safe for a few steps after; leaving at the far end onto the Kana
// island on foot, back over its bridge onto the path's island end, and back along the path to the village square; a
// learner without a starter asked to choose one; one screen on a laptop and a phone.
// Against a fixture API. The dice are loaded through `window.__roll` so the test decides when the grass bites.
//   node wild-path-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const STARTER_SET = { starter: 'ka', kanaIds: [1, 2, 3, 4, 5, 6] };
const withAnswers = data => ({ ...data, answers: data.kanaIds.map(kanaId => ({ kanaId, correct: 0, wrong: 0 })), beatenChallengers: [] });
const profile = { username: 'aki', display_name: 'Aki', email: 'aki@example.test', email_verified_at: '2026-01-01', bio: '', avatar: null, learning_language: 'japanese', learning_goal: null, daily_goal: 10, profile_visibility: 'private',
  xp: 120, level: 3, rank: 'Beginner', lessons_completed: 0, current_streak: 4, achievements_count: 0, achievements: [],
  xpProgress: { currentLevelXp: 0, nextLevelXp: 200, progressXp: 120, progressPercent: 60 } };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ viewport = { width: 1366, height: 768 }, collection = STARTER_SET } = {}) => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(t => {
        localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('course_level', 'N5'); localStorage.setItem('user_handle', 'aki');
        const realRandom = Math.random.bind(Math);
        window.__roll = null;
        Math.random = () => (window.__roll ?? realRandom());
      }, token);
      const state = { collection: { ...collection } };
      await context.route('http://localhost:5000/api/**', route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/units') return json({ units: [] });
        if (p === '/profile/me') return json(profile);
        if (p === '/srs/summary') return json({ total: 0, newCards: 0, dueNow: 0, dueToday: 0, learned: 0, mature: 0, reviewedToday: 0, dueSoon: 0, suspended: 0, newToday: 0, dueTotal: 0 });
        if (p === '/friends') return json({ friends: [], incoming: [], outgoing: [] });
        if (p === '/statistics/overview') return json({ practice: [], srs: { mature: 0, learned: 0 }, kanji: { mastered: 0 } });
        if (p === '/statistics') return json({ hiragana: { characters: [] }, katakana: { characters: [] } });
        if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        if (p === '/kana-wilds/collection') return json(withAnswers(state.collection));
        if (p === '/kana-wilds/starter') { state.collection = { starter: request.postDataJSON().starter, kanaIds: [1, 2, 3, 4, 5, 6] }; return json(withAnswers(state.collection), 201); }
        return json({});
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      return { context, page, errors };
    };
    const fitsScreen = page => page.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1 && document.scrollingElement.scrollWidth <= innerWidth);
    const setRoll = (page, roll) => page.evaluate(value => { window.__roll = value; }, roll);
    const arena = page => page.getByRole('region', { name: 'Battle against a wild kana' });
    /** Holds a key until `isDone` (checked often) or the time runs out. */
    const holdUntil = async (page, key, isDone, ms = 12000) => {
      await page.keyboard.down(key);
      const deadline = Date.now() + ms;
      try { while (Date.now() < deadline) { if (await isDone()) return true; await page.waitForTimeout(40); } return false; }
      finally { await page.keyboard.up(key); }
    };

    // ---- the map marks the path on the bridge; it opens on foot
    let { context, page, errors } = await run();
    await page.goto(base + '/');
    const marker = page.getByRole('link', { name: 'The meadow path (のはら): a wild path to the Kana island' });
    await marker.waitFor();
    await page.screenshot({ path: path.join(shots, 'wild-path-map.png') });
    await marker.click();
    await page.waitForURL('**/wilds/home-kana?from=home');
    await page.getByRole('heading', { name: 'The meadow path (のはら), a wild path' }).waitFor();
    assert.ok(await fitsScreen(page), 'the path fits one screen');
    await page.screenshot({ path: path.join(shots, 'wild-path-walk.png') });

    // ---- off the path's grass nothing happens; into the tall grass, a battle starts
    await setRoll(page, 0);
    const isBattle = async () => Boolean(await arena(page).count());
    assert.ok(await holdUntil(page, 'ArrowRight', isBattle), 'walking east into the tall grass starts a battle');
    await setRoll(page, null);
    await page.locator('.kw-info--enemy').getByText('Wild ？').waitFor();
    assert.ok(await fitsScreen(page), 'the battle fits one screen over the path');
    await page.screenshot({ path: path.join(shots, 'wild-path-battle.png') });
    await arena(page).getByRole('button', { name: 'Run away' }).click();
    await page.getByRole('heading', { name: 'You ran away' }).waitFor();
    await page.getByRole('button', { name: 'Back to the path' }).click();
    await page.getByRole('heading', { name: 'The meadow path (のはら), a wild path' }).waitFor();

    // ---- just after a battle the grass is safe, even with loaded dice; on to the far end and off the path
    await setRoll(page, 0);
    const leave = page.getByRole('button', { name: 'On to the Kana island' });
    assert.ok(await holdUntil(page, 'ArrowRight', async () => Boolean(await leave.count()) || await isBattle(), 15000), 'reached the far end');
    assert.equal(await isBattle(), false, 'no battle in the safe steps after the last one');
    await setRoll(page, null);
    await page.keyboard.press('KeyE');

    // ---- the far end is the Kana island, on foot; its bridge leads back onto the path, at the island end
    await page.waitForURL('**/islands/kana');
    await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
    assert.ok(await fitsScreen(page), 'the island fits one screen');
    await page.screenshot({ path: path.join(shots, 'island-kana.png') });
    assert.equal(await page.getByRole('navigation', { name: 'Page navigation' }).count(), 0, 'no Back button while walking');
    // The island remembers where the traveller stood: up by the hiragana hall, then reloaded.
    const hiraganaDoor = page.getByRole('button', { name: /^Go into hiragana/ });
    assert.ok(await holdUntil(page, 'ArrowUp', async () => Boolean(await hiraganaDoor.count())), 'walked up to the hiragana hall');
    await page.waitForTimeout(700);
    await page.reload();
    await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
    await hiraganaDoor.waitFor({ state: 'attached' });
    assert.equal(new URL(page.url()).search, '', 'the arrival is dropped from the address');
    await page.keyboard.down('ArrowDown'); await page.waitForTimeout(550); await page.keyboard.up('ArrowDown');
    const bridge = page.getByRole('button', { name: 'Back along the meadow path to the village' });
    assert.ok(await holdUntil(page, 'ArrowLeft', async () => Boolean(await bridge.count())), 'walked to the bridge');
    await page.keyboard.press('KeyE');
    await page.waitForURL('**/wilds/home-kana?from=kana');
    await page.getByRole('heading', { name: 'The meadow path (のはら), a wild path' }).waitFor();
    assert.equal(await leave.count(), 0, 'arriving from the island, the traveller is not already at the exit');

    // ---- west along the path (the dice kind this time) to the village square
    await setRoll(page, 1);
    const home = page.getByRole('button', { name: 'Back to the village' });
    assert.ok(await holdUntil(page, 'ArrowLeft', async () => Boolean(await home.count()), 20000), 'walked back to the village end');
    await page.keyboard.press('KeyE');
    await page.waitForURL(url => new URL(url).pathname === '/village');
    await page.getByRole('heading', { name: 'Village square' }).waitFor({ state: 'attached' });
    const eastGate = page.getByRole('button', { name: 'The meadow path (のはら), east to the Kana island' });
    assert.ok(await holdUntil(page, 'ArrowRight', async () => Boolean(await eastGate.count()), 3000), 'back in the village at the end of the meadow road');
    await page.screenshot({ path: path.join(shots, 'village-road-east.png') });
    assert.deepEqual(errors, []); await context.close();

    // ---- a learner who hasn't chosen a starter is asked to on the path; a phone fits the path and a battle
    ({ context, page, errors } = await run({ viewport: { width: 390, height: 844 }, collection: { starter: null, kanaIds: [] } }));
    await page.goto(base + '/wilds/home-kana');
    await page.getByRole('heading', { name: 'Choose your starter kana' }).waitFor();
    await page.getByRole('button', { name: /^か \(ka\)/ }).click();
    await page.getByRole('heading', { name: 'Choose your starter kana' }).waitFor({ state: 'detached' });
    assert.ok(await fitsScreen(page), 'the path fits a phone');
    await page.screenshot({ path: path.join(shots, 'wild-path-phone.png') });
    await setRoll(page, 0);
    assert.ok(await holdUntil(page, 'ArrowRight', isBattle), 'a battle starts on a phone too');
    await setRoll(page, null);
    await arena(page).getByRole('group').first().waitFor();
    assert.ok(await fitsScreen(page), 'the battle fits a phone: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight])));
    await page.screenshot({ path: path.join(shots, 'wild-path-phone-battle.png') });
    assert.deepEqual(errors, []); await context.close();

    console.log('PASS: wild path — marked on the map\'s Home–Kana bridge; opens on foot; tall grass starts a battle over the path, run from and back; safe grass steps after a battle; leaving at the far end onto the Kana island on foot, back over its bridge to the path’s island end, and west to the village square at the end of its road; the island’s spot remembered over a reload; no Back button while walking; a missing starter is chosen on the path; one screen at 1366×768 and 390×844; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
