const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

async function main() {
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  let server;
  const cache = new Map();
  function load(filename) {
    if (filename.endsWith('.json')) return JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (cache.has(filename)) return cache.get(filename);
    const exports = {}; cache.set(filename, exports);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(compiled, { exports, console, process, require: name => {
      if (name.endsWith('/config/db')) return { pool: {
        query: (...args) => client.query(...args),
        connect: async () => ({
          query: (sql, values) => client.query(sql === 'BEGIN' ? 'SAVEPOINT kanji_request' : sql === 'COMMIT' ? 'RELEASE SAVEPOINT kanji_request' : sql === 'ROLLBACK' ? 'ROLLBACK TO SAVEPOINT kanji_request' : sql, values),
          release() {},
        }),
      } };
      return name.startsWith('.') ? load(path.resolve(path.dirname(filename), name.endsWith('.json') ? name : name + '.ts')) : require(name);
    } });
    return exports;
  }
  const src = name => load(path.resolve(__dirname, '../src', name));
  try {
    await client.query('BEGIN');
    await client.query('CREATE TEMP TABLE users (id INTEGER PRIMARY KEY)');
    await client.query('INSERT INTO users VALUES (1),(2)');
    await client.query(fs.readFileSync(path.resolve(__dirname, '../migrations/004_kanji_progress.sql'), 'utf8').replaceAll('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE'));
    const { catalog, makeKanjiQuestion } = src('services/kanji.service.ts');
    const { characterProgress } = src('services/character-progress.ts');
    const references = load(path.resolve(__dirname, '../../nihon-web/src/data/japaneseStudyUnits.ts')).JAPANESE_STUDY_UNITS;
    const lessonIds = new Set(references.flatMap(unit => unit.lessons.map(l => l.id)));
    const words = references.flatMap(unit => unit.lessons.flatMap(l => l.vocabulary));
    assert.equal(catalog.kanji.length, 10);
    for (const k of catalog.kanji) {
      assert.ok(k.meanings.length && k.onyomi.length && k.kunyomi.length && k.source);
      assert.ok(Number.isInteger(k.strokeCount) && k.strokeCount > 0);
      assert.equal(k.jlptLevel, null);
      for (const kind of ['meaning','reading','vocabulary']) for (let repeat = 0; repeat < 30; repeat++) {
        const q = makeKanjiQuestion(k.id, kind);
        assert.equal(q.options.length, 4); assert.equal(new Set(q.options).size, 4);
        assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
        if (kind === 'meaning') assert.equal(q.options.filter(o => k.meanings.includes(o)).length, 1);
        if (kind === 'reading') assert.equal(q.options[q.correctIndex], catalog.vocabularyForms.find(f => f.written === q.display).reading);
        if (kind === 'vocabulary') assert.equal(q.options.filter(o => o.includes(k.character)).length, 1);
      }
    }
    for (const form of catalog.vocabularyForms) {
      assert.ok(form.vocabularyIds.length);
      for (const id of form.vocabularyIds) assert.equal(words.find(w => w.id === id)?.japanese, form.reading, id);
      for (const id of form.kanjiIds) assert.ok(form.written.includes(catalog.kanji.find(k => k.id === id).character));
    }
    for (const intro of catalog.lessonIntroductions) {
      assert.ok(lessonIds.has(intro.lessonId));
      assert.equal(new Set(intro.introducedKanji).size, intro.introducedKanji.length);
      for (const id of intro.introducedKanji) assert.ok(catalog.kanji.some(k => k.id === id));
    }
    // Exhaustively compare the extracted helper with the original Kana arithmetic.
    for (let c = 0; c <= 100; c++) for (let w = 0; w <= 100; w++) {
      const total = c + w, accuracy = total ? Number((c / total * 100).toFixed(0)) : 0;
      const original = !total ? 'untested' : accuracy >= 80 && c >= 3 ? 'mastered' : 'learning';
      assert.equal(characterProgress(c,w).status, original);
      assert.equal(characterProgress(c,w).accuracy, accuracy);
    }
    process.env.JWT_SECRET = 'local-kanji-test-only';
    const app = express(); app.use(express.json());
    app.use('/api/kanji', src('routes/kanji.routes.ts').default);
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    const headers = id => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${id === 1 ? token : jwt.sign({ userId: id }, process.env.JWT_SECRET)}` });
    const request = async (route, body, id = 1) => {
      const response = await fetch(`${base}/api/kanji${route}`, { method: body === undefined ? 'GET' : 'POST', headers: id === null ? {} : headers(id), ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      return { status: response.status, data: await response.json() };
    };
    assert.equal((await request('/progress', undefined, null)).status, 401);
    assert.equal((await request('/practice', { size: 3 }, null)).status, 401);
    assert.equal((await request('/answer', {}, null)).status, 401);
    assert.equal((await request('/practice', { size: 100 })).status, 400);
    assert.equal((await request('/practice', { size: 3, kanjiId: 'unknown' })).status, 404);
    assert.equal((await request('/practice', { size: 3, kanjiId: '' })).status, 404);
    assert.equal((await request('/answer', { questionId: 'bad', answerIndex: 0 })).status, 400);
    let progress = (await request('/progress')).data.progress;
    assert.equal(progress.length, 10); assert.ok(progress.every(p => p.total === 0 && p.status === 'untested' && p.lastPracticedAt === null));
    const chosen = catalog.kanji.find(k => k.character === '学');
    let session = await request('/practice', { size: 3, kanjiId: chosen.id });
    assert.equal(session.status, 200);
    assert.deepEqual(Array.from(session.data.questions, q => q.kind), ['meaning','reading','vocabulary']);
    assert.ok(session.data.questions.every(q => !('correctIndex' in q) && q.kanjiId === chosen.id));
    for (let i = 0; i < 3; i++) {
      const q = session.data.questions[i];
      const answerIndex = (await client.query('SELECT correct_index FROM kanji_practice_questions WHERE id=$1', [q.id])).rows[0].correct_index;
      assert.equal((await request('/answer', { questionId: q.id, answerIndex }, 2)).status, 404);
      assert.equal((await request('/answer', { questionId: q.id, answerIndex: 7 })).status, 400);
      let answer = await request('/answer', { questionId: q.id, answerIndex, userId: 2, correct: false });
      assert.equal(answer.status, 200); assert.equal(answer.data.correct, true);
      assert.equal(answer.data.progress.total, i + 1);
      assert.equal(answer.data.progress.status, i === 2 ? 'mastered' : 'learning');
      assert.ok(answer.data.progress.lastPracticedAt);
      const retry = await request('/answer', { questionId: q.id, answerIndex });
      assert.equal(retry.data.progress.total, i + 1);
      assert.equal((await request('/answer', { questionId: q.id, answerIndex: (answerIndex + 1) % 4 })).status, 409);
    }
    session = await request('/practice', { size: 3, kanjiId: chosen.id });
    const first = session.data.questions[0];
    const correctIndex = (await client.query('SELECT correct_index FROM kanji_practice_questions WHERE id=$1', [first.id])).rows[0].correct_index;
    const wrong = await request('/answer', { questionId: first.id, answerIndex: (correctIndex + 1) % 4 });
    assert.equal(wrong.data.progress.wrongCount, 1); assert.equal(wrong.data.progress.accuracy, 75);
    assert.equal(wrong.data.progress.status, 'learning');
    await client.query("UPDATE kanji_practice_questions SET expires_at=NOW()-INTERVAL '1 second' WHERE id=$1", [session.data.questions[1].id]);
    assert.equal((await request('/answer', { questionId: session.data.questions[1].id, answerIndex: 0 })).status, 410);
    assert.ok((await request('/progress', undefined, 2)).data.progress.every(p => p.total === 0));
    assert.equal((await request('/progress')).data.progress.find(p => p.kanjiId === chosen.id).total, 4);
    console.log('PASS: 10 verified-record shapes; vocabulary/lesson references; 900 unambiguous questions; 10,201 unchanged Kana mastery cases; auth/user isolation; grading, persistence, mastery transitions, expiry and idempotent retries.');

    if (process.argv.includes('--browser')) {
      const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
      const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
      try {
        await client.query('TRUNCATE user_kanji_progress, kanji_practice_questions');
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(token => { localStorage.setItem('token', token); localStorage.setItem('app_language','japanese'); }, token);
        await page.route('http://localhost:5000/api/kanji/**', async route => {
          const response = await route.fetch({ url: `${base}${new URL(route.request().url()).pathname}` });
          await route.fulfill({ response });
        });
        const web = process.env.TEST_BASE_URL || 'http://127.0.0.1:5181';
        await page.goto(`${web}/learn/kanji`);
        await page.getByRole('button', { name: '⚪ Untested (10)', exact: true }).waitFor();
        assert.equal(await page.getByRole('link', { name: '← Dashboard', exact: true }).getAttribute('href'), '/');
        await page.getByRole('button', { name: 'Study flashcards', exact: true }).click();
        await page.getByLabel('Card 1 of 10', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Next →', exact: true }).click();
        await page.getByLabel('Card 2 of 10', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
        await page.getByLabel('Card 1 of 10', { exact: true }).waitFor();
        await page.getByRole('button', { name: 'Study flashcards', exact: true }).click();
        await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click();
        await page.getByRole('button', { name: '漢 Kanji', exact: true }).click();
        assert.equal(new URL(page.url()).pathname, '/learn/kanji');
        assert.equal(await page.getByRole('link', { name: /Untested$/ }).count(), 10);
        await page.getByRole('searchbox').fill('ガク');
        assert.equal(await page.getByRole('link', { name: /Untested$/ }).count(), 1);
        await page.getByRole('link', { name: /study.*Untested/ }).click();
        await page.getByRole('heading', { name: '学', exact: true }).waitFor();
        await page.getByRole('img', { name: 'Stroke order for 学, 0 of 8 strokes', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Next Stroke', exact: true }).click();
        await page.getByRole('img', { name: 'Stroke order for 学, 1 of 8 strokes', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Previous Stroke', exact: true }).click();
        await page.getByRole('button', { name: 'Replay', exact: true }).click();
        await page.getByRole('img', { name: 'Stroke order for 学, 8 of 8 strokes', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await page.getByRole('img', { name: 'Stroke order for 学, 0 of 8 strokes', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Study flashcards', exact: true }).click();
        const study = page.getByRole('article', { name: 'Study 学', exact: true });
        await study.getByText("On'yomi", { exact: true }).waitFor();
        await study.getByText("Kun'yomi", { exact: true }).waitFor();
        await study.getByText('がくせい', { exact: true }).waitFor();
        assert.ok((await study.getByRole('link', { name: /学生/ }).getAttribute('href')).startsWith('/vocabulary?unit='));
        assert.equal(await page.getByRole('group', { name: 'Flashcard type' }).count(), 0);
        await study.locator('summary').click();
        await study.getByRole('button', { name: 'Next Stroke', exact: true }).click();
        await study.getByRole('img', { name: 'Stroke order for 学, 1 of 8 strokes', exact: true }).waitFor();
        assert.equal(await study.getByRole('link', { name: 'Mixed practice →', exact: true }).getAttribute('href'), '/learn/kanji/practice?kanji=kanji-5b66');
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.setViewportSize({ width: 1280, height: 900 });
        assert.equal(Number((await client.query('SELECT count(*) FROM user_kanji_progress')).rows[0].count), 0, 'Study must not change mastery');
        await page.getByRole('button', { name: 'Study flashcards', exact: true }).click();
        await page.locator('p[lang="ja"]').filter({ hasText: /^学生$/ }).waitFor();
        await page.getByRole('link', { name: 'Practice 学', exact: true }).click();
        await page.getByRole('button', { name: 'Start Practice', exact: true }).click();
        let dropped = false;
        await page.route('http://localhost:5000/api/kanji/answer', async route => {
          const response = await route.fetch({ url: `${base}/api/kanji/answer` });
          if (!dropped) { dropped = true; await route.abort(); }
          else await route.fulfill({ response });
        });
        for (let i = 0; i < 3; i++) {
          await page.getByText(`Question ${i + 1} / 3`, { exact: true }).waitFor();
          const q = (await client.query('SELECT options,correct_index FROM kanji_practice_questions WHERE user_id=1 AND answered_at IS NULL ORDER BY created_at, id')).rows;
          const promptKind = ['meaning','reading','vocabulary'][i];
          const row = (await client.query('SELECT options,correct_index FROM kanji_practice_questions WHERE user_id=1 AND kind=$1 AND answered_at IS NULL', [promptKind])).rows[0];
          assert.ok(q.length);
          const option = page.getByRole('button', { name: row.options[row.correct_index], exact: true });
          await option.focus(); await page.keyboard.press('Enter');
          if (i === 0) await page.getByRole('button', { name: 'Retry saving answer', exact: true }).click();
          await page.getByText('Correct!', { exact: true }).waitFor();
          await page.getByRole('button', { name: i === 2 ? 'View Summary' : 'Next Question →', exact: true }).click();
        }
        await page.getByRole('heading', { name: 'Practice Summary' }).waitFor();
        await page.getByRole('link', { name: 'Back to Kanji', exact: true }).click();
        await page.reload();
        await page.getByText('3 attempts · 3 correct · 0 incorrect · 100% accuracy', { exact: true }).waitFor();
        await page.goto(`${web}/learn/kanji`);
        await page.getByRole('button', { name: '🟢 Mastered (1)', exact: true }).click();
        await page.getByRole('link', { name: /study.*Mastered/ }).waitFor();
        assert.equal(await page.getByRole('link', { name: /Mastered$/ }).count(), 1);
        await page.goto(`${web}/vocabulary?unit=japanese-n5-unit-3&lesson=japanese-n5-unit-3-people-locations`);
        await page.getByRole('link', { name: 'Learn Kanji 学', exact: true }).click();
        await page.getByRole('heading', { name: '学', exact: true }).waitFor();
        // Only the lesson eligibility request is stubbed here; full unit gates are tested separately.
        await page.route('http://localhost:5000/api/lessons/**/access', route => route.fulfill({ json: { allowed: true } }));
        await page.getByRole('link', { name: /Unit 3 · Lesson 5/ }).click();
        const intro = page.getByRole('region', { name: 'Kanji introduced in this lesson' });
        await intro.getByRole('link', { name: /学/ }).click();
        await page.getByRole('heading', { name: '学', exact: true }).waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.goto(`${web}/vocabulary?unit=japanese-n5-unit-1&lesson=japanese-n5-unit-1-hello`);
        await page.getByRole('button', { name: 'Flashcards', exact: true }).click();
        const firstCard = page.getByRole('button', { name: /^Reveal answer for / });
        await firstCard.focus(); await page.keyboard.press('Enter');
        await page.getByRole('button', { name: /^Hide answer for / }).waitFor();
        await page.getByRole('button', { name: 'Next →', exact: true }).click();
        await page.getByRole('button', { name: /^Reveal answer for / }).waitFor();
        await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
        assert.ok((await page.getByRole('status', { name: /^Card 1 of / }).count()) === 1);
        await page.getByRole('button', { name: 'Lesson 2', exact: true }).click();
        await page.getByRole('button', { name: /^Reveal answer for / }).waitFor();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        console.log('PASS: unified Kanji study card, readings, vocabulary link, expandable shared strokes, mixed practice link, shuffle/navigation, no study progress writes, Vocabulary flashcard regression, practice persistence/mastery and mobile layout.');
      } finally { await browser.close(); }
    }
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await client.query('ROLLBACK'); client.release(); await pool.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
