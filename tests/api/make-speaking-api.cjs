// Builds speaking-api.cjs: the review-api harness plus the speaking test routes, with fake Azure and AI graders.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Speaking test API (N3+) with fake pronunciation and content graders")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    `app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api', src('routes/communication.routes.ts').default);
    const { createSpeakingTestRouter } = src('routes/speaking-test.routes.ts'); const { createSpeakingTestService } = src('services/speaking/speaking-test.service.ts');
    const azure = { next: null, calls: [], async assessFreeAnswer(wav) { this.calls.push(['free', wav.length]); return this.next; }, async assessReading(wav, passage) { this.calls.push(['reading', passage]); return this.next; } };
    const grader = { next: null, inputs: [], async grade(input) { this.inputs.push(input); return this.next; } };
    app.use('/api/speaking-tests', createSpeakingTestRouter(createSpeakingTestService({ assessor: azure, grader })));
    app.use('/api/st-browser', createSpeakingTestRouter(createSpeakingTestService({ assessor: null, grader })));
    app.use('/api/st-no-ai', createSpeakingTestRouter(createSpeakingTestService({ assessor: azure, grader: null })));`)
  .replace("const app = express(); app.use(express.json());", "const app = express(); for (const prefix of ['/api/speaking-tests', '/api/st-browser', '/api/st-no-ai']) app.use(prefix, express.json({ limit: '1.5mb' })); app.use(express.json());")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ["limit: '1.5mb'", 'createSpeakingTestRouter', "'ben']", 'setInterval, clearInterval']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const ana = 'learner', uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const wav = (seconds, rate = 16000) => { const data = Math.round(seconds * rate) * 2, b = Buffer.alloc(44 + data); b.write('RIFF', 0, 'ascii'); b.writeUInt32LE(36 + data, 4); b.write('WAVE', 8, 'ascii'); b.write('fmt ', 12, 'ascii'); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36, 'ascii'); b.writeUInt32LE(data, 40); return b.toString('base64'); };
    const submit = (task, body, as = ana, prefix = '/speaking-tests') => call('POST', prefix + '/tasks/' + task + '/attempts', { as, body });
    const saved = async () => (await client.query('SELECT COUNT(*)::int AS n FROM speaking_attempts')).rows[0].n;
    const assessed = (transcript, accuracy, fluency, completeness = null, words = []) => ({ status: 'assessed', assessment: { transcript, accuracy, fluency, completeness, words, durationSeconds: 18.2 } });
    const content = (bands, extra = {}) => ({ offTask: false, criteria: Object.fromEntries(['task', 'coherence', 'vocabulary', 'grammar'].map((id, i) => [id, { band: bands[i], comment: id + ' comment' }])), corrections: [], summary: 'Summary.', strengths: ['Clear start'], nextSteps: ['Use から'], estimatedLevel: 'B1', ...extra });

    // ---- Access
    assert.equal((await call('GET', '/speaking-tests?level=N3')).status, 401);
    assert.equal((await call('GET', '/speaking-tests?level=N5', { as: ana })).status, 404, 'N5 keeps speaking practice');
    const locked = await call('GET', '/speaking-tests?level=N3', { as: 'ben' });
    assert.deepEqual([locked.status, locked.data.open, locked.data.tasks.length], [200, false, 4]); assert.match(locked.data.lockedReason, /N3/);
    assert.equal((await submit('n3-my-town', { audio: wav(1) }, 'ben')).status, 403, 'not reached N3 yet');
    await client.query('UPDATE users SET all_lessons_unlocked = TRUE WHERE id = $1', [await uid('learner')]);
    const list = (await call('GET', '/speaking-tests?level=N3', { as: ana })).data;
    assert.deepEqual([list.open, list.jfLevel, list.delivery, list.contentGrading, list.dailyLimit, list.usedToday], [true, 'B1', 'azure', true, 30, 0]);
    assert.deepEqual(list.tasks.map(t => t.kind).sort(), ['interaction', 'production', 'production', 'read_aloud']);
    assert.match(list.tasks.find(t => t.kind === 'read_aloud').passage.ruby, /<ruby>/);
    assert.equal((await submit('nope', { audio: wav(1) })).status, 404);

    // ---- Read-aloud with Azure: pronunciation 50 %, fluency 30 %, completeness 20 %
    azure.next = assessed('私の町には…', 85, 72, 90);
    const reading = await submit('n3-read-park', { audio: wav(2) });
    assert.equal(reading.status, 201);
    assert.equal(azure.calls.at(-1)[0], 'reading'); assert.ok(!azure.calls.at(-1)[1].includes('{'), 'the plain passage is the reference text');
    assert.deepEqual([reading.data.score, reading.data.band, reading.data.met, reading.data.delivery], [93, 4, true, 'azure']);
    assert.deepEqual(reading.data.criteria.map(c => [c.id, c.weight, c.band, c.rawScore]), [['pronunciation', 50, 4, 85], ['fluency', 30, 3, 72], ['completeness', 20, 4, 90]]);
    assert.match(reading.data.criteria[1].comment, /B1 needs 70/);
    assert.equal(grader.inputs.length, 0, 'no AI for read-aloud');

    // ---- Free answer with Azure + AI: content 60 %, delivery 40 %
    azure.next = assessed('私の町は静かです。公園が行きました。', 60, 50, null, [{ word: '公園', accuracy: 40, errorType: 'Mispronunciation' }]);
    grader.next = content([3, 2, 3, 2], { corrections: [
      { excerpt: '公園が', corrected: '公園に', category: 'particle', explanation: 'Use に for the destination.' },
      { excerpt: '駅で', corrected: '駅に', category: 'particle', explanation: 'Not in the transcript.' },
    ] });
    const answer = await submit('n3-my-town', { audio: wav(3) });
    assert.equal(answer.status, 201);
    const input = grader.inputs.at(-1);
    assert.deepEqual([input.level, input.transcript, input.task.id, input.measurements.durationSeconds, input.measurements.sentences], ['B1', '私の町は静かです。公園が行きました。', 'n3-my-town', 18.2, 2]);
    assert.deepEqual([answer.data.score, answer.data.band, answer.data.met, answer.data.bandLabel], [54, 2, false, 'もうすこし']);
    assert.deepEqual(answer.data.criteria.map(c => [c.id, c.band]), [['task', 3], ['coherence', 2], ['vocabulary', 3], ['grammar', 2], ['pronunciation', 2], ['fluency', 1]]);
    assert.deepEqual(answer.data.corrections.map(c => [c.excerpt, c.start, c.end]), [['公園が', 9, 12]], 'positions added, excerpts not in the transcript dropped');
    assert.deepEqual(answer.data.words, [{ word: '公園', accuracy: 40, errorType: 'Mispronunciation' }]);
    assert.deepEqual([answer.data.summary, answer.data.estimatedLevel, answer.data.notAssessed], ['Summary.', 'B1', []]);

    // ---- No answer: silence, or not a real attempt — nothing saved
    const before = await saved();
    azure.next = { status: 'no_speech' };
    const silent = await submit('n3-trip', { audio: wav(1) }); assert.deepEqual([silent.status, silent.data.status], [200, 'no_answer']);
    azure.next = assessed('hello hello', 70, 70); grader.next = content([1, 1, 1, 1], { offTask: true });
    assert.equal((await submit('n3-trip', { audio: wav(1) })).data.status, 'no_answer');
    assert.equal(await saved(), before, 'no-answer attempts are not saved');

    // ---- Uploads are checked before anything is sent anywhere
    const callsBefore = azure.calls.length;
    for (const [body, why] of [[{}, 'no audio'], [{ audio: wav(1, 44100) }, 'wrong sample rate'], [{ audio: '***' }, 'not base64']]) assert.equal((await submit('n3-trip', body)).status, 400, why);
    assert.equal(azure.calls.length, callsBefore);

    // ---- Browser transcript only (no Azure): delivery not assessed, weights rescaled
    grader.next = content([3, 3, 3, 3]);
    assert.equal((await submit('n3-decline', { transcript: 'ごめん、土曜日はバイトがあるんだ。日曜日はどう？' }, ana, '/st-browser')).status, 400, 'duration required');
    const browser = await submit('n3-decline', { transcript: 'ごめん、土曜日はバイトがあるんだ。日曜日はどう？', durationSeconds: 9 }, ana, '/st-browser');
    assert.deepEqual([browser.status, browser.data.score, browser.data.met, browser.data.delivery, browser.data.notAssessed], [201, 75, true, 'browser', ['pronunciation', 'fluency']]);
    assert.equal(browser.data.criteria.find(c => c.id === 'pronunciation').band, null);
    assert.equal((await submit('n3-decline', { transcript: '  ', durationSeconds: 3 }, ana, '/st-browser')).data.status, 'no_answer');
    const { SPEAKING_TASKS } = src('data/speaking-tasks.ts'); const passage = SPEAKING_TASKS.find(t => t.id === 'n3-read-park').passage.plain;
    const browserReading = await submit('n3-read-park', { transcript: passage, durationSeconds: 12 }, ana, '/st-browser');
    assert.deepEqual(browserReading.data.criteria.map(c => [c.id, c.weight, c.rawScore, c.band]), [['recognised', 100, 100, 4]]);
    assert.equal((await call('GET', '/st-browser?level=N3', { as: ana })).data.delivery, 'browser');

    // ---- Without the AI: free answers refused (not saved), read-aloud still works
    const noAi = (await call('GET', '/st-no-ai?level=N3', { as: ana })).data;
    assert.equal(noAi.contentGrading, false); assert.deepEqual(noAi.tasks.filter(t => t.available).map(t => t.kind), ['read_aloud']);
    const n = await saved(); azure.next = assessed('x', 80, 80);
    assert.equal((await submit('n3-my-town', { audio: wav(1) }, ana, '/st-no-ai')).status, 503); assert.equal(await saved(), n);
    azure.next = assessed('x', 80, 80, 80);
    assert.equal((await submit('n3-read-park', { audio: wav(1) }, ana, '/st-no-ai')).status, 201);

    // ---- History, summary, privacy
    const history = (await call('GET', '/speaking-tests/tasks/n3-my-town/attempts', { as: ana })).data.attempts;
    assert.equal(history.length, 1); assert.equal(history[0].id, answer.data.id); assert.equal(history[0].score, 54);
    assert.equal((await call('GET', '/speaking-tests/attempts/' + answer.data.id, { as: ana })).data.transcript, '私の町は静かです。公園が行きました。');
    assert.equal((await call('GET', '/speaking-tests/attempts/' + answer.data.id, { as: 'ben' })).status, 404, "another learner's result is not found");
    const summary = (await call('GET', '/speaking-tests?level=N3', { as: ana })).data;
    assert.deepEqual(summary.tasks.find(t => t.id === 'n3-read-park').best, { score: 100, band: 4, met: true, attempts: 3 });
    assert.equal(summary.usedToday, await saved());
    assert.ok((await client.query('SELECT last_activity_at FROM user_gamification WHERE user_id = $1', [await uid('learner')])).rows[0].last_activity_at, 'a graded answer counts toward the streak');

    // ---- Disputing a grade
    const report = await call('POST', '/speaking-tests/attempts/' + answer.data.id + '/report', { as: ana, body: { note: 'I said 公園に.' } });
    assert.equal(report.status, 201);
    const sent = (await client.query("SELECT c.subject, m.body FROM conversations c JOIN messages m ON m.conversation_id = c.id WHERE c.id = $1", [report.data.supportConversationId])).rows[0];
    assert.equal(sent.subject, 'Speaking grade #' + answer.data.id); assert.match(sent.body, /54\/100/); assert.match(sent.body, /公園が行きました/); assert.match(sent.body, /I said 公園に/);
    assert.equal((await call('POST', '/speaking-tests/attempts/' + answer.data.id + '/report', { as: 'ben', body: {} })).status, 404);

    // ---- Daily limit and the content switch
    await client.query("INSERT INTO speaking_attempts (user_id, task_id, course_level, score, band, met, delivery_source, transcript, result) SELECT $1, 'n3-trip', 'N3', 50, 2, FALSE, 'azure', 'x', '{}' FROM generate_series(1, 30)", [await uid('learner')]);
    azure.next = assessed('x', 80, 80, 80);
    const limited = await submit('n3-read-park', { audio: wav(1) }); assert.equal(limited.status, 429); assert.match(limited.data.message, /30 answers/);
    const { contentKeysForPath } = src('middleware/content-availability.middleware.ts');
    assert.equal(JSON.stringify(contentKeysForPath('/speaking-tests/tasks/x/attempts')), JSON.stringify(['speaking']));
    console.log('PASS: sign-in; N5/N4 have no test; locked until the level is reached (admin unlock opens it); read-aloud with Azure (50/30/20, B1 thresholds, plain passage as reference, no AI); free answer graded 60 % AI + 40 % Azure with the right level, transcript and measurements (54 = band 2, not met); corrections positioned, missing excerpts dropped; word scores; silence and non-attempts not saved; bad uploads refused before any service call; browser-only mode rescales without pronunciation/fluency and checks read-aloud by text match; without the AI free answers are refused and read-aloud works; history, best result, privacy; graded answers count toward the streak; disputes open a support request; 30 a day; content switch. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'speaking-api.cjs'), head + tail);
console.log('written');
