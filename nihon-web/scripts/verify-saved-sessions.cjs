// Browser regression with fixture APIs; never writes real users' learning data.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:5181';
const key = 'learning-session-v1:1';
const token = id => `test.${Buffer.from(JSON.stringify({ userId: id })).toString('base64url')}.fixture`;
const characters = ['あ','い','う','え','お','か','き','く','け','こ'].map((kana, i) => ({ id: i + 1, kana, romaji: ['a','i','u','e','o','ka','ki','ku','ke','ko'][i], correctCount: 0, wrongCount: 0, total: 0, accuracy: 0, status: 'untested' }));
async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    let page = await context.newPage();
    const errors = [], submissions = [], receipts = new Map();
    let loseAnswer = false;
    context.on('page', p => p.on('pageerror', e => errors.push(e.message)));
    page.on('pageerror', e => errors.push(e.message));
    await context.addInitScript(t => { if (location.protocol !== 'http:') return; if (!localStorage.getItem('token')) localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); }, token(1));
    const assessment = { assessmentId: 'unit-1', unitNumber: 1, title: 'Unit 1 Assessment', passPercent: 80, questions: Array.from({ length: 15 }, (_, i) => ({ id: `q${i}`, prompt: `Assessment question ${i + 1}`, options: ['One','Two','Three','Four'] })) };
    await context.route('http://localhost:5000/api/**', async route => {
      const request = route.request(), url = new URL(request.url()), body = request.postDataJSON();
      let data = {};
      if (url.pathname.endsWith('/statistics')) data = { hiragana: { characters }, katakana: { characters: characters.map(c => ({ ...c, kana: String.fromCharCode(c.kana.charCodeAt(0) + 0x60) })) } };
      else if (url.pathname.endsWith('/quiz/characters')) data = { characters };
      else if (url.pathname.endsWith('/quiz/answer')) {
        submissions.push(body);
        if (!receipts.has(body.submissionId)) receipts.set(body.submissionId, { correct: body.answer === characters.find(c => c.id === body.kanaId).romaji, correctAnswer: characters.find(c => c.id === body.kanaId).romaji });
        data = receipts.get(body.submissionId);
        if (loseAnswer) { loseAnswer = false; return route.abort(); }
      } else if (url.pathname.endsWith('/kanji/practice')) data = { questions: Array.from({ length: body.size }, (_, i) => ({ id: `kanji-${i}`, kanjiId: 'kanji-65e5', character: '日', display: '日', kind: 'meaning', prompt: `Meaning ${i + 1}`, options: ['day','water','person','study'] })) };
      else if (url.pathname.endsWith('/kanji/answer')) data = { correct: true, correctAnswer: 'day', progress: { kanjiId: 'kanji-65e5', correctCount: 1, wrongCount: 0, total: 1, accuracy: 100, status: 'learning' } };
      else if (url.pathname.endsWith('/assessment')) data = request.method() === 'GET' ? assessment : { correct: 15, total: 15, wrong: 0, accuracy: 100, passed: true, passPercent: 80, unitCompleted: true };
      else if (url.pathname.endsWith('/units')) data = { units: [] };
      else if (url.pathname.endsWith('/profile/me')) data = { display_name: 'Test', username: 'test', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 } };
      return route.fulfill({ json: data });
    });
    const saved = () => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
    const fresh = async url => { await page.goto(base); await page.evaluate(k => localStorage.removeItem(k), key); await page.goto(base + url); };
    const resumeDashboard = async () => {
      const before = await saved(); await page.goto(base);
      await page.getByRole('link', { name: 'Resume session →', exact: true }).waitFor();
      assert.equal(await page.locator('#next-heading').textContent(), before.title);
      await page.getByRole('link', { name: 'Resume session →', exact: true }).click();
      return before;
    };
    // Both Review scripts preserve the randomized deck, answer receipts and index.
    for (const script of ['hiragana','katakana']) {
      await fresh(`/review/${script}`);
      await page.getByRole('button', { name: '5', exact: true }).click({ timeout: 10000 }).catch(async error => { console.error(page.url(), await page.locator('body').innerText(), errors); throw error; });
      await page.getByRole('button', { name: 'Start Review', exact: true }).click();
      await page.getByText('Question 1 / 5', { exact: true }).waitFor();
      const first = (await saved()).data.questions[0]; loseAnswer = true;
      await page.getByRole('button', { name: first.character.romaji, exact: true }).click();
      await page.getByRole('button', { name: 'Retry saving answer' }).waitFor();
      const before = await saved(); await page.reload();
      await page.getByRole('button', { name: 'Retry saving answer' }).click();
      await page.getByText('Correct!', { exact: true }).waitFor();
      assert.equal(submissions.at(-1).submissionId, before.data.questions[0].submissionId);
      assert.equal(submissions.at(-2).submissionId, submissions.at(-1).submissionId);
      await page.getByRole('button', { name: 'Next Question →' }).click();
      const next = await saved();
      await page.close(); page = await context.newPage(); await page.goto(base + `/review/${script}`);
      await page.getByText('Question 2 / 5', { exact: true }).waitFor();
      assert.deepEqual((await saved()).data.questions, next.data.questions);
      assert.equal((await saved()).data.answers.length, 1);
      await resumeDashboard(); await page.getByText('Question 2 / 5', { exact: true }).waitFor();
    }
    // Replacement is explicit; cancelling leaves the old session byte-for-byte intact.
    const old = await saved(); await page.goto(base + '/learn/kanji/practice');
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Start Practice', exact: true }).click();
    assert.deepEqual(await saved(), old);
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Start Practice', exact: true }).click();
    await page.getByText('Question 1 / 10', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'day', exact: true }).click();
    await page.getByRole('button', { name: 'Next Question →' }).click();
    await page.reload(); await page.getByText('Question 2 / 10', { exact: true }).waitFor();
    assert.equal((await saved()).data.answers.length, 1); await resumeDashboard();
    const existingPractice = await saved();
    page.once('dialog', d => d.dismiss()); await page.getByRole('button', { name: 'Start new practice', exact: true }).click();
    assert.deepEqual(await saved(), existingPractice);
    page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Start new practice', exact: true }).click();
    await page.getByText('Question 1 / 10', { exact: true }).waitFor();
    assert.notEqual((await saved()).id, existingPractice.id);
    assert.equal((await saved()).data.answers.length, 0);
    await page.getByRole('button', { name: 'day', exact: true }).click();
    await page.getByRole('button', { name: 'Next Question →' }).click();
    // A stale tab cannot overwrite a session deliberately replaced in another tab.
    const stale = await context.newPage(); await stale.goto(page.url());
    await stale.getByText('Question 2 / 10', { exact: true }).waitFor();
    await page.goto(base + '/review/hiragana');
    page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Start Review', exact: true }).click();
    await stale.getByRole('heading', { name: 'Your session changed in another tab' }).waitFor(); await stale.close();
    // Assessment choices survive refresh and completed results stop occupying next step.
    await fresh('/quizzes/japanese-n5-unit-1');
    await page.getByRole('radio', { name: 'Two', exact: true }).check();
    await page.getByRole('button', { name: 'Next →', exact: true }).click();
    await page.reload(); await page.getByText('Question 2 / 15', { exact: true }).waitFor();
    await page.getByRole('button', { name: '← Previous', exact: true }).click();
    assert.ok(await page.getByRole('radio', { name: 'Two', exact: true }).isChecked());
    await resumeDashboard();
    for (let i = 0; i < 15; i++) {
      await page.getByRole('radio', { name: 'One', exact: true }).check();
      if (i < 14) await page.getByRole('button', { name: 'Next →', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Submit Assessment' }).click();
    await page.getByRole('heading', { name: '✓ Unit 1 Assessment Passed' }).waitFor();
    assert.equal((await saved()).status, 'completed');
    await page.reload(); await page.getByRole('heading', { name: '✓ Unit 1 Assessment Passed' }).waitFor();
    await page.goto(base); assert.equal(await page.getByRole('link', { name: 'Resume session →' }).count(), 0);
    // Lesson 1 and shared Units 1–3 engine save steps and practice answers.
    for (const slug of ['n5-unit-1-hello', 'n5-unit-2-family']) {
      await fresh(`/lessons/japanese/${slug}`);
      for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Continue →', exact: true }).click();
      await page.locator('main section article').first().getByRole('button').first().click();
      const before = await saved(); await page.reload();
      await page.getByRole('heading', { name: 'Practice', exact: true }).waitFor();
      assert.equal((await saved()).data.step, 5);
      assert.deepEqual((await saved()).data[slug.includes('hello') ? 'answers' : 'practice'], before.data[slug.includes('hello') ? 'answers' : 'practice']);
      await resumeDashboard();
    }
    // Speed quiz retains pool, current character, typed text, feedback and counters.
    await fresh('/practice?type=hiragana');
    await page.getByRole('button', { name: 'Select all', exact: true }).click();
    await page.getByRole('button', { name: 'Start Quiz →', exact: true }).click();
    await page.getByLabel('Auto-submit on match').uncheck();
    await page.getByPlaceholder('Type romaji...').fill('partial');
    const typed = await saved(); await page.reload();
    assert.equal(await page.getByPlaceholder('Type romaji...').inputValue(), 'partial');
    assert.deepEqual((await saved()).data.current, typed.data.current);
    await page.getByRole('button', { name: /Submit \(Enter/ }).click();
    await page.getByText('Incorrect ❌', { exact: true }).waitFor();
    await page.reload(); await page.getByText('Incorrect ❌', { exact: true }).waitFor();
    assert.equal((await saved()).data.wrongCount, 1); await resumeDashboard();
    const userOne = await saved();
    await page.evaluate(t => localStorage.setItem('token', t), token(2)); await page.goto(base);
    assert.equal(await page.getByRole('link', { name: 'Resume session →' }).count(), 0);
    await page.evaluate(t => localStorage.setItem('token', t), token(1)); await page.reload();
    await page.getByRole('link', { name: 'Resume session →' }).waitFor(); assert.deepEqual(await saved(), userOne);
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('PASS: refresh/closed-page recovery, both Reviews, interrupted idempotent retry, Kanji, assessment completion, lessons, Speed Quiz, dashboard, replacement cancel/accept, stale tabs, per-user isolation, mobile. Fixture APIs; no real progress writes.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
