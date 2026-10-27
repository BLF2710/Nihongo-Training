// Builds level-review-api.cjs from the harness of review-api.cjs plus the cumulative-review checks.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
const head = original.slice(0, original.indexOf('    // ---- learner review'))
  .replace("// Unit review + question bank API", "// Cumulative (level) review API")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    "await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));\n    await client.query(fs.readFileSync(path.join(API, 'migrations/010_review_bank_units_4_9.sql'), 'utf8'));");
if (!head.includes('010_review_bank')) throw new Error('harness changed');
const tail = String.raw`    // ---- cumulative review
    const unitOf = id => /^japanese-n5-unit-\d+/.exec(id)?.[0];
    assert.equal((await call('GET', '/review/levels/N5/questions')).status, 401);
    for (const bad of ['N6', 'n5', 'X', 'N55']) assert.equal((await call('GET', '/review/levels/' + bad + '/questions', { as: 'learner' })).status, 404, bad);
    assert.equal((await call('GET', '/review/levels/N4/questions', { as: 'learner' })).status, 403);
    // A new learner has reached Unit 1 only: every question comes from Unit 1.
    const first = await call('GET', '/review/levels/N5/questions', { as: 'learner' }); assert.equal(first.status, 200);
    assert.ok(first.data.questions.length >= 20, 'too few questions: ' + first.data.questions.length);
    assert.deepEqual([...new Set(first.data.questions.map(q => q.unitId))], [U1]);
    // With every lesson unlocked, all nine units are reached and the review draws across them.
    await client.query("UPDATE users SET all_lessons_unlocked=TRUE WHERE username='learner_x1'");
    const all = await call('GET', '/review/levels/N5/questions', { as: 'learner' }); assert.equal(all.status, 200);
    const questions = all.data.questions;
    assert.equal(questions.length, 40); assert.equal(questions.filter(q => !q.id.startsWith('bank:')).length, 0, 'reviews never show assessment questions');
    assert.equal(new Set(questions.map(q => q.unitId + q.id)).size, 40);
    const units = new Set(questions.map(q => q.unitId)); assert.ok(units.size >= 6, 'drawn from only ' + units.size + ' units');
    for (const q of questions) { assert.ok(/^japanese-n5-unit-[1-9]$/.test(q.unitId)); for (const secret of ['correctIndex', 'answer', 'pairs', 'explanation', 'solution']) assert.ok(!(secret in q), q.id + ' leaks ' + secret); }
    // Each question is graded by its own unit, and by no other.
    const rows = (await client.query('SELECT id, unit_id, type, content FROM review_questions')).rows;
    const { UNIT_ASSESSMENTS } = src('data/unit-assessments.ts');
    let right = 0, wrong = 0;
    for (const q of questions) {
      const [source, key] = [q.id.slice(0, q.id.indexOf(':')), q.id.slice(q.id.indexOf(':') + 1)];
      let good, bad;
      if (source === 'assessment') { const item = UNIT_ASSESSMENTS.flatMap(a => a.questions).find(x => x.id === key); good = item.correctIndex; bad = (item.correctIndex + 1) % item.options.length; }
      else { const row = rows.find(r => r.id === Number(key)); assert.equal(row.unit_id, q.unitId);
        if (row.type === 'multiple_choice') { good = row.content.correctIndex; bad = (good + 1) % row.content.options.length; }
        else if (row.type === 'word_match') { good = q.left.map(left => row.content.pairs.find(p => p.left === left).right); bad = [...good].reverse(); if (JSON.stringify(bad) === JSON.stringify(good)) bad = null; }
        else { good = row.content.answer; bad = good + 'x'; } }
      const ok = await call('POST', '/review/units/' + q.unitId + '/check', { as: 'learner', body: { questionId: q.id, answer: good } });
      assert.equal(ok.status, 200, q.id); assert.equal(ok.data.correct, true, q.id); right++;
      if (bad !== null) { const no = await call('POST', '/review/units/' + q.unitId + '/check', { as: 'learner', body: { questionId: q.id, answer: bad } }); assert.equal(no.data.correct, false, q.id); wrong++; }
      const other = q.unitId === U1 ? U2 : U1;
      assert.equal((await call('POST', '/review/units/' + other + '/check', { as: 'learner', body: { questionId: q.id, answer: good } })).status, 404, q.id + ' graded by another unit');
    }
    // Disabled questions are never drawn; two reviews differ.
    await client.query("UPDATE review_questions SET enabled=FALSE WHERE unit_id <> '" + U1 + "'");
    const narrowed = (await call('GET', '/review/levels/N5/questions', { as: 'learner' })).data.questions;
    assert.ok(narrowed.filter(q => q.id.startsWith('bank:')).every(q => q.unitId === U1));
    const again = (await call('GET', '/review/levels/N5/questions', { as: 'learner' })).data.questions;
    assert.notEqual(JSON.stringify(again.map(q => q.id)), JSON.stringify(narrowed.map(q => q.id)));
    // The seed for Units 4-9: every unit has questions of all three kinds.
    for (let n = 4; n <= 9; n++) { const mine = rows.filter(r => r.unit_id === 'japanese-n5-unit-' + n); assert.equal(mine.length, 25); assert.deepEqual([...new Set(mine.map(r => r.type))].sort(), ['multiple_choice', 'word_match', 'word_scramble']); }
    void unitOf;
    console.log('PASS: auth, unknown and unreached levels refused; a new learner is drawn from Unit 1 only; with all units reached 40 questions (all from the question bank, none from assessments) from ' + units.size + ' units without answer keys; ' + right + ' right and ' + wrong + ' wrong answers graded by their own unit and refused by another; disabled questions never drawn; fresh selection; 25 seeded questions of 3 kinds in each of Units 4-9. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1200)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'level-review-api.cjs'), head + tail);
console.log('written');
