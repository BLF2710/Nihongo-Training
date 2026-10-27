// Builds streak-api.cjs: the review-api harness (temp copies of every table, rolled back) plus streak checks.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Daily learning streaks")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    `await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    for (const table of ['hiraganas', 'katakanas', 'kanji_catalog']) await client.query('INSERT INTO pg_temp.' + table + ' SELECT * FROM public.' + table);
    const streakSql = fs.readFileSync(path.join(API, 'migrations/012_learning_streaks.sql'), 'utf8');
    await client.query(streakSql);`)
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/quiz', src('routes/quiz.routes.ts').default); app.use('/api/kanji', src('routes/kanji.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat']) {");
for (const needle of ['012_learning_streaks', "routes/profile.routes.ts", "'ben', 'cat'", 'hiraganas']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const me = async (as = L) => { const p = (await call('GET', '/profile/me', { as })).data; return { streak: Number(p.current_streak), longest: Number(p.longest_streak), today: p.active_today }; };
    const setState = async (name, sql, streak, longest = streak) => client.query('UPDATE user_gamification SET last_activity_at = ' + sql + ', current_streak = $2, longest_streak = $3 WHERE user_id = $1', [await uid(name), streak, longest]);
    const kana = (as = L) => call('POST', '/quiz/answer', { as, body: { type: 'hiragana', kanaId: 1, answer: 'a' } });
    // ---- a new learner has no streak
    assert.deepEqual(await me(), { streak: 0, longest: 0, today: false });
    // ---- the first learning action of a day starts a streak; more actions the same day change nothing
    assert.equal((await kana()).status, 200); assert.deepEqual(await me(), { streak: 1, longest: 1, today: true });
    await kana(); await kana(); assert.deepEqual(await me(), { streak: 1, longest: 1, today: true });
    // ---- active yesterday: today's first action extends the streak
    await setState('learner', "NOW() - INTERVAL '1 day'", 3);
    assert.deepEqual(await me(), { streak: 3, longest: 3, today: false }, 'yesterday still counts until today ends');
    await kana(); assert.deepEqual(await me(), { streak: 4, longest: 4, today: true });
    // ---- a missed day: the streak reads 0 at once, and the next action starts again from 1; the record is kept
    await setState('learner', "NOW() - INTERVAL '3 days'", 6, 9);
    assert.deepEqual(await me(), { streak: 0, longest: 9, today: false });
    await kana(); assert.deepEqual(await me(), { streak: 1, longest: 9, today: true });
    // ---- guests answering kana do not touch anyone's streak
    assert.equal((await call('POST', '/quiz/answer', { body: { type: 'hiragana', kanaId: 1, answer: 'a' } })).status, 200);
    // ---- other learning actions count: kanji practice and review answers
    await setState('ben', "NOW() - INTERVAL '1 day'", 2);
    const practice = await call('POST', '/kanji/practice', { as: 'ben', body: { size: 3, kanjiId: 'kanji-65e5' } }); assert.equal(practice.status, 200, JSON.stringify(practice.data).slice(0, 200));
    const question = (practice.data.questions ?? practice.data)[0];
    assert.equal((await call('POST', '/kanji/answer', { as: 'ben', body: { questionId: question.id, answerIndex: 0 } })).status, 200);
    assert.deepEqual(await me('ben'), { streak: 3, longest: 3, today: true }, 'kanji practice counts');
    await setState('cat', "NOW() - INTERVAL '1 day'", 1);
    const review = await call('GET', '/review/units/japanese-n5-unit-1/questions', { as: 'cat' });
    const mc = review.data.questions.find(q => q.type === 'multiple_choice');
    assert.equal((await call('POST', '/review/units/japanese-n5-unit-1/check', { as: 'cat', body: { questionId: mc.id, answer: 0 } })).status, 200);
    assert.deepEqual(await me('cat'), { streak: 2, longest: 2, today: true }, 'review answers count');
    // ---- an automatic reward (an achievement) is not learning activity
    await setState('admin', "NOW() - INTERVAL '1 day'", 4);
    await src('services/xp.service.ts').awardXP(await uid('admin'), 10, 'achievement', 'test-achievement');
    assert.deepEqual(await me('admin'), { streak: 4, longest: 4, today: false });
    // ---- the time zone decides where the day starts
    assert.equal((await call('PUT', '/profile/me/time-zone', { as: L, body: { timeZone: 'Mars/Olympus' } })).status, 400);
    assert.equal((await call('PUT', '/profile/me/time-zone', { as: L, body: { timeZone: "UTC'; DROP TABLE users; --" } })).status, 400);
    assert.equal((await call('PUT', '/profile/me/time-zone', { as: L, body: { timeZone: 'Asia/Tokyo' } })).status, 200);
    // 23:59 yesterday in Tokyo is "yesterday" there, whatever the UTC date is.
    await setState('learner', "(date_trunc('day', NOW() AT TIME ZONE 'Asia/Tokyo') - INTERVAL '1 minute') AT TIME ZONE 'Asia/Tokyo'", 5, 9);
    assert.deepEqual(await me(), { streak: 5, longest: 9, today: false });
    await kana(); assert.deepEqual(await me(), { streak: 6, longest: 9, today: true });
    // 00:01 today in Tokyo is already "today": a second action keeps the streak.
    await setState('learner', "date_trunc('day', NOW() AT TIME ZONE 'Asia/Tokyo') AT TIME ZONE 'Asia/Tokyo' + INTERVAL '1 minute'", 6, 9);
    await kana(); assert.deepEqual(await me(), { streak: 6, longest: 9, today: true });
    // ---- the migration rebuilds streaks from stored history (UTC days)
    const backfill = streakSql.slice(streakSql.indexOf('WITH activity'));
    const ben = await uid('ben'), cat = await uid('cat');
    await client.query('DELETE FROM xp_events WHERE user_id = ANY($1)', [[ben, cat]]);
    await client.query("UPDATE user_gamification SET current_streak = 0, longest_streak = 0, last_activity_at = NULL WHERE user_id = ANY($1)", [[ben, cat]]);
    await client.query('DELETE FROM kanji_practice_questions WHERE user_id = $1', [ben]);
    for (const [user, days, source] of [[ben, 1, 'lesson_completion'], [ben, 2, 'quiz'], [ben, 3, 'game'], [ben, 6, 'quiz'], [ben, 7, 'quiz'], [ben, 8, 'quiz'], [ben, 9, 'quiz'], [cat, 5, 'game'], [cat, 2, 'achievement']]) {
      await client.query("INSERT INTO xp_events (user_id, amount, source, reference_id, created_at) VALUES ($1, 5, $3, $4, NOW() - make_interval(days => $2))", [user, days, source, 'bf-' + days + '-' + source]);
    }
    await client.query("UPDATE user_profiles SET time_zone = 'UTC' WHERE user_id = ANY($1)", [[ben, cat]]);
    await client.query(backfill);
    assert.deepEqual(await me('ben'), { streak: 3, longest: 4, today: false }, 'three days ending yesterday; an older run of four');
    assert.deepEqual(await me('cat'), { streak: 0, longest: 1, today: false }, 'achievements are not activity, and a five-day-old run has ended');
    console.log('PASS: new learner 0; first action starts 1, repeats the same day do not add; yesterday extends (4), a missed day reads 0 at once and restarts at 1 while the record (9) stays; guests ignored; kanji practice and review answers count; achievements do not; invalid or injected time zones refused; Tokyo day boundaries at 23:59 yesterday and 00:01 today; migration rebuilds current and longest streaks from history (3 and 4) and ignores achievements. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'streak-api.cjs'), head + tail);
console.log('written');
