// Daily review (spaced repetition), the mistake notebook, the dashboard's Today panel, the study timer and the
// statistics overview, against a fixture API. Nothing is written for any real account.
//   node learning-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const HELLO = 'japanese-n5-unit-1-hello';
const MIN = 60_000, DAY = 24 * 60 * MIN;
const NEW_INTERVALS = { again: 10 * MIN, hard: DAY, good: DAY, easy: 3 * DAY };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ viewport = { width: 1366, height: 900 }, clock = false } = {}) => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('user_handle', 'mika'); localStorage.setItem('app_language', 'japanese'); }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
      const state = { enrolments: [], reviews: [], studyTime: [], practised: [], deleted: [], kanaAnswers: [], mistakes: [
        { id: 1, source: 'review', label: 'Unit 1 review', prompt: 'Which greeting fits the evening?', options: ['おはよう', 'こんばんは', 'こんにちは'], given: 'おはよう', answer: 'こんばんは', explanation: 'こんばんは is for the evening.', wrongCount: 2, correctStreak: 0, lastWrongAt: '2026-10-25T10:00:00Z', resolvedAt: null, isLocked: false },
        { id: 2, source: 'assessment', label: 'Unit 1 assessment', prompt: 'Choose a polite thank-you.', options: ['ありがとう', 'ありがとうございます'], given: 'ありがとう', wrongCount: 1, correctStreak: 0, lastWrongAt: '2026-10-25T09:00:00Z', resolvedAt: null, isLocked: true },
        { id: 3, source: 'lesson', label: 'How to Say Hello', prompt: 'Say hello in the afternoon.', options: ['こんにちは', 'さようなら'], given: 'さようなら', answer: 'こんにちは', wrongCount: 1, correctStreak: 1, lastWrongAt: '2026-10-24T09:00:00Z', resolvedAt: null, isLocked: false },
      ] };
      const lesson = (id, completed) => ({ id, slug: id.replace('japanese-', ''), title: id, description: '', isPlaceholder: false, allowed: true, reasons: [], completed });
      await context.route('http://localhost:5000/api/**', route => {
        const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method(), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/units') return json({ units: [{ id: 'japanese-n5-unit-1', number: 1, title: 'Greetings', description: '', requiredLevel: 1, allowed: true, reasons: [], completedLessons: 1, totalLessons: 6, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 10, passPercent: 80, lessons: [lesson(HELLO, true), lesson('japanese-n5-unit-1-introductions', false)] }] });
        if (p === '/profile/me') return json({ username: 'mika', display_name: 'Mika', level: 1, rank: 'Beginner', xp: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 }, current_streak: 2, longest_streak: 2, active_today: true, achievements_count: 0, daily_goal: 10 });
        if (p === '/srs/cards') { state.enrolments.push(request.postDataJSON().items); return json({ added: request.postDataJSON().items.length, ignored: 0 }); }
        if (p === '/srs/summary') return json({ total: 30, newCards: 20, dueNow: 1, dueToday: 1, learned: 10, mature: 2, reviewedToday: 0, newToday: 2, dueTotal: 3 });
        if (p === '/srs/queue') return json({ newLimit: 5, cards: [
          { itemType: 'vocabulary', itemId: HELLO + ':こんにちは', isNew: false, repetitions: 2, lapses: 1, intervals: { again: 10 * MIN, hard: 4 * DAY, good: 8 * DAY, easy: 10 * DAY } },
          { itemType: 'vocabulary', itemId: HELLO + ':no-longer-in-the-course', isNew: true, repetitions: 0, lapses: 0, intervals: NEW_INTERVALS },
          { itemType: 'kanji', itemId: 'kanji-65e5', isNew: true, repetitions: 0, lapses: 0, intervals: NEW_INTERVALS },
        ] });
        if (p === '/srs/reviews') { const body = request.postDataJSON(); state.reviews.push(body);
          // +2 XP per card; the third card also brings a level and an achievement (the "+XP" pop-up adds them up).
          const isThird = state.reviews.length === 3;
          const reward = { xpEarned: 2, xp: 248 + state.reviews.length * 2, level: isThird ? 3 : 2, leveledUp: isThird, rank: 'Bronze', rankedUp: false, unlocked: isThird ? [{ id: 'reviews_100', title: 'Review Rookie', icon: '🃏' }] : [] };
          return json({ reward, itemType: body.itemType, itemId: body.itemId, dueAt: new Date().toISOString(), intervalDays: body.grade === 'again' ? 0 : 1, intervals: { again: 10 * MIN, hard: DAY, good: DAY, easy: 3 * DAY } }); }
        if (p === '/activity/today') return json({ secondsToday: 240, minutesToday: 4, goalMinutes: 10, isGoalMet: false });
        if (p === '/activity/study-time') { state.studyTime.push(request.postDataJSON().seconds); return json({ secondsToday: 300, minutesToday: 5, goalMinutes: 10, isGoalMet: false }); }
        // Weak characters: あ (50%), カ (82%, mastered) and the kanji 日 (40%); kana answers are graded as the API would.
        if (p === '/mistakes/weak-characters') return json({ weakBelowPercent: 85, kana: [
          { script: 'hiragana', id: 1, kana: 'あ', romaji: 'a', correctCount: 2, wrongCount: 2, total: 4, accuracy: 50, status: 'learning' },
          { script: 'katakana', id: 6, kana: 'カ', romaji: 'ka', correctCount: 41, wrongCount: 9, total: 50, accuracy: 82, status: 'mastered' }],
          kanji: [{ kanjiId: 'kanji-65e5', character: '日', meaning: 'day', correctCount: 2, wrongCount: 3, total: 5, accuracy: 40, status: 'learning' }] });
        if (p === '/quiz/answer') { const body = request.postDataJSON(); state.kanaAnswers.push(body); const right = body.kanaId === 1 ? 'a' : 'ka';
          return json({ correct: body.answer === right, correctAnswer: right, type: body.type }); }
        if (p === '/mistakes' && method === 'GET') {
          const open = state.mistakes.filter(m => !m.resolvedAt), resolved = state.mistakes.filter(m => m.resolvedAt);
          const bySource = { lesson: 0, review: 0, assessment: 0, mock_exam: 0, kana: 0, kanji: 0 }; for (const m of open) bySource[m.source]++;
          return json({ mistakes: url.searchParams.get('status') === 'resolved' ? resolved : open, counts: { open: open.length, resolved: resolved.length, bySource }, correctInARowToResolve: 2 });
        }
        const practice = p.match(/^\/mistakes\/(\d+)\/practice$/);
        if (practice) { const m = state.mistakes.find(x => x.id === Number(practice[1])); const { correct } = request.postDataJSON(); state.practised.push({ id: m.id, correct });
          m.correctStreak = correct ? m.correctStreak + 1 : 0; if (m.correctStreak >= 2) m.resolvedAt = '2026-10-26T10:00:00Z';
          return json({ id: m.id, correctStreak: m.correctStreak, wrongCount: m.wrongCount, isResolved: Boolean(m.resolvedAt) }); }
        const remove = p.match(/^\/mistakes\/(\d+)$/);
        if (remove && method === 'DELETE') { state.deleted.push(Number(remove[1])); state.mistakes = state.mistakes.filter(m => m.id !== Number(remove[1])); return json({ deleted: true }); }
        if (p === '/statistics/overview') return json({
          studyTime: { days: Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(13 + i).padStart(2, '0')}`, seconds: i * 90 })), goalMinutes: 10, totalSeconds: 8190, daysGoalMet: 4 },
          lessons: { completed: 7, weeks: Array.from({ length: 8 }, (_, i) => ({ week: `2026-09-${String(7 + i * 3).padStart(2, '0')}`, lessons: i % 3, averageScore: null })) },
          assessments: [{ unitId: 'japanese-n5-unit-1', level: 'N5', number: 1, title: 'Greetings & Introductions', bestScore: 90, isPassed: true }],
          kanji: { total: 137, mastered: 5, learning: 7, untested: 125 },
          srs: { total: 30, newCards: 20, dueNow: 1, dueToday: 1, learned: 10, mature: 2, reviewedToday: 0, newToday: 2, dueTotal: 3, days: [{ day: '2026-10-26', reviews: 8, remembered: 6 }] },
          mistakes: { open: 3, resolved: 4, bySource: { lesson: 1, review: 1, assessment: 1, mock_exam: 0 } },
          mockExams: [{ id: 1, level: 'N5', correct: 30, total: 36, percent: 83, passed: true, timedOut: false, sections: [], createdAt: '2026-10-20T10:00:00Z' }],
          practice: [{ kind: 'listening', sessions: 3, answered: 30, correct: 24 }], speaking: [] });
        if (p === '/statistics') return json({ totalCorrect: 0, totalWrong: 0, totalAnswers: 0, accuracy: 0, hiragana: { totalCorrect: 0, totalWrong: 0, totalAnswers: 0, accuracy: 0, characters: [] }, katakana: { totalCorrect: 0, totalWrong: 0, totalAnswers: 0, accuracy: 0, characters: [] }, english: null });
        if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        return json({});
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      if (clock) await page.clock.install({ time: new Date('2026-10-26T09:00:00') });
      return { context, page, state, errors };
    };
    const noOverflow = async (page, label) => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), label + ' overflows');

    // ---- Dashboard: today's reviews, goal and mistakes; the deck gets the completed lesson's words, once
    let { context, page, state, errors } = await run();
    await page.goto(base + '/');
    const today = page.locator('section[aria-labelledby="today-goals-heading"]');
    await today.getByText('3 due today').waitFor(); await today.getByText('1 to review · 2 new').waitFor();
    await today.getByText('4 / 10 min').waitFor(); await today.getByText('About 6 more minutes of lessons or practice.').waitFor();
    await today.getByText('3 to practise').waitFor();
    assert.equal(state.enrolments.length, 1);
    const enrolled = state.enrolments[0];
    assert.ok(enrolled.some(i => i.itemType === 'vocabulary' && i.itemId === HELLO + ':こんにちは'));
    assert.ok(enrolled.every(i => i.itemType === 'vocabulary' && i.itemId.startsWith(HELLO + ':')), 'only the completed lesson');
    await page.screenshot({ path: shots + '/learning-dashboard.png' });
    await page.reload(); await today.getByText('3 due today').waitFor(); assert.equal(state.enrolments.length, 1, 'not sent again while nothing changed');
    await page.getByRole('link', { name: /Daily review/ }).first().click(); await page.waitForURL('**/srs');

    // ---- Daily review: reveal, grade with keys and buttons; "Again" brings the card back; unknown items skipped
    await page.getByRole('heading', { name: 'Daily review' }).waitFor();
    const reviewCard = page.locator('section[aria-label="Review card"]');
    await reviewCard.getByText('こんにちは', { exact: true }).waitFor(); await reviewCard.getByText('2 cards left · 0 reviewed').waitFor(); await reviewCard.getByText('Forgotten 1×').waitFor();
    assert.equal(await reviewCard.getByText('Hello / Good afternoon').count(), 0, 'answer hidden first');
    await page.keyboard.press('Space'); await reviewCard.getByText('Hello / Good afternoon').waitFor(); await reviewCard.getByText('Konnichiwa').waitFor();
    assert.deepEqual(await reviewCard.getByRole('group').getByRole('button').evaluateAll(b => b.map(x => x.innerText.replace(/\s+/g, ' ').trim())),
      ['Again Forgot it in 10 min · key 1', 'Hard Remembered with effort in 4 d · key 2', 'Good Remembered in 8 d · key 3', 'Easy Knew it at once in 10 d · key 4']);
    await page.screenshot({ path: shots + '/srs-revealed.png' });
    await page.keyboard.press('3');
    await reviewCard.getByText('日', { exact: true }).waitFor(); await reviewCard.getByText('New', { exact: true }).waitFor(); await reviewCard.getByText('Kanji', { exact: false }).first().waitFor();
    await reviewCard.getByRole('button', { name: /Show answer/ }).click(); await reviewCard.getByText(/^day, sun, Japan/).waitFor(); await reviewCard.getByText(/On: ニチ/).waitFor();
    await reviewCard.getByRole('button', { name: /^Again/ }).click();
    await reviewCard.getByText('1 card left · 2 reviewed').waitFor(); await reviewCard.getByText('日', { exact: true }).waitFor();
    await page.keyboard.press('Enter'); await reviewCard.getByRole('button', { name: /^Good.*in 1 d/ }).click();
    await page.getByRole('heading', { name: 'All done for today 🎉' }).waitFor(); await page.getByText('You reviewed 3 cards, and 1 will come back soon.').waitFor();
    // The "+XP" pop-up: three quick rewards add up into one, with the level and the achievement; it can be dismissed.
    const toast = page.getByRole('status').filter({ hasText: 'XP' });
    await toast.getByText('+6 XP').waitFor(); await toast.getByText('Level 3!').waitFor();
    await toast.getByText('Review Rookie').waitFor();
    assert.equal(await toast.getByRole('link', { name: 'See achievements →' }).getAttribute('href'), '/achievements');
    await page.screenshot({ path: shots + '/xp-toast.png' });
    await toast.getByRole('button', { name: 'Dismiss' }).click(); await toast.getByText('+6 XP').waitFor({ state: 'detached' });
    assert.deepEqual(state.reviews, [
      { itemType: 'vocabulary', itemId: HELLO + ':こんにちは', grade: 'good' }, { itemType: 'kanji', itemId: 'kanji-65e5', grade: 'again' }, { itemType: 'kanji', itemId: 'kanji-65e5', grade: 'good' }]);
    assert.deepEqual(errors, []); await context.close();

    // ---- Mistake notebook: locked assessment answers, filters, practice, remove
    ({ context, page, state, errors } = await run());
    await page.goto(base + '/mistakes'); await page.getByRole('heading', { name: 'Mistake notebook' }).waitFor();
    await page.getByRole('tab', { name: 'To practise (3)' }).waitFor();
    const locked = page.getByRole('article', { name: 'Mistake: Choose a polite thank-you.' });
    await locked.getByText(/The right answer appears once you pass this assessment/).waitFor();
    assert.equal(await locked.getByText(/Right answer/).count(), 0);
    const reviewMistake = page.getByRole('article', { name: 'Mistake: Which greeting fits the evening?' });
    await reviewMistake.getByText('✗ Your answer: おはよう').waitFor(); await reviewMistake.getByText('✓ Right answer: こんばんは').waitFor(); await reviewMistake.getByText('Wrong 2× · 0 of 2 right in a row').waitFor();
    await page.getByRole('button', { name: 'Assessments · 1' }).click(); assert.equal(await page.getByRole('article').count(), 1);
    assert.equal(await page.getByRole('button', { name: /^Practise/ }).count(), 0, 'nothing practisable among locked mistakes');
    await page.getByRole('button', { name: 'All · 3' }).click();
    await page.screenshot({ path: shots + '/mistakes.png', fullPage: true });
    await page.getByRole('button', { name: 'Practise 2 questions →' }).click();
    const practice = page.locator('section[aria-label="Practice question"]');
    for (let i = 0; i < 2; i++) {
      const prompt = await practice.locator('p[lang="ja"]').first().innerText();
      const right = prompt.includes('evening') ? 'こんばんは' : 'こんにちは';
      await practice.getByRole('button', { name: right, exact: true }).click();
      await practice.getByRole('status').waitFor();
      await practice.getByRole('button', { name: i ? 'Finish' : 'Next question →' }).click();
    }
    await page.getByRole('heading', { name: 'Practice finished' }).waitFor(); await page.getByText('1 mistake cleared.').waitFor();
    assert.deepEqual(state.practised.map(x => x.correct), [true, true]);
    await page.getByRole('button', { name: 'Back to the notebook' }).click();
    await page.getByRole('tab', { name: 'To practise (2)' }).waitFor();
    await page.getByRole('tab', { name: 'Cleared (1)' }).click(); await page.getByText(/^Cleared \d/).waitFor();
    await page.getByRole('tab', { name: 'To practise (2)' }).click();
    const card = page.getByRole('article', { name: 'Mistake: Which greeting fits the evening?' });
    await card.getByRole('button', { name: 'Remove' }).click(); await card.getByRole('button', { name: 'Keep it' }).click(); assert.deepEqual(state.deleted, []);
    await card.getByRole('button', { name: 'Remove' }).click(); await card.getByRole('button', { name: 'Yes, remove' }).click();
    await card.waitFor({ state: 'detached' }); assert.deepEqual(state.deleted, [1]);
    // Nothing practisable is left once the last unlocked one is removed.
    await page.getByRole('button', { name: 'Practise 0 questions →' }).waitFor({ state: 'detached' });

    // ---- Weak characters: kana and kanji under 85%, mastered ones marked; kana drilled here, kanji link to practice
    await page.getByRole('tab', { name: 'Weak characters (3)' }).click();
    const weakKana = page.getByRole('region', { name: 'Kana (2)' });
    assert.deepEqual((await weakKana.locator('li').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()), ['あ Hiragana a, 50% · 2/4', 'カ Katakana ka, 82% · 41/50 mastered']);
    const kanjiLink = page.getByRole('link', { name: 'Practise 日 (day), 40% right' });
    assert.equal(await kanjiLink.getAttribute('href'), '/learn/kanji/practice?kanji=kanji-65e5');
    await page.screenshot({ path: shots + '/weak-characters.png', fullPage: true });
    await weakKana.getByRole('button', { name: 'Practise these kana →' }).click();
    const drill = page.locator('section[aria-label="Kana practice"]');
    for (let i = 0; i < 2; i++) {
      const shownKana = await drill.locator('p[lang="ja"]').innerText();
      // あ answered right, カ answered wrong; Enter submits.
      await page.getByLabel('Reading in romaji').fill(shownKana === 'あ' ? 'a' : 'ta'); await page.keyboard.press('Enter');
      await drill.getByRole('status').getByText(shownKana === 'あ' ? 'Right ✓' : 'Not quite: カ is “ka”').waitFor();
      await drill.getByRole('button', { name: i ? 'Finish' : 'Next kana →' }).click();
    }
    await page.getByRole('heading', { name: 'Practice finished' }).waitFor(); await page.getByText('1 of 2 right.', { exact: false }).waitFor();
    assert.deepEqual(state.kanaAnswers.map(a => [a.type, a.kanaId]).sort(), [['hiragana', 1], ['katakana', 6]]);
    assert.equal(new Set(state.kanaAnswers.map(a => a.submissionId)).size, 2, 'one submission id per kana');
    await page.getByRole('button', { name: 'Back to weak characters' }).click(); await weakKana.waitFor();
    assert.deepEqual(errors, []); await context.close();

    // ---- Study timer: counts on learning pages while active, not on the dashboard, not while idle
    ({ context, page, state, errors } = await run({ clock: true }));
    await page.goto(base + '/srs'); await page.getByRole('heading', { name: 'Daily review' }).waitFor();
    for (let s = 0; s < 6; s++) { await page.mouse.move(100 + s * 10, 200); await page.clock.runFor(10_000); }
    await page.clock.runFor(2_000);
    await page.waitForTimeout(300); assert.equal(state.studyTime.length, 1, 'one report after a minute'); assert.ok(state.studyTime[0] >= 58 && state.studyTime[0] <= 62, String(state.studyTime[0]));
    // Idle: after 90 s without input nothing more is counted.
    await page.clock.runFor(180_000); await page.waitForTimeout(300);
    const idleTotal = state.studyTime.slice(1).reduce((a, b) => a + b, 0); assert.ok(idleTotal <= 92, 'idle time not counted: ' + idleTotal);
    // The dashboard isn't study time.
    await page.goto(base + '/'); await page.locator('section[aria-labelledby="today-goals-heading"]').waitFor();
    const before = state.studyTime.length;
    for (let s = 0; s < 7; s++) { await page.mouse.move(100 + s * 10, 300); await page.clock.runFor(10_000); }
    await page.waitForTimeout(300);
    assert.equal(state.studyTime.slice(before).reduce((a, b) => a + b, 0), 0, 'nothing counted on the dashboard');
    await context.close();

    // ---- Statistics overview
    ({ context, page, state, errors } = await run());
    // Split into tabs, each at its own address; the old address opens Overview.
    const tabs = page.getByRole('navigation', { name: 'Statistics sections' });
    await page.goto(base + '/statistics/japanese'); await page.waitForURL('**/statistics/japanese/overview');
    await page.getByRole('heading', { name: 'Your learning' }).waitFor();
    await page.getByText('137 min').waitFor(); await page.getByText('Daily goal met on 4 days').waitFor();
    await page.getByRole('heading', { name: 'Minutes studied per day' }).waitFor();
    await page.getByRole('img', { name: /^Minutes studied per day: / }).waitFor();
    await page.locator('summary', { hasText: 'Show as a table' }).first().click(); await page.getByRole('cell', { name: '20', exact: true }).first().waitFor();
    assert.equal(await page.getByRole('heading', { name: 'Kana quizzes' }).count(), 0, 'kana is on its own tab');
    await page.screenshot({ path: shots + '/statistics-learning.png', fullPage: true });
    await tabs.getByRole('link', { name: 'Tests' }).click(); await page.waitForURL('**/statistics/japanese/tests');
    await page.getByText('N5 Unit 1 · Greetings & Introductions').waitFor(); await page.getByText('90%', { exact: true }).first().waitFor();
    await page.getByText(/^✓?Passed$/).first().waitFor();
    assert.equal(await tabs.getByRole('link', { name: 'Tests' }).getAttribute('aria-current'), 'page');
    await page.screenshot({ path: shots + '/statistics-tests.png', fullPage: true });
    await tabs.getByRole('link', { name: 'Practice' }).click();
    await page.getByText('8 reviews in 14 days, 75% remembered.').waitFor();
    await page.getByText('Listening · 3 sessions').waitFor(); await page.getByText('80% right').waitFor();
    await page.screenshot({ path: shots + '/statistics-practice.png', fullPage: true });
    await tabs.getByRole('link', { name: 'Kana' }).click(); await page.getByRole('heading', { name: 'Kana quizzes' }).waitFor();
    await page.goBack(); await page.getByText('Listening · 3 sessions').waitFor();
    await page.goto(base + '/statistics/japanese?type=katakana'); await page.waitForURL('**/statistics/japanese/kana?type=katakana');
    await page.getByRole('heading', { name: 'Kana quizzes' }).waitFor();
    assert.deepEqual(errors, []); await context.close();

    // ---- Phone width: no sideways scrolling
    ({ context, page, errors } = await run({ viewport: { width: 375, height: 812 } }));
    for (const [path, ready] of [['/', 'today-goals-heading'], ['/srs', null], ['/mistakes', null], ['/statistics/japanese', null]]) {
      await page.goto(base + path);
      if (ready) await page.locator(`section[aria-labelledby="${ready}"]`).waitFor(); else await page.getByRole('heading', { level: 1 }).first().waitFor();
      await page.waitForTimeout(400); await noOverflow(page, path);
    }
    await page.goto(base + '/srs'); await page.getByRole('button', { name: /Show answer/ }).click(); await noOverflow(page, '/srs revealed');
    await page.screenshot({ path: shots + '/srs-phone.png' });
    assert.deepEqual(errors, []); await context.close();
    console.log('PASS: dashboard Today panel (reviews due, goal minutes, mistakes) and one-time deck enrolment of the completed lesson; daily review reveals with Space/button, interval previews on grade buttons, keys and clicks grade, Again re-queues, unknown items skipped, finish screen; mistake notebook hides locked assessment answers, filters by source, practises and clears, removes with confirmation; study timer reports a minute on learning pages, ignores idle time and the dashboard; statistics overview with charts, table view and test results; no overflow at phone width; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 2000)); process.exitCode = 1; });
