// Kana Wilds: choosing a starter, the collection, a battle (attack with words, block by reading, the vowel hint),
// catching by tracing and by the keyboard alternative, the catch saved, the battle saved as practice, a rematch,
// the load error, and one screen on a laptop and a phone. Against a fixture API.
//   node kana-wilds-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const VOWELS = [1, 2, 3, 4, 5], STARTER_IDS = { ka: 6, sa: 11, ta: 16 };
const MAX_TURNS = 60;

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ viewport = { width: 1366, height: 768 }, collection = { starter: null, kanaIds: [] }, failCollection = false } = {}) => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai'); }, token);
      const sent = { starter: [], catches: [], practice: [], answers: [] };
      const state = { collection: { ...collection, kanaIds: [...collection.kanaIds] }, romajiById: {} };
      await context.route('http://localhost:5000/api/**', async route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/kana-wilds/collection') return failCollection ? json({ message: 'Server error' }, 500) : json(state.collection);
        if (p === '/kana-wilds/starter') {
          const { starter } = request.postDataJSON(); sent.starter.push(starter);
          state.collection = { starter, kanaIds: [...VOWELS, STARTER_IDS[starter]] }; return json(state.collection, 201);
        }
        if (p === '/kana-wilds/catches') {
          const { kanaId } = request.postDataJSON(); sent.catches.push(kanaId);
          const isNew = !state.collection.kanaIds.includes(kanaId);
          if (isNew) state.collection = { ...state.collection, kanaIds: [...state.collection.kanaIds, kanaId] };
          return json({ ...state.collection, isNew, reward: null });
        }
        if (p === '/quiz/answer') {
          const body = request.postDataJSON(); sent.answers.push(body);
          const correctAnswer = state.romajiById[body.kanaId];
          return json({ correct: body.answer === correctAnswer, correctAnswer, type: 'hiragana' });
        }
        if (p === '/activity/practice') { sent.practice.push(request.postDataJSON()); return json({ recorded: true, currentStreak: 1, reward: null }); }
        return json({});
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      return { context, page, sent, state, errors };
    };
    // The game's own word list and kana table, from the dev server, so the test answers exactly as a learner who knows them.
    const loadAnswers = async (page, state) => {
      const { words, kana } = await page.evaluate(async () => {
        const [{ COURSE_BATTLE_WORDS }, { BASIC_HIRAGANA }] = await Promise.all([import('/src/lib/kanaWilds/courseWords.ts'), import('/src/lib/kanaWilds/gojuon.ts')]);
        return { words: COURSE_BATTLE_WORDS, kana: BASIC_HIRAGANA };
      });
      for (const item of kana) state.romajiById[item.id] = item.romaji;
      return { wordByJapanese: new Map(words.map(word => [word.japanese, word])), kanaByCharacter: new Map(kana.map(item => [item.kana, item])) };
    };
    const fitsScreen = page => page.evaluate(() => document.scrollingElement.scrollHeight <= window.innerHeight + 1 && document.scrollingElement.scrollWidth <= window.innerWidth);

    /** Traces the kana by following the guide strokes drawn in the tracing area. */
    const trace = async (page, isSloppy) => {
      const strokes = await page.evaluate(() => {
        const svg = document.querySelector('canvas[aria-label^="Tracing area"]').previousElementSibling, box = svg.getBoundingClientRect();
        return [...svg.querySelectorAll('path')].map(path => {
          const length = path.getTotalLength();
          return Array.from({ length: 20 }, (_, index) => { const point = path.getPointAtLength(length * index / 19); return { x: box.left + point.x / 109 * box.width, y: box.top + point.y / 109 * box.height }; });
        });
      });
      for (const stroke of isSloppy ? [[...strokes[0]].reverse()] : strokes) {
        await page.mouse.move(stroke[0].x, stroke[0].y); await page.mouse.down();
        for (const point of stroke.slice(1)) await page.mouse.move(point.x, point.y, { steps: 2 });
        await page.mouse.up();
      }
    };

    /** Plays a battle to its end as a learner who knows every answer; catches by tracing or by the stroke-count question. */
    const fight = async (page, answers, { catchBy, sloppyFirstTrace = false, onAttack }) => {
      const arena = page.getByRole('region', { name: /^Battle against / });
      await arena.waitFor();
      const enemyCharacter = (await arena.getAttribute('aria-label')).replace('Battle against ', '');
      const enemy = answers.kanaByCharacter.get(enemyCharacter);
      let hasTracedSloppily = !sloppyFirstTrace, sawStrong = false;
      const seen = { projectile: false, burst: false, shield: false, heldHp: false };
      const noteEffects = async () => { for (const [name, selector] of [['projectile', '.kw-projectile'], ['burst', '.kw-burst'], ['shield', '.kw-shield']]) seen[name] ||= Boolean(await page.locator(selector).count()); };
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        await page.waitForTimeout(50);
        await noteEffects();
        // Each turn plays out before the next question: the menu is held while the scene animates.
        await page.waitForFunction(() => !document.querySelector('section[data-animating="true"]'));
        if (await page.getByRole('heading', { name: /caught|got away|won this time|ran away|You beat/ }).count()) return { enemy, sawStrong, seen };
        const group = arena.getByRole('group').first();
        const prompt = (await group.count()) ? await group.innerText() : '';
        if (prompt.startsWith('How do you read')) {
          const word = answers.wordByJapanese.get(prompt.match(/How do you read (\S+?)\?/)[1]);
          await group.getByRole('button', { name: word.romaji, exact: true }).click();
        } else if (prompt.startsWith('Right:')) {
          const word = answers.wordByJapanese.get(prompt.match(/^Right: (\S+) is/)[1]);
          const enemyHpText = () => page.locator('.kw-info--enemy').getByText(/^\d+ \/ 20$/).innerText();
          const shownBefore = await enemyHpText();
          await group.getByRole('button', { name: word.meaning, exact: true }).click();
          if (!seen.heldHp) {
            // The hit is decided at once, but the shown HP changes only when the word lands on the kana.
            assert.equal(await enemyHpText(), shownBefore, 'HP held until the impact');
            await page.waitForFunction(before => document.querySelector('.kw-info--enemy')?.textContent?.includes(before) === false, shownBefore);
            seen.heldHp = true;
          }
        } else if (prompt.includes('attacks! Read it to block.')) {
          await group.getByRole('button', { name: enemy.romaji, exact: true }).click();
          await arena.getByRole('status').getByText(/block its attack/).waitFor();
          assert.equal(await page.locator('section[data-animating="true"] .kw-shield').count(), 1, 'a block raises the shield while the turn plays');
        } else if (prompt.startsWith('How many strokes')) {
          const count = await page.evaluate(character => import('/src/lib/kanaWilds/strokeSamples.ts').then(module => module.strokePathsOf(character).length), enemy.kana);
          await group.getByRole('button', { name: String(count), exact: true }).click();
        } else if (await arena.getByRole('button', { name: 'Catch it!' }).count() && !(await page.locator('canvas[aria-label^="Tracing area"]').count())) {
          await arena.getByRole('button', { name: 'Catch it!' }).click();
          if (catchBy === 'keyboard') await arena.getByRole('button', { name: "Can't draw? Answer instead" }).click();
        } else if (await page.locator('canvas[aria-label^="Tracing area"]').count()) {
          await page.screenshot({ path: path.join(shots, `kana-wilds-catch-${page.viewportSize().width}.png`) });
          assert.ok(await fitsScreen(page), 'the catch fits one screen: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight, document.scrollingElement.scrollWidth, innerWidth])));
          await trace(page, !hasTracedSloppily);
          await arena.getByRole('button', { name: 'Throw!' }).click();
          hasTracedSloppily = true;
        } else if (prompt.startsWith('Your turn')) {
          if (onAttack) await onAttack(group);
          sawStrong ||= Boolean(await group.getByText('▲', { exact: true }).count());
          await group.getByRole('button').first().click();
        } else throw new Error('unexpected battle screen: ' + (await arena.innerText()).slice(0, 300));
      }
      throw new Error('the battle did not end');
    };

    // ---- the collection fails to load: explained, with a retry
    let { context, page, errors, sent, state } = await run({ failCollection: true });
    await page.goto(base + '/games/kana-wilds');
    await page.getByRole('alert').getByText('Server error').waitFor();
    await page.getByRole('button', { name: 'Try again' }).waitFor();
    assert.deepEqual(errors, []); await context.close();

    // ---- first visit: choose a starter; the vowels plus か are given
    ({ context, page, errors, sent, state } = await run());
    await page.goto(base + '/games/kana-wilds');
    await page.getByRole('heading', { name: 'Choose your starter kana' }).waitFor();
    for (const name of [/^か \(ka\): \d+ words$/, /^さ \(sa\): \d+ words$/, /^た \(ta\): \d+ words$/]) await page.getByRole('button', { name }).waitFor();
    await page.screenshot({ path: path.join(shots, 'kana-wilds-starter.png') });
    assert.ok(await fitsScreen(page), 'the starter choice fits one screen');
    await page.getByRole('button', { name: /^か \(ka\)/ }).click();
    await page.getByText('6 / 46').waitFor();
    assert.deepEqual(sent.starter, ['ka']);
    assert.equal(await page.getByRole('cell', { name: 'か caught' }).count(), 1);
    assert.equal(await page.getByRole('cell', { name: 'ki not caught yet' }).count(), 1);
    const wordCount = Number((await page.getByText(/Your kana spell/).innerText()).match(/\d+/)[0]);
    assert.ok(wordCount >= 5, 'the vowels and か spell some course words: ' + wordCount);
    await page.screenshot({ path: path.join(shots, 'kana-wilds-hub.png') });
    assert.ok(await fitsScreen(page), 'the collection fits one screen');

    // ---- a battle won by tracing (one sloppy trace first: drawn backwards, it breaks free)
    const answers = await loadAnswers(page, state);
    await page.getByRole('button', { name: 'Explore the tall grass →' }).click();
    let attackShot = false;
    const first = await fight(page, answers, { catchBy: 'trace', sloppyFirstTrace: true, onAttack: async () => {
      if (attackShot) return; attackShot = true;
      await page.screenshot({ path: path.join(shots, 'kana-wilds-battle.png') });
      assert.ok(await fitsScreen(page), 'the battle fits one screen: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight])));
    } });
    assert.ok(first.seen.projectile && first.seen.burst, 'played words fly at the kana and burst on it');
    assert.ok(first.seen.heldHp, 'the HP number waited for the impact');
    assert.ok(['k', 's'].includes(first.enemy.row), 'wild kana come from the first rows not yet caught: ' + first.enemy.kana);
    await page.getByRole('heading', { name: `You caught ${first.enemy.kana}!` }).waitFor();
    await page.getByText('Added to your collection.').waitFor();
    assert.deepEqual(sent.catches, [first.enemy.id]);
    assert.equal(sent.practice.length, 1); assert.deepEqual([sent.practice[0].kind, sent.practice[0].scope], ['battle', 'N5']);
    assert.ok(sent.practice[0].answered >= 3 && sent.practice[0].correct <= sent.practice[0].answered);
    assert.ok(sent.answers.every(answer => answer.type === 'hiragana' && answer.kanaId === first.enemy.id && /^[0-9a-f-]{36}$/.test(answer.submissionId)), 'blocks are graded by the server');
    assert.equal(new Set(sent.answers.map(answer => answer.submissionId)).size, sent.answers.length, 'a new submission id for every block');
    await page.screenshot({ path: path.join(shots, 'kana-wilds-caught.png') });

    // ---- back to the collection: the catch is filled in, and more words open
    await page.getByRole('button', { name: 'Your collection' }).click();
    await page.getByText('7 / 46').waitFor();
    await page.getByRole('cell', { name: `${first.enemy.kana} caught` }).waitFor();

    // ---- a second battle, caught with the keyboard alternative (no drawing)
    await page.getByRole('button', { name: 'Explore the tall grass →' }).click();
    const second = await fight(page, answers, { catchBy: 'keyboard' });
    assert.notEqual(second.enemy.id, first.enemy.id, 'a caught kana is no longer wild while others are');
    await page.getByRole('heading', { name: `You caught ${second.enemy.kana}!` }).waitFor();
    assert.deepEqual(sent.catches, [first.enemy.id, second.enemy.id]);

    // ---- running away, then a rematch against the same kana
    const practiceBefore = sent.practice.length;
    await page.getByRole('button', { name: 'Explore the grass' }).click();
    const arena = page.getByRole('region', { name: /^Battle against / });
    const third = (await arena.getAttribute('aria-label')).replace('Battle against ', '');
    await arena.getByRole('button', { name: 'Run away' }).click();
    await page.getByRole('heading', { name: 'You ran away' }).waitFor();
    await page.waitForTimeout(300);
    assert.equal(sent.practice.length, practiceBefore, 'a battle run from at once is not saved as practice');
    await page.getByRole('button', { name: `Battle ${third} again` }).click();
    assert.equal(await page.getByRole('region', { name: 'Battle against ' + third }).count(), 1);
    assert.deepEqual(errors, []); await context.close();

    // ---- phone: the battle and the catch on one screen
    ({ context, page, errors, sent, state } = await run({ viewport: { width: 390, height: 844 }, collection: { starter: 'sa', kanaIds: [...VOWELS, 11] } }));
    await page.goto(base + '/games/kana-wilds');
    await page.getByText('6 / 46').waitFor();
    assert.ok(await fitsScreen(page), 'the collection fits a phone');
    await page.screenshot({ path: path.join(shots, 'kana-wilds-phone-hub.png') });
    const phoneAnswers = await loadAnswers(page, state);
    await page.getByRole('button', { name: 'Explore the tall grass →' }).click();
    let phoneShot = false;
    await fight(page, phoneAnswers, { catchBy: 'trace', onAttack: async () => {
      if (phoneShot) return; phoneShot = true;
      await page.screenshot({ path: path.join(shots, 'kana-wilds-phone-battle.png') });
      assert.ok(await fitsScreen(page), 'the battle fits a phone: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight])));
    } });
    assert.equal(sent.catches.length, 1);
    assert.deepEqual(errors, []); await context.close();

    console.log('PASS: Kana Wilds — load error with retry; starter choice (か/さ/た with their word counts) gives the vowels plus the starter; the collection table; wild kana from the first rows still incomplete; attacks with course words read right (and meaning for criticals), blocks graded by the server with fresh submission ids; a backwards trace breaks free, a good trace catches; the stroke-count alternative catches without drawing; catches saved and filled in; battles saved as N5 practice (not when run from at once); rematch; one screen at 1366×768 and 390×844; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
