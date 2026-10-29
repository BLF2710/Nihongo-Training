// Builds character-mistakes-api.cjs: the review-api harness (temp copies of every table, rolled back) plus kana and
// kanji answers in the mistake notebook and the weak-characters list.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Kana and kanji in the mistake notebook")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    `await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    for (const table of ['hiraganas', 'katakanas', 'kanji_catalog']) await client.query('INSERT INTO pg_temp.' + table + ' SELECT * FROM public.' + table);`)
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/quiz', src('routes/quiz.routes.ts').default); app.use('/api/kanji', src('routes/kanji.routes.ts').default); app.use('/api/mistakes', src('routes/mistake.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/mistake.routes.ts', "'ben']", 'hiraganas']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const learnerId = await uid(L);
    const kanaA = (await client.query("SELECT id, kana, romaji FROM hiraganas WHERE romaji = 'a'")).rows[0];
    let submission = 0;
    const answerKana = (answer, kana = kanaA, type = 'hiragana', as = L) => call('POST', '/quiz/answer', { as, body: { type, kanaId: kana.id, answer, submissionId: 'e2e0c0de-0000-4000-8000-' + String(++submission).padStart(12, '0') } });
    const notebook = async (status = 'open', as = L) => (await call('GET', '/mistakes?status=' + status, { as })).data;
    const weak = async (as = L) => (await call('GET', '/mistakes/weak-characters', { as })).data;

    // ---- a wrong kana answer joins the notebook with reading choices; guests are never recorded
    assert.equal((await call('GET', '/mistakes/weak-characters')).status, 401);
    assert.equal((await answerKana('o')).data.correct, false);
    assert.equal((await call('POST', '/quiz/answer', { body: { type: 'hiragana', kanaId: kanaA.id, answer: 'o' } })).status, 200);
    let book = await notebook();
    assert.equal(book.counts.bySource.kana, 1);
    const entry = book.mistakes.find(item => item.source === 'kana');
    assert.deepEqual([entry.label, entry.prompt, entry.answer, entry.given, entry.wrongCount], ['Hiragana reading', kanaA.kana, 'a', 'o', 1]);
    assert.equal(entry.options.length, 4); assert.ok(entry.options.includes('a')); assert.equal(new Set(entry.options).size, 4, 'four different readings');
    // Missing it again counts again; two right answers in a row (in any quiz) clear it.
    await answerKana('i'); assert.equal((await notebook()).mistakes.find(item => item.source === 'kana').wrongCount, 2);
    await answerKana('a'); await answerKana('a');
    assert.equal((await notebook()).counts.bySource.kana, 0);
    assert.ok((await notebook('resolved')).mistakes.some(item => item.source === 'kana'), 'cleared');

    // ---- the weak list: missed and under 85%, mastered ones included, never-missed and solid ones left out
    // あ: 2 right of 4 = 50%.
    let list = await weak();
    assert.deepEqual(list.kana.map(item => [item.kana, item.accuracy, item.status]), [[kanaA.kana, 50, 'learning']]);
    assert.equal(list.weakBelowPercent, 85);
    const [ka, ki, ku] = (await client.query("SELECT id, kana FROM hiraganas WHERE romaji IN ('ka', 'ki', 'ku') ORDER BY romaji")).rows;
    const setProgress = (kana, correct, wrong) => client.query('INSERT INTO user_progress (user_id, hiragana_id, correct_count, wrong_count) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, hiragana_id) DO UPDATE SET correct_count = $3, wrong_count = $4', [learnerId, kana.id, correct, wrong]);
    await setProgress(ka, 41, 9);   // 82%, mastered: weak
    await setProgress(ki, 17, 3);   // 85%: not weak
    await setProgress(ku, 5, 0);    // never missed: not weak
    list = await weak();
    assert.deepEqual(list.kana.map(item => [item.kana, item.accuracy, item.status]), [[kanaA.kana, 50, 'learning'], [ka.kana, 82, 'mastered']], 'weakest first');
    assert.deepEqual((await weak('ben')).kana, [], 'per learner');

    // ---- kanji practice: a wrong answer joins the notebook, the weak list shows the kanji
    const practice = await call('POST', '/kanji/practice', { as: L, body: { size: 3, kanjiId: 'kanji-65e5' } });
    assert.equal(practice.status, 200, JSON.stringify(practice.data).slice(0, 200));
    const question = (practice.data.questions ?? practice.data)[0];
    const correctIndex = (await client.query('SELECT correct_index FROM kanji_practice_questions WHERE id = $1', [question.id])).rows[0].correct_index;
    const wrongIndex = (correctIndex + 1) % question.options.length;
    assert.equal((await call('POST', '/kanji/answer', { as: L, body: { questionId: question.id, answerIndex: wrongIndex } })).data.correct, false);
    book = await notebook();
    const kanjiEntry = book.mistakes.find(item => item.source === 'kanji');
    assert.ok(kanjiEntry.label.startsWith('Kanji · '), kanjiEntry.label);
    assert.deepEqual([kanjiEntry.answer, kanjiEntry.given, kanjiEntry.options], [question.options[correctIndex], question.options[wrongIndex], question.options]);
    list = await weak();
    assert.deepEqual(list.kanji.map(item => [item.kanjiId, item.character, item.accuracy]), [['kanji-65e5', '日', 0]]);
    assert.ok(list.kanji[0].meaning, 'a meaning to show');
    console.log('PASS: wrong kana answers join the notebook (label, kana, right reading, the typed answer, 4 different reading choices), guests never; missing again counts again; two right in a row clear it; weak list: missed and under 85% (a mastered 82% kana included, 85% and never-missed ones not), weakest first, per learner; a wrong kanji practice answer joins the notebook with its question, choices and answer, and the kanji shows as weak. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'character-mistakes-api.cjs'), head + tail);
console.log('written');
