// Builds learning-api.cjs: the review-api harness (temp copies of every table, rolled back) plus spaced repetition,
// the mistake notebook, server-graded mock exams, study time and the statistics overview.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Learning records: spaced repetition, mistakes, mock exams, study time, statistics")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/units', src('routes/unit.routes.ts').default); app.use('/api/srs', src('routes/srs.routes.ts').default); app.use('/api/mistakes', src('routes/mistake.routes.ts').default); app.use('/api/mock-exams', src('routes/mock-exam.routes.ts').default); app.use('/api/activity', src('routes/activity.routes.ts').default); app.use('/api/statistics', src('routes/statistics.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/srs.routes.ts', "'ben']", 'setInterval, clearInterval']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const learnerId = await uid(L), benId = await uid('ben');
    const complete = async (userId, lessonIds) => { for (const id of lessonIds) await client.query("INSERT INTO lesson_progress (user_id, lesson_id, challenge_score) VALUES ($1, $2, 80) ON CONFLICT DO NOTHING", [userId, id]); };
    const HELLO = 'japanese-n5-unit-1-hello';
    const MINUTE = 60 * 1000, DAY = 24 * 60 * MINUTE;

    // ================= Spaced repetition
    assert.equal((await call('GET', '/srs/summary')).status, 401);
    await complete(learnerId, [HELLO]);
    const enrol = items => call('POST', '/srs/cards', { as: L, body: { items } });
    const first = await enrol([
      { itemType: 'vocabulary', itemId: HELLO + ':こんにちは' }, { itemType: 'kanji', itemId: 'kanji-65e5' },
      { itemType: 'kanji', itemId: 'kanji-nope' }, { itemType: 'vocabulary', itemId: 'japanese-n5-unit-2-family:かぞく' },
      { itemType: 'vocabulary', itemId: HELLO + ':' }, { itemType: 'vocabulary', itemId: 'こんにちは' },
    ]);
    assert.deepEqual([first.status, first.data], [200, { added: 2, ignored: 4 }], 'only words of completed lessons and catalog Kanji');
    assert.deepEqual((await enrol([{ itemType: 'kanji', itemId: 'kanji-65e5' }])).data, { added: 0, ignored: 0 }, 'existing cards untouched');
    for (const items of ['x', [{ itemType: 'grammar', itemId: 'a' }], [{ itemType: 'kanji' }], [null], Array(501).fill({ itemType: 'kanji', itemId: 'kanji-65e5' })]) assert.equal((await enrol(items)).status, 400);
    let summary = (await call('GET', '/srs/summary', { as: L })).data;
    assert.deepEqual([summary.total, summary.newCards, summary.newToday, summary.dueNow, summary.dueTotal], [2, 2, 2, 0, 2]);
    let queue = (await call('GET', '/srs/queue', { as: L })).data;
    assert.deepEqual(queue.cards.map(c => c.itemId).sort(), [HELLO + ':こんにちは', 'kanji-65e5'].sort());
    assert.deepEqual(queue.cards[0].intervals, { again: 10 * MINUTE, hard: DAY, good: DAY, easy: 3 * DAY });
    const grade = (itemType, itemId, g, as = L) => call('POST', '/srs/reviews', { as, body: { itemType, itemId, grade: g } });
    assert.equal((await grade('kanji', 'kanji-65e5', 'perfect')).status, 400);
    assert.equal((await grade('kanji', 'kanji-65e5', 'good', 'ben')).status, 404, "another learner's card");
    assert.equal((await grade('kanji', 'kanji-4e00', 'good')).status, 404);
    const good = await grade('vocabulary', HELLO + ':こんにちは', 'good');
    assert.equal(good.status, 200); assert.equal(good.data.intervalDays, 1); assert.ok(Math.abs(new Date(good.data.dueAt) - Date.now() - DAY) < MINUTE);
    assert.equal((await grade('vocabulary', HELLO + ':こんにちは', 'good')).status, 409, 'not due yet');
    const forgotten = (await grade('kanji', 'kanji-65e5', 'again')).data;
    assert.equal(forgotten.intervalDays, 0); assert.deepEqual([forgotten.intervals.again, forgotten.intervals.good], [10 * MINUTE, DAY], 'previews for seeing it again');
    assert.equal((await grade('kanji', 'kanji-65e5', 'good')).status, 200, 'a card being learned can be repeated in the session');
    assert.equal((await client.query('SELECT COUNT(*)::int AS n FROM srs_reviews WHERE user_id = $1', [learnerId])).rows[0].n, 3);
    assert.equal((await client.query('SELECT current_streak FROM user_gamification WHERE user_id = $1', [learnerId])).rows[0].current_streak, 1, 'reviews count toward the streak');
    summary = (await call('GET', '/srs/summary', { as: L })).data;
    assert.deepEqual([summary.newCards, summary.dueNow, summary.reviewedToday, summary.learned], [0, 0, 3, 2]);
    // The daily limit of new cards: 20, and 2 were introduced today.
    const catalog = JSON.parse(fs.readFileSync(ROOT + '/shared/kanji.json', 'utf8')).kanji;
    assert.equal((await enrol(catalog.slice(1, 31).map(k => ({ itemType: 'kanji', itemId: k.id })))).data.added, 30);
    queue = (await call('GET', '/srs/queue', { as: L })).data;
    assert.equal(queue.cards.filter(c => c.isNew).length, 18); assert.equal(queue.newLimit, 20);
    // A due review comes before new cards.
    await client.query("UPDATE srs_cards SET due_at = NOW() - INTERVAL '1 hour' WHERE user_id = $1 AND item_type = 'vocabulary'", [learnerId]);
    queue = (await call('GET', '/srs/queue', { as: L })).data;
    assert.deepEqual([queue.cards[0].itemId, queue.cards[0].isNew], [HELLO + ':こんにちは', false]);
    assert.equal((await call('GET', '/srs/summary', { as: L })).data.dueTotal, 19);
    assert.equal((await grade('vocabulary', HELLO + ':こんにちは', 'good')).data.intervalDays, 3, 'second success: 3 days');

    // ================= Mistakes from the unit review

    const review = (await call('GET', '/review/units/' + U1 + '/questions', { as: L })).data.questions;
    const mcq = review.find(q => q.type === 'multiple_choice');
    const stored = (await client.query('SELECT content FROM review_questions WHERE id = $1', [Number(mcq.id.split(':')[1])])).rows[0].content;
    const wrongIndex = (stored.correctIndex + 1) % mcq.options.length;
    const check = answer => call('POST', '/review/units/' + U1 + '/check', { as: L, body: { questionId: mcq.id, answer } });
    await check(wrongIndex);
    let notebook = (await call('GET', '/mistakes', { as: L })).data;
    assert.equal(notebook.mistakes.length, 1);
    let mistake = notebook.mistakes[0];
    assert.deepEqual([mistake.source, mistake.label, mistake.prompt, mistake.answer, mistake.given, mistake.isLocked, mistake.wrongCount],
      ['review', 'Unit 1 review', stored.prompt, stored.options[stored.correctIndex], mcq.options[wrongIndex], false, 1]);
    assert.deepEqual(mistake.options, stored.options);
    assert.deepEqual(notebook.counts, { open: 1, resolved: 0, bySource: { lesson: 0, review: 1, assessment: 0, mock_exam: 0 } });
    await check(stored.correctIndex); await check(stored.correctIndex);
    notebook = (await call('GET', '/mistakes', { as: L })).data;
    assert.equal(notebook.mistakes.length, 0, 'two right answers in a row clear it');
    assert.equal((await call('GET', '/mistakes?status=resolved', { as: L })).data.mistakes.length, 1);
    await check(wrongIndex);
    mistake = (await call('GET', '/mistakes', { as: L })).data.mistakes[0];
    assert.deepEqual([mistake.wrongCount, mistake.correctStreak, mistake.resolvedAt], [2, 0, null], 'wrong again: back in the notebook');
    // Practice in the notebook
    const practise = (id, correct, as = L) => call('POST', '/mistakes/' + id + '/practice', { as, body: { correct } });
    assert.equal((await practise(mistake.id, 'yes')).status, 400);
    assert.equal((await practise(mistake.id, true, 'ben')).status, 404);
    assert.equal((await practise('abc', true)).status, 404);
    assert.deepEqual((await practise(mistake.id, true)).data, { id: mistake.id, correctStreak: 1, wrongCount: 2, isResolved: false, reward: null });
    assert.deepEqual((await practise(mistake.id, false)).data, { id: mistake.id, correctStreak: 0, wrongCount: 3, isResolved: false, reward: null });
    await practise(mistake.id, true);
    const cleared = (await practise(mistake.id, true)).data;
    assert.deepEqual([cleared.isResolved, cleared.reward.xpEarned], [true, 5], "clearing a mistake pays XP");
    assert.equal((await practise(mistake.id, true)).status, 409, 'already cleared');
    assert.equal((await call('DELETE', '/mistakes/' + mistake.id, { as: 'ben' })).status, 404);
    assert.equal((await call('DELETE', '/mistakes/' + mistake.id, { as: L })).status, 200);
    assert.equal((await call('DELETE', '/mistakes/' + mistake.id, { as: L })).status, 404);

    // ================= Mistakes from a lesson challenge
    const lessonAnswer = (extra = {}) => ({ prompt: 'Which greeting fits the morning?', options: ['おはよう', 'こんばんは', 'さようなら'], answer: 'おはよう', given: 'こんばんは', correct: false, explanation: 'おはよう is a morning greeting.', ...extra });
    const lesson = (lessonId, answers, as = L) => call('POST', '/mistakes/lessons/' + lessonId, { as, body: { answers } });
    const recorded = await lesson(HELLO, [lessonAnswer(), lessonAnswer({ prompt: 'Say thank you.', options: ['ありがとう', 'すみません'], answer: 'ありがとう', given: 'ありがとう', correct: true })]);
    assert.deepEqual([recorded.status, recorded.data], [201, { recorded: 2, mistakes: 1 }]);
    assert.equal((await lesson('japanese-n5-unit-1-introductions', [lessonAnswer()])).status, 403, 'lesson not finished');
    assert.equal((await lesson(HELLO, [lessonAnswer()], 'ben')).status, 403);
    assert.equal((await lesson('nope', [lessonAnswer()])).status, 404);
    for (const answers of [[], 'x', Array(31).fill(lessonAnswer()), [lessonAnswer({ answer: 'not an option' })], [lessonAnswer({ given: '' })], [lessonAnswer({ options: ['only one'] })], [lessonAnswer({ prompt: 'x'.repeat(301) })], [lessonAnswer({ correct: 'no' })]]) {
      assert.equal((await lesson(HELLO, answers)).status, 400, JSON.stringify(answers).slice(0, 80));
    }
    notebook = (await call('GET', '/mistakes', { as: L })).data;
    const lessonMistake = notebook.mistakes.find(m => m.source === 'lesson');
    assert.deepEqual([lessonMistake.label, lessonMistake.answer, lessonMistake.given, lessonMistake.explanation], ['How to Say Hello', 'おはよう', 'こんばんは', 'おはよう is a morning greeting.']);
    await lesson(HELLO, [lessonAnswer()]);
    assert.equal((await call('GET', '/mistakes', { as: L })).data.mistakes.find(m => m.source === 'lesson').wrongCount, 2, 'the same question is one entry');

    // ================= Mistakes from an assessment: the right answers stay hidden until it is passed
    const { LESSONS } = src('data/lessons.ts');
    await complete(learnerId, LESSONS.filter(l => l.unit === 'Japanese N5 Unit 1').map(l => l.id));
    const sheet = (await call('GET', '/units/' + U1 + '/assessment', { as: L })).data;
    const assessmentQuestions = sheet.questions ?? sheet.assessment?.questions;
    const { UNIT_ASSESSMENTS } = src('data/unit-assessments.ts'); const key = UNIT_ASSESSMENTS.find(a => a.id === (sheet.assessmentId ?? sheet.id ?? sheet.assessment?.id));
    const answers = key.questions.map((q, i) => i === 0 ? q.correctIndex : (q.correctIndex + 1) % q.options.length);
    const submitted = await call('POST', '/units/' + U1 + '/assessment', { as: L, body: { assessmentId: key.id, answers } });
    assert.equal(submitted.status, 200, JSON.stringify(submitted.data).slice(0, 200)); assert.equal(submitted.data.passed, false);
    notebook = (await call('GET', '/mistakes', { as: L })).data;
    const fromAssessment = notebook.mistakes.filter(m => m.source === 'assessment');
    assert.equal(fromAssessment.length, key.questions.length - 1);
    for (const m of fromAssessment) { assert.equal(m.isLocked, true); assert.ok(!('answer' in m) && !('explanation' in m), 'no answer before passing'); assert.ok(m.given && m.prompt && m.options.length); }
    assert.equal((await practise(fromAssessment[0].id, true)).status, 409);
    assert.ok(assessmentQuestions.length);
    await client.query('UPDATE user_assessment_progress SET passed_at = NOW() WHERE user_id = $1', [learnerId]);
    const unlocked = (await call('GET', '/mistakes', { as: L })).data.mistakes.filter(m => m.source === 'assessment');
    assert.ok(unlocked.every(m => !m.isLocked && typeof m.answer === 'string'));
    const firstWrong = key.questions[1];
    assert.equal(unlocked.find(m => m.prompt === firstWrong.prompt).answer, firstWrong.options[firstWrong.correctIndex]);
    assert.equal((await practise(unlocked[0].id, true)).status, 200);

    // ================= Mock exams graded on the server
    const exam = JSON.parse(fs.readFileSync(ROOT + '/shared/course/mock-exams.json', 'utf8')).N5;
    const mockQuestions = exam.sections.map(s => s.groups.flatMap(g => g.questions));
    const submitMock = (body, level = 'N5', as = L) => call('POST', '/mock-exams/' + level + '/results', { as, body });
    assert.equal((await submitMock({ answers: { [mockQuestions[0][0].id]: 0 } }, 'N5', 'ben')).status, 403, 'every N5 unit must be reached');
    await client.query('UPDATE users SET all_lessons_unlocked = TRUE WHERE id = $1', [learnerId]);
    assert.equal((await submitMock({ answers: {} }, 'N9')).status, 404);
    for (const bad of [{ answers: {} }, { answers: { nope: 0 } }, { answers: { [mockQuestions[0][0].id]: 9 } }, { answers: [1] }, {}]) assert.equal((await submitMock(bad)).status, 400, JSON.stringify(bad));
    // Every vocabulary question right, two grammar questions wrong, the rest blank: 15/36 = 42%, failed.
    const mockAnswers = Object.fromEntries([...mockQuestions[0].map(q => [q.id, q.correctIndex]), ...mockQuestions[1].slice(0, 2).map(q => [q.id, (q.correctIndex + 1) % q.options.length])]);
    const mock = await submitMock({ answers: mockAnswers, timedOut: true });
    assert.equal(mock.status, 201, JSON.stringify(mock.data).slice(0, 200));
    assert.deepEqual([mock.data.result.correct, mock.data.result.total, mock.data.result.percent, mock.data.result.passed, mock.data.result.timedOut], [15, 36, 42, false, true]);
    assert.deepEqual(mock.data.result.sections.map(s => [s.correct, s.total, s.reached]), [[15, 15, true], [0, 15, false], [0, 6, false]]);
    assert.equal((await client.query("SELECT answered FROM practice_sessions WHERE user_id = $1 AND kind = 'mock-exam'", [learnerId])).rows[0].answered, 17, 'also counted as practice');
    const mockMistakes = (await call('GET', '/mistakes', { as: L })).data.mistakes.filter(m => m.source === 'mock_exam');
    assert.equal(mockMistakes.length, 2, 'wrong answers only; blanks are not mistakes');
    assert.equal(mockMistakes[0].label, 'N5 mock exam · ' + exam.sections[1].title);
    const allRight = Object.fromEntries(mockQuestions.flat().map(q => [q.id, q.correctIndex]));
    assert.equal((await submitMock({ answers: allRight })).data.result.passed, true);
    const history = (await call('GET', '/mock-exams/N5/results', { as: L })).data;
    assert.deepEqual([history.results.length, history.attempts, history.bestPercent, history.hasPassed, history.results[0].percent], [2, 2, 100, true, 100]);
    assert.equal((await call('GET', '/mistakes', { as: L })).data.mistakes.filter(m => m.source === 'mock_exam').every(m => m.correctStreak === 1), true, 'a right answer later counts toward clearing');
    assert.deepEqual((await call('GET', '/mock-exams/N5/results', { as: 'ben' })).data.results, [], 'results are per learner');

    // ================= Study time and the daily goal
    const report = (seconds, as = L) => call('POST', '/activity/study-time', { as, body: { seconds } });
    for (const bad of [0, -5, 'abc', null]) assert.equal((await report(bad)).status, 400);
    assert.equal((await report(60)).data.secondsToday, 60);
    assert.equal((await report(60)).data.secondsToday, 65, 'a second report straight away adds only the few seconds that passed');
    await client.query("UPDATE study_time SET last_credited_at = NOW() - INTERVAL '61 seconds' WHERE user_id = $1", [learnerId]);
    assert.equal((await report(500)).data.secondsToday, 65 + 66, 'never more than the time since the last report (and the per-report cap)');
    let today = (await call('GET', '/activity/today', { as: L })).data;
    assert.deepEqual(today, { secondsToday: 131, minutesToday: 2, goalMinutes: 10, isGoalMet: false });
    await client.query('UPDATE user_profiles SET daily_goal = 2 WHERE user_id = $1', [learnerId]);
    assert.equal((await call('GET', '/activity/today', { as: L })).data.isGoalMet, true);
    assert.equal((await call('GET', '/activity/today', { as: 'ben' })).data.secondsToday, 0);

    // ================= Statistics overview
    const overview = (await call('GET', '/statistics/overview', { as: L })).data;
    assert.equal(overview.studyTime.days.length, 14); assert.equal(overview.studyTime.days.at(-1).seconds, 131); assert.deepEqual([overview.studyTime.totalSeconds, overview.studyTime.daysGoalMet, overview.studyTime.goalMinutes], [131, 1, 2]);
    assert.equal(overview.lessons.completed, 6); assert.equal(overview.lessons.weeks.length, 8); assert.equal(overview.lessons.weeks.at(-1).lessons, 6);
    assert.deepEqual(overview.assessments.map(a => [a.unitId, a.isPassed]), [[U1, true]]);
    assert.deepEqual([overview.kanji.total, overview.kanji.mastered], [catalog.length, 0]);
    assert.equal(overview.srs.total, 32); assert.equal(overview.srs.days.at(-1).reviews, 4);
    assert.ok(overview.mistakes.open > 0);
    assert.deepEqual(overview.mockExams.map(r => r.percent), [100, 42]);
    assert.deepEqual(overview.practice.map(p => [p.kind, p.sessions]), [['mock-exam', 2]]);
    assert.deepEqual(overview.speaking, []);
    const empty = (await call('GET', '/statistics/overview', { as: 'ben' })).data;
    assert.deepEqual([empty.lessons.completed, empty.srs.total, empty.mistakes.open, empty.mockExams.length, empty.studyTime.totalSeconds], [0, 0, 0, 0, 0]);
    assert.equal((await call('GET', '/statistics/overview')).status, 401);
    console.log('PASS: spaced repetition (only completed-lesson words and catalog Kanji enrolled, invalid lists refused, 1/3-day intervals, not-due 409, relearning allowed, 20 new cards a day, due before new, streak counted); mistake notebook from reviews (cleared after 2 right in a row, reopened when wrong), practice and delete per learner, lesson challenges validated and de-duplicated, assessment answers hidden and unpractisable until passed; mock exams graded on the server with section minimums, saved with history, counted as practice, wrong answers noted; study time capped by elapsed time with the daily goal; statistics overview for active and new learners. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'learning-api.cjs'), head + tail);
console.log('written');
