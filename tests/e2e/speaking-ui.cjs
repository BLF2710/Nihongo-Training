// Speaking test page (N3+), against fixture APIs. Chrome's fake microphone supplies real audio, so recording,
// resampling and WAV encoding run for real; the fixture checks the uploaded WAV.
//   node speaking-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;

const task = (id, kind, title, extra = {}) => ({ id, level: 'N3', kind, title, canDo: `Can-do for ${title}.`, instructions: `Instructions for ${title}.`, minSeconds: 15, maxSeconds: 30, available: true, best: null, ...extra });
const tasks = [
  task('n3-read-park', 'read_aloud', 'Read aloud: the park in my town', { minSeconds: 1, maxSeconds: 3, passage: { ruby: '<ruby>私<rt>わたし</rt></ruby>の<ruby>町<rt>まち</rt></ruby>', plain: '私の町' }, best: { score: 93, band: 4, met: true, attempts: 2 } }),
  task('n3-my-town', 'production', 'Introduce your town', { prompt: { ruby: 'あなたの<ruby>町<rt>まち</rt></ruby>を紹介してください。', plain: 'あなたの町を紹介してください。' } }),
  task('n3-trip', 'production', 'A trip you enjoyed', { prompt: { ruby: '旅行', plain: '旅行' } }),
  task('n3-decline', 'interaction', 'Turn down an invitation', { speaker: 'Friend', minSeconds: 1, prompt: { ruby: '映画を見に行かない？', plain: '映画を見に行かない？' } }),
];
const criteria = [
  ['task', 'Task achievement', '課題達成', 'ai', 20, 3, null], ['coherence', 'Coherence', 'まとまり', 'ai', 10, 2, null], ['vocabulary', 'Vocabulary', '語彙', 'ai', 15, 3, null],
  ['grammar', 'Grammar', '文法', 'ai', 15, 2, null], ['pronunciation', 'Pronunciation', '発音', 'azure', 20, 2, 60], ['fluency', 'Fluency', '流暢さ', 'azure', 20, 1, 50],
].map(([id, name, japanese, source, weight, band, rawScore]) => ({ id, name, japanese, source, weight, band, bandLabel: ['', 'がんばろう', 'もうすこし', 'できました', 'すばらしい'][band], comment: `${name} comment.`, rawScore }));
const graded = (id, overrides = {}) => ({
  status: 'graded', id, taskId: 'n3-my-town', level: 'N3', jfLevel: 'B1', kind: 'production', createdAt: new Date().toISOString(),
  score: 54, band: 2, bandLabel: 'もうすこし', met: false, delivery: 'azure', criteria, notAssessed: [],
  transcript: '私の町は静かです。公園が行きました。', words: [{ word: '公園', accuracy: 40, errorType: 'Mispronunciation' }, { word: '町', accuracy: 95, errorType: 'None' }],
  corrections: [{ excerpt: '公園が', corrected: '公園に', category: 'particle', explanation: 'Use に for where you go.', start: 9, end: 12 }],
  summary: 'A clear start; add a reason.', strengths: ['Clear first sentence'], nextSteps: ['Give a reason with から'], estimatedLevel: 'A2',
  measurements: { durationSeconds: 2.1, reachedMinimum: false, characters: 16, charactersPerSecond: 7.6, sentences: 2 }, ...overrides,
});

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
  try {
    const run = async ({ delivery, contentGrading = true }) => {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, permissions: ['microphone'] });
      await context.addInitScript(([t, withRecognition]) => {
        localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); localStorage.setItem('user_handle', 'kai');
        window.spoken = []; window.speechSynthesis.speak = utterance => { window.spoken.push(utterance.text); setTimeout(() => utterance.onend?.(), 10); };
        if (withRecognition) window.SpeechRecognition = class {
          start() { setTimeout(() => this.onresult?.({ resultIndex: 0, results: [Object.assign([{ transcript: 'ごめん、土曜日はバイトがあるんだ。' }], { isFinal: true })] }), 50); }
          stop() { setTimeout(() => this.onend?.(), 10); } abort() { this.stop(); }
        };
      }, [token, delivery === 'browser']);
      const state = { posts: [], reports: [], history: [], next: [] };
      await context.route('http://localhost:5000/api/**', route => {
        const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        if (p === '/units') return json({ units: [] });
        if (p === '/speaking-tests') {
          const level = url.searchParams.get('level');
          if (level !== 'N3') return json({ level, jfLevel: 'B2', open: false, lockedReason: `Opens when you reach ${level}: complete every unit of the levels before it.`, delivery, contentGrading, dailyLimit: 30, usedToday: 0, tasks: [] });
          return json({ level: 'N3', jfLevel: 'B1', open: true, lockedReason: null, delivery, contentGrading, dailyLimit: 30, usedToday: state.posts.length, tasks: tasks.map(t => ({ ...t, available: t.kind === 'read_aloud' || contentGrading })) });
        }
        const attempts = p.match(/^\/speaking-tests\/tasks\/([\w-]+)\/attempts$/);
        if (attempts && request.method() === 'GET') return json({ attempts: state.history });
        if (attempts) { const body = request.postDataJSON(); state.posts.push({ taskId: attempts[1], body }); const reply = state.next.shift() ?? graded(100 + state.posts.length); if (reply.status === 'graded') state.history.unshift(reply); return json(reply, reply.status === 'graded' ? 201 : 200); }
        const report = p.match(/^\/speaking-tests\/attempts\/(\d+)\/report$/);
        if (report) { state.reports.push({ id: Number(report[1]), note: request.postDataJSON().note }); return json({ supportConversationId: 12 }, 201); }
        return json({});
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      return { context, page, state, errors };
    };
    const record = async (page, seconds) => {
      await page.getByRole('button', { name: '🎤 Start recording' }).click();
      await page.getByText('Recording…').waitFor(); await page.waitForTimeout(seconds * 1000);
      await page.getByRole('button', { name: '■ Stop' }).click(); await page.getByRole('button', { name: 'Submit for grading' }).waitFor({ timeout: 15000 });
    };
    const decodeWav = base64 => { const b = Buffer.from(base64, 'base64'); return { riff: b.toString('ascii', 0, 4), wave: b.toString('ascii', 8, 12), format: b.readUInt16LE(20), channels: b.readUInt16LE(22), rate: b.readUInt32LE(24), bits: b.readUInt16LE(34), seconds: (b.length - 44) / 32000, peak: Array.from({ length: (b.length - 44) / 2 }, (_, i) => Math.abs(b.readInt16LE(44 + i * 2))).reduce((max, v) => Math.max(max, v), 0) }; };

    // ================= Azure delivery =================
    let { context, page, state, errors } = await run({ delivery: 'azure' });
    await page.goto(base + '/speaking'); await page.getByRole('link', { name: /Speaking test · N3 and above/ }).click(); await page.waitForURL('**/speaking/test');
    await page.getByRole('heading', { name: 'Speaking test', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'N3' }).getAttribute('aria-pressed'), 'true', 'N3 by default for an N5/N4 learner');
    await page.getByText('0 of 30 answers graded today').waitFor();
    assert.equal(await page.locator('main ul > li').count(), 4);
    await page.getByText('Best:').first().waitFor(); await page.getByText('すばらしい').first().waitFor();
    await page.screenshot({ path: shots + '/speaking-tasks.png', fullPage: true });
    // Locked level
    await page.getByRole('button', { name: 'N2' }).click(); await page.getByRole('heading', { name: 'The N2 speaking test is locked' }).waitFor();
    await page.getByRole('button', { name: 'N3' }).click(); await page.getByRole('button', { name: 'Start: Introduce your town' }).click();
    // Consent, then the prompt with readings and audio
    await page.getByText('Before your first recording').waitFor(); await page.getByText('sent to Microsoft Azure').waitFor();
    assert.equal(await page.getByRole('button', { name: '🎤 Start recording' }).count(), 0, 'no recording before consent');
    await page.getByRole('button', { name: 'I understand' }).click();
    assert.equal(await page.locator('main ruby').count(), 1); await page.getByLabel('Show readings').uncheck(); assert.equal(await page.locator('main rt').count(), 0);
    await page.getByRole('button', { name: '🔊 Hear the question' }).click(); assert.deepEqual(await page.evaluate(() => window.spoken), ['あなたの町を紹介してください。']);
    // Record ~2 s, short-answer hint, upload is a real 16 kHz mono WAV
    await record(page, 2);
    await page.getByText(/Shorter than the 15 seconds/).waitFor(); await page.getByRole('button', { name: 'Record again' }).waitFor();
    assert.ok(await page.locator('audio[aria-label="Your recording"]').getAttribute('src'));
    await page.getByRole('button', { name: 'Submit for grading' }).click();
    await page.getByRole('heading', { name: /もうすこし/ }).waitFor();
    const upload = state.posts[0]; assert.equal(upload.taskId, 'n3-my-town'); assert.deepEqual(Object.keys(upload.body), ['audio'], 'Azure mode sends only the recording');
    const wav = decodeWav(upload.body.audio);
    assert.deepEqual([wav.riff, wav.wave, wav.format, wav.channels, wav.rate, wav.bits], ['RIFF', 'WAVE', 1, 1, 16000, 16]);
    assert.ok(wav.seconds > 1.5 && wav.seconds < 4, 'length ' + wav.seconds); assert.ok(wav.peak > 100, 'the fake microphone tone is in the audio: ' + wav.peak);
    // Result
    await page.getByText('Not yet at the B1 target (N3)').waitFor(); await page.getByText('A clear start; add a reason.').waitFor();
    const rows = page.locator('table tbody tr'); assert.equal(await rows.count(), 6);
    assert.match(await rows.nth(4).innerText(), /Pronunciation[\s\S]*20 %[\s\S]*もうすこし[\s\S]*60\/100/);
    const marked = page.locator('mark'); assert.equal(await marked.count(), 1); assert.match(await marked.innerText(), /^公園が\s*1$/);
    await page.getByText('Use に for where you go.').waitFor();
    const practise = page.getByRole('region', { name: 'Words to practise' }); assert.match(await practise.innerText(), /公園\s*40\/100/); assert.ok(!(await practise.innerText()).includes('町 95'), 'well-said words are not listed');
    await page.getByText('Estimated level from this answer:').waitFor();
    await page.getByRole('heading', { name: 'Your results for this task' }).waitFor();
    await page.screenshot({ path: shots + '/speaking-result.png', fullPage: true });
    // Dispute the grade
    await page.getByRole('button', { name: 'Report this grade' }).click(); await page.getByLabel(/What do you think is wrong/).fill('I said 公園に.');
    await page.getByRole('button', { name: 'Send to Help & support' }).click(); await page.getByRole('link', { name: 'Open the request →' }).waitFor();
    assert.deepEqual(state.reports, [{ id: 101, note: 'I said 公園に.' }]); assert.equal(await page.getByRole('link', { name: 'Open the request →' }).getAttribute('href'), '/support/12');
    // Try again: no answer recognised keeps the recording to retry
    await page.getByRole('button', { name: 'Try this task again' }).click(); assert.equal(await page.getByText('Before your first recording').count(), 0, 'consent is remembered');
    await record(page, 1); state.next.push({ status: 'no_answer', message: 'No answer was recognised. Check your microphone, speak in Japanese and try again.' });
    await page.getByRole('button', { name: 'Submit for grading' }).click(); await page.getByText('No answer was recognised.').waitFor();
    await page.getByRole('button', { name: 'Submit for grading' }).waitFor();
    // A server error is shown and the recording kept
    await page.route('http://localhost:5000/api/speaking-tests/tasks/*/attempts', r => r.request().method() === 'POST' ? r.fulfill({ status: 503, json: { message: 'Speaking grading is unavailable right now. Please try again shortly.' } }) : r.fallback());
    await page.getByRole('button', { name: 'Submit for grading' }).click(); await page.getByRole('alert').getByText('Speaking grading is unavailable right now.').waitFor();
    await page.unroute('http://localhost:5000/api/speaking-tests/tasks/*/attempts');
    // History shows earlier results
    await page.getByRole('button', { name: '← All N3 tasks' }).click(); await page.getByRole('button', { name: 'Try again: Read aloud: the park in my town' }).click();
    // Auto-stop at the task's limit (3 s here)
    await page.getByRole('button', { name: '🎤 Start recording' }).click(); await page.getByText('Recording…').waitFor();
    await page.getByRole('button', { name: 'Submit for grading' }).waitFor({ timeout: 8000 }); assert.equal(await page.getByRole('button', { name: '■ Stop' }).count(), 0, 'stopped by itself at the limit');
    assert.match(await page.getByText(/s recorded/).innerText(), /^(2\.[5-9]|3\.\d) s recorded/);
    await page.getByRole('button', { name: 'Hear a model reading' }).waitFor();
    // Phone layout
    await page.setViewportSize({ width: 375, height: 812 }); await page.goto(base + '/speaking/test?level=N3&task=n3-my-town');
    await page.getByRole('heading', { name: 'Introduce your town' }).waitFor(); await page.getByRole('button', { name: /^\d+ もうすこし/ }).first().click();
    await page.getByRole('heading', { name: /もうすこし/ }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no page overflow on phones');
    await page.screenshot({ path: shots + '/speaking-result-mobile.png', fullPage: true });
    assert.deepEqual(errors, []); await context.close();

    // ================= Browser-only delivery, no AI =================
    ({ context, page, state, errors } = await run({ delivery: 'browser', contentGrading: false }));
    await page.goto(base + '/speaking/test?level=N3');
    await page.getByText("Pronunciation and fluency aren't scored on this site yet").waitFor(); await page.getByText("Grading of free answers isn't available right now.").waitFor();
    assert.equal(await page.getByRole('button', { name: /^Unavailable: / }).count(), 3, 'only read-aloud can be started');
    assert.equal(await page.getByRole('button', { name: /^Unavailable: / }).first().isDisabled(), true);
    await page.getByRole('button', { name: 'Try again: Read aloud: the park in my town' }).click();
    await page.getByText('speech recognition writes down what you say').waitFor(); await page.getByRole('button', { name: 'I understand' }).click();
    state.next.push(graded(300, { taskId: 'n3-read-park', kind: 'read_aloud', delivery: 'browser', score: 100, band: 4, bandLabel: 'すばらしい', met: true, transcript: '私の町', words: [], corrections: [], summary: '', strengths: [], nextSteps: [], estimatedLevel: null,
      criteria: [{ id: 'recognised', name: 'Recognised accuracy', japanese: '認識の正確さ', source: 'browser', weight: 100, band: 4, bandLabel: 'すばらしい', comment: '100/100 match with the passage.', rawScore: 100 }] }));
    await record(page, 1); await page.getByText('heard:').waitFor();
    await page.getByRole('button', { name: 'Submit for grading' }).click(); await page.getByRole('heading', { name: /すばらしい/ }).waitFor();
    const sent = state.posts[0].body; assert.deepEqual(Object.keys(sent).sort(), ['durationSeconds', 'transcript'], 'browser mode sends the transcript, never audio');
    assert.equal(sent.transcript, 'ごめん、土曜日はバイトがあるんだ。'); assert.ok(sent.durationSeconds > 0.5 && sent.durationSeconds <= 3);
    await page.getByText('✓ Meets the B1 target (N3)').waitFor();
    assert.deepEqual(errors, []); await context.close();
    console.log('PASS: entry from the Speaking page; N3 by default; task list with best results; locked level; consent before the first recording (remembered); prompt with readings toggle and audio; real recording through the fake microphone uploaded as a 16 kHz mono 16-bit WAV with sound in it (Azure mode sends only audio); short-answer hint; result with score, band, target, 6 criteria with weights/raw scores, marked transcript, corrections, words to practise, strengths, next steps, indicative level; report to Help & support; retry keeps consent; no-answer and server errors keep the recording; auto-stop at the time limit; history; phones without overflow; browser-only mode sends the transcript (never audio), notices, and only read-aloud without the AI; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
