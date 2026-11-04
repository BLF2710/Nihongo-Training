// The village square: today's errands from the learner's real data (none done, then all done with every lantern lit),
// villagers with news marked "!", talking (live numbers, links to the real pages, Escape and E to close), coming back to
// the same spot after following a link, walking with the keyboard, the data failing to load, a phone and dark mode.
// Against fixture APIs. The traveller is moved next to a villager by editing the remembered spot (sessionStorage).
//   node village-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const PLACE_KEY = 'village-square:place';
const NEXT_TO = { zen: { x: 7.5, y: 3.6 }, hato: { x: 23.5, y: 21.6 }, hakase: { x: 23.5, y: 5.6 }, home: { x: 22.5, y: 12.6 } };

const lesson = (slug, title, completed) => ({ id: slug, slug, title, description: '', isPlaceholder: false, allowed: true, reasons: [], completed });
const units = { units: [{ id: 'japanese-n5-unit-3', number: 3, title: 'Shopping', description: '', requiredLevel: 1, allowed: true, reasons: [], completedLessons: 1, totalLessons: 2, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 0, passPercent: null,
  lessons: [lesson('japanese-n5-unit-3-lesson-1', 'Numbers', true), lesson('japanese-n5-unit-3-lesson-2', 'At the shop', false)] }] };
const gamification = (earned) => ({ xp: 300, level: { level: 3, currentLevelXp: 250, nextLevelXp: 400, progressXp: 50, progressPercent: 33 }, rank: 'Bronze', nextRank: null, ranks: [],
  streak: { current: 6, longest: 9 }, today: { date: '2026-11-04', xp: 0, activities: [
    { source: 'lesson_completion', amount: 50, dailyCap: null, earned: earned ? 50 : 0 },
    { source: 'practice', amount: 15, dailyCap: 60, earned: earned ? 15 : 0 },
  ] }, achievements: [], recent: [] });
// Enough for the island map and the dashboard to load, which the shortcut keys open.
const profile = { username: 'kai', display_name: 'Kai', email: 'kai@example.test', email_verified_at: '2026-01-01', bio: '', avatar: null, learning_language: 'japanese', learning_goal: null, daily_goal: 15, profile_visibility: 'private',
  xp: 300, level: 3, rank: 'Bronze', lessons_completed: 1, current_streak: 6, achievements_count: 0, achievements: [],
  xpProgress: { currentLevelXp: 250, nextLevelXp: 400, progressXp: 50, progressPercent: 33 } };
const srs = (done) => ({ total: 80, newCards: 10, dueNow: done ? 0 : 9, dueToday: done ? 0 : 9, learned: 40, mature: 20, reviewedToday: done ? 12 : 0, dueSoon: 0, suspended: 0, newToday: done ? 0 : 3, dueTotal: done ? 0 : 12 });

async function open(browser, { done = false, failing = false, viewport = { width: 1366, height: 768 }, mobile = false } = {}) {
  const context = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai'); localStorage.setItem('user_name', 'Kai'); localStorage.setItem('course_level', 'N5'); }, token);
  await context.route('http://localhost:5000/api/**', async route => {
    const p = new URL(route.request().url()).pathname.replace('/api', ''), json = data => route.fulfill({ status: 200, json: data });
    if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
    if (failing && ['/units', '/profile/me/gamification', '/mistakes', '/srs/summary', '/activity/today', '/inbox'].includes(p)) return route.fulfill({ status: 500, json: { error: 'down' } });
    if (p === '/units') return json(units);
    if (p === '/profile/me') return json(profile);
    if (p === '/friends') return json({ friends: [], incoming: [], outgoing: [] });
    if (p === '/statistics/overview') return json({ practice: [], srs: { mature: 0, learned: 0 }, kanji: { mastered: 0 } });
    if (p === '/statistics') return json({ hiragana: { characters: [] }, katakana: { characters: [] } });
    if (p === '/srs/cards') return json({ added: 0 });
    if (p === '/srs/summary') return json(srs(done));
    if (p === '/profile/me/gamification') return json(gamification(done));
    if (p === '/mistakes') return json({ counts: { open: 3, resolved: 0 }, mistakes: [] });
    if (p === '/activity/today') return json(done ? { secondsToday: 1200, minutesToday: 20, goalMinutes: 15, isGoalMet: true } : { secondsToday: 240, minutesToday: 4, goalMinutes: 15, isGoalMet: false });
    if (p === '/inbox') return json({ direct: 2, support: 0, total: 2, friendRequests: done ? 0 : 1, notifications: 0 });
    return json({});
  });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(base + '/village');
  return { context, page, errors };
}

