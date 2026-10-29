// Daily review follow-ups: review ahead once today's cards are done, hiding a card while reviewing, the deck
// page (statuses, search, filters, hide and show again) and adding a kanji from its page. Against fixture APIs.
//   node srs-deck-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const HOUR = 60 * 60 * 1000, DAY = 24 * HOUR;
const intervals = { again: 600000, hard: 2 * DAY, good: 4 * DAY, easy: 6 * DAY };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); }, token);
    const soon = new Date(Date.now() + 6 * HOUR).toISOString(), later = new Date(Date.now() + 9 * DAY).toISOString();
    const state = {
      reviews: [], patches: [], enrolled: [],
      deck: [
        { itemType: 'kanji', itemId: 'kanji-65e5', status: 'learning', dueAt: soon, intervalDays: 1, repetitions: 1, lapses: 0 },
        { itemType: 'kanji', itemId: 'kanji-4e00', status: 'mature', dueAt: later, intervalDays: 30, repetitions: 5, lapses: 0 },
        { itemType: 'kanji', itemId: 'kanji-4e8c', status: 'new', dueAt: null, intervalDays: 0, repetitions: 0, lapses: 0 },
        { itemType: 'vocabulary', itemId: 'retired-lesson:むかし', status: 'learning', dueAt: soon, intervalDays: 2, repetitions: 2, lapses: 1 },
      ],
    };
    await context.route('http://localhost:5000/api/**', async route => {
      const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method(), json = data => route.fulfill({ status: 200, json: data });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/units') return json({ units: [] });
      if (p === '/srs/summary') return json({ total: 4, newCards: 1, dueNow: 0, dueToday: 0, dueSoon: 2, learned: 3, mature: 1, suspended: 0, reviewedToday: 0, newToday: 0, dueTotal: 0 });
      if (p === '/srs/queue') {
        const cards = url.searchParams.get('ahead') === '1'
          ? ['kanji-65e5', 'kanji-4e00'].map(itemId => ({ itemType: 'kanji', itemId, isNew: false, repetitions: 1, lapses: 0, intervals }))
          : [];
        return json({ cards, newLimit: 5 });
      }
      if (p === '/srs/reviews') { state.reviews.push(request.postDataJSON()); return json({ dueAt: later, intervalDays: 4, intervals, reward: null }); }
      if (p === '/srs/cards' && method === 'GET') return json({ cards: state.deck });
      if (p === '/srs/cards' && method === 'POST') { state.enrolled.push(...request.postDataJSON().items); return json({ added: 1, ignored: 0 }); }
      const patch = p.match(/^\/srs\/cards\/(kanji|vocabulary)\/(.+)$/);
      if (patch && method === 'PATCH') { state.patches.push({ itemType: patch[1], itemId: decodeURIComponent(patch[2]), ...request.postDataJSON() }); return json({ ok: true }); }
      return json({});
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));

    // ---- nothing due: review ahead the 2 cards due within a day; hide one while reviewing
    await page.goto(base + '/srs');
    await page.getByRole('heading', { name: 'Nothing to review right now' }).waitFor();
    await page.getByText('2 cards are due in the next day.').waitFor();
    await page.getByRole('button', { name: 'Review ahead (2)' }).click();
    const reviewCard = page.locator('section[aria-label="Review card"]');
    await reviewCard.getByText('2 cards left · 0 reviewed').waitFor();
    await page.keyboard.press('Space'); await page.keyboard.press('3');
    await reviewCard.getByText('1 card left · 1 reviewed').waitFor();
    await reviewCard.getByRole('button', { name: 'Hide it' }).click();
    await page.getByRole('heading', { name: 'All done for today 🎉' }).waitFor();
    assert.equal(state.reviews.length, 1); assert.equal(state.reviews[0].ahead, true, 'graded as a review ahead');
    assert.deepEqual(state.patches, [{ itemType: 'kanji', itemId: state.reviews[0].itemId === 'kanji-65e5' ? 'kanji-4e00' : 'kanji-65e5', suspended: true }]);

    // ---- the deck: statuses and due dates, search, filters, hide and show again
    await page.getByRole('link', { name: 'Your deck →' }).click(); await page.waitForURL('**/srs/deck');
    await page.getByRole('heading', { name: 'Your deck' }).waitFor();
    await page.getByText('4 cards').waitFor();
    for (const [label] of [['All · 4'], ['New · 1'], ['Learning · 2'], ['Mature · 1'], ['Hidden · 0']]) await page.getByRole('button', { name: label }).waitFor();
    await page.getByText('Comes up as a new card').waitFor();
    await page.getByText('No longer in the course').waitFor();
    assert.ok(await page.getByText(/Due in (5|6) h/).count() >= 1, 'due soon shown in hours');
    await page.screenshot({ path: path.join(shots, 'srs-deck.png'), fullPage: true });
    await page.getByLabel('Find a card').fill('sun');
    await page.getByText('1 card', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Hide 日' }).click();
    await page.getByRole('button', { name: 'Show again 日' }).waitFor();
    assert.deepEqual(state.patches.at(-1), { itemType: 'kanji', itemId: 'kanji-65e5', suspended: true });
    await page.getByLabel('Find a card').fill('');
    await page.getByRole('button', { name: 'Hidden · 1' }).click();
    await page.getByText('1 card', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Show again 日' }).click();
    await page.getByRole('button', { name: 'Hidden · 0' }).waitFor();
    assert.deepEqual(state.patches.at(-1), { itemType: 'kanji', itemId: 'kanji-65e5', suspended: false });

    // ---- a kanji's page adds it to the daily review
    await page.goto(base + '/learn/kanji/kanji-4e5d');
    await page.getByRole('button', { name: 'Add to daily review' }).click();
    await page.getByText('Added to your daily review ✓').waitFor();
    assert.deepEqual(state.enrolled, [{ itemType: 'kanji', itemId: 'kanji-4e5d' }]);

    // ---- phone width: the deck fits
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(base + '/srs/deck'); await page.getByText('4 cards').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'deck fits a phone');
    await page.screenshot({ path: path.join(shots, 'srs-deck-phone.png'), fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: nothing due offers review ahead (2 due within a day); reviewing ahead sends ahead:true; a card hidden mid-session; deck page: 4 cards with statuses (new, learning, mature), due texts, a retired card, search, filter counts, hide and show again by name; a kanji added from its page; deck fits a phone.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
