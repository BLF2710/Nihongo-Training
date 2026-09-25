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
  const cache = new Map();
  let server;
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const exports = {};
    cache.set(filename, exports);
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
    vm.runInNewContext(compiled, { exports, console, process, require: name => {
      if (name.endsWith('/config/db')) return { pool: client };
      if (name.endsWith('/services/xp.service')) return { awardXP: () => { throw new Error('Assessment must not award XP'); } };
      if (name.endsWith('/services/achievement.service')) return { evaluateAchievements: () => { throw new Error('Unexpected achievement write'); } };
      return name.startsWith('.') ? load(path.resolve(path.dirname(filename), `${name}.ts`)) : require(name);
    } });
    return exports;
  }
  const src = name => load(path.resolve(__dirname, '../src', name));
  try {
    await client.query('BEGIN');
    // Fixtures are connection-local temporary tables; no real users/progress are edited.
    await client.query('CREATE TEMP TABLE users (id INTEGER PRIMARY KEY)');
    await client.query('INSERT INTO users VALUES (1), (2)');
    await client.query('CREATE TEMP TABLE user_gamification (user_id INTEGER, xp INTEGER)');
    await client.query('INSERT INTO user_gamification VALUES (1, 0), (2, 0)');
    await client.query('CREATE TEMP TABLE lesson_progress (user_id INTEGER, lesson_id VARCHAR(120), PRIMARY KEY (user_id,lesson_id))');
    const migration = fs.readFileSync(path.resolve(__dirname, '../migrations/003_unit_assessments.sql'), 'utf8');
    await client.query(migration.replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE'));
    const { UNITS } = src('data/units.ts');
    const { UNIT_ASSESSMENTS } = src('data/unit-assessments.ts');
    const { getUnitAccess, getUnitProgress } = src('services/unit.service.ts');
    const { canUserAccessLesson, LESSONS } = src('services/lesson.service.ts');
    assert.equal(UNITS.length, 3);
    assert.equal(UNIT_ASSESSMENTS.length, 1);
    const unit = UNITS[0];
    const assessment = UNIT_ASSESSMENTS[0];
    assert.equal(unit.lessonIds.length, 6);
    assert.equal(assessment.questions.length, 15);
    assert.equal(new Set(assessment.questions.map(q => q.id)).size, 15);
    assessment.questions.forEach(q => { assert.equal(new Set(q.options).size, 4); assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4); });
    const fixture = { ...unit, id: 'test-dependent-unit', previousUnitId: unit.id, requiredLevel: 3 };
    for (const [level, previous, expectedReasons] of [[1, false, 2], [3, false, 1], [1, true, 1], [3, true, 0]]) {
      const access = getUnitAccess(fixture, level, new Set(previous ? [unit.id] : []));
      assert.equal(access.allowed, expectedReasons === 0); assert.equal(access.reasons.length, expectedReasons);
    }
    assert.equal(getUnitProgress(unit, new Set(unit.lessonIds.slice(0, 5)), new Set([assessment.id])).completed, false);
    process.env.JWT_SECRET = 'local-unit-assessment-test-only';
    const app = express(); app.use(express.json());
    app.use('/api/units', src('routes/unit.routes.ts').default);
    app.use('/api/lessons', src('routes/lesson.routes.ts').default);
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const request = async (url, body, auth = headers) => {
      const response = await fetch(`${base}/api${url}`, { method: body === undefined ? 'GET' : 'POST', headers: auth, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      return { status: response.status, data: await response.json() };
    };
    const endpoint = `/units/${unit.id}/assessment`;
    const correct = assessment.questions.map(q => q.correctIndex);
    const answersFor = count => correct.map((answer, index) => index < count ? answer : (answer + 1) % 4);
    const post = count => request(endpoint, { assessmentId: assessment.id, answers: answersFor(count), userId: 2, score: 100 });
    assert.equal((await request('/units', undefined, {})).status, 401);
    assert.equal((await request(endpoint, undefined, {})).status, 401);
    assert.equal((await request(endpoint, { answers: correct }, {})).status, 401);
    let state = (await request('/units')).data.units[0];
    assert.equal(state.allowed, true); assert.equal(state.completedLessons, 0); assert.equal(state.completed, false);
    for (const lesson of LESSONS) assert.equal(state.lessons.find(l => l.id === lesson.id).allowed, (await canUserAccessLesson(1, lesson)).allowed);
    assert.equal((await request(`/lessons/${LESSONS[1].id}/complete`, { challengeScore: 100 })).status, 403);
    await client.query('UPDATE user_gamification SET xp=100 WHERE user_id=1');
    for (const id of unit.lessonIds.slice(0, 5)) await client.query('INSERT INTO lesson_progress VALUES (1,$1)', [id]);
    state = (await request('/units')).data.units[0];
    assert.equal(state.completedLessons, 5); assert.equal(state.assessmentUnlocked, false);
    assert.equal((await request(endpoint)).status, 403); assert.equal((await post(15)).status, 403);
    await client.query('INSERT INTO lesson_progress VALUES (1,$1)', [unit.lessonIds[5]]);
    state = (await request('/units')).data.units[0];
    assert.equal(state.assessmentUnlocked, true); assert.equal(state.completed, false);
    for (const lesson of LESSONS) assert.equal(state.lessons.find(l => l.id === lesson.id).allowed, (await canUserAccessLesson(1, lesson)).allowed);
    const publicAssessment = await request(endpoint);
    assert.equal(publicAssessment.status, 200);
    assert.ok(publicAssessment.data.questions.every(q => !('correctIndex' in q) && !('correct' in q)));
    for (const answers of [[], correct.slice(1), [...correct, 0], correct.map(() => null), correct.map(() => '0'), correct.map(() => 99)]) {
      assert.equal((await request(endpoint, { assessmentId: assessment.id, answers })).status, 400);
    }
    assert.equal((await request(endpoint, { assessmentId: 'invalid', answers: correct })).status, 400);
    assert.equal((await request('/units/does-not-exist/assessment')).status, 404);
    let result = await post(11);
    assert.equal(result.status, 200); assert.equal(result.data.correct, 11); assert.equal(result.data.wrong, 4); assert.equal(result.data.passed, false);
    assert.equal((await request('/units')).data.units[0].completed, false);
    result = await post(12);
    assert.equal(result.data.accuracy, 80); assert.equal(result.data.passed, true); assert.equal(result.data.unitCompleted, true);
    result = await post(0);
    assert.equal(result.data.passed, false); assert.equal(result.data.unitCompleted, true); assert.equal(result.data.bestScore, 80);
    await post(0); // Retrying the same submission has no extra progression effect.
    assert.equal((await request('/units')).data.units[0].completed, true);
    assert.equal((await request('/units', undefined, { ...headers, Authorization: `Bearer ${jwt.sign({ userId: 2 }, process.env.JWT_SECRET)}` })).data.units[0].completed, false);
    assert.equal((await client.query('SELECT count(*) FROM user_assessment_progress')).rows[0].count, '1');
    assert.equal((await client.query('SELECT xp FROM user_gamification WHERE user_id=1')).rows[0].xp, 100);
    for (const placeholder of UNITS.filter(item => item.isPlaceholder)) {
      assert.equal(placeholder.placeholderLessons.length, 1);
      assert.equal(placeholder.lessonIds.length, 0);
      assert.equal(getUnitProgress({ ...placeholder, lessonIds: ['fake'], assessmentId: 'fake' }, new Set(['fake']), new Set(['fake'])).completed, false);
      for (const [level, previousComplete, allowed] of [[1, false, false], [11, false, false], [1, true, false], [11, true, true]]) {
        assert.equal(getUnitAccess(placeholder, level, new Set(previousComplete ? [placeholder.previousUnitId] : [])).allowed, allowed);
      }
      assert.equal((await request(`/units/${placeholder.id}/assessment`)).status, 403);
      assert.equal((await request(`/units/${placeholder.id}/assessment`, { assessmentId: assessment.id, answers: correct })).status, 403);
      assert.equal((await request(`/lessons/${placeholder.placeholderLessons[0].id}/complete`, { challengeScore: 100 })).status, 404);
    }
    assert.equal((await request('/units')).data.units[1].allowed, false, 'Completion alone cannot bypass Level 3');
    await client.query('UPDATE user_gamification SET xp=700 WHERE user_id=1');
    let allUnits = (await request('/units')).data.units;
    assert.equal(allUnits[1].allowed, true);
    assert.equal(allUnits[2].allowed, false, 'High level cannot bypass incomplete placeholder Unit 2');
    await post(0);
    assert.equal((await request('/units')).data.units[1].allowed, true, 'Failed retake must preserve Unit 2 access');
    await client.query('INSERT INTO lesson_progress VALUES (1,$1)', [UNITS[1].placeholderLessons[0].id]);
    await client.query("INSERT INTO user_assessment_progress (user_id,assessment_id,best_score,last_score,passed_at) VALUES (1,'japanese-n5-unit-2-assessment',100,100,NOW())");
    allUnits = (await request('/units')).data.units;
    assert.equal(allUnits[1].completed, false); assert.equal(allUnits[1].assessmentUnlocked, false); assert.equal(allUnits[1].completedLessons, 0);
    assert.equal(allUnits[2].allowed, false);
    assert.equal(allUnits[0].bestCorrect, 12);
    console.log('PASS: three-unit catalog; placeholders cannot complete or be played; actual Unit 2/3 AND conditions; malformed placeholder progress ignored; retained Unit 2 access after failed retake.');
    console.log('PASS: real PostgreSQL + authenticated HTTP routes; new user; 5/6 and 6/6 gates; hidden answer keys; payload validation; 11/15 fail; 12/15 pass; persistent pass after failed retakes; user isolation; unchanged lesson gates/XP; future level AND prerequisite rules.');

    if (process.argv.includes('--browser')) {
      const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
      const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
      try {
        await client.query('TRUNCATE user_assessment_progress');
        await client.query('DELETE FROM lesson_progress WHERE user_id=1 AND lesson_id=$1', [unit.lessonIds[5]]);
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = []; page.on('pageerror', error => errors.push(error.message));
        await page.addInitScript(token => { localStorage.setItem('token', token); }, token);
        // Frontend calls the real controllers using only the temporary test DB.
        await page.route('http://localhost:5000/api/**', async route => {
          const response = await route.fetch({ url: `${base}${new URL(route.request().url()).pathname}` });
          await route.fulfill({ response });
        });
        const web = process.env.TEST_BASE_URL || 'http://127.0.0.1:5181';
        await page.goto(`${web}/lessons`);
        await page.getByText('5 / 6 lessons completed', { exact: true }).waitFor();
        assert.equal(await page.locator('select option').count(), 3);
        assert.equal(await page.locator('select option:disabled').count(), 2);
        const assessmentCard = page.getByRole('region', { name: 'Unit 1 Assessment', exact: true });
        assert.ok(await assessmentCard.evaluate(element => element.getBoundingClientRect().top > document.querySelector('main .space-y-4 > button:last-child').getBoundingClientRect().bottom));
        await page.getByText('Complete all 6 Unit 1 lessons to unlock the final assessment.', { exact: true }).waitFor();
        assert.equal(await page.getByRole('link', { name: 'Start Unit 1 Assessment →', exact: true }).count(), 0);
        await page.goto(`${web}/quizzes/${unit.id}`);
        await page.getByRole('alert').waitFor(); assert.equal(await page.getByRole('radio').count(), 0);
        await client.query('INSERT INTO lesson_progress VALUES (1,$1)', [unit.lessonIds[5]]);
        await page.goto(`${web}/quizzes`);
        await page.getByText('Coming Soon', { exact: true }).first().waitFor();
        assert.equal(await page.getByText('Coming Soon', { exact: true }).count(), 2);
        await page.getByRole('link', { name: 'Start Unit 1 Assessment →', exact: true }).click();
        await page.getByRole('radio').first().waitFor();
        assert.equal(await page.getByRole('button', { name: 'Next →', exact: true }).isDisabled(), true);
        async function finish(count) {
          const choices = answersFor(count);
          for (let i = 0; i < choices.length; i++) {
            await page.getByText(`Question ${i + 1} / 15`, { exact: true }).waitFor();
            await page.getByRole('radio').nth(choices[i]).check();
            await page.getByRole('button', { name: i === choices.length - 1 ? 'Submit Assessment' : 'Next →', exact: true }).click();
          }
        }
        await finish(11);
        await page.getByRole('heading', { name: 'Assessment Not Passed', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Try Again', exact: true }).click();
        await finish(12);
        await page.getByRole('heading', { name: '✓ Unit 1 Assessment Passed', exact: true }).waitFor();
        await page.getByRole('link', { name: 'Back to Lessons', exact: true }).click();
        await page.getByText('✓ Unit 1 Complete', { exact: true }).waitFor();
        await page.reload(); await page.getByText('✓ Unit 1 Complete', { exact: true }).waitFor();
        await page.getByText('Best score: 12 / 15 · Accuracy: 80%', { exact: true }).waitFor();
        await page.getByRole('combobox', { name: 'Choose a unit' }).selectOption(UNITS[1].id);
        await page.getByRole('heading', { name: 'Everyday Japanese', exact: true }).waitFor();
        assert.equal(await page.getByRole('progressbar').count(), 0);
        assert.equal(await page.getByRole('button', { name: /Lesson 1.*Coming Soon/ }).isDisabled(), true);
        assert.equal(await page.getByRole('link', { name: /Start.*Assessment/ }).count(), 0);
        assert.notEqual(await page.locator(`option[value="${UNITS[2].id}"]`).getAttribute('disabled'), null);
        await page.goto(`${web}/quizzes`);
        await page.getByRole('link', { name: 'Retake Assessment', exact: true }).click();
        await finish(0);
        await page.getByText('✓ Unit 1 Complete — your earlier pass is still valid.', { exact: true }).waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.deepEqual(errors, []);
        console.log('PASS: browser unit selector, 5/6 locked listing + direct URL, 6/6 unlock, required answers, 15-question fail/pass/retake flow, saved completion after refresh, mobile summary, no browser errors.');
      } finally { await browser.close(); }
    }
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await client.query('ROLLBACK'); client.release(); await pool.end();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
