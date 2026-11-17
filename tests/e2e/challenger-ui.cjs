// Challengers on the islands (docs/WORLD.md milestones 3–4): every path open on the map from the start; Chun on the
// Kana island, walked up to and challenged with E; a lost challenge (nothing saved, try again at once); a won challenge
// (three open kana in a row, HP carried over, the win saved, a rematch offered); each challenger's signature defence
// (Chun: look-alikes; Tama: the kana shouts, with a caption; Pon: the stroke reveal) and the hints after a loss
// ("You read ね as れ twice"); rewards (the riverside grass quiet until Chun is beaten, the stone path's rows held
// for Tama, Pon's skill Sharp Eyes, Sensei's word attacks and evolution); the challenge on one screen at 1366×768 and 390×844. Against a fixture API that grades
// kana answers like the server; speech is stubbed so the test knows what was shouted.
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
        window.__shouts = [];
        window.speechSynthesis.speak = utterance => { window.__shouts.push(utterance.text); setTimeout(() => utterance.onend?.(), 0); };
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
        const [{ EVERY_TILE_WORD }, { TILE_KANA }] = await Promise.all([import('/src/lib/kanaWilds/courseWords.ts'), import('/src/lib/kanaWilds/gojuon.ts')]);
        return { words: EVERY_TILE_WORD, kana: TILE_KANA };
      });
      for (const item of kana) state.romajiById[item.id] = item.romaji;
      return { wordByJapanese: new Map(words.map(word => [word.japanese, word])), kanaByCharacter: new Map(kana.map(item => [item.kana, item])) };
    };
    const arena = (page, name = 'Chun') => page.getByRole('region', { name: 'Challenge against ' + name });
    const MIXED_UP = new Set('ぬめねれわるろさちきはほけいりこにうらしつそんたなまもあおくへすむ');
    /** The traveller's feet, in tiles (`tilesAcross`: the map's width; an island's is 30, a path's 36). */
    const travellerAt = (page, tilesAcross = 30) => page.evaluate(across => {
      const world = document.querySelector('.village-world'), me = document.querySelector('div.village-person'), tile = world.offsetWidth / across;
      return { x: (parseFloat(me.style.left) + me.offsetWidth / 2) / tile, y: (parseFloat(me.style.top) + me.offsetHeight) / tile };
    }, tilesAcross);
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
    const wrongChoice = async (group, right, buttons = group.getByRole('button')) => {
      for (const button of await buttons.all()) if ((await button.innerText()).trim() !== right) return button;
      throw new Error('no wrong choice');
    };

    /** Plays the challenge to its end, answering right (`isRight`) or always wrong; notes what the rounds showed. */
    const playChallenge = async (page, answers, { isRight, onRound, name = 'Chun', onDefence }) => {
      const seen = { rounds: [], hpAtRoundStart: [], attacks: [], choices: [], prompts: new Set(), notes: new Set(), statuses: new Set() };
      const over = new RegExp(`^You beat ${name}!|${name} won this time`);
      for (let turn = 0; turn < MAX_TURNS; turn++) {
        await page.waitForTimeout(50);
        await page.waitForFunction(() => !document.querySelector('section[data-animating="true"]'));
        if (await page.getByRole('heading', { name: over }).count()) return seen;
        const status = await arena(page, name).getByRole('status').first().innerText().catch(() => '');
        seen.statuses.add(status);
        const opening = status.match(new RegExp(`^${name} sends out (\\S)! \\(kana (\\d) of 3\\)$`));
        if (opening && !seen.rounds.includes(opening[1])) {
          seen.rounds.push(opening[1]);
          seen.hpAtRoundStart.push(Number((await page.locator('.kw-info--player').getByText(/^\d+ \/ 30$/).innerText()).split(' ')[0]));
          if (onRound) await onRound(seen);
        }
        const group = arena(page, name).getByRole('group').first();
        const prompt = (await group.count()) ? await group.innerText() : '';
        const next = arena(page, name).getByRole('button', { name: 'Next', exact: true });
        if (await next.count()) { await next.click(); continue; }
        if (prompt.startsWith('How do you read')) {
          const word = answers.wordByJapanese.get(prompt.match(/How do you read (\S+?)\?/)[1]);
          await (isRight ? group.getByRole('button', { name: word.romaji, exact: true }) : await wrongChoice(group, word.romaji)).click();
        } else if (prompt.startsWith('Right:')) {
          const word = answers.wordByJapanese.get(prompt.match(/^Right: (\S+) is/)[1]);
          await group.getByRole('button', { name: word.meaning, exact: true }).click();
        } else if (prompt.includes('shouts!')) {
          const shouted = await page.evaluate(() => window.__shouts.at(-1));
          seen.prompts.add(prompt.split('\n')[0]); seen.attacks.push(shouted);
          const kanaButtons = group.locator('button[lang="ja"]');
          seen.choices.push(...(await kanaButtons.allInnerTexts()).map(text => text.trim()));
          if (onDefence) await onDefence(group, seen);
          await (isRight ? group.getByRole('button', { name: shouted, exact: true }) : await wrongChoice(group, shouted, kanaButtons)).click();
        } else if (await group.locator('.kw-attack-card').count()) {
          const attack = await group.locator('.kw-attack-card').getAttribute('aria-label');
          const attackKana = answers.kanaByCharacter.get(attack);
          const reading = attackKana ? attackKana.romaji : answers.wordByJapanese.get(attack).romaji;
          seen.prompts.add(prompt.split('\n')[0]); seen.attacks.push(attack);
          if (attackKana) seen.choices.push(...(await group.getByRole('button').allInnerTexts()).map(text => text.trim()));
          if (onDefence) await onDefence(group, seen);
          seen.notes.add(await group.locator('p.text-xs').innerText());
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
    for (const name of ['The meadow path (のはら): a wild path to the Kana island', 'The riverside path (かわべ): a wild path to the Practice island', 'The forest path (もり): a wild path to the Games island', 'The stone path (いしみち): a wild path to the Lessons island']) {
      await page.getByRole('link', { name, exact: true }).waitFor();
    }

    // ---- rows held back: the riverside grass is quiet until Chun is beaten (walking through it starts no battle), and
    // the stone path's rows wait on Tama while the forest keeps its own
    await page.goto(base + '/wilds/home-practice');
    await page.getByText('The riverside path: the grass is quiet. Beat Chun to bring the さ and た rows here.').waitFor();
    await page.getByText(/^Walk: WASD or arrow keys/).waitFor(); // the path takes keys once the collection is in
    // The riverside path runs west from the village: from its east end across the grass band (columns 9–10).
    assert.ok(await holdUntil(page, 'ArrowLeft', async () => (await travellerAt(page, 36)).x <= 8), 'walked across the riverside grass');
    assert.equal(await page.getByRole('region', { name: 'Battle against a wild kana' }).count(), 0, 'quiet grass starts no battle');
    await page.screenshot({ path: path.join(shots, 'riverside-quiet.png') });
    await page.goto(base + '/wilds/home-games');
    await page.getByText('The forest path: wild kana in the tall grass', { exact: true }).waitFor();
    await page.goto(base + '/wilds/home-lessons');
    await page.getByText('The stone path: the grass is quiet. Beat Tama to bring the ま, や, ら, わ and ん rows here.').waitFor();
    await page.screenshot({ path: path.join(shots, 'stone-path-quiet.png') });

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
    const lostToChun = await playChallenge(page, answers, { isRight: false });
    await page.getByRole('heading', { name: 'Chun won this time' }).waitFor();
    assert.deepEqual(sent.wins, [], 'a loss saves nothing');
    await page.getByText(/My team is あ, こ, お/).waitFor();
    // Chun's signature: every attack is the kana or its look-alike, and every choice is a kana learners mix up.
    assert.deepEqual([...lostToChun.prompts], ['A look-alike attack! Read it carefully to block.']);
    assert.ok(lostToChun.attacks.every(attack => 'あおこに'.includes(attack)), 'look-alike attacks: ' + lostToChun.attacks);
    const romajiOf = new Map([...answers.kanaByCharacter.values()].map(item => [item.romaji, item.kana]));
    assert.ok(lostToChun.choices.every(romaji => MIXED_UP.has(romajiOf.get(romaji))), 'look-alike choices: ' + lostToChun.choices);
    // The hint names the kana read wrong, and how often.
    const chunHints = await page.getByRole('list', { name: 'What tripped you up' }).getByRole('listitem').allInnerTexts();
    assert.ok(chunHints.length >= 1 && chunHints.every(hint => /^You read [あおこに] as \S (once|twice|\d+ times)\.$/.test(hint)), 'hints: ' + chunHints);
    await page.screenshot({ path: path.join(shots, 'challenge-lost.png') });
    await page.getByRole('button', { name: 'Challenge Chun again' }).click();

    // ---- answered right, the three kana fall one after another, the HP carried over; the win is saved once
    const seen = await playChallenge(page, answers, { isRight: true });
    assert.deepEqual(seen.rounds, ['あ', 'こ', 'お'], 'Chun\'s team in order');
    assert.ok(seen.hpAtRoundStart.slice(1).every((hp, index) => hp <= seen.hpAtRoundStart[index]), 'no healing between rounds: ' + seen.hpAtRoundStart);
    await page.getByRole('heading', { name: 'You beat Chun!' }).waitFor();
    await page.getByText(/Come back for a rematch whenever you like/).waitFor();
    assert.equal(await page.getByRole('list', { name: 'What tripped you up' }).count(), 0, 'no hints after a win');
    await page.getByText('The さ and た rows now live in the tall grass of the riverside path.').waitFor();
    await page.getByRole('button', { name: 'Challenge Chun again' }).waitFor();
    assert.deepEqual(sent.wins, ['chun']);
    assert.ok(sent.practice.some(item => item.kind === 'battle' && item.answered >= 3), 'the challenge counts as practice');
    await page.screenshot({ path: path.join(shots, 'challenge-won.png') });
    await page.getByRole('button', { name: 'Back to the Kana island' }).click();
    await page.getByRole('heading', { name: 'The Kana island (かなのしま)' }).waitFor({ state: 'attached' });
    await page.getByRole('button', { name: 'Chun', exact: true }).waitFor({ state: 'attached' });

    // ---- with Chun beaten, the riverside grass holds wild kana
    await page.goto(base + '/wilds/home-practice');
    await page.getByText('The riverside path: wild kana in the tall grass', { exact: true }).waitFor();

    // ---- Tama waits on the Practice island, and Pon on the Games island
    for (const [island, heading, challenger] of [['practice', 'The Practice island (れんしゅうのしま)', 'Tama'], ['games', 'The Games island (あそびのしま)', 'Pon']]) {
      await page.goto(base + '/islands/' + island);
      await page.getByRole('heading', { name: heading }).waitFor({ state: 'attached' });
      await page.getByRole('button', { name: `${challenger} (has something for you)` }).waitFor({ state: 'attached' });
      assert.ok(await fitsScreen(page), `the ${island} island fits one screen`);
      await page.screenshot({ path: path.join(shots, `island-${island}.png`) });
    }
    assert.deepEqual(errors, []); await context.close();

    // ---- Tama's kana shout: pick the kana heard (a caption shows the sound); the hint says what it was heard as
    ({ context, page, errors, state, sent } = await run());
    await page.goto(base + '/islands/practice');
    const practiceAnswers = await loadAnswers(page, state);
    await page.getByRole('heading', { name: 'The Practice island (れんしゅうのしま)' }).waitFor({ state: 'attached' });
    // In over the east bridge, west along the road to Tama's column, then down beside her.
    assert.ok(await holdUntil(page, 'ArrowLeft', async () => (await travellerAt(page)).x <= 7.8), 'walked west toward Tama');
    assert.ok(await holdUntil(page, 'ArrowDown', async () => Boolean(await page.getByText('Tama is here. Press E to challenge them.').count())), 'walked up to Tama');
    await page.keyboard.press('KeyE');
    await arena(page, 'Tama').waitFor();
    let captioned = false;
    const lostToTama = await playChallenge(page, practiceAnswers, { isRight: false, name: 'Tama', onDefence: async group => {
      if (captioned) return;
      captioned = true;
      await group.getByRole('button', { name: 'Caption' }).click();
      const shouted = await page.evaluate(() => window.__shouts.at(-1));
      await group.getByText(`Shouted: “${practiceAnswers.kanaByCharacter.get(shouted).romaji}!”`).waitFor();
      await group.getByRole('button', { name: 'Hear it again' }).click();
      assert.equal(await page.evaluate(() => window.__shouts.at(-1)), shouted, 'heard again');
      await group.getByText('Heard again: a right pick still blocks.').waitFor();
      assert.ok(await fitsScreen(page), 'the shout fits one screen');
      await page.screenshot({ path: path.join(shots, 'challenge-tama-shout.png') });
    } });
    assert.deepEqual([...lostToTama.prompts], ['The kana shouts! Pick the one you heard.']);
    assert.ok(lostToTama.attacks.length >= 1 && lostToTama.attacks.every(attack => answers.kanaByCharacter.has(attack)), 'single kana shouted: ' + lostToTama.attacks);
    await page.getByRole('heading', { name: 'Tama won this time' }).waitFor();
    await page.getByText(/Listen to the whole sound/).waitFor();
    const tamaHints = await page.getByRole('list', { name: 'What tripped you up' }).getByRole('listitem').allInnerTexts();
    assert.ok(tamaHints.length >= 1 && tamaHints.every(hint => /^You heard \S as \S (once|twice|\d+ times)\.$/.test(hint)), 'hints: ' + tamaHints);
    await page.screenshot({ path: path.join(shots, 'challenge-tama-lost.png') });
    assert.deepEqual(errors, []); await context.close();

    // ---- Pon's stroke reveal: a slow drawing, perfect before half its strokes, a partial block after
    ({ context, page, errors, state, sent } = await run());
    await page.goto(base + '/islands/games');
    const gamesAnswers = await loadAnswers(page, state);
    await page.getByRole('heading', { name: 'The Games island (あそびのしま)' }).waitFor({ state: 'attached' });
    // In over the north bridge: west of the goldfish pond, down to Pon's row, then east to Pon.
    assert.ok(await holdUntil(page, 'ArrowLeft', async () => (await travellerAt(page)).x <= 11.5), 'walked west of the pond');
    assert.ok(await holdUntil(page, 'ArrowDown', async () => (await travellerAt(page)).y >= 9.4), 'walked down to Pon\'s row');
    assert.ok(await holdUntil(page, 'ArrowRight', async () => Boolean(await page.getByText('Pon is here. Press E to challenge them.').count())), 'walked up to Pon');
    await page.keyboard.press('KeyE');
    await arena(page, 'Pon').waitFor();
    let waited = false;
    const lostToPon = await playChallenge(page, gamesAnswers, { isRight: false, name: 'Pon', onDefence: async group => {
      if (waited) return;
      waited = true;
      // A two-stroke kana is past half after one stroke (900 ms), so the test may first see the second note.
      await group.getByText(/^(Read it now for a perfect block!|A good block now: a quarter of the hit gets through\.)$/).waitFor();
      await page.screenshot({ path: path.join(shots, 'challenge-pon-reveal.png') });
      await group.getByText('All drawn: reading it now still lets half the hit through.').waitFor({ timeout: 8000 });
    } });
    assert.deepEqual([...lostToPon.prompts], ['A stroke reveal! The earlier you read it, the better the block.']);
    await page.getByRole('heading', { name: 'Pon won this time' }).waitFor();
    await page.getByRole('button', { name: 'Challenge Pon again' }).click();
    // Read right once it is all drawn: the block grazes, taking half the hit.
    let grazed = false;
    await playChallenge(page, gamesAnswers, { isRight: true, name: 'Pon', onDefence: async group => {
      if (grazed) return;
      grazed = true;
      await group.getByText('All drawn: reading it now still lets half the hit through.').waitFor({ timeout: 8000 });
    } }).then(seenPon => assert.ok([...seenPon.statuses].some(text => text.includes('Read once it was drawn, it grazed you.')), 'a graze: ' + [...seenPon.statuses]));
    await page.getByRole('heading', { name: 'You beat Pon!' }).waitFor();
    await page.getByText('You learned Sharp Eyes: wild kana show how many strokes they have from the start.').waitFor();
    await page.screenshot({ path: path.join(shots, 'challenge-pon-won.png') });
    assert.deepEqual(errors, []); await context.close();

    // ---- Sensei on the Lessons island: word attacks with voiced kana; the win opens evolution
    ({ context, page, errors, state, sent } = await run({ beatenChallengers: ['chun', 'tama', 'pon'] }));
    await page.goto(base + '/islands/lessons');
    const lessonsAnswers = await loadAnswers(page, state);
    await page.getByRole('heading', { name: 'The Lessons island (まなびのしま)' }).waitFor({ state: 'attached' });
    await page.screenshot({ path: path.join(shots, 'island-lessons.png') });
    // In over the south bridge: up the stepping stones toward the pagoda, then east to Sensei beside them.
    assert.ok(await holdUntil(page, 'ArrowUp', async () => (await travellerAt(page)).y <= 8.6), 'walked up the approach');
    assert.ok(await holdUntil(page, 'ArrowRight', async () => Boolean(await page.getByText('Sensei is here. Press E to challenge them.').count())), 'walked up to Sensei');
    await page.keyboard.press('KeyE');
    await arena(page, 'Sensei').waitFor();
    let isWordShot = false;
    const beatSensei = await playChallenge(page, lessonsAnswers, { isRight: true, name: 'Sensei', onDefence: async () => {
      if (isWordShot) return;
      isWordShot = true;
      await page.screenshot({ path: path.join(shots, 'challenge-sensei-word.png') });
    } });
    assert.deepEqual(beatSensei.rounds, ['が', 'だ', 'ば']);
    assert.ok(beatSensei.prompts.has('A word attack! Read the whole word to block.'), 'word attacks: ' + [...beatSensei.prompts]);
    assert.ok(beatSensei.attacks.every(attack => [...attack].length > 1 && /[がだば]/.test(attack)), 'each attack a word with the kana in it: ' + beatSensei.attacks);
    await page.getByRole('heading', { name: 'You beat Sensei!' }).waitFor();
    await page.getByText(/^Your kana can evolve now/).waitFor();
    assert.ok(await fitsScreen(page), 'the result fits one screen');
    await page.screenshot({ path: path.join(shots, 'challenge-sensei-won.png') });
    assert.deepEqual(sent.wins, ['sensei']);
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

    console.log('PASS: challengers — every path open on the map; Chun walked up to on the Kana island and challenged with E; a lost challenge saves nothing and can be retried; Chun\'s three open kana in order with HP carried over; the win saved once, counted as practice, a rematch offered; Tama and Pon on their islands; signature defences (Chun’s look-alike attacks and choices, Tama’s shout with caption and hearing again, Pon’s slow stroke reveal with a graze when read late); hints after a loss name each mix-up and how often, none after a win; the riverside grass quiet (no battle) until Chun is beaten and the stone path’s rows waiting on Tama, each win naming its reward (rows, Pon’s skill Sharp Eyes); Sensei walked up to on the Lessons island, attacking with words holding が, だ and ば, the win opening evolution; one screen at 1366×768 and 390×844; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
