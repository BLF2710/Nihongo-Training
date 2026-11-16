// Challengers on the islands (docs/WORLD.md milestones 3–4): every path open on the map from the start; Chun on the
// Kana island, walked up to and challenged with E; a lost challenge (nothing saved, try again at once); a won challenge
// (three open kana in a row, HP carried over, the win saved, a rematch offered); Tama and Pon waiting on their islands;
// the challenge on one screen at 1366×768 and 390×844. Against a fixture API that grades kana answers like the server.
//   node challenger-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const MAX_TURNS = 80;
// The traveller arrives on the island's road (row 7); walking east along it brings them to Chun, who stands beside
// it in the cherry-tree square.
const profile = { username: 'aki', display_name: 'Aki', email: 'aki@example.test', email_verified_at: '2026-01-01', bio: '', avatar: null, learning_language: 'japanese', learning_goal: null, daily_goal: 10, profile_visibility: 'private',
  xp: 120, level: 3, rank: 'Beginner', lessons_completed: 0, current_streak: 4, achievements_count: 0, achievements: [],
  xpProgress: { currentLevelXp: 0, nextLevelXp: 200, progressXp: 120, progressPercent: 60 } };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ viewport = { width: 1366, height: 768 }, beatenChallengers = [], isTouch = false } = {}) => {
      const context = await browser.newContext({ viewport, hasTouch: isTouch, isMobile: isTouch });
      await context.addInitScript(t => {
        localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('course_level', 'N5'); localStorage.setItem('user_handle', 'aki');
      }, token);
      const state = { collection: { starter: 'ka', kanaIds: [1, 2, 3, 4, 5, 6], beatenChallengers: [...beatenChallengers] }, romajiById: {} };
      const sent = { wins: [], practice: [] };
      const respond = () => ({ ...state.collection, answers: state.collection.kanaIds.map(kanaId => ({ kanaId, correct: 0, wrong: 0 })) });
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
        if (p === '/kana-wilds/collection') return json(respond());
        const win = p.match(/^\/kana-wilds\/challengers\/(\w+)\/wins$/);
        if (win) {
          sent.wins.push(win[1]);
          const isNew = !state.collection.beatenChallengers.includes(win[1]);
          if (isNew) state.collection = { ...state.collection, beatenChallengers: [...state.collection.beatenChallengers, win[1]] };
          return json({ ...respond(), isNew, reward: null });
        }
        if (p === '/activity/practice') { sent.practice.push(request.postDataJSON()); return json({}, 201); }
        if (p === '/quiz/answer') {
          const body = request.postDataJSON(), correctAnswer = state.romajiById[body.kanaId];
          return json({ correct: body.answer === correctAnswer, correctAnswer, type: 'hiragana' });
        }
        return json({});
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      return { context, page, errors, state, sent };
    };
    const fitsScreen = page => page.evaluate(() => document.scrollingElement.scrollHeight <= innerHeight + 1 && document.scrollingElement.scrollWidth <= innerWidth);
    const loadAnswers = async (page, state) => {
      const { words, kana } = await page.evaluate(async () => {
        const [{ COURSE_BATTLE_WORDS }, { BASIC_HIRAGANA }] = await Promise.all([import('/src/lib/kanaWilds/courseWords.ts'), import('/src/lib/kanaWilds/gojuon.ts')]);
        return { words: COURSE_BATTLE_WORDS, kana: BASIC_HIRAGANA };
      });
      for (const item of kana) state.romajiById[item.id] = item.romaji;
      return { wordByJapanese: new Map(words.map(word => [word.japanese, word])), kanaByCharacter: new Map(kana.map(item => [item.kana, item])) };
    };
    const arena = page => page.getByRole('region', { name: 'Challenge against Chun' });
    /** Holds a key until `isDone` (checked often) or the time runs out. */
    const holdUntil = async (page, key, isDone, ms = 12000) => {
      await page.keyboard.down(key);
      const deadline = Date.now() + ms;
      try { while (Date.now() < deadline) { if (await isDone()) return true; await page.waitForTimeout(40); } return false; }
      finally { await page.keyboard.up(key); }
    };
    const walkToChun = async page => {
      await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
      await page.getByRole('button', { name: /^Chun/ }).waitFor({ state: 'attached' });
      const nearChun = page.getByText('Chun is here. Press E to challenge them.');
      assert.ok(await holdUntil(page, 'ArrowRight', async () => Boolean(await nearChun.count())), 'walked up to Chun');
    };
    const wrongChoice = async (group, right) => {
      for (const button of await group.getByRole('button').all()) if ((await button.innerText()).trim() !== right) return button;
      throw new Error('no wrong choice');
    };

    /** Plays the challenge to its end, answering right (`isRight`) or always wrong; notes what the rounds showed. */
    const playChallenge = async (page, answers, { isRight, onRound }) => {
      const seen = { rounds: [], hpAtRoundStart: [] };
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        await page.waitForTimeout(50);
        await page.waitForFunction(() => !document.querySelector('section[data-animating="true"]'));
        if (await page.getByRole('heading', { name: /^You beat Chun!|Chun won this time/ }).count()) return seen;
        const status = await arena(page).getByRole('status').first().innerText().catch(() => '');
        const opening = status.match(/^Chun sends out (\S)! \(kana (\d) of 3\)$/);
        if (opening && !seen.rounds.includes(opening[1])) {
          seen.rounds.push(opening[1]);
          seen.hpAtRoundStart.push(Number((await page.locator('.kw-info--player').getByText(/^\d+ \/ 30$/).innerText()).split(' ')[0]));
          if (onRound) await onRound(seen);
        }
        const group = arena(page).getByRole('group').first();
        const prompt = (await group.count()) ? await group.innerText() : '';
        const next = arena(page).getByRole('button', { name: 'Next', exact: true });
        if (await next.count()) { await next.click(); continue; }
        if (prompt.startsWith('How do you read')) {
          const word = answers.wordByJapanese.get(prompt.match(/How do you read (\S+?)\?/)[1]);
          await (isRight ? group.getByRole('button', { name: word.romaji, exact: true }) : await wrongChoice(group, word.romaji)).click();
        } else if (prompt.startsWith('Right:')) {
          const word = answers.wordByJapanese.get(prompt.match(/^Right: (\S+) is/)[1]);
          await group.getByRole('button', { name: word.meaning, exact: true }).click();
        } else if (prompt.includes('attacks! Read it to block.')) {
          const attack = await group.locator('.kw-attack-card').getAttribute('aria-label');
          const attackKana = answers.kanaByCharacter.get(attack);
          const reading = attackKana ? attackKana.romaji : answers.wordByJapanese.get(attack).romaji;
          await (isRight ? group.getByRole('button', { name: reading, exact: true }) : await wrongChoice(group, reading)).click();
        } else if (prompt.startsWith('Your turn')) {
          await group.getByRole('listitem').first().getByRole('button').click();
        }
      }
      throw new Error('the challenge did not end');
    };

    // ---- no path waits on a challenger: all three are open on the map from the start
    let { context, page, errors, state, sent } = await run();
    await page.goto(base + '/');
    for (const name of ['The meadow path (のはら): a wild path to the Kana island', 'The riverside path (かわべ): a wild path to the Practice island', 'The forest path (もり): a wild path to the Games island']) {
      await page.getByRole('link', { name, exact: true }).waitFor();
    }

    // ---- Chun waits on the Kana island; E challenges; answering wrong loses, nothing is saved, and Chun can be challenged again
    await page.goto(base + '/islands/kana');
    const answers = await loadAnswers(page, state);
    await walkToChun(page);
    await page.screenshot({ path: path.join(shots, 'island-kana-chun.png') });
    await page.keyboard.press('KeyE');
    await arena(page).waitFor();
    await page.locator('.kw-info--enemy').getByText("Chun's あ").waitFor();
    assert.equal(await page.locator('.kw-enemy-card').getAttribute('aria-label'), "Chun's あ", 'a challenger\'s kana is in the open');
    assert.ok(await fitsScreen(page), 'the challenge fits one screen');
    await page.screenshot({ path: path.join(shots, 'challenge-start.png') });
    await playChallenge(page, answers, { isRight: false });
    await page.getByRole('heading', { name: 'Chun won this time' }).waitFor();
    assert.deepEqual(sent.wins, [], 'a loss saves nothing');
    await page.getByText(/My team is あ, こ, お/).waitFor();
    await page.screenshot({ path: path.join(shots, 'challenge-lost.png') });
    await page.getByRole('button', { name: 'Challenge Chun again' }).click();

    // ---- answered right, the three kana fall one after another, the HP carried over; the win is saved once
    const seen = await playChallenge(page, answers, { isRight: true });
    assert.deepEqual(seen.rounds, ['あ', 'こ', 'お'], 'Chun\'s team in order');
    assert.ok(seen.hpAtRoundStart.slice(1).every((hp, index) => hp <= seen.hpAtRoundStart[index]), 'no healing between rounds: ' + seen.hpAtRoundStart);
    await page.getByRole('heading', { name: 'You beat Chun!' }).waitFor();
    await page.getByText(/Come back for a rematch whenever you like/).waitFor();
    await page.getByRole('button', { name: 'Challenge Chun again' }).waitFor();
    assert.deepEqual(sent.wins, ['chun']);
    assert.ok(sent.practice.some(item => item.kind === 'battle' && item.answered >= 3), 'the challenge counts as practice');
    await page.screenshot({ path: path.join(shots, 'challenge-won.png') });
    await page.getByRole('button', { name: 'Back to the Kana island' }).click();
    await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Chun', exact: true }).waitFor({ state: 'attached' });

    // ---- Tama waits on the Practice island, and Pon on the Games island
    for (const [island, heading, challenger] of [['practice', 'The Practice island (れんしゅうのしま)', 'Tama'], ['games', 'The Games island (あそびのしま)', 'Pon']]) {
      await page.goto(base + '/islands/' + island);
      await page.getByRole('heading', { name: heading }).waitFor({ state: 'attached' });
      await page.getByRole('button', { name: `${challenger} (has something for you)` }).waitFor({ state: 'attached' });
      assert.ok(await fitsScreen(page), `the ${island} island fits one screen`);
      await page.screenshot({ path: path.join(shots, `island-${island}.png`) });
    }
    assert.deepEqual(errors, []); await context.close();

    // ---- a phone: the challenge fits one screen, and the touch button says Fight next to Chun
    ({ context, page, errors, state, sent } = await run({ viewport: { width: 390, height: 844 }, beatenChallengers: ['chun'], isTouch: true }));
    await page.goto(base + '/islands/kana');
    await walkToChun(page);
    await page.getByRole('button', { name: 'Fight' }).tap();
    await arena(page).getByRole('group').first().waitFor();
    assert.ok(await fitsScreen(page), 'the challenge fits a phone: ' + JSON.stringify(await page.evaluate(() => [document.scrollingElement.scrollHeight, innerHeight])));
    await page.screenshot({ path: path.join(shots, 'challenge-phone.png') });
    assert.deepEqual(errors, []); await context.close();

    console.log('PASS: challengers — every path open on the map; Chun walked up to on the Kana island and challenged with E; a lost challenge saves nothing and can be retried; Chun\'s three open kana in order with HP carried over; the win saved once, counted as practice, a rematch offered; Tama and Pon on their islands; one screen at 1366×768 and 390×844; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