// Moves the traveller next to a villager by rewriting the remembered spot, then reloads. It waits first: the page saves
// the spot half a second after loading, which would otherwise overwrite this one.
async function moveNextTo(page, id, prompt = 'Talk E') {
  await page.waitForTimeout(800);
  await page.evaluate(([key, position]) => sessionStorage.setItem(key, JSON.stringify({ position, facing: 'left' })), [PLACE_KEY, NEXT_TO[id]]);
  await page.reload();
  await page.getByText(prompt).waitFor();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    // ---- a busy day: four errands to do, villagers with news marked
    let { context, page, errors } = await open(browser);
    const board = page.getByRole('region', { name: /Today's errands/ });
    await board.getByRole('heading', { name: "Today's errands · 0 of 4" }).waitFor();
    const tasks = await board.getByRole('listitem').allInnerTexts();
    // The first line of each: the second is the screen-reader "Not done yet."
    assert.deepEqual(tasks.map(text => text.split('\n')[0].trim()), ["Clear today's review cards. (Zen)", 'Finish a new lesson. (Hakase)', 'Do a listening, speaking or reading round. (Tama)', 'Study for 15 minutes. (Kon)']);
    assert.equal(await board.getByRole('link', { name: /Finish a new lesson/ }).getAttribute('href'), '/lessons/japanese/japanese-n5-unit-3-lesson-2');
    for (const name of ['Zen', 'Hato', 'Hakase', 'Tama', 'Kon']) await page.getByRole('button', { name: `${name} (has something for you)` }).waitFor();
    await page.getByRole('button', { name: 'Momo', exact: true }).waitFor();
    assert.equal(await page.locator('.village-lantern-lit').count(), 0, 'no lanterns lit yet');
    assert.equal(await page.getByRole('button', { name: '← Back' }).count(), 0, 'the square is a starting point, with no Back row');
    await page.screenshot({ path: path.join(shots, 'village-square.png') });

    // ---- walking: the remembered spot moves with the traveller
    await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(800);
    const walked = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), PLACE_KEY);
    assert.ok(walked.position.x > 18.5 && walked.facing === 'right', JSON.stringify(walked));
    // Holding Shift runs: as long a hold covers more ground than walking could (4.5 tiles a second).
    await page.keyboard.down('Shift'); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(400);
    await page.keyboard.up('ArrowLeft'); await page.keyboard.up('Shift');
    await page.waitForTimeout(800);
    const ran = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), PLACE_KEY);
    assert.ok(walked.position.x - ran.position.x > 2.3 && ran.facing === 'left', JSON.stringify({ walked, ran }));

    const standNextTo = id => moveNextTo(page, id);
    const dialog = page.getByRole('dialog', { name: /^Talking with/ });

    // ---- Zen counts the cards; Escape closes
    await standNextTo('zen');
    await page.keyboard.press('KeyE');
    await dialog.getByText('カードが 12まい まって います。').waitFor();
    await dialog.getByText('12 cards are waiting for you.').waitFor();
    assert.equal(await dialog.getByRole('link', { name: 'Daily review →' }).getAttribute('href'), '/srs');
    await page.screenshot({ path: path.join(shots, 'village-zen.png') });
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'detached' });

    // ---- Hato's mail; following the link and coming back stands the traveller by Hato again
    await standNextTo('hato');
    await page.keyboard.press('KeyE');
    await dialog.getByText('Mail for you: 2 unread messages and 1 friend request.').waitFor();
    await dialog.getByRole('link', { name: 'Messages →' }).click();
    await page.waitForURL('**/messages');
    // The village is replaced once the Messages page has loaded (until then the router keeps showing it).
    await dialog.waitFor({ state: 'detached' });
    await page.goBack(); await page.waitForURL('**/village');
    await page.getByRole('button', { name: /^Hato/ }).getByText('Talk E').waitFor();

    // ---- Hakase points to the next lesson; E closes as well
    await standNextTo('hakase');
    await page.getByRole('button', { name: /^Hakase/ }).click();
    await dialog.getByText('Your next lesson: At the shop.').waitFor();
    await page.keyboard.press('KeyE'); await dialog.waitFor({ state: 'detached' });
    assert.deepEqual(errors, []);

    // ---- M opens the island map and Tab the dashboard, and the same key again comes back to the same spot
    // (the fixtures don't cover those pages, so only where each key goes is checked)
    const backAtHakase = () => page.getByRole('button', { name: /^Hakase/ }).getByText('Talk E').waitFor();
    await page.keyboard.press('KeyM'); await page.waitForURL('**/map'); await page.waitForTimeout(1000);
    await page.keyboard.press('KeyM'); await page.waitForURL('**/village'); await backAtHakase();
    await page.keyboard.press('Tab'); await page.waitForURL(url => new URL(url).pathname === '/'); await page.waitForTimeout(1000);
    await page.keyboard.press('Tab'); await page.waitForURL('**/village'); await backAtHakase();

    // ---- the learner's house: at its door E goes in, to the profile
    await moveNextTo(page, 'home', 'Enter E');
    await page.getByRole('button', { name: 'Go into your house' }).waitFor();
    await page.locator('.village-sign', { hasText: 'Kai のいえ' }).waitFor();
    await page.screenshot({ path: path.join(shots, 'village-home.png') });
    await page.keyboard.press('KeyE'); await page.waitForURL('**/profile');
    await context.close();

    // ---- every errand done: ticked, thanks, and every lantern lit
    ({ context, page, errors } = await open(browser, { done: true }));
    await page.getByRole('heading', { name: "Today's errands · 4 of 4" }).waitFor();
    await page.getByText('All done: the lanterns are lit!').waitFor();
    assert.equal(await page.locator('.village-lantern-lit').count(), 16);
    assert.equal(await page.getByRole('button', { name: /has something for you/ }).count(), 1, 'only Hato, with unread mail');
    await moveNextTo(page, 'zen');
    await page.keyboard.press('KeyE');
    await page.getByRole('dialog', { name: 'Talking with Zen' }).getByText("Thank you! Today's errand is done.").waitFor();
    await page.keyboard.press('Escape');
    await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
    await page.screenshot({ path: path.join(shots, 'village-done-dark.png') });
    assert.deepEqual(errors, []);
    await context.close();

    // ---- nothing loads: said so, and the villagers still show the way
    ({ context, page, errors } = await open(browser, { failing: true }));
    await page.getByText("Today's errands couldn't be loaded.", { exact: false }).waitFor();
    await moveNextTo(page, 'zen');
    await page.keyboard.press('KeyE');
    await page.getByRole('dialog', { name: 'Talking with Zen' }).getByRole('link', { name: 'Daily review →' }).waitFor();
    assert.deepEqual(errors, []);
    await context.close();

    // ---- a phone: the board and touch controls fit, nothing scrolls sideways
    ({ context, page, errors } = await open(browser, { viewport: { width: 390, height: 844 }, mobile: true }));
    await page.getByRole('heading', { name: "Today's errands · 0 of 4" }).waitFor();
    assert.equal(await page.getByRole('listitem').count(), 0, 'the list starts folded on a phone');
    await page.screenshot({ path: path.join(shots, 'village-phone.png') });
    await page.getByRole('button', { name: "Today's errands · 0 of 4" }).click();
    assert.equal(await page.getByRole('region', { name: /Today's errands/ }).getByRole('listitem').count(), 4);
    await page.getByRole('button', { name: 'Walk up' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no sideways scrolling');
    assert.deepEqual(errors, []);
    await context.close();

    console.log('PASS: today\'s errands from real data (review, next lesson, practice, daily goal; links to each; none done, then all done with all 16 lanterns lit); villagers with news marked; Zen counts due cards, Hato reports mail, Hakase points to the next lesson, thanks once an errand is done; Escape and E close; following a link and coming back returns to the same spot; walking remembered; holding Shift runs; M opens the map and Tab the dashboard, and the same key comes back; the house is signed with the learner\'s name and E at its door opens the profile; no Back row; data failing shows a notice and the villagers still link; phone fits (the errands start folded); dark mode; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
