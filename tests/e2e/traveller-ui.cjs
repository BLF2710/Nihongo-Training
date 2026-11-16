// The traveller's wardrobe (docs/WORLD.md): the learner's own look loaded from the API; choosing a kimono, skin, hat
// and what to carry, seen at once; Save sends the look and the traveller wears it on the islands; a failed save says so;
// keyboard choices with the arrow keys; one screen at 1366×768 and 390×844. Against a fixture API.
//   node traveller-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const SAVED_LOOK = { outfit: 'moss', sash: 'gold', skin: 'tan', hair: 'brown', hat: 'kasa', accessory: 'bundle', cheeks: 'plain' };
const VERMILION = '#c4472f';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ viewport = { width: 1366, height: 768 }, isSaveBroken = false } = {}) => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(t => {
        localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('course_level', 'N5'); localStorage.setItem('user_handle', 'aki');
      }, token);
      const sent = [];
      let look = SAVED_LOOK;
      await context.route('http://localhost:5000/api/**', route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/units') return json({ units: [] });
        if (p === '/traveller/look' && request.method() === 'PUT') {
          if (isSaveBroken) return json({ message: 'down' }, 500);
          look = request.postDataJSON(); sent.push(look); return json(look);
        }
        if (p === '/traveller/look') return json(look);
        if (p === '/kana-wilds/collection') return json({ starter: 'ka', kanaIds: [1, 2, 3, 4, 5, 6], answers: [], beatenChallengers: [] });
        return json({});
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      return { context, page, errors, sent };
    };
    const fitsScreen = page => page.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1 && document.scrollingElement.scrollWidth <= innerWidth);
    const choice = (page, part, name) => page.getByRole('group', { name: part }).getByRole('radio', { name, exact: true });

    // ---- the learner's own look comes from the API
    let { context, page, errors, sent } = await run();
    await page.goto(base + '/traveller');
    await page.getByRole('heading', { name: 'Your traveller' }).waitFor();
    await choice(page, 'Kimono', 'Moss green').waitFor();
    assert.ok(await choice(page, 'Kimono', 'Moss green').isChecked(), 'the saved kimono is chosen');
    assert.ok(await choice(page, 'Skin', 'Tan').isChecked(), 'the saved skin is chosen');
    assert.ok(await page.getByRole('button', { name: 'Save' }).isDisabled(), 'nothing to save yet');
    assert.ok(await fitsScreen(page), 'the wardrobe fits one screen');
    await page.screenshot({ path: path.join(shots, 'traveller-saved.png') });

    // ---- trying things on shows at once; the arrow keys move between choices
    await choice(page, 'Kimono', 'Vermilion').check({ force: true });
    await choice(page, 'Skin', 'Deep').check({ force: true });
    await choice(page, 'Hat', 'Headband').check({ force: true });
    await choice(page, 'Carrying', 'Lantern').check({ force: true });
    await choice(page, 'Cheeks', 'Rosy').check({ force: true });
    await choice(page, 'Hair', 'Black').focus();
    await page.keyboard.press('ArrowRight');
    assert.ok(await choice(page, 'Hair', 'Brown').isChecked(), 'arrow keys choose the next hair colour');
    assert.ok(await page.locator(`[role="img"] svg path[fill="${VERMILION}"]`).count() > 0, 'the preview wears the vermilion kimono');
    await page.getByRole('button', { name: 'Walk' }).click();
    await page.screenshot({ path: path.join(shots, 'traveller-trying-on.png') });

    // ---- Save sends the look; the traveller wears it on the islands, and it is still there on the next visit
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Saved. Your traveller wears it everywhere now.').waitFor();
    assert.deepEqual(sent, [{ outfit: 'vermilion', sash: 'gold', skin: 'deep', hair: 'brown', hat: 'hachimaki', accessory: 'lantern', cheeks: 'rosy' }]);
    await page.goto(base + '/islands/kana');
    await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
    await page.locator(`.village-person svg path[fill="${VERMILION}"]`).first().waitFor({ state: 'attached' });
    await page.screenshot({ path: path.join(shots, 'traveller-on-kana-island.png') });
    await page.goto(base + '/traveller');
    assert.ok(await choice(page, 'Carrying', 'Lantern').isChecked(), 'the saved look on the next visit');
    assert.deepEqual(errors, []); await context.close();

    // ---- a failed save says so and keeps the draft; a phone fits the wardrobe
    ({ context, page, errors, sent } = await run({ viewport: { width: 390, height: 844 }, isSaveBroken: true }));
    await page.goto(base + '/traveller');
    await choice(page, 'Kimono', 'Moss green').waitFor();
    await choice(page, 'Kimono', 'Plum').check({ force: true });
    await choice(page, 'Hat', 'No hat').check({ force: true });
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByText('Could not save your traveller. Please try again.').waitFor();
    assert.ok(await choice(page, 'Kimono', 'Plum').isChecked(), 'the draft is kept after a failed save');
    await page.screenshot({ path: path.join(shots, 'traveller-phone.png'), fullPage: true });
    assert.ok(await fitsScreen(page), 'the wardrobe fits a phone: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight])));
    assert.deepEqual(errors, []); await context.close();

    console.log('PASS: traveller — the saved look loaded from the API; kimono, skin, hair, hat and what to carry tried on and shown at once (arrow keys too); Save sends the look, worn on the Kana island and kept for the next visit; a failed save says so and keeps the draft; one screen at 1366×768 and 390×844; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
