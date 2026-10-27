// Dashboard, Messages, Help & support, Study assistant and the admin support inbox against an in-memory fixture API.
//   node comm-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = role => `test.${Buffer.from(JSON.stringify({ userId: role === 'admin' ? 9 : 1 })).toString('base64url')}.x`;

function fixture() {
  let nextId = 100;
  const at = () => new Date().toISOString();
  const msg = (body, mine, senderRole = 'learner', sender = 'Ken') => ({ id: nextId++, body, senderRole, sender: mine ? 'You' : sender, mine, sentAt: at() });
  const db = {
    direct: [{ id: 1, with: { username: 'ken_k', name: 'Ken' }, blockedByMe: false, unread: 2, messages: [msg('はじめまして！', false), msg('Shall we practise together?', false)] }],
    support: [{ id: 7, subject: 'Lesson will not open', status: 'open', unread: 1, messages: [msg('Lesson 3 does not open.', true), msg('Thanks, we are looking into it.', false, 'admin', 'LingoHub support')] }],
    assistant: { conversationId: null, messages: [] },
    staffReplies: [], reports: [], asks: [], statusChanges: [], fail: false,
  };
  return { db, msg, handle(p, method, body, query) {
    const direct = db.direct.find(c => p.startsWith(`/messages/conversations/${c.id}`));
    const support = db.support.find(c => p.startsWith(`/support/${c.id}`) || p.startsWith(`/admin/support/${c.id}`));
    if (p === '/inbox') return { direct: db.direct.reduce((n, c) => n + (c.unread ? 1 : 0), 0), support: db.support.reduce((n, c) => n + (c.unread ? 1 : 0), 0), get total() { return this.direct + this.support; } };
    if (p === '/messages/conversations' && method === 'GET') return { conversations: db.direct.map(c => ({ id: c.id, with: c.with, unread: c.unread, lastMessageAt: at(), lastMessage: c.messages.length ? { body: c.messages.at(-1).body, mine: c.messages.at(-1).mine } : null })) };
    if (p === '/messages/conversations' && method === 'POST') {
      if (body.username !== 'yuki_san') return [404, { message: 'No learner has that username.' }];
      const c = { id: 2, with: { username: 'yuki_san', name: 'Yuki' }, blockedByMe: false, unread: 0, messages: [] }; db.direct.push(c); return [201, { id: 2, with: c.with }];
    }
    if (direct && method === 'GET') { direct.unread = 0; return { id: direct.id, with: direct.with, blockedByMe: direct.blockedByMe, canReply: !direct.blockedByMe, messages: direct.messages }; }
    if (direct && p.endsWith('/block')) { direct.blockedByMe = body.blocked; return { blockedByMe: body.blocked }; }
    if (direct && p.endsWith('/report')) { db.reports.push({ path: p, ...body }); return [201, { supportConversationId: 8 }]; }
    if (direct && p.endsWith('/messages')) { const m = msg(body.body, true); direct.messages.push(m); return [201, m]; }
    if (p === '/support' && method === 'GET') return { conversations: db.support.map(c => ({ id: c.id, subject: c.subject, status: c.status, unread: c.unread, lastMessageAt: at(), lastMessage: { body: c.messages.at(-1).body, fromSupport: !c.messages.at(-1).mine } })) };
    if (p === '/support' && method === 'POST') { const c = { id: 9, subject: body.subject, status: 'open', unread: 0, messages: [msg(body.body, true)] }; db.support.push(c); return [201, { id: 9 }]; }
    if (support && p.startsWith('/support/') && method === 'GET') { support.unread = 0; return { id: support.id, subject: support.subject, status: support.status, messages: support.messages }; }
    if (support && p.startsWith('/support/') && p.endsWith('/messages')) { const m = msg(body.body, true); support.messages.push(m); support.status = 'open'; return [201, m]; }
    if (p === '/assistant' && method === 'GET') return { provider: { id: 'course-helper', label: 'Course helper (searches your lessons)', ai: false }, conversationId: db.assistant.conversationId, messages: db.assistant.messages, conversations: db.assistant.conversationId ? [{ id: 50, title: 'weather', lastMessageAt: at() }] : [] };
    if (p === '/assistant/conversations') { db.assistant = { conversationId: 51, messages: [] }; return [201, { conversationId: 51 }]; }
    if (p === '/assistant/messages') {
      db.asks.push(body);
      if (db.fail) return [503, { message: 'The study assistant is busy right now. Please try again in a minute.' }];
      const q = msg(body.body, true), a = msg(`Here is what I found in your course:\n• 天気 (てんき), tenki: weather`, false, 'assistant', 'Study assistant');
      db.assistant.conversationId = 50; db.assistant.messages.push(q, a); return [201, { conversationId: 50, messages: [q, a] }];
    }
    if (p === '/admin/access') return { id: 9, username: 'boss', role: 'admin' };
    if (p === '/admin/support' && method === 'GET') { const list = db.support.filter(c => (query.status ?? 'open') === 'all' || c.status === (query.status ?? 'open')); return { unreadOpen: 1, conversations: list.map(c => ({ id: c.id, subject: c.subject, status: c.status, unread: c.id === 7, lastMessageAt: at(), learner: { id: 1, username: 'mika', name: 'Mika' }, lastMessage: { body: c.messages.at(-1).body, fromSupport: !c.messages.at(-1).mine } })) }; }
    if (support && p.startsWith('/admin/support/') && method === 'GET') return { id: support.id, subject: support.subject, status: support.status, createdAt: at(), learner: { id: 1, username: 'mika', name: 'Mika', status: 'active' }, messages: support.messages.map(m => ({ ...m, mine: false, sender: m.mine ? 'Mika' : 'Boss (support)' })) };
    if (support && p.startsWith('/admin/support/') && method === 'POST') { db.staffReplies.push(body.body); const m = { ...msg(body.body, true, 'admin'), sender: 'You (support)' }; support.messages.push({ ...m, mine: false, sender: 'LingoHub support' }); return [201, m]; }
    if (support && p.startsWith('/admin/support/') && method === 'PATCH') { db.statusChanges.push(body.status); support.status = body.status; return { id: support.id, status: body.status }; }
    return undefined;
  } };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const { db, handle } = fixture();
    const unit = (n, completedLessons, allowed = true) => ({ id: `japanese-n5-unit-${n}`, number: n, title: `Unit title ${n}`, description: '', requiredLevel: 1, allowed, reasons: allowed ? [] : [`Complete Unit ${n - 1} first`], completedLessons, totalLessons: 6, allLessonsCompleted: completedLessons === 6, assessmentUnlocked: completedLessons === 6, assessmentPassed: completedLessons === 6 && n < 2, completed: completedLessons === 6 && n < 2, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80,
      lessons: Array.from({ length: 6 }, (_, i) => ({ id: `japanese-n5-unit-${n}-l${i}`, slug: `n5-unit-${n}-l${i}`, title: `Lesson ${n}.${i + 1}`, description: '', isPlaceholder: false, allowed, reasons: [], completed: i < completedLessons })) });
    const units = [unit(1, 6), unit(2, 2), unit(3, 0, false)];
    const route = async (context, role) => {
      await context.addInitScript(([t, r]) => { localStorage.setItem('token', t); localStorage.setItem('user_role', r); localStorage.setItem('user_name', 'Mika'); localStorage.setItem('app_language', 'japanese'); }, [token(role), role === 'admin' ? 'admin' : 'learner']);
      await context.route('http://localhost:5000/api/**', r => { const request = r.request(), url = new URL(request.url()), p = url.pathname.replace('/api', '');
        const json = (data, status = 200) => r.fulfill({ status, json: data });
        const result = handle(p, request.method(), request.postDataJSON() ?? {}, Object.fromEntries(url.searchParams));
        if (result !== undefined) return Array.isArray(result) ? json(result[1], result[0]) : json(JSON.parse(JSON.stringify(result)));
        if (p === '/units') return json({ units });
        if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (p === '/profile/me') return json({ username: 'mika', display_name: 'Mika', level: 2, rank: 'Explorer', xp: 140, xpProgress: { progressPercent: 40, nextLevelXp: 300 }, current_streak: 4, achievements_count: 3, achievements: [] });
        if (p === '/kanji/progress') return json({ progress: [{ kanjiId: 'kanji-65e5', status: 'mastered', correctCount: 4, wrongCount: 0, total: 4, accuracy: 100, lastPracticedAt: null }] });
        return json({}); });
    };
    const learner = await browser.newContext({ viewport: { width: 1366, height: 900 } }); await route(learner, 'learner');
    const page = await learner.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const heading = name => page.getByRole('heading', { name, exact: true });
    const noOverflow = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows`);

    // ---- Dashboard
    await page.goto(base + '/'); await page.getByRole('heading', { level: 1 }).filter({ hasText: 'Mika' }).waitFor();
    assert.match(await page.getByRole('heading', { level: 1 }).innerText(), /^(おはようございます|こんにちは|こんばんは), Mika$/);
    await heading('Lesson 2.3').waitFor(); await page.getByRole('link', { name: 'Continue learning →', exact: true }).waitFor();
    await page.getByLabel('8 of 18 N5 lessons completed').waitFor();
    for (const label of ['Streak', 'Explorer', 'N5 lessons', 'N5 kanji mastered']) await page.locator('section[aria-labelledby="progress-heading"] p').filter({ hasText: new RegExp(label + '$') }).first().waitFor();
    await page.getByText('4 days', { exact: true }).waitFor(); await page.getByText('8 / 18', { exact: true }).waitFor();
    assert.equal(await page.locator('section[aria-labelledby="path-heading"] ol > li').count(), 3);
    await page.locator('section[aria-labelledby="path-heading"]').getByText('Unit 2 · In progress').waitFor();
    await page.locator('section[aria-labelledby="path-heading"]').getByText('Complete Unit 2 first').waitFor();
    const plan = await page.locator('section[aria-labelledby="today-heading"] li a').evaluateAll(links => links.map(a => a.getAttribute('href')));
    assert.deepEqual(plan.slice(0, 2), ['/lessons/japanese/n5-unit-2-l2', '/review?unit=japanese-n5-unit-2']); assert.match(plan[2], /^\/(listening|speaking)\?unit=japanese-n5-unit-2$/); assert.equal(plan.length, 4);
    await page.locator('section[aria-labelledby="community-heading"]').getByText('1 new').first().waitFor();
    await page.getByRole('button', { name: 'Messages, 2 unread' }).waitFor();
    await page.screenshot({ path: shots + '/dashboard.png', fullPage: true });
    // Asking from the dashboard opens the assistant and sends the question once, with the level.
    await page.getByPlaceholder('e.g. What does 思う mean?').fill('weather'); await page.getByRole('button', { name: 'Ask', exact: true }).click();
    await page.waitForURL(base + '/assistant'); await page.getByText('天気 (てんき), tenki: weather', { exact: false }).waitFor();
    assert.deepEqual(db.asks, [{ body: 'weather', conversationId: null, level: 'N5' }]);
    await page.getByText('Course helper (searches your lessons)').first().waitFor();

    // ---- Study assistant
    await page.getByRole('button', { name: '+ New chat' }).click(); await page.getByText('What would you like to learn?').waitFor();
    await page.getByRole('button', { name: 'When do I use は and when が?' }).click(); await page.getByText('Here is what I found', { exact: false }).first().waitFor();
    assert.equal(db.asks.at(-1).body, 'When do I use は and when が?');
    db.fail = true; const box = page.getByRole('textbox', { name: 'Message', exact: true });
    await box.fill('Is anyone there?'); await box.press('Enter');
    await page.getByRole('alert').filter({ hasText: 'The study assistant is busy right now' }).waitFor(); assert.equal(await box.inputValue(), 'Is anyone there?', 'the draft is kept after a failure');
    db.fail = false; await page.getByRole('button', { name: 'Send' }).click(); await page.waitForFunction(() => !document.querySelector('[role="alert"]'));
    // Sending clears the error first and the draft once the reply arrives, so wait for the draft.
    await page.waitForFunction(() => document.querySelector('main textarea')?.value === '');
    assert.equal(await box.inputValue(), '');
    await page.screenshot({ path: shots + '/assistant.png' });

    // ---- Messages
    await page.goto(base + '/messages'); await heading('Messages').waitFor();
    const convoLink = page.getByRole('link', { name: /Ken/ }); await convoLink.getByText('2 unread').waitFor();
    await convoLink.click(); await page.waitForURL(base + '/messages/1'); await page.getByText('はじめまして！').waitFor();
    const composer = page.getByRole('textbox', { name: 'Message', exact: true });
    await composer.fill('よろしく'); await composer.press('Shift+Enter'); await composer.type('おねがいします'); assert.equal(await composer.inputValue(), 'よろしく\nおねがいします');
    await composer.press('Enter'); await page.locator('ol[aria-label="Conversation with Ken"] li').filter({ hasText: 'よろしく' }).waitFor();
    assert.equal(db.direct[0].messages.at(-1).body, 'よろしく\nおねがいします');
    await page.getByRole('button', { name: 'Report' }).first().click(); await page.getByLabel(/What is wrong/).fill('Spam'); await page.getByRole('button', { name: 'Send report' }).click();
    await page.getByText(/sent to the support team/).waitFor(); assert.deepEqual(db.reports.map(r => [r.path.split('/').slice(-2)[0] > 0, r.reason]), [[true, 'Spam']]);
    await page.getByRole('button', { name: 'Block' }).click(); await page.getByText('You blocked Ken.', { exact: false }).waitFor();
    await page.getByText('You have blocked this learner. Unblock them to reply.').waitFor(); assert.equal(await composer.count(), 0);
    await page.getByRole('button', { name: 'Unblock' }).click(); await composer.waitFor();
    // Starting a conversation by username.
    const start = page.getByLabel('New message to a username');
    await start.fill('nobody'); await page.getByRole('button', { name: 'Start' }).click(); await page.getByRole('alert').filter({ hasText: 'No learner has that username.' }).waitFor();
    await start.fill('@yuki_san'); await page.getByRole('button', { name: 'Start' }).click(); await page.waitForURL(base + '/messages/2'); await heading('Yuki').waitFor();
    await page.getByText('No messages yet. Say hello!').waitFor();
    await page.screenshot({ path: shots + '/messages.png' });

    // ---- Help & support
    await page.goto(base + '/support'); await heading('Help & support').waitFor();
    await page.getByRole('link', { name: /Lesson will not open/ }).getByText('1 new').waitFor();
    await page.getByLabel('Subject').fill('Change my email'); await page.getByLabel('Message', { exact: true }).fill('Please change it to a new one.');
    await page.getByRole('button', { name: 'Send request' }).click(); await page.waitForURL(base + '/support/9'); await heading('Change my email').waitFor();
    await page.getByRole('link', { name: '← All requests' }).click(); await page.getByRole('link', { name: /Lesson will not open/ }).click();
    await page.getByText('Thanks, we are looking into it.').waitFor(); await page.locator('ol li').filter({ hasText: 'LingoHub support' }).first().waitFor();
    await page.screenshot({ path: shots + '/support.png' });

    // ---- Mobile: messages list, then thread
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/messages'); await page.getByRole('link', { name: /Ken/ }).waitFor(); assert.ok(!(await page.getByText('Choose a conversation').isVisible()));
    await page.goto(base + '/messages/1'); await page.getByRole('link', { name: '← All' }).waitFor(); assert.ok(!(await page.getByLabel('New message to a username').isVisible())); await noOverflow('messages mobile');
    for (const path of ['/', '/support', '/assistant']) { await page.goto(base + path); await page.waitForLoadState('networkidle'); await noOverflow(path); }
    await page.goto(base + '/'); await page.screenshot({ path: shots + '/dashboard-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);

    // ---- Admin support inbox
    const admin = await browser.newContext({ viewport: { width: 1366, height: 900 } }); await route(admin, 'admin');
    const adminPage = await admin.newPage(); const adminErrors = []; adminPage.on('pageerror', e => adminErrors.push(e.message));
    await adminPage.goto(base + '/admin/support'); await adminPage.getByRole('heading', { name: 'Support inbox' }).waitFor();
    await adminPage.getByText('1 open with new messages').waitFor();
    await adminPage.getByRole('button', { name: /Lesson will not open/ }).click(); await adminPage.waitForURL(/\/admin\/support\?id=7/);
    await adminPage.getByText('From Mika (@mika)', { exact: false }).waitFor();
    const reply = adminPage.getByRole('textbox', { name: 'Message', exact: true }); await reply.fill('Fixed now, please try again.'); await reply.press('Enter');
    await adminPage.locator('ol li').filter({ hasText: 'Fixed now, please try again.' }).waitFor(); assert.deepEqual(db.staffReplies, ['Fixed now, please try again.']);
    await adminPage.getByRole('button', { name: 'Close request' }).click(); await adminPage.getByRole('button', { name: 'Reopen' }).waitFor(); assert.deepEqual(db.statusChanges, ['closed']);
    await adminPage.getByRole('button', { name: 'Closed', exact: true }).click(); await adminPage.getByRole('button', { name: /Lesson will not open/ }).waitFor();
    await adminPage.screenshot({ path: shots + '/admin-support.png' });
    assert.deepEqual(adminErrors, []);
    console.log('PASS: dashboard (greeting, next step, level ring, stats, path with states, plan of 4, unread badges, ask → assistant once with level); assistant (provider label, new chat, suggestion, failure keeps the draft, retry); messages (unread, open, Shift+Enter newline, Enter sends, report with reason, block/unblock, unknown username error, start by @username); support (unread, new request, thread with LingoHub support); mobile list/thread and no overflow; admin inbox (unread, open, reply, close, filter); no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
