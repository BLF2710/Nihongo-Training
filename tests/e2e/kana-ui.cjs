// Kana Speed Quiz: "each once" rounds with a results screen, and unlimited mode without early repeats.
//   node kana-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
(async () => {
  // The real hiragana list, as the API serves it, read from the migration that seeds it (no API server needed).
  const seed = require('node:fs').readFileSync(require('node:path').join(__dirname, '../../nihon-api/migrations/000_base_schema.sql'), 'utf8');
  const rows = seed.slice(seed.indexOf('INSERT INTO hiraganas'), seed.indexOf(';', seed.indexOf('INSERT INTO hiraganas')));
  const list = [...rows.matchAll(/\((\d+), '([^']+)', '([^']+)'\)/g)].map(([, id, kana, romaji]) => ({ id: Number(id), kana, romaji }));
  const characters = { type: 'hiragana', characters: list };
  assert.ok(list.length > 40, 'character list');
  const romaji = new Map(list.map(c => [c.kana, c.romaji]));
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
    const answers = [];
    await context.route('http://localhost:5000/api/**', route => { const request = route.request(), p = new URL(request.url()).pathname.replace('/api', '');
      if (p === '/quiz/characters') return route.fulfill({ json: characters });
      if (p === '/quiz/answer') { const body = request.postDataJSON(); const kana = list.find(c => c.id === Number(body.kanaId)); answers.push(kana.kana); return route.fulfill({ json: { correct: body.answer === kana.romaji, correctAnswer: kana.romaji, type: 'hiragana' } }); }
      if (p === '/site') return route.fulfill({ json: { registration_enabled: true, announcement: '', disabled: [] } });
      return route.fulfill({ json: {} }); });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const shown = () => page.locator('div.select-none').first().innerText();
    const input = page.getByLabel('Romaji');
    const answerCurrent = async (wrong = false) => {
      const kana = (await shown()).trim();
      await input.fill(wrong ? 'zz' : romaji.get(kana)); if (wrong) await input.press('Enter');
      return kana;
    };
    // Starting while a game is unfinished asks whether to resume or start again; these checks start again.
    const start = async () => { await page.getByRole('button', { name: 'Start Quiz →' }).click(); await page.waitForTimeout(300); const fresh = page.getByRole('button', { name: 'Start new session' }); if (await fresh.count()) await fresh.click(); };
    const advance = async () => { const next = page.getByRole('button', { name: /Next Kana|See results/ }); await next.click(); };

    // ---- Setup: the あ column, "each once" is the default mode.
    await page.goto(base + '/practice?type=hiragana'); await page.getByRole('heading', { name: 'Hiragana Speed Quiz' }).waitFor();
    await page.getByText('Choose individually').first().click(); await page.getByRole('button', { name: 'Select あ column' }).click();
    assert.equal(await page.getByRole('radio', { name: /Each once/ }).isChecked(), true);
    await page.getByText('5 characters selected · each once').waitFor();
    await page.getByRole('button', { name: 'Start Quiz →' }).click(); await page.getByText('Character 1 of 5').waitFor();

    // ---- Round: each character exactly once; one deliberate mistake.
    const seen = [];
    for (let i = 0; i < 5; i++) {
      await page.getByText(`Character ${i + 1} of 5`).waitFor();
      if (i === 2) { seen.push(await answerCurrent(true)); await page.getByText('Incorrect ❌').waitFor(); await advance(); continue; }
      seen.push(await answerCurrent());
      if (i === 1) { // a reload in the middle keeps the round
        await page.getByText('Correct! ✅').waitFor(); await page.reload(); await page.getByText('Character 2 of 5').waitFor(); assert.equal((await shown()).trim(), seen[1]);
        await advance(); continue;
      }
      if (i < 4) await page.waitForFunction(n => document.body.innerText.includes(`Character ${n} of 5`), i + 2); // correct answers advance by themselves
    }
    assert.deepEqual([...seen].sort(), ['あ', 'い', 'う', 'え', 'お'].sort(), 'each character exactly once: ' + seen.join(''));
    const results = page.getByRole('region', { name: /complete|Great work|Perfect/ }).or(page.locator('section[aria-labelledby="round-results"]'));
    await page.locator('#round-results').waitFor();
    await results.getByText('4 / 5').waitFor(); await results.getByText('80%').waitFor(); await results.getByText('🔥 2').waitFor();
    await page.getByRole('heading', { name: 'To practise again (1)' }).waitFor(); await results.getByText(`You typed: zz`).waitFor();
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'round-results', 'focus moves to the results');
    await page.screenshot({ path: shots + '/kana-results.png', fullPage: true });
    // ---- Practise the missed one: a round of exactly that character.
    await page.getByRole('button', { name: 'Practise the missed ones →' }).click(); await page.getByText('Character 1 of 1 · practising missed characters').waitFor();
    assert.equal((await shown()).trim(), seen[2]); await answerCurrent();
    await page.getByRole('heading', { name: 'Perfect round! 🎉' }).waitFor(); await page.getByText('You answered every character correctly.').waitFor();
    // ---- Play again uses all five characters again.
    await page.getByRole('button', { name: 'Play again' }).click(); await page.getByText('Character 1 of 5').waitFor();

    // ---- Unlimited: every five answers contain all five characters, and no character twice in a row.
    await page.getByRole('button', { name: '← Change characters' }).click(); await page.getByRole('radio', { name: /Unlimited/ }).check();
    await page.getByText('5 characters selected · unlimited').waitFor(); await start();
    await page.getByText('Unlimited', { exact: true }).waitFor();
    assert.equal(await page.getByText(/before any repeats/).count(), 0, 'no explanation of the deck order');
    const order = [];
    for (let i = 0; i < 15; i++) {
      const before = (await shown()).trim(); order.push(before); await input.fill(romaji.get(before));
      if (i < 14) await page.waitForFunction(([prev, count]) => { const el = document.querySelector('div.select-none'); return el && document.querySelector('input[aria-label="Romaji"]')?.value === '' && Number(document.body.innerText.match(/✅ (\d+)/)?.[1]) === count; }, [before, i + 1]);
    }
    for (let block = 0; block < 3; block++) assert.deepEqual(order.slice(block * 5, block * 5 + 5).sort(), ['あ', 'い', 'う', 'え', 'お'].sort(), 'block ' + block + ': ' + order.join(''));
    for (let i = 1; i < order.length; i++) assert.notEqual(order[i], order[i - 1], 'no immediate repeat at ' + i + ': ' + order.join(''));
    assert.equal(await page.locator('#round-results').count(), 0, 'unlimited mode never ends by itself');

    // ---- Switching script during an unfinished game only browses; a new session starts on Start Quiz.
    const sessionId = () => page.evaluate(() => JSON.parse(localStorage.getItem('learning-session-v1:1') ?? 'null')?.id);
    const gameId = await sessionId(); const gameKana = (await shown()).trim(); assert.ok(gameId);
    for (const type of ['katakana', 'hiragana', 'katakana']) {
      // From the game the learner reaches the other script through the menu (a link to /practice?type=…); on the selection screen through its tabs.
      if (await page.getByRole('link', { name: 'Katakana', exact: true }).count()) await page.getByRole('link', { name: type === 'katakana' ? 'Katakana' : 'Hiragana', exact: true }).click(); else await page.goto(`${base}/practice?type=${type}`);
      if (type === 'katakana') await page.getByRole('heading', { name: 'Katakana Speed Quiz' }).waitFor();
      else { await input.waitFor(); assert.equal((await shown()).trim(), gameKana, 'back on Hiragana the unfinished game continues'); }
      assert.equal(await page.locator('section[aria-label="Replace unfinished session"]').count() + await page.getByRole('dialog').count(), 0, 'no session prompt while switching');
      assert.equal(await sessionId(), gameId, 'switching does not replace the session');
    }
    await page.getByRole('button', { name: 'Select all' }).click(); await page.getByRole('button', { name: 'Start Quiz →' }).click();
    const prompt = page.getByRole('dialog', { name: 'Continue or start something new?' }); await prompt.waitFor();
    await prompt.getByRole('button', { name: 'Cancel' }).click(); await prompt.waitFor({ state: 'hidden' });
    assert.equal(await sessionId(), gameId, 'cancelling keeps the unfinished game'); await page.getByRole('heading', { name: 'Katakana Speed Quiz' }).waitFor();
    await page.getByRole('button', { name: 'Start Quiz →' }).click(); await prompt.getByRole('button', { name: 'Start new session' }).click(); await input.waitFor();
    assert.notEqual(await sessionId(), gameId, 'Start Quiz then confirm starts the new session');
    // An unfinished lesson does not block opening the speed quiz either.
    await page.evaluate(() => localStorage.setItem('learning-session-v1:1', JSON.stringify({ version: 1, id: 'lesson-1', key: '/lessons/japanese/n5-unit-1-hello', href: '/lessons/japanese/n5-unit-1-hello', title: 'Japanese lesson', kind: 'lesson', status: 'active', updatedAt: new Date().toISOString(), data: { step: 2 } })));
    await page.goto(base + '/practice?type=hiragana'); await page.getByRole('heading', { name: 'Hiragana Speed Quiz' }).waitFor();
    assert.equal(await page.locator('section[aria-label="Replace unfinished session"]').count() + await page.getByRole('dialog').count(), 0); assert.equal(await sessionId(), 'lesson-1');
    await page.getByRole('link', { name: 'Katakana', exact: true }).click(); await page.getByRole('heading', { name: 'Katakana Speed Quiz' }).waitFor(); assert.equal(await sessionId(), 'lesson-1');
    await page.getByRole('link', { name: 'Hiragana', exact: true }).click(); await page.getByRole('button', { name: 'Select all' }).click();

    await page.getByRole('button', { name: 'Clear selection' }).click(); await page.getByText('Choose individually').first().click(); await page.getByRole('button', { name: 'Select あ column' }).click(); await page.getByText('5 characters selected').waitFor();
    await page.getByRole('radio', { name: /Each once/ }).check(); await start();
    for (let i = 0; i < 5; i++) { await page.getByText(`Character ${i + 1} of 5`).waitFor(); await answerCurrent(true); await advance(); }
    await page.setViewportSize({ width: 390, height: 844 }); await page.locator('#round-results').waitFor(); await results.getByText('0 / 5').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'results overflow on mobile');
    assert.deepEqual(errors, []);
    console.log(`PASS: switching Hiragana/Katakana mid-game or with an unfinished lesson never prompts or replaces the session, the game resumes, and only Start Quiz asks (cancel keeps it); setup defaults to "each once" and shows the mode; a round shows each of 5 characters exactly once (${seen.join('')}), survives a reload, and ends on a results screen (4/5, 80%, best streak 2, missed list with the typed answer, focus moved); practising the missed character runs a 1-character round to a perfect result; play again; unlimited mode over 15 answers had all 5 characters in every block of 5 and no immediate repeats (${order.join('')}); mobile results; ${answers.length} answers sent; no page errors.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
