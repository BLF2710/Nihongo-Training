// Invite links and QR codes, the friends leaderboard and the notification centre, against fixture APIs.
//   node social-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const iso = minutesAgo => new Date(Date.now() - minutesAgo * 60_000).toISOString();
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    await context.addInitScript(() => {
      // A live stream the test can push into (see friends-ui.cjs).
      const encoder = new TextEncoder(); window.__streams = [];
      window.__push = (type, data) => window.__streams.forEach(c => { try { c.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)); } catch { /* closed */ } });
      const original = window.fetch;
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        if (!url.endsWith('/api/events')) return original(input, init);
        const stream = new ReadableStream({ start(c) { window.__streams.push(c); c.enqueue(encoder.encode('event: ready\ndata: {}\n\n')); init?.signal?.addEventListener('abort', () => { try { c.error(new DOMException('aborted', 'AbortError')); } catch { /* closed */ } }); } });
        return Promise.resolve(new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
      };
    });
    const state = { friendship: 'none', notes: [], reads: 0 };
    // 27 notifications, oldest first; the newest 3 unread.
    const kinds = ['friend_request', 'friend_accepted', 'support_reply', 'achievement'];
    for (let i = 1; i <= 27; i++) state.notes.push({ id: i, kind: kinds[i % 4], createdAt: iso((28 - i) * 600), read: i <= 24, actor: i % 4 < 2 ? { username: 'mika', displayName: 'Mika' } : null, data: i % 4 === 2 ? { conversationId: 5, subject: 'Audio problem' } : i % 4 === 3 ? { achievementId: 'first_steps', title: 'First Steps' } : {} });
    const board = { period: { from: iso(7 * 1440), to: iso(0) }, hidden: 2, entries: [
      { username: 'kai', displayName: 'Kai', self: true, weeklyXp: 120, weeklyLessons: 2, currentStreak: 3, activeToday: true },
      { username: 'mika', displayName: 'Mika', self: false, weeklyXp: 300, weeklyLessons: 2, currentStreak: 9, activeToday: false },
      { username: 'ren', displayName: 'Ren', self: false, weeklyXp: 120, weeklyLessons: 5, currentStreak: 0, activeToday: false },
      { username: 'sora', displayName: 'Sora', self: false, weeklyXp: 0, weeklyLessons: 0, currentStreak: 0, activeToday: false },
    ] };
    const writes = [];
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (method !== 'GET') writes.push({ p, body: request.postDataJSON() });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/auth/login') return json({ token, user: { id: 1, username: 'kai', email: 'kai@example.com', role: 'learner' } });
      if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: state.notes.filter(n => !n.read).length });
      if (p === '/profile/me') return json({ username: 'kai', display_name: 'Kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      if (p === '/units') return json({ units: [] });
      if (p === '/friends') return json({ friends: [], incoming: [], outgoing: [] });
      if (p === '/friends/leaderboard') return json(board);
      if (p === '/friends/requests' && method === 'POST') { state.friendship = 'outgoing'; return json({ state: 'outgoing', requestId: 4, person: { username: 'mika', displayName: 'Mika' } }, 201); }
      const person = p.match(/^\/people\/(\w+)$/);
      if (person) { const u = person[1]; return json({ username: u, displayName: u === 'kai' ? 'Kai' : 'Mika', joinedAt: iso(60000), visibility: 'public', visible: false, canRequest: true, friendship: u === 'kai' ? { state: 'self' } : state.friendship === 'outgoing' ? { state: 'outgoing', requestId: 4 } : { state: 'none' } }); }
      if (p === '/notifications' && method === 'GET') {
        const before = Number(url.searchParams.get('before') ?? Infinity), limit = Number(url.searchParams.get('limit') ?? 20);
        const page = [...state.notes].reverse().filter(n => n.id < before);
        return json({ notifications: page.slice(0, limit).map(n => ({ ...n })), hasMore: page.length > limit, unread: state.notes.filter(n => !n.read).length });
      }
      if (p === '/notifications/read') { state.reads++; state.notes.forEach(n => { n.read = true; }); return json({ unread: 0 }); }
      return json({});
    });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const noOverflow = async what => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow: ' + what);

    // ---- Invite link while signed out: sign in, then land on the inviter's profile.
    await page.goto(base + '/add/mika'); await page.waitForURL(/\/login\?next=%2Fadd%2Fmika$/);
    await page.getByText('@mika invited you to be friends.').waitFor();
    assert.equal(await page.getByRole('link', { name: 'Create an account' }).getAttribute('href'), '/register?next=%2Fadd%2Fmika', 'registration keeps the invite');
    await page.goto(base + '/register?next=%2Fadd%2Fmika'); assert.equal(await page.getByRole('link', { name: 'Sign in' }).getAttribute('href'), '/login?next=%2Fadd%2Fmika');
    await page.goto(base + '/login?next=%2Fadd%2Fmika');
    await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('**/u/mika?invite=1');
    await page.getByText('@mika invited you to be friends. Press Add friend to send a request.').waitFor();
    assert.equal(writes.filter(w => w.p === '/friends/requests').length, 0, 'opening an invite sends nothing by itself');
    await page.getByRole('button', { name: 'Add friend' }).click(); await page.getByText('Your friend request to @mika is waiting for an answer.').waitFor();
    // Unsafe return addresses are ignored.
    await page.evaluate(() => localStorage.clear());
    for (const next of ['https%3A%2F%2Fevil.example', '%2F%2Fevil.example', '%2F%5Cevil.example', '%2Fadmin']) {
      await page.goto(base + '/login?next=' + next); await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click();
      await page.waitForURL(base + '/'); assert.equal(new URL(page.url()).origin, new URL(base).origin, 'stays on the site: ' + next);
      await page.evaluate(() => localStorage.clear());
    }
    await page.goto(base + '/login'); await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click(); await page.waitForURL(base + '/');
    // Own invite link.
    await page.goto(base + '/add/kai'); await page.getByText('This is your invite link. Share it so friends can add you.').waitFor();

    // ---- Invite card: link, copy, QR code.
    await page.goto(base + '/friends'); const link = page.getByLabel('Your invite link'); await link.waitFor();
    assert.equal(await link.inputValue(), new URL(base).origin + '/add/kai');
    await page.getByRole('button', { name: 'Copy link' }).click(); await page.getByText('Invite link copied.').waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), new URL(base).origin + '/add/kai');
    await page.getByRole('button', { name: 'Show QR code' }).click();
    const qr = page.getByRole('img', { name: 'QR code that opens the invite link for @kai' }); await qr.waitFor();
    assert.match(await qr.getAttribute('src'), /^data:image\/png;base64,/);
    const size = await qr.evaluate(img => [img.naturalWidth, img.naturalHeight]); assert.ok(size[0] >= 200 && size[0] === size[1], 'square QR image ' + size);
    // The QR code decodes back to the link (BarcodeDetector when the browser has it).
    const decoded = await qr.evaluate(async img => { if (!('BarcodeDetector' in window)) return null; const codes = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(img); return codes[0]?.rawValue ?? ''; });
    if (decoded !== null) assert.equal(decoded, new URL(base).origin + '/add/kai');
    assert.equal(await page.getByRole('link', { name: 'Download QR code' }).getAttribute('download'), 'lingohub-invite-kai.png');
    await page.screenshot({ path: shots + '/invite-qr.png' });
    await page.getByRole('button', { name: 'Hide QR code' }).click(); assert.equal(await qr.count(), 0);

    // ---- Leaderboard: rank by XP, streak or lessons; ties share a place; private friends counted.
    const lb = page.getByRole('region', { name: 'Leaderboard' });
    const ranking = async () => (await lb.locator('ol > li').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim());
    let rows = await ranking();
    assert.match(rows[0], /Mika.*300 XP/); assert.match(rows[1], /Kai \(you\).*120 XP/); assert.match(rows[2], /Ren.*120 XP/); assert.match(rows[3], /^4 .*Sora.*0 XP/);
    assert.deepEqual(await lb.locator('ol > li > span:first-child').evaluateAll(spans => spans.map(s => s.getAttribute('aria-label'))), ['Place 1', 'Place 2', 'Place 2', 'Place 4'], 'ties share a place');
    await lb.getByText('2 friends keep their progress private and aren\'t shown.').waitFor();
    await lb.getByRole('button', { name: 'Streak' }).click(); rows = await ranking(); assert.match(rows[0], /Mika.*9 days/); assert.match(rows[1], /Kai.*3 days/);
    await lb.getByRole('button', { name: 'Lessons this week' }).click(); rows = await ranking(); assert.match(rows[0], /Ren.*5 lessons/);
    assert.equal(await lb.getByRole('button', { name: 'Lessons this week' }).getAttribute('aria-pressed'), 'true');
    await page.screenshot({ path: shots + '/leaderboard.png', fullPage: true });

    // ---- Notification centre: bell count, history page, paging, read state, live updates.
    const bell = page.getByRole('button', { name: /^Notifications/ });
    assert.equal(await bell.getAttribute('aria-label'), 'Notifications, 3 new');
    // Opened directly (the bell panel would already mark them read; it is checked further down).
    await page.goto(base + '/notifications');
    await page.getByRole('heading', { name: 'Notifications', exact: true }).waitFor();
    const list = page.locator('main ul').first();
    await list.locator('li').first().waitFor(); assert.equal(await list.locator('li').count(), 20);
    assert.equal(await list.getByText('New', { exact: true }).count(), 3, 'the three unread stay marked on this visit');
    await page.getByRole('button', { name: 'Notifications', exact: true }).waitFor(); assert.ok(state.reads >= 1, 'visiting marks them read');
    const texts = await list.locator('li').allInnerTexts();
    assert.ok(texts.some(t => t.includes('Mika (@mika) accepted your friend request.')) && texts.some(t => t.includes('Support replied to “Audio problem”.')) && texts.some(t => t.includes('You earned an achievement: First Steps.')));
    assert.equal(await list.getByRole('link', { name: /Support replied/ }).first().getAttribute('href'), '/support/5');
    await page.getByRole('button', { name: 'Load older notifications' }).click(); await page.waitForFunction(() => document.querySelectorAll('main ul')[0].querySelectorAll('li').length === 27);
    assert.equal(await page.getByRole('button', { name: 'Load older notifications' }).count(), 0);
    // A new notification arrives live at the top, above the older pages.
    state.notes.push({ id: 28, kind: 'friend_request', createdAt: iso(0), read: false, actor: { username: 'ren', displayName: 'Ren' }, data: {} });
    await page.evaluate(() => window.__push('notifications', { type: 'notifications' }));
    await list.locator('li').first().getByText('Ren (@ren) sent you a friend request.').waitFor(); await list.locator('li').first().getByText('just now').waitFor();
    assert.equal(await list.locator('li').count(), 28, 'older pages are kept');
    await page.screenshot({ path: shots + '/notifications.png' });
    // Bell panel shows recent history.
    await bell.click(); const panel = page.getByRole('dialog', { name: 'Notifications' });
    await panel.getByRole('region', { name: 'Recent notifications' }).getByText('Ren (@ren) sent you a friend request.').waitFor();
    await panel.getByRole('link', { name: 'See all' }).click(); await panel.waitFor({ state: 'hidden' });
    // Empty history.
    state.notes = []; await page.goto(base + '/notifications'); await page.getByText('No notifications yet').waitFor();
    await page.setViewportSize({ width: 375, height: 812 }); await page.goto(base + '/friends'); await page.getByLabel('Your invite link').waitFor(); await noOverflow('friends with invite and leaderboard');
    await page.getByRole('button', { name: 'Show QR code' }).click(); await page.getByRole('img', { name: /QR code/ }).waitFor(); await noOverflow('QR');
    await page.screenshot({ path: shots + '/social-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`PASS: invite link while signed out goes through sign-in (and registration) and lands on the inviter's profile with the invitation, sending nothing until Add friend; unsafe return addresses ignored; own invite link; invite card copies the link and shows a downloadable QR code${decoded !== null ? ' that decodes to the link' : ''}; leaderboard by XP, streak and lessons with shared places, (you) and private friends counted; bell count and See all; notifications page with 20 + older page, new ones marked, visiting marks read, live arrivals on top keeping older pages, links to targets; panel history; empty state; phones; no page errors.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
