// Level picker, level-aware Lessons, Kanji filters, grammar summary, mock exam and cumulative review,
// against a fixture API. Nothing is written for any real account.
//   node wrap-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict'); const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })() + '/';
const exam = JSON.parse(fs.readFileSync(ROOT + 'shared/course/mock-exams.json', 'utf8')).N5;
const catalog = JSON.parse(fs.readFileSync(ROOT + 'shared/kanji.json', 'utf8'));
const examQuestions = exam.sections.flatMap(s => s.groups.flatMap(g => g.questions));
const kanjiIn = unit => new Set(catalog.lessonIntroductions.filter(i => i.lessonId.startsWith(unit + '-')).flatMap(i => i.introducedKanji)).size;

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('user_email', 'mika@example.com'); localStorage.setItem('app_language', 'japanese'); delete window.SpeechRecognition; delete window.webkitSpeechRecognition; }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
    let reachedUpTo = 1; const checks = [];
    const unit = n => ({ id: `japanese-n5-unit-${n}`, number: n, title: `Unit title ${n}`, description: 'About this unit.', requiredLevel: 1, allowed: n <= reachedUpTo, reasons: n <= reachedUpTo ? [] : [`Complete Unit ${n - 1} first`], completedLessons: 0, totalLessons: 6, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80, lessons: [] });
    const examReports = [], mockPosts = [], mockResults = [];
    // Grades like the server: the overall target and the minimum in every section.
    const gradeMock = answers => {
      const sections = exam.sections.map(section => { const qs = section.groups.flatMap(g => g.questions); const correct = qs.filter(q => answers[q.id] === q.correctIndex).length; return { id: section.id, title: section.title, correct, total: qs.length, percent: Math.round(correct * 100 / qs.length) }; });
      const correct = sections.reduce((n, x) => n + x.correct, 0), percent = Math.round(correct * 100 / 36);
      return { correct, total: 36, percent, sections: sections.map(x => ({ ...x, reached: x.percent >= exam.sectionMinPercent })), passed: percent >= exam.passPercent && sections.every(x => x.percent >= exam.sectionMinPercent) };
    };
    await context.route('http://localhost:5000/api/**', route => { const request = route.request(), p = new URL(request.url()).pathname.replace('/api', '');
      const json = data => route.fulfill({ json: data });
      if (p === '/activity/practice') { examReports.push(request.postDataJSON()); return route.fulfill({ status: 201, json: { recorded: true, currentStreak: 1 } }); }
      if (p === '/mock-exams/N5/results' && request.method() === 'POST') { const body = request.postDataJSON(); mockPosts.push(body); const saved = { id: mockResults.length + 1, level: 'N5', timedOut: body.timedOut, createdAt: new Date().toISOString(), ...gradeMock(body.answers) }; mockResults.unshift(saved); return route.fulfill({ status: 201, json: { result: saved } }); }
      if (p === '/mock-exams/N5/results') return json({ results: mockResults, attempts: mockResults.length, bestPercent: mockResults.length ? Math.max(...mockResults.map(r => r.percent)) : null, hasPassed: mockResults.some(r => r.passed) });
      if (p === '/units') return json({ units: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(unit) });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/kanji/progress') return json({ progress: catalog.kanji.map((k, i) => ({ kanjiId: k.id, correctCount: i % 3 === 0 ? 4 : 0, wrongCount: 0, total: i % 3 === 0 ? 4 : 0, accuracy: i % 3 === 0 ? 100 : 0, status: i % 3 === 0 ? 'mastered' : 'untested', lastPracticedAt: null })) });
      if (p === '/profile/me') return json({ username: 'mika', display_name: 'Mika', level: 1, rank: 'Beginner', xp: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 }, current_streak: 0, achievements_count: 0 });
      if (p === '/review/levels/N5/questions') return json({ questions: Array.from({ length: 40 }, (_, i) => ({ id: `bank:${i + 1}`, unitId: `japanese-n5-unit-${i % 9 + 1}`, type: 'multiple_choice', prompt: `Cumulative question ${i + 1}`, options: ['right', 'wrong', 'other', 'another'] })) });
      const check = p.match(/^\/review\/units\/([^/]+)\/check$/);
      if (check) { const body = request.postDataJSON(); checks.push({ unit: check[1], id: body.questionId }); return json({ correct: body.answer === 0, solution: 'right' }); }
      return json({}); });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const heading = name => page.getByRole('heading', { name, exact: true });
    const noOverflow = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows`);

    // ---- Lessons shows one level; the picker switches it.
    await page.goto(base + '/lessons'); await heading('Choose a unit').waitFor();
    await page.getByText('Japanese • N5 Start Here').waitFor();
    assert.equal(await page.locator('section[aria-labelledby="choose-unit-heading"] > div button').count(), 9);
    // Wrap-up: with only Unit 1 reached the exam is locked, the other two are links.
    const wrap = page.locator('section[aria-labelledby="wrap-up-heading"]'); await wrap.getByRole('heading', { name: 'N5 wrap-up' }).waitFor();
    assert.deepEqual(await wrap.getByRole('link').evaluateAll(links => links.map(a => a.getAttribute('href'))), ['/grammar/summary?level=N5', '/review?unit=level:N5']);
    await wrap.getByText('🔒 Opens when you reach Unit 9.').waitFor();
    await page.getByRole('link', { name: 'Change level' }).click();
    await heading('A clearer place to start.Step by step.').waitFor().catch(async () => page.getByRole('heading', { level: 1 }).waitFor());
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /A clearer place to start\.\s*Step by step\./);
    const cards = page.locator('main ol > li button');
    assert.deepEqual(await cards.evaluateAll(list => list.map(b => b.querySelector('span').textContent)), ['N5', 'N4', 'N3', 'N2', 'N1']);
    assert.deepEqual(await cards.evaluateAll(list => list.map(b => b.getAttribute('aria-pressed'))), ['true', 'false', 'false', 'false', 'false']);
    await cards.nth(0).getByText('9 units').waitFor(); await cards.nth(1).getByText('9 units').waitFor(); await cards.nth(2).getByText('Coming soon').waitFor(); await cards.nth(0).getByText('Current level ✓').waitFor();
    await page.screenshot({ path: shots + '/levels.png', fullPage: true });
    await cards.nth(1).click(); await page.waitForURL(base + '/lessons');
    await heading('N4 lessons are coming soon').waitFor(); await page.getByText('Japanese • N4 Build Basics').waitFor();
    assert.equal(await page.locator('section[aria-labelledby="wrap-up-heading"]').count(), 0);
    assert.equal(await page.evaluate(() => localStorage.getItem('course_level')), 'N4');
    // A link to a unit opens it whatever level is chosen.
    reachedUpTo = 9;
    await page.goto(base + '/lessons?unit=japanese-n5-unit-4'); await heading('Unit title 4').waitFor(); await page.getByText('Japanese • N5 Start Here').waitFor();
    // The sidebar shows the level and leads to the picker; an unsafe return address is ignored.
    await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click(); await page.getByRole('button', { name: /Level N4 · Change/ }).click(); await page.waitForURL(base + '/levels');
    await page.goto(base + '/levels?next=//evil.example'); await cards.nth(0).click(); await page.waitForURL(base + '/lessons'); await heading('Choose a unit').waitFor();
    await wrap.getByRole('link', { name: /Mock exam/ }).waitFor();

    // ---- Kanji filters
    await page.goto(base + '/learn/kanji'); await heading('Kanji').waitFor();
    const level = page.getByLabel('Course level'), unitSelect = page.locator('main select').nth(1);
    const tiles = page.locator('section[aria-labelledby="kanji-mastery-heading"] a[href^="/learn/kanji/kanji-"]');
    const tilesAre = async n => { for (let i = 0; i < 50 && await tiles.count() !== n; i++) await page.waitForTimeout(100); assert.equal(await tiles.count(), n); };
    const n5Count = catalog.kanji.filter(k => !catalog.lessonIntroductions.some(i => i.introducedKanji.includes(k.id) && !i.lessonId.startsWith('japanese-n5-'))).length;
    assert.equal(await level.inputValue(), 'N5'); await tilesAre(n5Count); assert.equal(n5Count, 103);
    assert.ok((await level.locator('option').allInnerTexts()).includes('N3 (0)'));
    await unitSelect.selectOption('japanese-n5-unit-5'); await page.waitForURL(/unit=japanese-n5-unit-5/);
    await tilesAre(kanjiIn('japanese-n5-unit-5')); assert.equal(kanjiIn('japanese-n5-unit-5'), 19);
    await page.getByRole('button', { name: `All (19)` }).waitFor();
    const unit5 = await tiles.evaluateAll(list => list.map(a => a.querySelector('span').textContent).join(''));
    for (const c of '何年聞天気雨友会社一二三四五六七八九十') assert.ok(unit5.includes(c), c);
    // Status chips and search work inside the chosen unit.
    await page.getByRole('button', { name: /Mastered/ }).click(); const mastered = await tiles.count(); assert.ok(mastered > 0 && mastered < 19);
    await page.getByRole('button', { name: /^All/ }).click(); await page.getByLabel(/Search character/).fill('rain'); await tilesAre(1); await page.getByLabel(/Search character/).fill('');
    await page.screenshot({ path: shots + '/kanji-filter.png', fullPage: true });
    // The filter survives opening a character and going back.
    await tiles.first().click(); await page.getByText(/N5 course · Unit 5/).waitFor(); await page.goBack(); await page.waitForURL(/unit=japanese-n5-unit-5/); await tilesAre(19);
    await level.selectOption('N3'); await page.getByText('No Kanji have been added for N3 yet.').waitFor(); assert.ok(await unitSelect.isDisabled());
    await level.selectOption('all'); await tilesAre(catalog.kanji.length); assert.ok(await unitSelect.isDisabled());
    await level.selectOption('N5'); await unitSelect.locator('option').nth(8).waitFor({ state: 'attached' }); assert.equal((await unitSelect.locator('option').count()), 9); // "All units" + Units 2–9

    // ---- Grammar summary
    await page.goto(base + '/grammar/summary'); await heading('N5 grammar summary').waitFor();
    assert.equal(await page.locator('main section h2').count(), 9);
    const rows = page.locator('main tbody tr'); const allRows = await rows.count(); assert.ok(allRows >= 60, 'rows: ' + allRows);
    await page.getByText(`All ${allRows} sentence patterns`).waitFor();
    await page.getByLabel(/Search patterns/).fill('ことが できます'); const found = await rows.count(); assert.ok(found >= 1 && found < 6, 'found ' + found);
    await page.getByLabel(/Search patterns/).fill('zzzz'); await page.getByText('No pattern matches this search.').waitFor();
    await page.getByLabel(/Search patterns/).fill(''); await page.screenshot({ path: shots + '/grammar-summary.png' });
    await page.getByLabel('Level').selectOption('N3'); await page.getByText('This level has no grammar yet.').waitFor();

    // ---- Mock exam: locked until the last unit is reached
    reachedUpTo = 8; await page.goto(base + '/mock-exam'); await heading('N5 mock exam').waitFor();
    await page.getByText('The mock exam opens when you reach the last unit of N5.').waitFor(); assert.equal(await page.getByRole('button', { name: /Start the exam/ }).count(), 0);
    await page.goto(base + '/mock-exam?level=N3'); await page.getByText('The N3 mock exam is not available yet.').waitFor();
    reachedUpTo = 9; await page.goto(base + '/mock-exam'); await page.getByText('40 minutes').waitFor(); await page.getByText('36', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Start the exam →' }).click();
    const timer = page.getByRole('timer'); assert.match(await timer.innerText(), /^(40:00|39:5\d)$/);
    const answer = async (q, index) => page.locator('li', { has: page.locator(`#q-${q.id}`) }).getByRole('radio').nth(index).click();
    const openSection = name => page.getByRole('tab', { name: new RegExp('^' + name) }).click();
    // No answer key is on the page while the exam runs.
    assert.equal(await page.getByText(examQuestions[0].explanation).count(), 0);
    // Attempt 1: leave some blank, get some wrong; answers can be changed; a reload keeps the attempt.
    const vocab = exam.sections[0].groups.flatMap(g => g.questions);
    await answer(vocab[0], (vocab[0].correctIndex + 1) % 4); await answer(vocab[0], vocab[0].correctIndex);
    assert.equal(await page.locator('li', { has: page.locator(`#q-${vocab[0].id}`) }).getByRole('radio', { checked: true }).count(), 1);
    for (const q of vocab.slice(1, 5)) await answer(q, q.correctIndex);
    await answer(vocab[5], (vocab[5].correctIndex + 1) % 4);
    await page.getByText('6 / 36 answered').waitFor(); await page.getByRole('tab', { name: 'Vocabulary & Kanji (6/15)' }).waitFor();
    await page.screenshot({ path: shots + '/mock-exam-running.png' });
    const startedAt = () => page.evaluate(() => JSON.parse(sessionStorage.getItem(Object.keys(sessionStorage)[0])).startedAt);
    const before = await startedAt(); await page.reload(); await page.getByText('6 / 36 answered').waitFor(); assert.equal(await startedAt(), before); assert.match(await timer.innerText(), /^(40:00|39:\d\d)$/);
    await openSection('Reading'); await page.getByText('アンナさんへ').waitFor(); await openSection('Vocabulary');
    await page.getByRole('button', { name: 'Submit exam' }).click(); await page.getByText('30 questions are unanswered. Submit anyway?').waitFor();
    await page.getByRole('button', { name: 'Keep working' }).click(); await page.getByRole('button', { name: 'Submit exam' }).click(); await page.getByRole('button', { name: 'Yes, submit' }).click();
    const result = page.locator('section[aria-label="Exam result"]'); await result.getByText('14%').waitFor(); await result.getByText(/Saved to your statistics/).waitFor(); await result.getByText('5 / 36 correct').waitFor(); await result.getByText(/Not at the target yet/).waitFor();
    await page.getByText('Not answered').first().waitFor(); assert.equal(await page.getByText('Not answered').count(), 30); assert.equal(await page.getByText('✓ Correct').count(), 5); await page.getByText(/✗ Your answer:/).waitFor();
    await page.getByText(examQuestions[0].explanation).first().waitFor();
    assert.equal(await page.evaluate(() => sessionStorage.length), 0);
    // Attempt 2: everything right.
    await page.getByRole('button', { name: 'Take it again' }).click(); await page.getByText('Your best result: 14% · 1 attempt').waitFor();
    await page.getByRole('button', { name: 'Start the exam →' }).click();
    for (const [i, section] of exam.sections.entries()) { if (i) await page.getByRole('button', { name: section.title + ' →' }).click(); for (const q of section.groups.flatMap(g => g.questions)) await answer(q, q.correctIndex); }
    await page.getByText('36 / 36 answered').waitFor(); await page.getByRole('button', { name: 'Submit exam' }).click(); await page.getByText('Submit your answers?').waitFor(); await page.getByRole('button', { name: 'Yes, submit' }).click();
    await result.getByText('100%').first().waitFor(); await result.getByText(/Target reached/).waitFor(); assert.equal(await page.getByText('✓ Correct').count(), 36);
    await page.screenshot({ path: shots + '/mock-exam-result.png' });
    // Passing overall is not enough when one section is under its minimum.
    await page.getByRole('button', { name: 'Take it again' }).click(); await page.getByText('Your best result: 100% · target reached ✓ · 2 attempts').waitFor(); await page.getByRole('button', { name: 'Start the exam →' }).click();
    for (const [i, section] of exam.sections.entries()) { if (i) await page.getByRole('button', { name: section.title + ' →' }).click(); const qs = section.groups.flatMap(g => g.questions); for (const [n, q] of qs.entries()) await answer(q, section.id === 'reading' && n >= 2 ? (q.correctIndex + 1) % 4 : q.correctIndex); }
    await page.getByRole('button', { name: 'Submit exam' }).click(); await page.getByRole('button', { name: 'Yes, submit' }).click();
    await result.getByText('89%').waitFor(); await result.getByText(/Not at the target yet/).waitFor(); await result.getByText('below the section minimum').waitFor();
    // Time running out submits what has been answered.
    await page.getByRole('button', { name: 'Take it again' }).click(); await page.getByRole('button', { name: 'Start the exam →' }).click(); await answer(vocab[0], vocab[0].correctIndex);
    await page.evaluate(() => { const key = Object.keys(sessionStorage)[0]; const saved = JSON.parse(sessionStorage.getItem(key)); saved.startedAt -= 40 * 60 * 1000 - 2500; sessionStorage.setItem(key, JSON.stringify(saved)); });
    await page.reload(); await page.getByText('Time is up. Your answers were submitted automatically.').waitFor({ timeout: 10000 }); await result.getByText('1 / 36 correct').waitFor();
    await page.getByText('Your best result').waitFor({ state: 'detached' });
    await result.getByText(/Saved to your statistics/).waitFor(); assert.equal(mockPosts.at(-1).timedOut, true); assert.deepEqual(Object.keys(mockPosts.at(-1).answers), [vocab[0].id]);

    // ---- Cumulative review
    await page.goto(base + '/review?unit=level:N5'); await heading('Unit Review').waitFor();
    const reviewSelect = page.getByLabel('Choose a unit'); assert.equal(await reviewSelect.inputValue(), 'level:N5');
    assert.equal((await reviewSelect.locator('option').allInnerTexts())[0], 'N5 cumulative review — every unit you have reached');
    await page.getByText(/A longer review of 20 questions drawn from all 9 N5 units/).waitFor();
    await page.getByRole('button', { name: 'Start review →' }).click(); await page.getByText(/N5 cumulative · Question 1 \/ 20/).waitFor();
    for (let i = 0; i < 20; i++) {
      await page.getByText(new RegExp(`Question ${i + 1} / 20`)).waitFor();
      const skip = page.getByRole('button', { name: /Can't (listen|speak)/ });
      if (await skip.count()) { await skip.click(); i--; continue; }
      await page.locator('main .grid.grid-cols-2 button').first().click();
      await page.getByRole('button', { name: i === 19 ? 'See results →' : 'Next →' }).click();
    }
    await heading('N5 cumulative review complete').waitFor();
    assert.ok(checks.length >= 12, 'server-graded: ' + checks.length); assert.ok(new Set(checks.map(c => c.unit)).size >= 4);
    for (const c of checks) assert.equal(c.unit, `japanese-n5-unit-${(Number(c.id.split(':')[1]) - 1) % 9 + 1}`);
    // A single unit still works and is labelled by its number.
    await page.goto(base + '/review?unit=japanese-n5-unit-4'); assert.equal(await reviewSelect.inputValue(), 'japanese-n5-unit-4');

    // ---- Dashboard entry points and mobile layout
    await page.goto(base + '/'); await page.getByRole('link', { name: /N5 · Change/ }).waitFor(); await page.getByRole('link', { name: /Mock exam/ }).first().waitFor(); await page.getByRole('link', { name: /Grammar summary/ }).first().waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [path, wait] of [['/levels', 'Step by step.'], ['/learn/kanji', 'Course level'], ['/grammar/summary', 'N5 grammar summary'], ['/lessons', 'N5 wrap-up'], ['/review', 'Unit Review']]) { await page.goto(base + path); await page.getByText(wait).first().waitFor(); await noOverflow(path); }
    await page.goto(base + '/mock-exam'); await page.getByRole('button', { name: 'Start the exam →' }).click(); await timer.waitFor(); await noOverflow('/mock-exam running');
    await page.screenshot({ path: shots + '/mock-exam-mobile.png' });
    assert.equal(mockPosts.length, 4, 'every submitted exam is sent to the server for grading');
    assert.ok(mockPosts.some(r => Object.keys(r.answers).length === 36 && !r.timedOut), 'the full-marks attempt is sent');
    assert.deepEqual(examReports.filter(r => r.kind === 'mock-exam'), [], 'the server records the practice session itself');
    assert.deepEqual(errors, []);
    console.log(`PASS: submitted mock exams graded and saved on the server (${mockPosts.length}, best and attempts shown from the server); level picker (5 levels, current marked, choice kept, unsafe return ignored); Lessons per level with coming-soon state and unit links; wrap-up cards lock/unlock; Kanji level+unit filters (${catalog.kanji.length} → 19 for Unit 5) with chips, search and back navigation; grammar summary (${allRows} patterns, search, empty level); mock exam locked/open, change answers, reload keeps attempt, unanswered warning, 14% / 100% / section-minimum fail, time-out auto-submit, best result; cumulative review of 20 graded by each question's unit (${checks.length} checks); dashboard links; mobile without overflow; no page errors.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
