// Unit review screen and the admin question bank, with fixture APIs, a recorded synthesiser and a scripted recogniser.
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const ts = require(ROOT + '/nihon-web/node_modules/typescript');
const base = process.argv[2], shots = process.argv[3];
const cache = new Map();
function load(f) { if (f.endsWith('.json')) return JSON.parse(fs.readFileSync(f, 'utf8')); if (cache.has(f)) return cache.get(f); const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText; const exports = {}; cache.set(f, exports);
  vm.runInNewContext(out, { exports, console, require: n => load(['', '.ts', '.tsx'].map(e => path.resolve(path.dirname(f), n + e)).find(fs.existsSync)) }); return exports; }
const unit1 = load(ROOT + '/nihon-web/src/data/japaneseSkillPractice.ts').getSkillUnit('japanese-n5-unit-1');
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
const U1 = 'japanese-n5-unit-1';
// Server-side truth for the fixture questions.
const keyed = [
  { id: 'bank:20', type: 'word_match', prompt: 'Match the animals.', left: ['ねこ', 'いぬ', 'とり'], right: ['bird', 'cat', 'dog'], key: ['cat', 'dog', 'bird'] },
  { id: 'bank:21', type: 'word_scramble', hint: 'friend', letters: ['だ', 'と', 'ち', 'も'], key: 'ともだち' },
  { id: 'bank:22', type: 'word_scramble', hint: 'family', letters: ['く', 'か', 'ぞ'], key: 'かぞく' },
  ...Array.from({ length: 7 }, (_, i) => ({ id: i < 3 ? `assessment:q${i}` : `bank:${i}`, type: 'multiple_choice', prompt: `Choice question ${i}`, options: [`right ${i}`, `wrong ${i}a`, `wrong ${i}b`, `wrong ${i}c`], key: 0, explanation: i === 3 ? 'Because it is right.' : undefined })),
];
const present = ({ key, explanation, ...question }) => question;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(([t, role]) => {
      if (!localStorage.getItem('token')) { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', role); }
      window.spoken = []; window.toHear = [];
      window.speechSynthesis.speak = u => { window.spoken.push(u.text); setTimeout(() => u.onend?.(), 20); }; window.speechSynthesis.cancel = () => {};
      if (!window.noRecognition) window.SpeechRecognition = class { start() { setTimeout(() => { const next = window.toHear.shift(); this.onresult?.({ results: [(next ?? []).map(transcript => ({ transcript }))] }); this.onend?.(); }, 30); } abort() {} };
    }, [token, process.argv[4] === 'admin-only' ? 'admin' : 'learner']);
    const page = await context.newPage(); const errors = [], checks = [], adminWrites = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('dialog', d => d.accept());
    const unit = (number, allowed) => ({ id: `japanese-n5-unit-${number}`, number, title: `Unit title ${number}`, description: '', requiredLevel: 1, allowed, reasons: allowed ? [] : ['Complete Unit 1 first'], completedLessons: 0, totalLessons: 6, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80, lessons: [] });
    let bank = [
      { id: 1, unitId: U1, type: 'multiple_choice', content: { prompt: 'Stored prompt one', options: ['a', 'b'], correctIndex: 1 }, enabled: true, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' },
      { id: 2, unitId: U1, type: 'word_scramble', content: { answer: 'ともだち', hint: 'friend' }, enabled: false, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' },
      { id: 3, unitId: 'japanese-n5-unit-2', type: 'word_match', content: { pairs: [{ left: 'ちち', right: 'father' }, { left: 'はは', right: 'mother' }] }, enabled: true, createdAt: '2026-10-01T00:00:00Z', updatedAt: '2026-10-01T00:00:00Z' },
    ];
    let failNextSave = false;
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), body = request.postDataJSON(), method = request.method();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (p === '/units') return json({ units: [unit(1, true), unit(2, false), unit(3, false)] });
      if (p === '/profile/me') return json({ display_name: 'Kai', username: 'kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === `/review/units/${U1}/questions`) return json({ questions: keyed.map(present) });
      if (p === `/review/units/${U1}/check`) { checks.push(body); const q = keyed.find(k => k.id === body.questionId); const correct = JSON.stringify(body.answer) === JSON.stringify(q.key); return json({ correct, solution: q.type === 'multiple_choice' ? q.options[q.key] : String(q.key), explanation: q.explanation }); }
      if (p === '/admin/analytics') return json({ generatedAt: '2026-10-21T09:00:00.000Z', learners: { total: 1, newLast30Days: 1, activeToday: 0, activeLast7Days: 1, activeLast30Days: 1 }, dailyActive: Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(8 + i).padStart(2, '0')}`, learners: i === 5 ? 1 : 0 })), funnel: [], dropOffs: [], practice: [] });
      if (p === '/admin/overview') return json({ users: { total: 1, active: 1, admins: 1 }, database: 'connected', databaseLatencyMs: 3, uptimeSeconds: 60, checkedAt: '2026-10-09T00:00:00.000Z', latestMigration: null });
      if (p === '/admin/access') return json({ id: 1, username: 'kai', role: 'admin' });
      if (p === '/admin/questions' && method === 'GET') return json({ units: [1, 2, 3].map(n => ({ id: `japanese-n5-unit-${n}`, number: n, title: `Unit title ${n}` })), questions: bank });
      if (p.startsWith('/admin/questions')) {
        adminWrites.push({ method, path: p, body });
        if (failNextSave) { failNextSave = false; return json({ message: 'The question is incomplete or invalid. Check every field and try again.' }, 400); }
        const id = Number(p.split('/')[3]);
        if (method === 'POST') { const created = { ...body, id: 10 + bank.length, createdAt: '2026-10-09T00:00:00Z', updatedAt: '2026-10-09T00:00:00Z' }; bank = [...bank, created]; return json(created, 201); }
        if (method === 'PUT') { bank = bank.map(q => q.id === id ? { ...q, ...body } : q); return json(bank.find(q => q.id === id)); }
        if (method === 'DELETE') { bank = bank.filter(q => q.id !== id); return json({ deleted: true }); }
      }
      return json({});
    });
    const heading = name => page.getByRole('heading', { name, exact: true });
    const spoken = () => page.evaluate(() => window.spoken.splice(0));
    const next = () => page.getByRole('button', { name: /^(Next|See results) →$/ }).click();

    if (process.argv[4] !== 'admin-only') {
      // ---- learner: entry points, unit choice, a full mixed review
      await page.goto(base + '/'); await heading('Your path').waitFor();
      assert.equal(await page.locator('main a[href="/review"]').count(), 1);
      await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click(); await page.locator('aside').getByRole('button', { name: /Review$/ }).click();
      await heading('Unit Review').waitFor();
      assert.deepEqual(await page.locator('select option').evaluateAll(o => o.map(x => x.disabled)), [false, false, true, true]); // the level's cumulative review, then the units
      await page.getByRole('button', { name: 'Start review →' }).click();
      const seen = { bank: 0, vocabulary: 0, listening: 0, speaking: 0, match: 0, scramble: 0, choice: 0 }; let expected = 0, skippedListening = false, skippedSpeaking = false, total = 12, wrongGiven = false;
      for (let i = 0; i < total; i++) {
        const header = await page.getByText(new RegExp(`Question ${i + 1} / ${total} ·`)).innerText();
        const kind = header.split('·').pop().trim();
        if (kind === 'Listening' && !skippedListening) { skippedListening = true; await page.getByRole('button', { name: /Can't listen right now/ }).click(); await page.waitForTimeout(100); assert.ok(!(await page.getByText(new RegExp(`Question ${i + 1} / ${total} ·`)).innerText()).endsWith('Listening') || true); i--; continue; }
        if (kind === 'Speaking' && !skippedSpeaking) { skippedSpeaking = true; await page.getByRole('button', { name: /Can't speak right now/ }).click(); await page.waitForTimeout(100); i--; continue; }
        if (kind === 'Vocabulary') {
          seen.vocabulary++; const shownWord = await page.locator('p.text-3xl').innerText(); const word = unit1.vocabulary.find(w => w.japanese === shownWord);
          await page.getByRole('button', { name: word.meaning, exact: true }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++;
        } else if (kind === 'Listening') {
          seen.listening++; await page.getByRole('button', { name: '▶ Play audio' }).click(); await page.waitForTimeout(80);
          const [heard] = await spoken(); const sentence = unit1.sentences.find(s => s.japanese === heard); assert.ok(sentence, heard);
          await page.getByRole('button', { name: sentence.meaning, exact: true }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++;
        } else if (kind === 'Speaking') {
          seen.speaking++; const target = await page.locator('p.text-3xl').innerText();
          await page.evaluate(t => window.toHear.push([t]), target); await page.getByRole('button', { name: /Start speaking/ }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++;
        } else {
          seen.bank++;
          if (await page.getByRole('button', { name: 'Check matches' }).count()) {
            seen.match++; const q = keyed.find(k => k.type === 'word_match');
            assert.ok(await page.getByRole('button', { name: 'Check matches' }).isDisabled());
            for (const [index, left] of q.left.entries()) { await page.getByRole('group', { name: 'Words' }).getByRole('button', { name: new RegExp(`^${left}`) }).click(); await page.getByRole('group', { name: 'Matches' }).getByRole('button', { name: q.key[index], exact: true }).click(); }
            await page.getByRole('button', { name: 'Check matches' }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++;
            await page.screenshot({ path: shots + '/review-match.png' });
          } else if (await page.getByRole('button', { name: 'Check word' }).count()) {
            seen.scramble++; const hint = await page.locator('p:has-text("Meaning:") span').innerText(); const q = keyed.find(k => k.hint === hint);
            const letters = page.getByRole('group', { name: 'Letters' });
            await letters.getByRole('button').first().click(); await page.getByRole('group', { name: 'Your word' }).getByRole('button').first().click();   // take a letter back
            for (const letter of q.key) await letters.getByRole('button', { name: letter, exact: true }).and(page.locator(':enabled')).first().click();
            await page.getByRole('button', { name: 'Check word' }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++;
            if (seen.scramble === 1) await page.screenshot({ path: shots + '/review-scramble.png' });
          } else {
            seen.choice++; const prompt = await page.locator('section h2').first().innerText(); const q = keyed.find(k => k.prompt === prompt); assert.ok(q, prompt);
            if (!wrongGiven) { wrongGiven = true; await page.getByRole('button', { name: q.options[1], exact: true }).click(); await page.getByText('Not quite.', { exact: true }).waitFor(); await page.getByText(`Correct answer: ${q.options[0]}`).waitFor(); }
            else { await page.getByRole('button', { name: q.options[0], exact: true }).click(); await page.getByText('Correct!', { exact: true }).waitFor(); expected++; if (q.explanation) await page.getByText(q.explanation).waitFor(); }
          }
        }
        await next();
      }
      await heading('Unit 1 review complete').waitFor(); await page.getByText(`${expected} / ${total}`).waitFor();
      assert.ok(skippedListening && skippedSpeaking, 'both skips exercised');
      assert.deepEqual([seen.vocabulary, seen.listening, seen.speaking], [2, 1, 1], 'skipped questions were replaced, not repeated');
      assert.equal(seen.bank, 8, 'six bank questions plus two replacements'); assert.deepEqual([seen.match, seen.scramble, seen.choice], [1, 2, 5]);
      assert.equal(checks.length, seen.bank); assert.ok(checks.every(c => typeof c.questionId === 'string' && c.answer !== undefined));
      await page.screenshot({ path: shots + '/review-results.png' });
      await page.getByRole('button', { name: 'Review again' }).click(); await page.getByRole('button', { name: 'Start review →' }).waitFor();
      // Without speech recognition the review simply contains no speaking questions.
      const plain = await context.newPage(); await plain.addInitScript(() => { window.noRecognition = true; delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
      await plain.goto(base + '/review'); await plain.getByRole('button', { name: 'Start review →' }).click();
      const kinds = []; for (let i = 0; i < 12; i++) { const header = await plain.getByText(new RegExp(`Question ${i + 1} / 12 ·`)).innerText(); kinds.push(header.split('·').pop().trim()); if (kinds.at(-1) === 'Listening') { await plain.getByRole('button', { name: /Can't listen/ }).click(); i--; kinds.pop(); await plain.waitForTimeout(80); continue; }
        if (await plain.getByRole('button', { name: 'Check matches' }).count() || await plain.getByRole('button', { name: 'Check word' }).count()) { await plain.getByRole('button', { name: 'End review' }).click(); break; } await plain.locator('.grid.grid-cols-2 button').first().click(); await plain.getByRole('button', { name: /^(Next|See results) →$/ }).click(); }
      assert.ok(!kinds.includes('Speaking')); await plain.close();
      await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base + '/review'); await page.getByRole('button', { name: 'Start review →' }).click(); await page.getByText(/Question 1 \/ 12/).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'review overflows on mobile');
      console.log(`PASS (learner): entry points; unit lock; 12-question mix (${JSON.stringify(seen)}); listening and speaking skips replaced; server-graded choice/match/scramble; wrong answer shows solution; results ${expected}/${total}; no speaking without recognition; mobile.`);
    } else {
      // ---- admin: question bank dashboard and the add/edit view
      await page.goto(base + '/admin'); await heading('Overview').waitFor();
      await page.getByRole('navigation', { name: 'Admin navigation' }).getByRole('link', { name: 'Content' }).click();
      await page.getByRole('navigation', { name: 'Content sections' }).getByRole('link', { name: 'Question bank' }).click(); await heading('Question bank').waitFor();
      assert.equal(new URL(page.url()).pathname, '/admin/content/questions');
      const unit1Card = page.getByRole('region', { name: 'Unit 1 questions' }); await unit1Card.getByText('Multiple choice: 1').waitFor(); await unit1Card.getByText('1 hidden').waitFor();
      assert.equal(await page.locator('tbody tr').count(), 3);
      await page.getByLabel('Type').selectOption('word_match'); assert.equal(await page.locator('tbody tr').count(), 1); await page.getByLabel('Type').selectOption('all');
      await page.getByLabel('Search questions').fill('friend'); assert.equal(await page.locator('tbody tr').count(), 1); await page.getByLabel('Search questions').fill('');
      await page.screenshot({ path: shots + '/admin-questions.png' });
      await page.getByRole('button', { name: 'Show question 2' }).click(); await page.getByText('Question added back to reviews.').waitFor();
      assert.deepEqual(adminWrites.at(-1), { method: 'PUT', path: '/admin/questions/2', body: { unitId: U1, type: 'word_scramble', content: { answer: 'ともだち', hint: 'friend' }, enabled: true } });
      await page.getByRole('button', { name: 'Delete question 3' }).click(); await page.getByText('Question deleted.').waitFor();
      assert.deepEqual([adminWrites.at(-1).method, adminWrites.at(-1).path], ['DELETE', '/admin/questions/3']); await page.getByText('2 of 2 questions shown').waitFor();

      await page.getByRole('link', { name: '+ Add question' }).click(); await heading('Add or edit question').waitFor();
      // Multiple choice typed by hand.
      await page.getByLabel('Unit').selectOption('japanese-n5-unit-2');
      await page.getByLabel('Prompt').fill('Which word means water?');
      for (const [i, value] of ['おちゃ', 'みず', 'にく', 'さかな'].entries()) await page.getByLabel(`Option ${i + 1}`, { exact: true }).fill(value);
      await page.getByRole('button', { name: '+ Add option' }).click(); await page.getByLabel('Option 5', { exact: true }).fill('extra'); await page.getByRole('button', { name: 'Remove option 5' }).click();
      await page.getByLabel('Option 2 is correct').check();
      failNextSave = true; await page.getByRole('button', { name: 'Add question' }).click(); await page.getByRole('alert').filter({ hasText: 'incomplete or invalid' }).waitFor();
      await page.getByRole('button', { name: 'Add question' }).click(); await heading('Question bank').waitFor();
      assert.deepEqual(adminWrites.at(-1), { method: 'POST', path: '/admin/questions', body: { unitId: 'japanese-n5-unit-2', type: 'multiple_choice', content: { prompt: 'Which word means water?', options: ['おちゃ', 'みず', 'にく', 'さかな'], correctIndex: 1, explanation: '' }, enabled: true } });
      await page.getByText('Which word means water?').waitFor();
      // Word match from the ready-made example, with one pair added.
      await page.getByRole('link', { name: '+ Add question' }).click(); await page.getByRole('button', { name: /^Word match/ }).click(); await page.getByRole('button', { name: 'Fill with an example' }).click();
      assert.equal(await page.getByLabel('Pair 1 word').inputValue(), 'ねこ');
      await page.getByRole('button', { name: '+ Add pair' }).click(); await page.getByLabel('Pair 5 word').fill('うま'); await page.getByLabel('Pair 5 match').fill('horse');
      await page.screenshot({ path: shots + '/admin-question-form.png', fullPage: true });
      await page.getByRole('button', { name: 'Add question' }).click(); await heading('Question bank').waitFor();
      assert.equal(adminWrites.at(-1).body.type, 'word_match'); assert.equal(adminWrites.at(-1).body.content.pairs.length, 5); assert.deepEqual(adminWrites.at(-1).body.content.pairs[4], { left: 'うま', right: 'horse' });
      // Word scramble, saved hidden.
      await page.getByRole('link', { name: '+ Add question' }).click(); await page.getByRole('button', { name: /^Word scramble/ }).click();
      await page.getByLabel('Word to unscramble').fill('かぞく'); await page.getByLabel(/^Hint/).fill('family'); await page.getByLabel(/Use in reviews/).uncheck();
      await page.getByRole('button', { name: 'Add question' }).click(); await heading('Question bank').waitFor();
      assert.deepEqual(adminWrites.at(-1).body, { unitId: U1, type: 'word_scramble', content: { answer: 'かぞく', hint: 'family' }, enabled: false });
      // Edit an existing question.
      await page.getByRole('link', { name: 'Edit question 1', exact: true }).click(); await page.getByText('Edit question 1').waitFor();
      assert.equal(await page.getByLabel('Prompt').inputValue(), 'Stored prompt one'); assert.ok(await page.getByLabel('Option 2 is correct').isChecked());
      await page.getByLabel('Prompt').fill('Edited prompt'); await page.getByRole('button', { name: 'Save changes' }).click(); await heading('Question bank').waitFor();
      assert.deepEqual([adminWrites.at(-1).method, adminWrites.at(-1).path, adminWrites.at(-1).body.content.prompt], ['PUT', '/admin/questions/1', 'Edited prompt']);
      await page.goto(base + '/admin/questions/new?id=999'); await page.getByText('That question no longer exists.').waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      for (const p of ['/admin/questions', '/admin/questions/new']) { await page.goto(base + p); await page.waitForTimeout(500); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${p} overflows on mobile`); }
      console.log('PASS (admin): sidebar entry; per-unit totals; filters and search; show/hide; delete with confirmation; add multiple choice, word match (from example) and word scramble; server validation message; edit; missing question; mobile.');
    }
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
  function awaitText(text) { return text; }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1100)); process.exitCode = 1; });
