// Particle Drop: sentences only from finished lessons, a timed round (answer by click or key, time-outs), scoring,
// the round saved as practice and its answers sent to the mistake notebook, the not-enough-lessons state and phones.
// Against fixture APIs.
//   node particle-drop-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
// Finished lessons: every imported N5 lesson (their grammar examples hold the sentences), read from the course file.
const course = JSON.parse(fs.readFileSync(path.join(__dirname, '../../shared/course/lessons.json'), 'utf8'));
const N5_LESSON_IDS = (Array.isArray(course) ? course : course.lessons).filter(lesson => lesson.level === 'N5').map(lesson => lesson.id);
const unitsWith = completedIds => ({ units: [{ id: 'japanese-n5-unit-4', number: 4, title: 'Unit', description: '', requiredLevel: 1, allowed: true, reasons: [], completedLessons: 0, totalLessons: completedIds.length, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 0, passPercent: null,
  lessons: completedIds.map(id => ({ id, slug: id, title: id, description: '', isPlaceholder: false, allowed: true, reasons: [], completed: true })) }] });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async ({ completed }) => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai'); }, token);
      const sent = { practice: [], mistakes: [] };
      await context.route('http://localhost:5000/api/**', async route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = data => route.fulfill({ status: 200, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/units') return json(unitsWith(completed));
        if (p === '/activity/practice') { sent.practice.push(request.postDataJSON()); return json({ recorded: true, currentStreak: 1, reward: null }); }
        if (p.startsWith('/mistakes/lessons/')) { sent.mistakes.push({ lessonId: decodeURIComponent(p.split('/').pop()), ...request.postDataJSON() }); return json({ recorded: 1, mistakes: 0 }); }
        return json({});
      });
      const page = await context.newPage();
      const errors = []; page.on('pageerror', error => errors.push(error.message));
      return { context, page, sent, errors };
    };

    // ---- not enough finished lessons: explained, with a way to the lessons
    let { context, page, errors } = await run({ completed: [] });
    await page.goto(base + '/games/particles');
    await page.getByRole('heading', { name: 'Finish a few more lessons first' }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Go to lessons →' }).getAttribute('href'), '/lessons');
    assert.deepEqual(errors, []); await context.close();

    // ---- a round: 10 sentences, answers by key and click, one time-out, results, practice and notebook saved
    let sent;
    ({ context, page, sent, errors } = await run({ completed: N5_LESSON_IDS }));
    await page.clock.install();
    await page.goto(base + '/games/particles');
    await page.getByRole('heading', { name: 'How to play' }).waitFor();
    const available = Number((await page.getByText(/sentences available from your lessons/).innerText()).match(/\d+/)[0]);
    assert.ok(available >= 100, 'sentences from the finished N5 lessons: ' + available);
    await page.getByRole('button', { name: 'Start →' }).click();
    const game = page.getByRole('region', { name: 'Particle Drop question' });
    let rightCount = 0, wrongCount = 0;
    for (let index = 0; index < 10; index++) {
      await game.getByText(`Sentence ${index + 1} of 10`).waitFor();
      assert.equal(await game.getByRole('group', { name: 'Particles' }).getByRole('button').count(), 4);
      if (index === 0) await page.screenshot({ path: path.join(shots, 'particle-drop.png') });
      if (index === 2) {
        // Letting the time run out counts as no answer.
        await page.clock.runFor(16_000);
        await game.getByRole('status').getByText(/^Time's up: the particle is /).waitFor();
        wrongCount++;
      } else {
        if (index % 2) await page.keyboard.press('1'); else await game.getByRole('group', { name: 'Particles' }).getByRole('button').nth(1).click();
        const verdict = await game.getByRole('status').locator('p').first().innerText();
        if (verdict.startsWith('Right!')) rightCount++; else { assert.match(verdict, /^Not quite: the particle is /); wrongCount++; }
      }
      // After answering, the gap shows the right particle and the choices are locked.
      assert.equal(await game.getByRole('group', { name: 'Particles' }).getByRole('button').first().isDisabled(), true);
      await game.getByRole('button', { name: index < 9 ? 'Next sentence →' : 'See results' }).click();
    }
    await page.getByRole('heading', { name: /Round finished|Perfect round/ }).waitFor();
    await page.getByText(`${rightCount} / 10`).waitFor();
    await page.screenshot({ path: path.join(shots, 'particle-drop-results.png'), fullPage: true });
    assert.deepEqual(sent.practice, [{ kind: 'particles', scope: 'N5', answered: 10, correct: rightCount }]);
    // Every answered sentence goes to the notebook (wrong ones noted, right ones count toward clearing); the time-out does not.
    await page.waitForTimeout(300);
    const notebookAnswers = sent.mistakes.flatMap(batch => batch.answers);
    assert.equal(notebookAnswers.length, 9, 'nine answered, one timed out');
    assert.equal(notebookAnswers.filter(answer => !answer.correct).length, wrongCount - 1);
    assert.ok(notebookAnswers.every(answer => answer.prompt.includes('＿') && answer.options.includes(answer.answer) && answer.options.includes(answer.given)));
    assert.ok(sent.mistakes.every(batch => N5_LESSON_IDS.includes(batch.lessonId)), 'sent per finished lesson');
    if (wrongCount) await page.getByRole('heading', { name: 'To look at again' }).waitFor();

    // ---- play again starts a fresh round; the best score is remembered
    await page.getByRole('button', { name: 'Play again' }).click();
    await game.getByText('Sentence 1 of 10').waitFor();

    // ---- phone width: no sideways scrolling
    await page.setViewportSize({ width: 375, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'fits a phone');
    await page.screenshot({ path: path.join(shots, 'particle-drop-phone.png'), fullPage: true });
    assert.deepEqual(errors, []); await context.close();
    console.log(`PASS: not-enough-lessons state with a link to lessons; ${available} sentences from finished N5 lessons; a 10-sentence round answered by click and key (4 choices, locked after answering), a time-out after 15 s; results (${rightCount}/10); the round saved as a Particle Drop practice session (N5) and 9 answered sentences sent to the notebook per lesson (time-out left out); play again; fits a phone.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
