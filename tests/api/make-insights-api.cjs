// Builds insights-api.cjs: the review-api harness plus practice-session recording and admin analytics checks.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Practice sessions and admin learning analytics")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    `await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    for (const file of ['012_learning_streaks.sql']) await client.query(fs.readFileSync(path.join(API, 'migrations', file), 'utf8'));
    await client.query(fs.readFileSync(path.join(API, 'migrations/013_practice_sessions.sql'), 'utf8').replaceAll('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));`)
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/activity', src('routes/activity.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat']) {");
for (const needle of ['013_practice_sessions', 'activity.routes', "'ben', 'cat'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const practice = (body, as = 'learner') => call('POST', '/activity/practice', { as, body });
    const streakOf = async as => Number((await call('GET', '/profile/me', { as })).data.current_streak);
    // ---- recording a finished practice session
    assert.equal((await call('POST', '/activity/practice', { body: { kind: 'reading', scope: 'japanese-n5-unit-6', answered: 3, correct: 3 } })).status, 401);
    for (const [body, why] of [
      [{ kind: 'singing', scope: 'japanese-n5-unit-6', answered: 3, correct: 3 }, 'unknown kind'],
      [{ kind: 'listening', scope: 'japanese-n5-unit-6', answered: 3, correct: 3 }, 'too few answers for a round'],
      [{ kind: 'reading', scope: 'unit six', answered: 3, correct: 3 }, 'bad scope'],
      [{ kind: 'mock-exam', scope: 'japanese-n5-unit-6', answered: 36, correct: 30 }, 'mock exam needs a level'],
      [{ kind: 'reading', scope: 'japanese-n5-unit-6', answered: 3, correct: 4 }, 'more correct than answered'],
      [{ kind: 'reading', scope: 'japanese-n5-unit-6', answered: 2.5, correct: 1 }, 'not whole numbers'],
      [{ kind: 'reading', scope: 'japanese-n5-unit-6', answered: 999, correct: 1 }, 'too many answers'],
    ]) assert.equal((await practice(body)).status, 400, why);
    assert.equal(await streakOf('learner'), 0);
    const ok = await practice({ kind: 'listening', scope: 'japanese-n5-unit-4', answered: 10, correct: 8 }); assert.equal(ok.status, 201); assert.equal(ok.data.currentStreak, 1);
    assert.equal(await streakOf('learner'), 1, 'a finished listening round counts toward the streak');
    assert.equal((await practice({ kind: 'mock-exam', scope: 'N5', answered: 36, correct: 30 }, 'ben')).status, 201);
    assert.equal((await practice({ kind: 'speaking', scope: 'japanese-n4-unit-1', answered: 10, correct: 6 }, 'ben')).status, 201);
    assert.equal((await practice({ kind: 'reading', scope: 'japanese-n5-unit-6', answered: 3, correct: 2 }, 'cat')).status, 201);
    // ---- rate limit
    await client.query("INSERT INTO practice_sessions (user_id, kind, scope, answered, correct) SELECT $1, 'reading', 'japanese-n5-unit-6', 1, 1 FROM generate_series(1, 60)", [await uid('cat')]);
    assert.equal((await practice({ kind: 'reading', scope: 'japanese-n5-unit-6', answered: 3, correct: 2 }, 'cat')).status, 429);
    await client.query("DELETE FROM practice_sessions WHERE user_id = $1 AND answered = 1", [await uid('cat')]);

    // ---- analytics: seed lesson progress, assessments and older activity
    const [ana, ben, cat] = [await uid('learner'), await uid('ben'), await uid('cat')];
    const { UNITS } = src('data/units.ts'); const unit1 = UNITS[0]; const unit4 = UNITS.find(u => u.id === 'japanese-n5-unit-4');
    for (const lesson of unit1.lessonIds) await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [ana, lesson]);
    for (const lesson of unit1.lessonIds.slice(0, 3)) await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [ben, lesson]);
    await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [cat, unit1.lessonIds[0]]);
    await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [ben, unit4.lessonIds[0]]);
    await client.query("INSERT INTO user_assessment_progress (user_id, assessment_id, best_score, last_score, passed_at) VALUES ($1, $2, 93.3, 93.3, NOW()), ($3, $2, 60, 60, NULL)", [ana, unit1.assessmentId, ben]);
    // The administrator's own work is never counted.
    const admin = await uid('admin');
    await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2)', [admin, unit1.lessonIds[0]]);
    await client.query("INSERT INTO practice_sessions (user_id, kind, scope, answered, correct) VALUES ($1, 'reading', 'japanese-n5-unit-6', 3, 3)", [admin]);
    await client.query("UPDATE user_gamification SET last_activity_at = NOW() - INTERVAL '10 days' WHERE user_id = $1", [cat]);
    assert.equal((await call('GET', '/admin/analytics', { as: 'learner' })).status, 403);
    const analytics = await call('GET', '/admin/analytics', { as: 'admin' }); assert.equal(analytics.status, 200);
    const a = analytics.data;
    assert.deepEqual(a.learners, { total: 3, newLast30Days: 3, activeToday: 2, activeLast7Days: 2, activeLast30Days: 3 });
    assert.equal(a.dailyActive.length, 14); assert.equal(a.dailyActive.at(-1).learners, 3, 'three learners did graded work today');
    const u1 = a.funnel.find(f => f.unitId === unit1.id);
    assert.deepEqual([u1.started, u1.finishedLessons, u1.assessment.attempted, u1.assessment.passed, u1.assessment.passRate], [3, 1, 2, 1, 50]);
    assert.equal(u1.assessment.averageBest, 77);
    assert.deepEqual([a.funnel.find(f => f.unitId === 'japanese-n5-unit-4').started, a.funnel.find(f => f.unitId === 'japanese-n5-unit-4').assessment.passRate], [1, null]);
    assert.equal(a.funnel.find(f => f.unitId === 'japanese-n4-unit-1').level, 'N4');
    const top = a.dropOffs[0];
    assert.equal(top.unitId, unit1.id); assert.equal(top.from.id, unit1.lessonIds[0]); assert.equal(top.lost, 1); assert.equal(top.from.completed, 3); assert.equal(top.to.completed, 2);
    assert.ok(a.dropOffs.some(d => d.from.id === unit1.lessonIds[2] && d.lost === 1), 'ben stopped after lesson 3');
    const byKind = Object.fromEntries(a.practice.map(p => [p.kind, p]));
    assert.deepEqual([byKind.listening.sessions, byKind.listening.accuracy, byKind['mock-exam'].sessions, byKind.reading.sessions], [1, 80, 1, 1], 'admin practice is excluded');
    // ---- Particle Drop rounds: a course level as scope, at least 5 answers, paid as game XP
    assert.equal((await practice({ kind: 'particles', scope: 'japanese-n5-unit-4', answered: 10, correct: 7 })).status, 400, 'a round covers a level');
    assert.equal((await practice({ kind: 'particles', scope: 'N5', answered: 3, correct: 3 })).status, 400, 'too few answers for a round');
    const round = await practice({ kind: 'particles', scope: 'N5', answered: 10, correct: 7 });
    assert.equal(round.status, 201); assert.equal(round.data.reward.xpEarned, 10);
    assert.equal((await client.query("SELECT count(*)::int AS n FROM xp_events WHERE user_id = $1 AND source = 'game'", [ana])).rows[0].n, 1);
    console.log('PASS: practice sessions need sign-in and valid kind, scope, counts and limits; Particle Drop rounds by level, paid as game XP; a finished round counts toward the streak; rate limit at 60 an hour; analytics (admins only): learner totals and activity windows, 14-day daily actives, unit funnel (3 started, 1 finished, 2 attempted, 1 passed = 50%, average best 77), N4 units labelled, drop-offs between consecutive lessons ranked, practice volume and accuracy by kind; administrators\' own activity excluded. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'insights-api.cjs'), head + tail);
console.log('written');
