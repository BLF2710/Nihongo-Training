// Published lesson edits reaching learners (and the cached copy when the server can't be reached), and the admin
// area's audit log, reports queue (also on a report request) and lesson editor, against fixture APIs.
//   node moderation-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const now = new Date().toISOString();
const LESSON = 'japanese-n5-unit-1-introductions';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    // ---- learners see published edits, and the last copy when the server can't be reached
    const learner = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await learner.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); }, token);
    let editsUp = true;
    const learnerEdits = { revision: 3, lessons: { [LESSON]: {
      title: 'Saying hello (edited)', objectives: ['Introduce yourself in one sentence'], vocabulary: [['わたし', 'watashi', 'I, me']],
      concept: { title: 'は and です', text: 'Edited concept.', examples: [] }, examples: [], dialogue: [],
      practice: [{ prompt: 'Edited practice?', options: ['はい', 'いいえ'], correct: 'はい', explanation: '' }],
      challenge: [{ prompt: 'Edited challenge?', options: ['はい', 'いいえ'], correct: 'はい', explanation: '' }],
    } } };
    await learner.route('http://localhost:5000/api/**', route => {
      const p = new URL(route.request().url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
      if (p === '/site/lesson-edits') return editsUp ? json(learnerEdits) : json({ message: 'down' }, 503);
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (/^\/lessons\/[^/]+\/access$/.test(p)) return json({ allowed: true });
      if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
      return json({});
    });
    const page = await learner.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + '/lessons/japanese/n5-unit-1-introductions');
    await page.getByText('Saying hello (edited)').first().waitFor();
    assert.match(await page.locator('main').innerText(), /Introduce yourself in one sentence/, 'lesson-page content is edited too');
    editsUp = false;
    await page.reload();
    await page.getByText('Saying hello (edited)').first().waitFor();
    assert.deepEqual(errors, []);
    await learner.close();

    // ---- admin area
    const admin = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await admin.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('user_role', 'admin'); }, token);
    const state = {
      reports: [{ learner: { id: 9, username: 'dan', displayName: 'Dan', status: 'active' }, openReports: 4, reporters: 3, recentReporters: 3, isRepeated: true, firstAt: now, lastAt: now, kinds: ['profile', 'message'], ticketIds: [7, 8], earlierResolved: 0 }],
      edit: { lessonId: LESSON, draft: null, draftUpdatedAt: null, draftBy: null, published: learnerEdits.lessons[LESSON], publishedAt: now, publishedBy: 'kai' },
      rejectNextDraft: true,
    };
    const writes = [], auditQueries = [];
    await admin.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      const body = method === 'GET' ? undefined : request.postDataJSON();
      if (method !== 'GET') writes.push({ method, p, body });
      if (p === '/site/lesson-edits') return json({ revision: 0, lessons: {} });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/admin/access') return json({ id: 1, username: 'kai', role: 'admin' });
      if (p === '/admin/audit-log') {
        auditQueries.push(url.search);
        return json({ hasMore: false, actions: ['user.suspended', 'reports.resolved', 'lesson.published'], entries: [
          { id: 2, action: 'reports.resolved', at: now, actor: 'kai', targetUser: 'dan', targetRef: null, details: { resolution: 'warned', reports: 4 } },
          { id: 1, action: 'lesson.published', at: now, actor: 'kai', targetUser: null, targetRef: LESSON, details: { title: 'Saying hello (edited)' } },
        ] });
      }
      if (p === '/admin/reports') return json({ learners: state.reports, repeatReporters: 3, windowDays: 30 });
      if (p === '/admin/reports/9/resolve') { state.reports = []; return json({ resolution: body.resolution }); }
      if (p === '/admin/support') return json({ unreadOpen: 0, conversations: [] });
      if (p === '/admin/support/7') return json({ id: 7, subject: 'Report: learner @dan', status: 'open', createdAt: now, learner: { id: 3, username: 'cat', name: 'Cat', status: 'active' }, messages: [], reports: state.reports[0] ?? null });
      if (p === '/admin/lessons/export') return json({ exportedAt: '2026-10-27T10:00:00.000Z', lessons: { [LESSON]: state.edit.published } });
      if (p === '/admin/lessons/edits') return json({ edits: [{ lessonId: LESSON, hasDraft: Boolean(state.edit.draft), draftUpdatedAt: null, draftBy: null, isPublished: Boolean(state.edit.published), publishedAt: now, publishedBy: 'kai' }] });
      if (p === `/admin/lessons/${LESSON}/edit`) return json(state.edit);
      if (p === `/admin/lessons/${LESSON}/draft` && method === 'PUT') {
        if (state.rejectNextDraft) { state.rejectNextDraft = false; return json({ message: 'The lesson has problems to fix before it can be saved.', errors: ['title: is required'] }, 400); }
        state.edit = { ...state.edit, draft: body.content, draftBy: 'kai', draftUpdatedAt: now }; return json(state.edit);
      }
      if (p === `/admin/lessons/${LESSON}/publish`) { state.edit = { ...state.edit, published: state.edit.draft, draft: null }; return json(state.edit); }
      if (p === `/admin/lessons/${LESSON}/published`) { state.edit = { ...state.edit, published: null }; return json(state.edit); }
      return json({});
    });
    const adminPage = await admin.newPage();
    adminPage.on('pageerror', error => errors.push(error.message));
    adminPage.on('dialog', dialog => void dialog.accept());
    const wrote = (method, p) => writes.filter(w => w.method === method && w.p === p);

    // Audit log
    await adminPage.goto(base + '/admin/audit-log');
    await adminPage.getByText('Resolved 4 reports about @dan: warned the learner').waitFor();
    await adminPage.getByText('Published lesson “Saying hello (edited)”').waitFor();
    await adminPage.getByLabel('What').selectOption('reports');
    await adminPage.getByRole('button', { name: 'Filter' }).click();
    for (let i = 0; i < 50 && !auditQueries.some(q => q.includes('action=reports')); i++) await adminPage.waitForTimeout(20);
    assert.ok(auditQueries.some(q => q.includes('action=reports')), 'the filter is sent');
    await adminPage.screenshot({ path: path.join(shots, 'admin-audit-log.png'), fullPage: true });

    // Reports on a report request, then the queue
    await adminPage.goto(base + '/admin/support?id=7');
    await adminPage.getByRole('region', { name: 'Reports about dan' }).getByText('Reported repeatedly').waitFor();
    await adminPage.screenshot({ path: path.join(shots, 'admin-support.png') });
    await adminPage.goto(base + '/admin/reports');
    const panel = adminPage.getByRole('region', { name: 'Reports about dan' });
    assert.match(await panel.innerText(), /4 open reports from 3 learners/);
    await adminPage.screenshot({ path: path.join(shots, 'admin-reports.png'), fullPage: true });
    await adminPage.getByRole('button', { name: 'Warn dan' }).click();
    await panel.getByRole('textbox').fill('Please keep your bio friendly.');
    await panel.getByRole('button', { name: 'Send warning and close reports' }).click();
    await adminPage.getByText('No open reports.').waitFor();
    assert.deepEqual(wrote('POST', '/admin/reports/9/resolve')[0].body, { resolution: 'warned', warning: 'Please keep your bio friendly.' });

    // Lesson editor: list, edit, rejected save with every problem, save, preview, publish, restore
    await adminPage.goto(base + '/admin/lessons');
    // Level filter: N4 shows only N4 units, kept in the address; All brings everything back.
    const levels = adminPage.getByRole('group', { name: 'Level' });
    await levels.getByRole('button', { name: /^N4/ }).click(); await adminPage.waitForURL('**/admin/content/lessons?level=N4');
    await adminPage.getByRole('heading', { name: 'N4 Unit 1' }).waitFor();
    // N4 Unit 1 is also in the unfiltered list, so wait for the N5 units to leave before counting.
    await adminPage.getByRole('heading', { name: 'N5 Unit 1', exact: true }).waitFor({ state: 'detached' });
    assert.equal(await adminPage.getByRole('heading', { name: /^N5 Unit/ }).count(), 0, 'no N5 units under N4');
    assert.equal(await levels.getByRole('button', { name: /^N4/ }).getAttribute('aria-pressed'), 'true');
    await levels.getByRole('button', { name: /^N5/ }).click(); await adminPage.getByRole('heading', { name: 'N5 Unit 1' }).waitFor();
    assert.equal(await adminPage.getByRole('heading', { name: /^N4 Unit/ }).count(), 0, 'no N4 units under N5');
    const row = adminPage.getByRole('link', { name: /Introducing Yourself/ });
    await row.waitFor(); assert.match(await row.innerText(), /Edited/, 'the list marks edited lessons');
    const [download] = await Promise.all([adminPage.waitForEvent('download'), adminPage.getByRole('button', { name: 'Export published edits (1)' }).click()]);
    assert.equal(download.suggestedFilename(), 'lesson-edits-2026-10-27.json');
    await row.click();
    const title = adminPage.getByLabel('Title', { exact: true });
    await title.waitFor(); assert.equal(await title.inputValue(), 'Saying hello (edited)', 'the editor starts from the published version');
    await title.fill('Saying hello again');
    await adminPage.getByRole('button', { name: 'Save draft' }).click();
    await adminPage.getByText('title: is required').waitFor();
    await adminPage.getByRole('button', { name: 'Save draft' }).click();
    await adminPage.getByText('Draft saved.', { exact: false }).waitFor();
    assert.equal(wrote('PUT', `/admin/lessons/${LESSON}/draft`).at(-1).body.content.title, 'Saying hello again');
    await adminPage.getByLabel('Practice 1: option 2 is correct').check();
    await adminPage.getByRole('button', { name: 'Preview' }).click();
    assert.match(await adminPage.getByRole('article', { name: 'Lesson preview' }).innerText(), /✓ いいえ/);
    await adminPage.getByRole('button', { name: 'Publish' }).click();
    await adminPage.getByText('Published. Learners see', { exact: false }).waitFor();
    assert.equal(wrote('PUT', `/admin/lessons/${LESSON}/draft`).at(-1).body.content.practice[0].correct, 'いいえ', 'unsaved changes are saved before publishing');
    assert.equal(wrote('POST', `/admin/lessons/${LESSON}/publish`).length, 1);
    await adminPage.screenshot({ path: path.join(shots, 'lesson-editor.png'), fullPage: false });
    await adminPage.getByRole('button', { name: 'Restore original' }).click();
    await adminPage.getByText('The original lesson is back for learners.').waitFor();
    assert.equal(await title.inputValue(), 'Introducing Yourself', 'the form shows the course-file version again');

    assert.deepEqual(errors, []);
    console.log('PASS: published edits change lesson titles and lesson-page content for learners, and the last copy is used when the server is down; audit log text and filter; report summary on a report request; reports queue warn flow; lesson editor (list badge, export download, starts from published, rejected save lists problems, save, correct answer, preview, publish saves first, restore original)');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
