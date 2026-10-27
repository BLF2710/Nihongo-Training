// Friends, part two, against fixture APIs: friend streaks and "studying now", nudges, challenges, the activity feed
// with cheers, suggestions, block and report from a profile, the opt-in settings and blocked list, notifications.
//   node friends-extras-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const now = new Date().toISOString();
const person = (username, displayName) => ({ username, displayName });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => {
      localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner');
      // A quiet live stream in place of the server's.
      const original = window.fetch;
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        if (!url.endsWith('/api/events')) return original(input, init);
        const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('event: ready\ndata: {}\n\n')); } });
        return Promise.resolve(new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
      };
    }, token);
    const state = {
      challenges: [
        { id: 2, metric: 'xp', days: 7, status: 'pending', sentByMe: false, friend: person('ren', 'Ren'), myScore: 0, theirScore: 0, createdAt: now, startsAt: null, endsAt: null, outcome: null },
        { id: 1, metric: 'lessons', days: 3, status: 'finished', sentByMe: true, friend: person('mika', 'Mika'), myScore: 4, theirScore: 2, createdAt: now, startsAt: now, endsAt: now, outcome: 'won' },
      ],
      feed: [{ key: 'lessons:2026-10-27', kind: 'lessons', lessons: 2, person: person('ren', 'Ren'), at: now, cheered: false }],
      suggestions: [{ username: 'yuki', displayName: 'Yuki', mutualFriends: 2, sameLevel: 'N5' }],
      social: { suggestMe: true, shareActivity: true, showStudyingNow: false },
      blocked: [],
      notes: [
        { id: 3, kind: 'challenge', createdAt: now, read: false, actor: person('mika', 'Mika'), data: { event: 'finished', metric: 'lessons', outcome: 'won', myScore: 4, theirScore: 2 } },
        { id: 2, kind: 'cheer', createdAt: now, read: false, actor: person('ren', 'Ren'), data: { reason: 'completing 2 lessons' } },
        { id: 1, kind: 'nudge', createdAt: now, read: false, actor: person('mika', 'Mika'), data: {} },
      ],
    };
    const me = { username: 'kai', display_name: 'Kai', avatar: null, bio: '', learning_language: 'Japanese', native_language: null, learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 120, level: 2, rank: 'Beginner', lessons_completed: 3, current_streak: 1, longest_streak: 2, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 250, progressPercent: 20 } };
    const friends = [
      { ...person('ren', 'Ren'), since: now, progress: { level: 3, currentStreak: 6, activeToday: true, friendStreak: 5, studyingNow: true } },
      { ...person('mika', 'Mika'), since: now, progress: { level: 2, currentStreak: 0, activeToday: false, friendStreak: 0, studyingNow: false } },
    ];
    const writes = [];
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      const body = method === 'GET' ? undefined : request.postDataJSON();
      if (method !== 'GET') writes.push({ method, p, body });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: state.notes.filter(n => !n.read).length });
      if (p === '/profile/me') return json(me);
      if (p === '/profile/me/social' && method === 'GET') return json(state.social);
      if (p === '/profile/me/social') { state.social = { ...state.social, ...body }; return json(state.social); }
      if (p === '/notifications' && method === 'GET') return json({ notifications: state.notes, hasMore: false, unread: state.notes.filter(n => !n.read).length });
      if (p === '/friends') return json({ friends, incoming: [], outgoing: [] });
      if (p === '/friends/leaderboard') return json({ period: { from: now, to: now }, entries: [], hidden: 0 });
      if (p === '/friends/challenges' && method === 'GET') return json({ challenges: state.challenges });
      if (p === '/friends/challenges' && method === 'POST') {
        state.challenges.unshift({ id: 9, metric: body.metric, days: body.days, status: 'pending', sentByMe: true, friend: person(body.username, 'Mika'), myScore: 0, theirScore: 0, createdAt: now, startsAt: null, endsAt: null, outcome: null });
        return json({ id: 9 }, 201);
      }
      if (p === '/friends/challenges/2' && method === 'PUT') { Object.assign(state.challenges.find(c => c.id === 2), { status: 'active', startsAt: now, endsAt: now }); return json({ id: 2, status: 'active' }); }
      if (p === '/friends/activity') return json({ items: state.feed, days: 14 });
      if (p === '/friends/ren/cheers') return json({ cheered: true }, 201);
      if (p === '/friends/mika/nudge') return json({ nudged: true }, 201);
      if (p === '/friends/suggestions') return json({ enabled: state.social.suggestMe, suggestions: state.social.suggestMe ? state.suggestions : [] });
      if (p === '/friends/requests' && method === 'POST') { state.suggestions = []; return json({ state: 'outgoing', requestId: 5, person: person(body.username, 'Yuki') }, 201); }
      if (p === '/people/sora') return json({ ...person('sora', 'Sora'), joinedAt: now, visibility: 'private', visible: false, canRequest: true, friendship: { state: 'none' } });
      if (p === '/people/sora/report') return json({ supportConversationId: 44 }, 201);
      if (p === '/people/sora/block') { state.blocked = [{ ...person('sora', 'Sora'), blockedAt: now }]; return json({ blocked: true }); }
      if (p === '/blocks' && method === 'GET') return json({ blocked: state.blocked });
      if (p === '/blocks/sora' && method === 'DELETE') { state.blocked = []; return json({ blocked: false }); }
      return json({});
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const wrote = (method, p) => writes.find(w => w.method === method && w.p === p);

    // ---- Friends page: friend streak, studying now, nudge
    await page.goto(base + '/friends');
    const renRow = page.getByRole('listitem').filter({ has: page.getByRole('link', { name: /Ren/ }) }).filter({ hasText: 'together' });
    await renRow.waitFor();
    assert.match(await renRow.innerText(), /5 days together/); assert.match(await renRow.innerText(), /studying now/);
    assert.equal(await page.getByRole('button', { name: 'Nudge ren to study' }).count(), 0, 'no nudge for a friend who studied today');
    await page.getByRole('button', { name: 'Nudge mika to study' }).click();
    await page.getByText('You nudged @mika.').waitFor();
    assert.ok(wrote('POST', '/friends/mika/nudge'));

    // ---- Challenges: answer one, send one, see a result
    const challenges = page.getByRole('region', { name: 'Challenges' });
    assert.match(await challenges.innerText(), /You won/);
    await page.getByRole('button', { name: 'Accept challenge from ren' }).click();
    await challenges.getByText(/ends /).waitFor();
    assert.deepEqual(wrote('PUT', '/friends/challenges/2').body, { accept: true });
    await page.getByRole('button', { name: 'Challenge mika' }).click();
    const form = page.getByRole('form', { name: 'Challenge mika' });
    await form.getByLabel('Most lessons').check(); await form.getByLabel('3 days').check();
    await form.getByRole('button', { name: 'Send challenge' }).click();
    await page.getByText('Challenge sent to @mika.').waitFor();
    assert.deepEqual(wrote('POST', '/friends/challenges').body, { username: 'mika', metric: 'lessons', days: 3 });

    // ---- Activity feed and cheers
    const feed = page.getByRole('region', { name: 'Friend activity' });
    assert.match(await feed.innerText(), /Ren completed 2 lessons/);
    await feed.getByRole('button', { name: /^Cheer ren/ }).click();
    await feed.getByText('🎉 Cheered').waitFor();
    assert.deepEqual(wrote('POST', '/friends/ren/cheers').body, { item: 'lessons:2026-10-27' });

    // ---- Suggestions
    const suggestions = page.getByRole('region', { name: 'People you might know' });
    assert.match(await suggestions.innerText(), /2 mutual friends · also studying N5/);
    await page.getByRole('button', { name: 'Add yuki as a friend' }).click();
    await page.getByText('Friend request sent to @yuki.').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Add yuki as a friend' }).count(), 0);
    await page.screenshot({ path: path.join(shots, 'friends-extras.png'), fullPage: true });

    // ---- Report and block from a profile
    await page.goto(base + '/u/sora');
    await page.getByRole('button', { name: 'Report' }).click();
    await page.getByLabel('Report @sora').fill('Spam in the bio');
    await page.getByRole('button', { name: 'Send report' }).click();
    await page.getByRole('link', { name: 'Help & support' }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Help & support' }).getAttribute('href'), '/support/44');
    assert.deepEqual(wrote('POST', '/people/sora/report').body, { reason: 'Spam in the bio' });
    await page.getByRole('button', { name: 'Block' }).click();
    await page.getByRole('group', { name: 'Block @sora?' }).getByRole('button', { name: 'Block' }).click();
    await page.getByRole('heading', { name: 'You blocked @sora' }).waitFor();

    // ---- Settings: opt-in choices and the blocked list
    await page.goto(base + '/settings/privacy');
    const suggest = page.getByLabel('Friend suggestions');
    await suggest.waitFor(); assert.equal(await suggest.isChecked(), true);
    await suggest.uncheck();
    for (let i = 0; i < 50 && !wrote('PUT', '/profile/me/social'); i++) await page.waitForTimeout(20);
    assert.deepEqual(wrote('PUT', '/profile/me/social').body, { suggestMe: false });
    assert.equal(await page.getByLabel("Show friends when I'm studying").isChecked(), false);
    await page.getByRole('navigation', { name: 'Settings sections' }).getByRole('link', { name: /Blocked learners/ }).click();
    const blockedList = page.getByRole('region', { name: 'Blocked learners' }).last();
    await blockedList.getByText('@sora').waitFor();
    await page.getByRole('button', { name: 'Unblock sora' }).click();
    await blockedList.getByText("You haven't blocked anyone.").waitFor();

    // ---- Notifications for nudges, cheers and challenges
    await page.goto(base + '/notifications');
    await page.getByText('You won your challenge with Mika (@mika), 4 to 2 lessons!').waitFor();
    await page.getByText('Ren (@ren) cheered you on for completing 2 lessons.').waitFor();
    await page.getByText('Mika (@mika) nudged you: time for some Japanese today!').waitFor();

    // ---- Phone width: no sideways scrolling
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(base + '/friends');
    await page.getByRole('region', { name: 'Friend activity' }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'fits a phone screen');
    await page.goto(base + '/settings/privacy');
    await page.getByRole('group', { name: 'Who can see your progress' }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'settings fit a phone screen');
    await page.screenshot({ path: path.join(shots, 'settings-phone.png') });

    assert.deepEqual(errors, []);
    console.log('PASS: friend streak and studying now on the list; nudge (not for friends who studied today); challenges: accept, send (goal and length), result; activity feed with cheers; suggestions with reasons and Add friend; report (support link) and block from a profile; opt-in settings saved on change; blocked list with Unblock; nudge, cheer and challenge notifications; phone width');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
