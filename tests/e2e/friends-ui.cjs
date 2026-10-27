// Friends page, public profiles, live notifications and privacy settings, against fixture APIs.
// The live stream (/api/events) is replaced in the page by a stream the test pushes events into.
//   node friends-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const now = '2026-10-21T08:00:00.000Z';
const people = {
  kai: { displayName: 'Kai', visibility: 'public', canRequest: false },
  mika: { displayName: 'Mika', visibility: 'friends', canRequest: true },
  ren: { displayName: 'Ren', visibility: 'public', canRequest: true },
  sora: { displayName: 'Sora', visibility: 'private', canRequest: true },
  yuki: { displayName: 'Yuki', visibility: 'public', canRequest: false },
};
const details = name => ({ bio: `${people[name].displayName} studies every morning.`, learningLanguage: 'Japanese', nativeLanguage: 'English', learningGoal: 'Pass N5', xp: 300, level: 3, rank: 'Beginner', currentStreak: 4, longestStreak: 9, activeToday: true, lessonsCompleted: 14, unitsPassed: 2, latestUnit: { level: 'N5', number: 2, title: 'Numbers & Time' }, achievements: [{ id: 'first', title: 'First steps', description: 'Finish a lesson', earnedAt: now }], friends: 3 });

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    await context.addInitScript(t => {
      localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner');
      // A controllable live stream in place of the server's.
      const encoder = new TextEncoder(); window.__streams = []; window.__connections = 0;
      window.__push = (type, data) => window.__streams.forEach(c => { try { c.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`)); } catch { /* closed */ } });
      window.__drop = () => { window.__streams.forEach(c => { try { c.close(); } catch { /* closed */ } }); window.__streams = []; };
      const original = window.fetch;
      window.fetch = (input, init) => {
        const url = typeof input === 'string' ? input : input.url;
        if (!url.endsWith('/api/events')) return original(input, init);
        window.__connections++; window.__lastAuth = new Headers(init?.headers).get('Authorization');
        const stream = new ReadableStream({ start(c) { window.__streams.push(c); c.enqueue(encoder.encode('retry: 5000\nevent: ready\ndata: {}\n\n')); init?.signal?.addEventListener('abort', () => { try { c.error(new DOMException('aborted', 'AbortError')); } catch { /* closed */ } }); } });
        return Promise.resolve(new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
      };
    }, token);
    // Fixture state: kai is signed in.
    const state = { friends: [], incoming: [], outgoing: [], nextId: 10, direct: 0, support: 0, notes: [] };
    const lists = () => ({
      friends: state.friends.map(u => ({ username: u, displayName: people[u].displayName, since: now, progress: people[u].visibility === 'private' ? null : { level: 3, currentStreak: 4, activeToday: true } })),
      incoming: state.incoming.map(r => ({ ...r, displayName: people[r.username].displayName, sentAt: now })),
      outgoing: state.outgoing.map(r => ({ ...r, displayName: people[r.username].displayName, sentAt: now })),
    });
    const stateOf = u => u === 'kai' ? { state: 'self' } : state.friends.includes(u) ? { state: 'friends' } : state.outgoing.find(r => r.username === u) ? { state: 'outgoing', requestId: state.outgoing.find(r => r.username === u).id } : state.incoming.find(r => r.username === u) ? { state: 'incoming', requestId: state.incoming.find(r => r.username === u).id } : { state: 'none' };
    const writes = []; let friendLoads = 0; let me = { username: 'kai', display_name: 'Kai', avatar: null, bio: '', learning_language: 'Japanese', native_language: null, learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 120, level: 2, rank: 'Beginner', lessons_completed: 3, current_streak: 1, longest_streak: 2, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 250, progressPercent: 20 } };
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), p = url.pathname.replace('/api', ''), method = request.method();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (method !== 'GET') writes.push({ method, p, body: request.postDataJSON() });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/inbox') return json({ direct: state.direct, support: state.support, total: state.direct + state.support, friendRequests: state.incoming.length, notifications: state.notes.filter(n => !n.read).length });
      if (p === '/profile/me' && method === 'GET') return json(me);
      if (p === '/profile/me' && method === 'PUT') { const b = request.postDataJSON(); me = { ...me, profile_visibility: b.profileVisibility, friend_requests: b.friendRequests, native_language: b.nativeLanguage || null }; return json(me); }
      if (p === '/notifications' && method === 'GET') return json({ notifications: [...state.notes].reverse().slice(0, Number(url.searchParams.get('limit') ?? 20)), hasMore: false, unread: state.notes.filter(n => !n.read).length });
      if (p === '/notifications/read') { state.notes.forEach(n => { n.read = true; }); return json({ unread: 0 }); }
      if (p === '/friends/leaderboard') return json({ period: { from: now, to: now }, entries: [{ username: 'kai', displayName: 'Kai', self: true, weeklyXp: 20, weeklyLessons: 1, currentStreak: 1, activeToday: true }], hidden: 0 });
      if (p === '/friends') { friendLoads++; return json(lists()); }
      if (p === '/friends/requests' && method === 'POST') {
        const u = request.postDataJSON().username.toLowerCase();
        if (!people[u]) return json({ message: 'No learner has that username.' }, 404);
        if (!people[u].canRequest) return json({ message: `@${u} isn't accepting friend requests.` }, 403);
        if (state.incoming.find(r => r.username === u)) { state.incoming = state.incoming.filter(r => r.username !== u); state.friends.push(u); return json({ state: 'friends', person: { username: u, displayName: people[u].displayName } }, 201); }
        const id = state.nextId++; state.outgoing.push({ id, username: u }); return json({ state: 'outgoing', requestId: id, person: { username: u, displayName: people[u].displayName } }, 201);
      }
      const answer = p.match(/^\/friends\/requests\/(\d+)$/);
      if (answer && method === 'PUT') { const r = state.incoming.find(x => x.id === Number(answer[1])); state.incoming = state.incoming.filter(x => x !== r); if (request.postDataJSON().accept) state.friends.push(r.username); return json({ state: request.postDataJSON().accept ? 'friends' : 'none' }); }
      if (answer && method === 'DELETE') { state.outgoing = state.outgoing.filter(x => x.id !== Number(answer[1])); return json({ state: 'none' }); }
      const remove = p.match(/^\/friends\/(\w+)$/);
      if (remove && method === 'DELETE') { state.friends = state.friends.filter(u => u !== remove[1]); return json({ state: 'none' }); }
      const person = p.match(/^\/people\/(\w+)$/);
      if (person) {
        const u = person[1].toLowerCase(); if (!people[u]) return json({ message: 'No learner has that username.' }, 404);
        const friendship = stateOf(u), info = people[u];
        const visible = u === 'kai' || info.visibility === 'public' || (info.visibility === 'friends' && friendship.state === 'friends');
        return json({ username: u, displayName: info.displayName, joinedAt: '2026-03-02T00:00:00.000Z', visibility: u === 'kai' ? me.profile_visibility : info.visibility, friendship, canRequest: friendship.state === 'none' && info.canRequest, visible, ...(visible ? { profile: details(u) } : {}) });
      }
      if (p === '/messages/conversations' && method === 'POST') return json({ id: 7, with: { username: request.postDataJSON().username, name: 'x' } }, 201);
      return json({});
    });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const push = (type, data) => page.evaluate(([t, d]) => window.__push(t, d), [type, data]);
    const toast = text => page.getByRole('status').filter({ hasText: text });
    const noOverflow = async what => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow: ' + what);

    // ---- Friends page, empty, live
    await page.goto(base + '/friends'); await page.getByRole('heading', { name: 'Friends', exact: true }).waitFor();
    await page.getByText('Live: requests appear as they arrive').waitFor();
    assert.match(await page.evaluate(() => window.__lastAuth), /^Bearer test\./, 'the token goes in the Authorization header');
    await page.getByText('No friends yet.').waitFor();
    // Send requests: success, unknown, not accepting.
    const field = page.getByLabel('Add a friend');
    await field.fill('@mika'); await page.getByRole('button', { name: 'Send request' }).click();
    await page.getByText('Friend request sent to @mika.').waitFor();
    await page.getByRole('heading', { name: 'Sent requests' }).waitFor(); await page.getByRole('button', { name: 'Cancel friend request to mika' }).waitFor();
    assert.equal(await field.inputValue(), '');
    await field.fill('ghost'); await page.getByRole('button', { name: 'Send request' }).click(); await page.getByRole('alert').getByText('No learner has that username.').waitFor();
    await field.fill('yuki'); await page.getByRole('button', { name: 'Send request' }).click(); await page.getByRole('alert').getByText("@yuki isn't accepting friend requests.").waitFor();

    // ---- A request arrives live: toast, list and badge update without reloading.
    const loadsBefore = friendLoads;
    state.incoming.push({ id: 3, username: 'ren' });
    await push('friends', { type: 'friends', reason: 'request', person: { username: 'ren', displayName: 'Ren' } });
    await toast('Ren (@ren) sent you a friend request.').waitFor();
    await page.getByRole('heading', { name: /Friend requests/ }).waitFor(); assert.ok(friendLoads > loadsBefore, 'the list reloaded from the live event');
    await page.getByRole('banner').getByRole('button', { name: 'Friends, 1 friend requests' }).waitFor();
    await page.screenshot({ path: shots + '/friends-request.png' });
    await page.getByRole('button', { name: 'Accept friend request from ren' }).click();
    await page.getByText('You and @ren are now friends.').waitFor();
    const renRow = page.locator('li', { hasText: '@ren' }); await renRow.getByText('Level 3').waitFor(); await renRow.getByText('studied today').waitFor();
    assert.equal(await page.getByRole('heading', { name: /Friend requests/ }).count(), 0);
    await page.getByRole('button', { name: 'Toggle navigation sidebar', exact: true }).waitFor();
    await page.getByRole('banner').getByRole('button', { name: 'Friends', exact: true }).waitFor(); // badge cleared

    // ---- Accepted live: toast links to the profile.
    state.outgoing = []; state.friends.push('mika');
    await push('friends', { type: 'friends', reason: 'accepted', person: { username: 'mika', displayName: 'Mika' } });
    await toast('Mika (@mika) accepted your friend request.').waitFor();
    await page.getByRole('link', { name: 'View profile →' }).click(); await page.waitForURL('**/u/mika');

    // ---- Public profile of a friend (friends-only profile is visible to friends)
    await page.getByRole('heading', { name: 'Mika', exact: true }).waitFor();
    await page.getByText('@mika · Joined March 2026').waitFor(); await page.getByText('✓ Friends').waitFor();
    for (const text of ['Mika studies every morning.', 'Level 3', '300 XP · Beginner', '4 days · best 9', 'N5 · Unit 2 passed', 'First steps', '14 lessons completed · 2 unit tests passed · latest: Numbers & Time']) await page.getByText(text).first().waitFor();
    await page.screenshot({ path: shots + '/profile-friend.png', fullPage: true });
    await page.getByRole('button', { name: 'Remove friend' }).click(); await page.getByText('Remove @mika as a friend?').waitFor();
    await page.getByRole('button', { name: 'Remove', exact: true }).click(); await page.getByText('@mika is no longer your friend.').waitFor();
    await page.getByRole('button', { name: 'Add friend' }).waitFor(); await page.getByText('Only @mika\'s friends can see their progress').waitFor();
    // A live change by the other learner refreshes the profile.
    state.incoming.push({ id: 4, username: 'mika' });
    await push('friends', { type: 'friends', reason: 'request', person: { username: 'mika', displayName: 'Mika' } });
    await page.getByRole('button', { name: 'Accept request' }).waitFor();
    await page.getByRole('button', { name: 'Accept request' }).click(); await page.getByText('✓ Friends').waitFor(); await page.getByText('Mika studies every morning.').waitFor();

    // ---- Private profile, request and cancel
    await page.goto(base + '/u/sora'); await page.getByText('@sora keeps their progress private').waitFor();
    assert.equal(await page.getByText('Level 3').count(), 0, 'no progress on a private profile');
    await page.getByRole('button', { name: 'Add friend' }).click(); await page.getByText('Request sent', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Cancel request' }).click(); await page.getByRole('button', { name: 'Add friend' }).waitFor();
    // Not found, own profile, someone not accepting requests
    await page.goto(base + '/u/ghost'); await page.getByRole('heading', { name: 'Learner not found' }).waitFor();
    await page.goto(base + '/u/yuki'); await page.getByText('Not accepting friend requests').waitFor();
    await page.goto(base + '/u/kai'); await page.getByText('This is how other learners see your profile.').waitFor(); await page.getByRole('link', { name: 'Edit profile & privacy' }).waitFor();
    // Profile to profile: the new learner is shown, never the old one.
    await page.goto(base + '/u/ren'); await page.getByRole('heading', { name: 'Ren', exact: true }).waitFor();
    await page.evaluate(() => { history.pushState({}, '', '/u/sora'); dispatchEvent(new PopStateEvent('popstate')); });
    await page.getByRole('heading', { name: 'Sora', exact: true }).waitFor(); assert.equal(await page.getByRole('heading', { name: 'Ren', exact: true }).count(), 0);

    // ---- Message and remove from the Friends page
    await page.goto(base + '/friends'); await page.getByRole('button', { name: 'Message ren' }).click(); await page.waitForURL('**/messages/7');
    assert.ok(writes.some(w => w.p === '/messages/conversations' && w.body.username === 'ren'));
    await page.goto(base + '/friends'); await page.getByRole('button', { name: 'Remove ren' }).click(); await page.getByText('Remove @ren?').waitFor();
    await page.getByRole('button', { name: 'Keep' }).click(); await page.getByRole('button', { name: 'Remove ren' }).click();
    await page.getByRole('button', { name: 'Remove', exact: true }).click(); await page.getByText('@ren is no longer your friend.').waitFor();
    assert.equal(await page.locator('li', { hasText: '@ren' }).count(), 0);

    // ---- Reconnecting: shows the fallback, then reloads what may have been missed.
    const loads = friendLoads, connections = await page.evaluate(() => window.__connections);
    await page.evaluate(() => window.__drop()); await page.getByText('Updates every minute').waitFor();
    await page.getByText('Live: requests appear as they arrive').waitFor({ timeout: 10000 });
    assert.ok(await page.evaluate(() => window.__connections) > connections, 'reconnected'); await page.waitForTimeout(200); assert.ok(friendLoads > loads, 'resynced after reconnecting');

    // ---- Privacy settings
    await page.goto(base + '/profile?tab=settings'); await page.getByRole('group', { name: 'Who can see your progress' }).waitFor();
    assert.equal(await page.getByRole('radio', { name: /Only me/ }).isChecked(), true);
    await page.getByRole('radio', { name: /Friends/ }).check(); await page.getByLabel(/Allow friend requests/).uncheck(); await page.getByLabel('Native language').fill('Vietnamese');
    await page.getByRole('button', { name: 'Save changes' }).click(); await page.getByText('Settings saved.').waitFor();
    const saved = writes.filter(w => w.p === '/profile/me').at(-1).body;
    assert.deepEqual([saved.profileVisibility, saved.friendRequests, saved.nativeLanguage], ['friends', 'nobody', 'Vietnamese']);
    await page.getByRole('button', { name: 'Profile', exact: true }).click(); await page.getByText('Progress visible to: your friends').waitFor();
    await page.getByRole('link', { name: 'See your public profile →' }).click(); await page.waitForURL('**/u/kai');
    await page.getByText('Your friends can see your progress, bio and achievements.').waitFor();

    // ---- Username: stored for older sessions, shown in the account menu and on Friends with Copy.
    assert.equal(await page.evaluate(() => localStorage.getItem('user_handle')), 'kai', 'the username was looked up once and stored');
    await page.goto(base + '/friends'); await page.getByText('Your username:').waitFor(); await page.getByText('@kai', { exact: true }).first().waitFor();
    await page.getByRole('button', { name: 'Copy', exact: true }).click(); await page.getByRole('button', { name: 'Copied', exact: true }).waitFor();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '@kai');
    await page.getByRole('button', { name: 'Open account details' }).click(); await page.getByText('Friends add you with your username').waitFor();
    await page.getByRole('button', { name: 'Open account details' }).click();

    // ---- Notification bell: red count of everything waiting, and a panel to act on it.
    const bell = page.getByRole('button', { name: /^Notifications/ });
    assert.equal(await bell.getAttribute('aria-label'), 'Notifications', 'nothing waiting');
    await bell.click(); const panel = page.getByRole('dialog', { name: 'Notifications' }); await panel.getByText("You're all caught up.").waitFor();
    await page.keyboard.press('Escape'); await panel.waitFor({ state: 'hidden' }); assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Notifications', 'focus returns to the bell');
    state.incoming.push({ id: 8, username: 'sora' }); state.direct = 2;
    state.notes.push({ id: 1, kind: 'friend_request', createdAt: new Date().toISOString(), read: false, actor: { username: 'sora', displayName: 'Sora' }, data: {} });
    await push('friends', { type: 'friends', reason: 'request', person: { username: 'sora', displayName: 'Sora' } });
    await push('notifications', { type: 'notifications' });
    await page.getByRole('button', { name: 'Notifications, 3 new' }).waitFor();
    const badge = bell.locator('span[aria-hidden="true"]').last(); assert.equal(await badge.innerText(), '3');
    // Read the colour through a canvas so any CSS colour format (oklch here) comes back as RGB.
    const [r, g, b] = await badge.evaluate(el => { const c = document.createElement('canvas').getContext('2d'); c.fillStyle = getComputedStyle(el).backgroundColor; c.fillRect(0, 0, 1, 1); return [...c.getImageData(0, 0, 1, 1).data].slice(0, 3); });
    assert.ok(r > 150 && g < 90 && b < 90, 'the count is red: ' + [r, g, b]);
    await page.screenshot({ path: shots + '/bell-badge.png', clip: { x: 700, y: 0, width: 666, height: 80 } });
    await bell.click(); await panel.getByText('1 friend request waiting').waitFor(); await panel.getByText('2 conversations with unread messages').waitFor();
    await panel.getByText('Sora (@sora) sent you a friend request.').waitFor(); await panel.getByText('New', { exact: true }).waitFor();
    await page.screenshot({ path: shots + '/bell-panel.png' });
    await panel.getByRole('button', { name: 'Accept friend request from sora' }).click();
    await page.getByRole('button', { name: 'Notifications, 2 new' }).waitFor(); await panel.getByRole('region', { name: 'Friend requests' }).waitFor({ state: 'detached' }); // answered requests leave the panel
    assert.ok(writes.some(w => w.p === '/notifications/read'), 'opening the panel marks notifications read');
    assert.ok(writes.some(w => w.p === '/friends/requests/8' && w.body.accept === true));
    await page.mouse.click(5, 400); await panel.waitFor({ state: 'hidden' }, 'outside click closes');
    await bell.click(); await panel.getByRole('link', { name: /2 conversations/ }).click(); await page.waitForURL('**/messages');
    state.direct = 0; state.friends = state.friends.filter(u => u !== 'sora');

    // ---- Phones and dark mode
    await page.setViewportSize({ width: 375, height: 812 });
    state.incoming.push({ id: 5, username: 'sora' }); state.friends.push('ren', 'mika');
    await page.goto(base + '/friends'); await page.getByRole('heading', { name: /Friend requests/ }).waitFor(); await noOverflow('friends');
    await bell.click(); await panel.getByRole('button', { name: 'Accept friend request from sora' }).waitFor(); await noOverflow('bell panel');
    const box = await panel.boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 375, 'panel fits the phone screen');
    await page.screenshot({ path: shots + '/bell-mobile.png' }); await page.keyboard.press('Escape');
    await push('friends', { type: 'friends', reason: 'request', person: { username: 'sora', displayName: 'Sora' } }); await toast('Sora (@sora)').waitFor(); await noOverflow('toast');
    await page.screenshot({ path: shots + '/friends-mobile.png', fullPage: true });
    await page.goto(base + '/u/mika'); await page.getByText('Mika studies every morning.').waitFor(); await noOverflow('profile');
    await page.evaluate(() => localStorage.setItem('theme', 'dark')); await page.reload(); await page.getByText('Mika studies every morning.').waitFor();
    await page.screenshot({ path: shots + '/profile-dark-mobile.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS: bell shows a red count of friend requests + unread messages + support replies, opens a panel (accept inline, links, all caught up, Escape/outside click close, fits phones); unique username stored for old sessions, shown in the account menu and on Friends with Copy; Friends page with live status and the token in the Authorization header; send (success, unknown, not accepting); a live request shows a toast, reloads the list and badges the menu; accept shows level/streak/studied today; live "accepted" toast links to the profile; friend profile with bio, level, streaks, course, achievements; remove with confirmation; live changes refresh an open profile; private profile hides progress; request + cancel; not found; own profile preview; profile-to-profile navigation; message a friend; remove from the list with Keep/Remove; dropped stream falls back and resyncs on reconnect; privacy settings saved (friends only, no requests, native language) and shown; no overflow on phones; dark mode; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
