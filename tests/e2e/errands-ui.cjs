// Island Errands: the start screen, walking with the keyboard (and stopping at walls), every errand played through in
// Japanese (a wrong reply gets a reaction and a hint, then the question again), the bag, the gates, the finished
// errands reported as practice, the festival finale, continuing a save, phones (touch pad) and dark mode.
// Against fixture APIs. The traveller is moved next to each villager by editing the save, so the test doesn't depend
// on how fast frames run.
//   node errands-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const SAVE_KEY = 'island-errands:matsuri:kai';
// Where to stand to talk to each villager: on a free tile next to theirs, feet near its middle.
const NEXT_TO = { pon: { x: 13.5, y: 14.6 }, tama: { x: 4.5, y: 15.6 }, hato: { x: 26.5, y: 19.5 }, kon: { x: 30.5, y: 13.6 }, hakase: { x: 22.5, y: 6.6 }, zen: { x: 6.5, y: 5.6 }, sensei: { x: 13.5, y: 6.6 } };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai'); }, token);
    const practice = [];
    await context.route('http://localhost:5000/api/**', async route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = data => route.fulfill({ status: 200, json: data });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/activity/practice') { practice.push(request.postDataJSON()); return json({ recorded: true, currentStreak: 1, reward: null }); }
      return json({});
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const save = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY);
    const dialog = page.getByRole('dialog', { name: /^Talking with/ });
    const errand = page.getByRole('region', { name: 'Errand' });
    const bag = page.getByRole('region', { name: 'Bag' });

    // Moves the traveller by rewriting the save (after the page has saved), then continues from it.
    const standNextTo = async id => {
      await page.waitForTimeout(1000);
      await page.evaluate(([key, position]) => { const state = JSON.parse(localStorage.getItem(key)); localStorage.setItem(key, JSON.stringify({ ...state, position })); }, [SAVE_KEY, NEXT_TO[id]]);
      await page.reload();
      await page.getByRole('button', { name: 'Continue →' }).click();
      await page.getByText('Talk E').waitFor();
    };
    const talk = async (name) => { await page.keyboard.press('KeyE'); await dialog.waitFor(); assert.equal(await dialog.getAttribute('aria-label'), `Talking with ${name}`); };
    const line = async japanese => { await dialog.getByText(japanese, { exact: true }).waitFor(); await page.keyboard.press('KeyE'); };
    const reply = async japanese => dialog.getByRole('button', { name: new RegExp('^' + japanese) }).click();

    // ---- the start screen, then the village
    await page.goto(base + '/games/errands');
    await page.getByRole('heading', { name: 'Island Errands: Festival Village' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Start over' }).count(), 0, 'nothing to start over yet');
    await page.screenshot({ path: path.join(shots, 'errands-start.png') });
    await page.getByRole('button', { name: 'Enter the village →' }).click();
    await errand.getByText('Errand 1 of 3').waitFor();
    await errand.getByText('Talk to Pon at the festival stall (まつり).').waitFor();
    await bag.getByText('Empty').waitFor();

    // ---- walking: up the path, and west into the house, which stops the traveller
    await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp');
    await page.waitForTimeout(1000);
    let position = (await save()).position;
    assert.ok(position.y < 19.5 && position.y > 16, 'walked up: ' + position.y);
    await page.keyboard.down('KeyA'); await page.waitForTimeout(1500); await page.keyboard.up('KeyA');
    await page.waitForTimeout(1000);
    position = (await save()).position;
    assert.ok(Math.abs(position.x - (6 + 0.3)) < 0.05, 'stopped by the west house (its wall at x 6): ' + position.x);
    assert.equal((await save()).facing, 'left');
    await page.screenshot({ path: path.join(shots, 'errands-village.png') });

    // ---- errand 1: Pon asks for bread; Tama's bakery (a wrong particle first); bread to Pon
    await standNextTo('pon');
    await talk('Pon');
    await page.screenshot({ path: path.join(shots, 'errands-dialogue.png') });
    await line('こんにちは！ぼくは ポンです。'); await line('おなかが すきました…。');
    await dialog.getByText('ふたつ means two (things).', { exact: false }).waitFor();
    await page.keyboard.press('KeyE'); await dialog.waitFor({ state: 'detached' });
    await errand.getByText('Buy two pieces of bread at Tama\'s bakery (パン).').waitFor();

    await standNextTo('tama');
    await talk('Tama');
    await line('いらっしゃいませ！');
    await dialog.getByText('Ask for bread.').waitFor();
    await page.screenshot({ path: path.join(shots, 'errands-replies.png') });
    await reply('パンが ください');
    await dialog.getByText('パンが…？ パンが どう しましたか？').waitFor();
    await dialog.getByText(/を marks the thing you want/).waitFor();
    await page.keyboard.press('KeyE');
    await reply('パンを ください');
    await line('はい。いくつですか。');
    await page.keyboard.press('Digit2');
    await line('ふたつ ですね。はい、どうぞ。');
    await line('ありがとう ございます。');
    await bag.getByText('パン ×2').waitFor();

    await standNextTo('pon');
    await talk('Pon');
    await line('あっ、パン！');
    await reply('どうぞ');
    await line('ありがとう！これ、おまつりの きっぷです。');
    await line('ひがしの もんが あきました！ハトさんに あって ください。');
    await errand.getByText('Errand 2 of 3').waitFor();
    await bag.getByText('きっぷ').waitFor();
    assert.equal(await bag.getByText('パン ×2').count(), 0, 'the bread was handed over');
    assert.deepEqual(practice, [{ kind: 'errands', scope: 'N5', answered: 3, correct: 2 }], 'the finished errand: three questions, Tama\'s first answer wrong');

    // ---- errand 2: Hato's letter, Kon's directions, Hakase (with furigana on 手紙)
    await standNextTo('hato');
    await talk('Hato');
    await line('こんにちは。ハトです。ゆうびんやさんです。');
    await dialog.locator('ruby', { hasText: '手紙' }).waitFor();
    await page.keyboard.press('KeyE');
    await line('はかせは がっこうに います。');
    await standNextTo('kon');
    await talk('Kon');
    await line('こんにちは。キツネの コンです。');
    await reply('がっこうは どこですか');
    await line('がっこうは きたに あります。');
    await page.keyboard.press('KeyE');
    await standNextTo('hakase');
    await talk('Hakase');
    await line('おや、なんですか。');
    await reply('ハトさんは');
    await dialog.getByText(/ハトさんは とりですよ/).waitFor();
    await page.keyboard.press('KeyE');
    await reply('ハトさんの');
    await line('ありがとう。これは おれいです。');
    await line('にわの かぎです。ゼンさんが まって いますよ。');
    await errand.getByText('Errand 3 of 3').waitFor();
    assert.deepEqual(practice[1], { kind: 'errands', scope: 'N5', answered: 2, correct: 1 });

    // ---- errand 3: Zen; Sensei's tea, ordered by building the sentence (a wrong order first); tea to Zen
    await standNextTo('zen');
    await talk('Zen');
    await line('にわへ ようこそ。ゼンです。'); await line('おちゃを ひとつ かって きて ください。');
    await standNextTo('sensei');
    await talk('Sensei');
    await line('いらっしゃい。なにに しますか。');
    const words = dialog.getByRole('group', { name: 'Words' });
    const word = text => words.getByRole('button', { name: text, exact: true }).click();
    for (const text of ['ひとつ', 'おちゃ', 'を', 'おねがいします']) await word(text);
    await page.screenshot({ path: path.join(shots, 'errands-build.png') });
    await dialog.getByRole('button', { name: 'Say it' }).click();
    await line('すみません、もう いちど おねがいします。');
    await word('おちゃ'); await word('が');
    await dialog.getByRole('button', { name: 'Undo' }).click();
    for (const text of ['を', 'ひとつ', 'おねがいします']) await word(text);
    assert.equal(await dialog.getByLabel('Your sentence').innerText(), 'おちゃ を ひとつ おねがいします');
    await dialog.getByRole('button', { name: 'Say it' }).click();
    await line('はい、おちゃ ひとつ。どうぞ。');
    await bag.getByText('おちゃ').waitFor();
    await standNextTo('zen');
    await talk('Zen');
    await line('ああ、おちゃ。ありがとう ございます。');
    await reply('どういたしまして');
    await line('これで まつりの じゅんびが できました。');
    await line('ちょうちんを つけましょう！');
    const finale = page.getByRole('dialog', { name: 'The festival has begun!' });
    await finale.getByText('You answered 4 of 7 questions right the first time.', { exact: false }).waitFor();
    assert.deepEqual(practice[2], { kind: 'errands', scope: 'N5', answered: 2, correct: 1 }, 'the first word order was wrong');
    await page.screenshot({ path: path.join(shots, 'errands-finale.png') });
    await finale.getByRole('button', { name: 'Keep exploring' }).click();
    await errand.getByText('The festival has begun!').waitFor();
    await talk('Zen'); await line('まつりが はじまりました。');

    // ---- leaving and coming back continues the save; English can be switched off
    await page.waitForTimeout(1000);
    await page.goto(base + '/games/errands');
    await page.getByRole('button', { name: 'Start over' }).waitFor();
    await page.getByRole('button', { name: 'Continue →' }).click();
    await errand.getByText('The festival has begun!').waitFor();
    await talk('Zen');
    await dialog.getByLabel('English').uncheck();
    await dialog.getByRole('button', { name: 'Show English' }).click();
    await dialog.getByText('The festival has begun.').waitFor();
    await page.keyboard.press('KeyE');
    assert.equal(await page.evaluate(() => localStorage.getItem('island-errands-english')), 'off');

    // ---- dark mode
    await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
    await page.screenshot({ path: path.join(shots, 'errands-dark.png') });
    assert.deepEqual(errors, []);
    await context.close();

    // ---- a phone: the touch pad walks, the Talk button talks, nothing overflows
    const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    await phone.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai'); }, token);
    await phone.route('http://localhost:5000/api/**', route => route.fulfill({ status: 200, json: new URL(route.request().url()).pathname === '/api/site' ? { registration_enabled: true, announcement: '', disabled: [] } : {} }));
    const mobile = await phone.newPage();
    const phoneErrors = []; mobile.on('pageerror', error => phoneErrors.push(error.message));
    await mobile.goto(base + '/games/errands');
    await mobile.getByRole('button', { name: 'Enter the village →' }).click();
    const up = mobile.getByRole('button', { name: 'Walk up' });
    const box = await up.boundingBox();
    await mobile.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await mobile.mouse.down(); await mobile.waitForTimeout(500); await mobile.mouse.up();
    await mobile.waitForTimeout(1000);
    assert.ok((await mobile.evaluate(key => JSON.parse(localStorage.getItem(key)), SAVE_KEY)).position.y < 19.5, 'the pad walks');
    assert.ok(await mobile.getByRole('button', { name: 'Talk', exact: true }).isDisabled(), 'nobody to talk to yet');
    assert.ok(await mobile.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no sideways scrolling');
    await mobile.screenshot({ path: path.join(shots, 'errands-phone.png') });
    assert.deepEqual(phoneErrors, []);
    await phone.close();

    console.log('PASS: start screen; walking with arrows and WASD, stopped by a house; Pon, Tama, Hato, Kon, Hakase, Zen and Sensei played through in Japanese (wrong replies and a wrong word order get a reaction and a hint, then the question again; furigana on 手紙); the bag gains and loses items; each finished errand reported once as practice (N5, first tries only); the festival finale with the score; lanterns lit and new lines afterwards; continue from a save; English off with Show English per line; dark mode; phone touch pad and Talk button, no overflow; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
