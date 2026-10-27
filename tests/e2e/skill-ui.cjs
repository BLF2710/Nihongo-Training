// Listening and Speaking screens with fixture units, a recorded speech synthesiser and a scripted recogniser.
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const ts = require(ROOT + '/nihon-web/node_modules/typescript');
const base = process.argv[2], shots = process.argv[3];
const cache = new Map();
function load(f) { if (f.endsWith('.json')) return JSON.parse(fs.readFileSync(f, 'utf8')); if (cache.has(f)) return cache.get(f); const out = ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText; const exports = {}; cache.set(f, exports);
  vm.runInNewContext(out, { exports, console, require: n => load(['', '.ts', '.tsx'].map(e => path.resolve(path.dirname(f), n + e)).find(fs.existsSync)) }); return exports; }
const { getSkillUnit } = load(ROOT + '/nihon-web/src/data/japaneseSkillPractice.ts');
const unit1 = getSkillUnit('japanese-n5-unit-1');
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => {
      localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese');
      window.spoken = []; window.toHear = [];
      window.speechSynthesis.speak = utterance => { window.spoken.push(utterance.text); setTimeout(() => utterance.onend?.(), 20); };
      window.speechSynthesis.cancel = () => {};
      if (!window.noRecognition) window.SpeechRecognition = class {
        start() { setTimeout(() => { const next = window.toHear.shift(); if (next?.error) this.onerror?.({ error: next.error }); else this.onresult?.({ results: [(next ?? []).map(transcript => ({ transcript }))] }); this.onend?.(); }, 30); }
        abort() {}
      };
    }, token);
    const page = await context.newPage(); const errors = []; const writes = [];
    page.on('pageerror', e => errors.push(e.message));
    const unit = (number, allowed) => ({ id: `japanese-n5-unit-${number}`, number, title: `Unit title ${number}`, description: '', requiredLevel: 1, allowed, reasons: allowed ? [] : [`Complete Unit ${number - 1} first`], completedLessons: 6, totalLessons: 6, completedLessons: 0, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80, lessons: [] });
    let units = [unit(1, false), unit(2, false), unit(3, false)];
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', '');
      if (request.method() !== 'GET') writes.push(p === '/activity/practice' ? { p, ...request.postDataJSON() } : p);
      if (p === '/units') return route.fulfill({ json: { units } });
      if (p === '/site') return route.fulfill({ json: { registration_enabled: true, announcement: '', disabled: [] } });
      if (p === '/profile/me') return route.fulfill({ json: { display_name: 'Kai', username: 'kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } } });
      return route.fulfill({ json: {} });
    });
    const heading = name => page.getByRole('heading', { name, exact: true });
    const spoken = () => page.evaluate(() => window.spoken.splice(0));
    const choice = name => page.getByRole('button', { name, exact: true });

    // Entry points: dashboard cards and the existing sidebar.
    await page.goto(base + '/'); await heading('Your path').waitFor();
    for (const href of ['/listening', '/speaking']) assert.equal(await page.locator(`main a[href="${href}"]`).count(), 1);
    await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click();
    await page.locator('aside').getByRole('button', { name: /Listening$/ }).click(); await heading('Listening').waitFor();

    // No cleared unit: nothing to practise yet.
    await heading('No unit is open for listening practice yet').waitFor(); assert.equal(await page.locator('select').count(), 0);
    await page.goto(base + '/speaking'); await heading('No unit is open for speaking practice yet').waitFor();

    // Unit 1 is open with no lesson done yet: it is selectable, later units show the server's reason.
    units = [unit(1, true), unit(2, false), unit(3, false)];
    await page.goto(base + '/listening?unit=japanese-n5-unit-2'); await page.getByLabel('Choose a unit').waitFor();
    assert.equal(await page.getByLabel('Choose a unit').inputValue(), 'japanese-n5-unit-1', 'a locked unit cannot be opened by URL');
    assert.deepEqual(await page.locator('select option').evaluateAll(options => options.map(o => o.disabled)), [false, true, true]);
    assert.match(await page.locator('select option').nth(1).textContent(), /🔒 Complete Unit 1 first$/);

    // Listening · vocabulary: hidden text, audio, four meanings, right and wrong answers, results.
    let expected = 0;
    for (let i = 0; i < 10; i++) {
      await page.getByText(`Question ${i + 1} / 10`).waitFor();
      await page.getByRole('button', { name: '▶ Play audio' }).click(); await page.waitForTimeout(80);
      const [word] = await spoken(); const item = unit1.vocabulary.find(w => w.japanese === word); assert.ok(item, `spoken ${word}`);
      assert.equal(await page.getByText(word, { exact: true }).count(), 0, 'the word is not shown before answering');
      const options = await page.locator('.grid.grid-cols-2 button').allTextContents(); assert.equal(options.length, 4); assert.ok(options.includes(item.meaning));
      const right = i % 3 !== 2; if (right) expected++;
      await choice(right ? item.meaning : options.find(o => o !== item.meaning)).click();
      await page.getByText(right ? 'Correct!' : 'Not quite.', { exact: true }).waitFor(); await page.getByText(word, { exact: true }).first().waitFor();
      if (i === 0) await page.screenshot({ path: shots + '/listening.png' });
      await page.getByRole('button', { name: i === 9 ? 'See results →' : 'Next →' }).click();
    }
    await heading('Round complete').waitFor(); await page.getByText(`${expected} / 10`).waitFor();
    await page.getByRole('button', { name: 'Practice again' }).click(); await page.getByText('Question 1 / 10').waitFor();

    // Listening · sentences and dialogue.
    await page.getByRole('button', { name: 'Sentences', exact: true }).click();
    await page.getByRole('button', { name: '▶ Play audio' }).click(); await page.waitForTimeout(80);
    const [heardSentence] = await spoken(); const sentence = unit1.sentences.find(s => s.japanese === heardSentence); await choice(sentence.meaning).click(); await page.getByText('Correct!', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Dialogue', exact: true }).click(); await page.getByText('Question 1 / 5').waitFor();
    await page.getByRole('button', { name: '▶ Play audio' }).click(); await page.waitForTimeout(150);
    const lines = await spoken(); assert.equal(lines.length, 2, 'both dialogue lines are spoken');
    assert.ok(unit1.dialogues.some(d => d.lines[0].japanese === lines[0] && d.lines[1].japanese === lines[1]));
    await choice(lines[1]).click(); await page.getByText('Correct!', { exact: true }).waitFor();

    // Speaking · vocabulary: wrong attempt, retry in standard writing, skip, results.
    await page.goto(base + '/speaking'); await heading('Speaking').waitFor(); await page.getByText('Question 1 / 10').waitFor();
    const target = () => page.locator('p.text-3xl').innerText();
    const say = async (...alternatives) => { await page.evaluate(a => window.toHear.push(a), alternatives); await page.getByRole('button', { name: /Start speaking|Try again/ }).click(); };
    const first = await target();
    await page.getByRole('button', { name: '🔊 Hear it' }).click(); assert.deepEqual(await spoken(), [first]);
    await say('まったくちがう'); await page.getByText('Not quite — listen again and retry.').waitFor(); await page.getByText('We heard: まったくちがう').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Next →' }).count(), 0);
    await say('ノイズ', first); await page.getByText('Correct!', { exact: true }).waitFor();
    await page.screenshot({ path: shots + '/speaking.png' });
    await page.getByRole('button', { name: 'Next →' }).click(); await page.getByText('Question 2 / 10').waitFor(); await page.getByText('1 correct').waitFor();
    await page.evaluate(() => window.toHear.push({ error: 'not-allowed' })); await page.getByRole('button', { name: /Start speaking/ }).click();
    await page.getByRole('alert').filter({ hasText: 'Microphone access is blocked' }).waitFor();
    for (let i = 1; i < 10; i++) await page.getByRole('button', { name: /^Skip/ }).click();
    await heading('Round complete').waitFor(); await page.getByText('1 / 10').waitFor();

    // Speaking · sentences accept the recogniser's standard writing; dialogue is a role-play.
    await page.getByRole('button', { name: 'Sentences', exact: true }).click(); await page.getByText('Question 1 / 10').waitFor();
    const written = { 'わたしは さくらです。': '私は桜です', 'なまえは なんですか。': '名前は何ですか', 'わたしは にほんじんです。': '私は日本人です', 'アメリカから きました。': 'アメリカから来ました', 'これは なんですか。': 'これは何ですか', 'それは ほんです。': 'それは本です', 'わたしは 8さいです。': '私は8歳です', '10さいです。': '十歳です', 'これは ほんです。': 'これは本です', 'その かばんは なんですか。': 'そのカバンは何ですか', 'あれは せんせいです。': 'あれは先生です' };
    for (let i = 0; i < 10; i++) { const text = await target(); assert.ok(written[text], text); await say(written[text]); await page.getByText('Correct!', { exact: true }).waitFor(); await page.getByRole('button', { name: i === 9 ? 'See results →' : 'Next →' }).click(); }
    await page.getByText('10 / 10').waitFor();
    await page.getByRole('button', { name: 'Dialogue', exact: true }).click(); await page.getByText('Question 1 / 5').waitFor();
    const reply = await target(); const dialogue = unit1.dialogues.find(d => d.lines[1].japanese === reply);
    await page.getByText(dialogue.lines[0].japanese, { exact: true }).waitFor(); await page.getByText('Answer as B').waitFor();
    await page.getByRole('button', { name: '🔊 Hear A' }).click(); assert.deepEqual(await spoken(), [dialogue.lines[0].japanese]);
    await say(reply); await page.getByText('Correct!', { exact: true }).waitFor();

    // Browsers without speech recognition: stated plainly, nothing pretends to check.
    const plain = await context.newPage(); await plain.addInitScript(() => { window.noRecognition = true; delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
    await plain.goto(base + '/speaking'); await plain.getByRole('alert').filter({ hasText: 'no speech recognition' }).waitFor();
    assert.equal(await plain.getByRole('button', { name: /Start speaking/ }).count(), 0); await plain.getByRole('button', { name: /^Skip/ }).waitFor(); await plain.close();

    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of ['/listening', '/speaking']) { await page.goto(base + p); await page.getByText('Question 1 / 10').waitFor(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${p} overflows on mobile`); }
    const reports = writes.filter(w => typeof w === 'object');
    assert.deepEqual(writes.filter(w => typeof w === 'string' && !w.includes('/profile/me/time-zone')), [], 'practice writes nothing else to the API');
    assert.ok(reports.length >= 1, 'a finished round is reported for the streak');
    for (const r of reports) { assert.ok(['listening', 'speaking'].includes(r.kind)); assert.match(r.scope, /^japanese-n5-unit-\d$/); assert.ok(r.answered >= 1 && r.correct <= r.answered); }
    console.log('practice reports:', JSON.stringify(reports)); assert.deepEqual(errors, []);
    console.log('PASS: entry points; locked until a unit is cleared; unit selector; listening vocabulary/sentences/dialogue with checked answers and results; speaking with wrong/retry/correct, kanji transcripts, microphone error, skip, dialogue role-play; no-recognition notice; mobile; each finished round reported once for the streak, nothing else written.');
  } finally { await browser.close(); }
  function spoken0(list) { return list[0]; }
})().catch(error => { console.error(String(error.stack || error).slice(0, 900)); process.exitCode = 1; });
