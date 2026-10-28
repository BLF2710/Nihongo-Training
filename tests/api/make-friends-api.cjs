// Builds friends-api.cjs: the review-api harness plus friends, public profiles and live events.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Friends, public profiles and live updates")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    `await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    for (const file of ['012_learning_streaks.sql', '014_friends_public_profiles.sql', '016_notifications.sql']) {
      const sql = fs.readFileSync(path.join(API, 'migrations', file), 'utf8').replaceAll('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS');
      await client.query(sql);
    }
    assert.equal((await client.query("SELECT n.nspname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'friendships' ORDER BY n.nspname LIMIT 1")).rows[0].nspname.startsWith('pg_temp'), true, 'friendships is a temp table');`)
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default); app.use('/api', src('routes/communication.routes.ts').default); app.use('/api', src('routes/friend.routes.ts').default);")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat', 'dan']) {");
for (const needle of ['setInterval, clearInterval', '014_friends_public_profiles', 'friend.routes', "'ben', 'cat', 'dan'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const user = name => name + '_x1'; const ana = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [user(name)])).rows[0].id;
    const profile = (name, as = 'learner') => call('GET', '/people/' + user(name), { as });
    const friends = as => call('GET', '/friends', { as }).then(r => r.data);
    const request = (to, as) => call('POST', '/friends/requests', { as, body: { username: user(to) } });
    const settings = async (as, change) => {
      const p = (await call('GET', '/profile/me', { as })).data;
      return call('PUT', '/profile/me', { as, body: { displayName: p.display_name, avatar: '', bio: change.bio ?? p.bio, learningLanguage: p.learning_language, learningGoal: p.learning_goal ?? '', dailyGoal: p.daily_goal, nativeLanguage: '', profileVisibility: change.visibility ?? p.profile_visibility, ...(change.friendRequests ? { friendRequests: change.friendRequests } : {}) } });
    };
    // Live event streams, read the way the browser reads them.
    const streams = [];
    const listen = async as => {
      const controller = new AbortController(); const events = [];
      const res = await fetch(base + '/events', { headers: { Authorization: 'Bearer ' + tokens[as] }, signal: controller.signal });
      assert.equal(res.status, 200); assert.match(res.headers.get('content-type'), /text\/event-stream/);
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
      (async () => { try { for (;;) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true });
        let end; while ((end = buffer.indexOf('\n\n')) >= 0) { const block = buffer.slice(0, end); buffer = buffer.slice(end + 2);
          const type = /^event: (.+)$/m.exec(block)?.[1]; const data = /^data: (.+)$/m.exec(block)?.[1]; if (type) events.push({ type, ...(data ? JSON.parse(data) : {}) }); } } } catch { /* closed */ } })();
      const stream = { events, close: () => controller.abort() }; streams.push(stream);
      for (let i = 0; i < 50 && !events.length; i++) await new Promise(r => setTimeout(r, 20));
      assert.equal(events[0]?.type, 'ready'); return stream;
    };
    const until = async (stream, test, what) => { for (let i = 0; i < 100; i++) { const found = stream.events.find(test); if (found) return found; await new Promise(r => setTimeout(r, 20)); } throw new Error('no live event: ' + what + ' ' + JSON.stringify(stream.events)); };
    const settle = () => new Promise(r => setTimeout(r, 150));
    try {
      // ---- access
      for (const url of ['/friends', '/people/' + user('ben'), '/events']) assert.equal((await call('GET', url)).status, 401, url);
      assert.equal((await call('GET', '/friends', { as: 'admin' })).status, 403, 'admins have no friend list');
      assert.equal((await profile('admin')).status, 404, 'administrators have no public profile');
      assert.equal((await call('GET', '/people/nobody_here', { as: ana })).status, 404); assert.equal((await call('GET', '/people/a', { as: ana })).status, 400);
      const { contentKeysForPath } = src('middleware/content-availability.middleware.ts');
      assert.equal(JSON.stringify([contentKeysForPath('/friends'), contentKeysForPath('/friends/requests/3'), contentKeysForPath('/people/ben'), contentKeysForPath('/events')]), JSON.stringify([['friends'], ['friends'], ['friends'], []]));

      // ---- profiles and visibility (default private)
      let view = (await profile('learner', 'ben')).data;
      assert.deepEqual([view.visible, view.visibility, view.friendship.state, view.canRequest, 'profile' in view], [false, 'private', 'none', true, false]);
      assert.equal((await profile('learner', ana)).data.friendship.state, 'self'); assert.equal((await profile('learner', ana)).data.visible, true, 'you always see your own profile');
      assert.equal((await settings(ana, { visibility: 'everyone' })).status, 400);
      assert.equal((await settings(ana, { visibility: 'public', bio: 'Studying for N5.' })).status, 200);
      await client.query("UPDATE user_gamification SET xp = 260, current_streak = 3, longest_streak = 5, last_activity_at = NOW() WHERE user_id = $1", [await uid('learner')]);
      const { UNITS } = src('data/units.ts');
      await client.query("INSERT INTO user_assessment_progress (user_id, assessment_id, best_score, last_score, passed_at) VALUES ($1, $2, 90, 90, NOW()), ($1, $3, 85, 85, NOW())", [await uid('learner'), UNITS[0].assessmentId, UNITS[1].assessmentId]);
      view = (await profile('learner', 'ben')).data;
      assert.equal(view.visible, true); assert.equal(view.profile.bio, 'Studying for N5.');
      assert.deepEqual([view.profile.level, view.profile.currentStreak, view.profile.longestStreak, view.profile.unitsPassed, view.profile.latestUnit.number, view.profile.latestUnit.level, view.profile.friends], [3, 3, 5, 2, 2, 'N5', 0]);
      for (const secret of ['email', 'time_zone', 'password', 'id', 'daily_goal']) assert.ok(!(secret in view) && !(secret in view.profile), 'profile leaks ' + secret);
      assert.equal((await settings('cat', { visibility: 'friends' })).status, 200);
      assert.equal((await profile('cat', 'ben')).data.visible, false, 'friends-only profile hidden from a stranger');

      // ---- requests in real time
      const benLive = await listen('ben'), anaLive = await listen(ana), anaSecondTab = await listen(ana);
      const sent = await request('ben', ana); assert.equal(sent.status, 201); assert.equal(sent.data.state, 'outgoing');
      const got = await until(benLive, e => e.type === 'friends' && e.reason === 'request', 'request reaches ben');
      assert.deepEqual(got.person, { username: user('learner'), displayName: user('learner') });
      await until(anaSecondTab, e => e.type === 'friends' && e.reason === 'updated', "the sender's other tab refreshes");
      assert.equal((await request('ben', ana)).data.requestId, sent.data.requestId, 'sending twice changes nothing');
      assert.equal((await call('GET', '/inbox', { as: 'ben' })).data.friendRequests, 1);
      let benList = await friends('ben'); assert.equal(benList.incoming.length, 1); assert.equal(benList.incoming[0].username, user('learner'));
      assert.equal((await friends(ana)).outgoing.length, 1);
      assert.deepEqual([(await profile('ben', ana)).data.friendship.state, (await profile('learner', 'ben')).data.friendship.state], ['outgoing', 'incoming']);
      assert.equal((await call('PUT', '/friends/requests/' + sent.data.requestId, { as: ana, body: { accept: true } })).status, 404, "the sender can't accept their own request");
      assert.equal((await call('DELETE', '/friends/requests/' + sent.data.requestId, { as: 'ben' })).status, 404, "the receiver can't cancel it");
      // Asking back accepts.
      const back = await request('learner', 'ben'); assert.deepEqual([back.status, back.data.state], [201, 'friends']);
      const accepted = await until(anaLive, e => e.type === 'friends' && e.reason === 'accepted', 'accepted reaches ana'); assert.equal(accepted.person.username, user('ben'));
      assert.equal((await call('GET', '/inbox', { as: 'ben' })).data.friendRequests, 0);
      // Accept and decline through the request.
      const fromCat = await request('ben', 'cat'); const fromDan = await request('ben', 'dan');
      assert.equal((await call('PUT', '/friends/requests/' + fromCat.data.requestId, { as: 'ben', body: { accept: 'yes' } })).status, 400);
      const catLive = await listen('cat'), danLive = await listen('dan');
      assert.deepEqual((await call('PUT', '/friends/requests/' + fromCat.data.requestId, { as: 'ben', body: { accept: true } })).data.state, 'friends');
      await until(catLive, e => e.reason === 'accepted', 'cat hears accepted');
      assert.equal((await call('PUT', '/friends/requests/' + fromDan.data.requestId, { as: 'ben', body: { accept: false } })).data.state, 'none');
      const danEvent = await until(danLive, e => e.type === 'friends', 'dan list refresh'); assert.equal(danEvent.reason, 'updated', 'a decline is not announced'); assert.ok(!danEvent.person);
      assert.equal((await friends('dan')).outgoing.length, 0);
      const again = await request('ben', 'dan'); assert.equal(again.status, 429, 'cool-down after a decline'); assert.match(again.data.message, /tomorrow/);
      await client.query("UPDATE friendships SET responded_at = NOW() - INTERVAL '2 days' WHERE id = $1", [fromDan.data.requestId]);
      assert.equal((await request('ben', 'dan')).data.state, 'outgoing', 'after the cool-down the request can be sent again');
      assert.equal((await call('DELETE', '/friends/requests/' + fromDan.data.requestId, { as: 'dan' })).status, 200, 'the sender cancels');
      await settle(); assert.equal((await friends('ben')).incoming.length, 0);
      // ---- Notification history from the requests so far.
      // Making friends checks achievements (and maybe a level); those notices are left out until the achievement checks below.
      let hideAchievementNotices = true;
      const notes = async (as, query = '') => { if (hideAchievementNotices) await client.query("DELETE FROM notifications WHERE kind IN ('achievement', 'level_up')"); return (await call('GET', '/notifications' + query, { as })).data; };
      let benNotes = await notes('ben');
      assert.deepEqual(benNotes.notifications.map(n => [n.kind, n.actor.username, n.read]), [['friend_request', user('cat'), true], ['friend_request', user('learner'), true]], 'answered requests are read; a cancelled request leaves no trace');
      assert.equal(benNotes.unread, 0);
      let anaNotes = await notes(ana); assert.deepEqual(anaNotes.notifications.map(n => [n.kind, n.actor.username, n.read]), [['friend_accepted', user('ben'), false]]);
      assert.equal((await call('GET', '/inbox', { as: ana })).data.notifications, 1);
      await until(anaLive, e => e.type === 'notifications', 'ana hears about the notification');
      assert.equal((await notes('cat')).notifications[0].kind, 'friend_accepted'); assert.equal((await notes('dan')).notifications.length, 0, 'a decline sends nothing');
      // Support replies and achievements.
      const supportId = (await call('POST', '/support', { as: ana, body: { subject: 'Audio does not play', body: 'Unit 3 listening is silent.' } })).data.id;
      assert.equal((await call('POST', '/admin/support/' + supportId + '/messages', { as: 'admin', body: { body: 'Fixed, thanks!' } })).status, 201);
      const { UNITS: units } = src('data/units.ts');
      await client.query('INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [await uid('learner'), units[0].lessonIds[0]]);
      const earned = await src('services/achievement.service.ts').evaluateAchievements(await uid('learner'));
      assert.ok(earned.includes('first_steps'), 'earned ' + JSON.stringify(earned));
      hideAchievementNotices = false;
      anaNotes = await notes(ana);
      assert.equal(anaNotes.notifications.filter(n => n.kind === 'achievement').length, earned.length, 'one notification per achievement'); assert.ok(anaNotes.notifications.some(n => n.kind === 'support_reply'));
      const reply = anaNotes.notifications.find(n => n.kind === 'support_reply');
      assert.deepEqual([reply.actor, reply.data.conversationId, reply.data.subject], [null, supportId, 'Audio does not play'], 'support replies name no administrator');
      assert.ok(anaNotes.notifications.some(n => n.kind === 'achievement' && n.data.title));
      const total = anaNotes.notifications.length; assert.ok(total >= 3 && anaNotes.unread === total, 'all unread: ' + total + '/' + anaNotes.unread);
      // Paging and read state.
      const first = await notes(ana, '?limit=2'); assert.equal(first.notifications.length, 2); assert.equal(first.hasMore, true);
      const rest = await notes(ana, '?before=' + first.notifications[1].id); assert.equal(rest.notifications.length, total - 2); assert.equal(rest.hasMore, false);
      for (const bad of ['?limit=0', '?limit=500', '?before=x']) assert.equal((await call('GET', '/notifications' + bad, { as: ana })).status, 400, bad);
      assert.equal((await call('POST', '/notifications/read', { as: ana, body: { ids: 'all' } })).status, 400);
      assert.equal((await call('POST', '/notifications/read', { as: 'ben', body: { ids: [first.notifications[0].id] } })).data.unread, 0, 'another learner ids change nothing');
      assert.equal((await notes(ana)).unread, total, 'ben could not mark the notifications of ana');
      assert.equal((await call('POST', '/notifications/read', { as: ana, body: { ids: [first.notifications[0].id] } })).data.unread, total - 1);
      assert.equal((await call('POST', '/notifications/read', { as: ana, body: {} })).data.unread, 0);
      assert.equal((await call('GET', '/notifications')).status, 401);

      // ---- Leaderboard: last 7 days of XP and lessons, current streak; private friends only counted.
      await client.query("INSERT INTO xp_events (user_id, amount, source, reference_id, created_at) VALUES ($1, 40, 'lesson', 'lb-1', NOW() - INTERVAL '1 day'), ($1, 500, 'lesson', 'lb-old', NOW() - INTERVAL '10 days'), ($2, 15, 'lesson', 'lb-2', NOW())", [await uid('learner'), await uid('ben')]);
      await settings('cat', { visibility: 'private' });
      const board = (await call('GET', '/friends/leaderboard', { as: 'ben' })).data;
      assert.equal(board.hidden, 1, 'cat keeps progress private');
      assert.deepEqual(board.entries.map(e => e.username).sort(), [user('ben'), user('learner')].sort());
      const anaEntry = board.entries.find(e => e.username === user('learner')), benEntry = board.entries.find(e => e.self);
      assert.equal(benEntry.username, user('ben'));
      assert.ok(anaEntry.weeklyXp >= 40 && anaEntry.weeklyXp < 500, 'older XP is not counted: ' + anaEntry.weeklyXp);
      assert.equal(anaEntry.weeklyLessons, 1); assert.equal(anaEntry.currentStreak, 3); const benAchievementXp = Number((await client.query("SELECT COALESCE(SUM(amount), 0) AS xp FROM xp_events WHERE user_id = $1 AND source = 'achievement'", [await uid('ben')])).rows[0].xp);
      assert.ok(benAchievementXp > 0, 'making friends earned an achievement'); assert.equal(benEntry.weeklyXp, 15 + benAchievementXp);
      assert.ok(!('email' in anaEntry) && !('id' in anaEntry));
      await settings('ben', { visibility: 'private' });
      assert.ok((await call('GET', '/friends/leaderboard', { as: 'ben' })).data.entries.some(e => e.self), 'you always see yourself');
      assert.equal((await call('GET', '/friends/leaderboard', { as: ana })).data.hidden, 1, 'a private profile hides ben from the board of ana');
      await settings('ben', { visibility: 'public' }); await settings('cat', { visibility: 'friends' });
      assert.equal((await call('GET', '/friends/leaderboard', { as: 'admin' })).status, 403);
      const { contentKeysForPath: keysFor } = src('middleware/content-availability.middleware.ts');
      assert.equal(JSON.stringify(keysFor('/friends/leaderboard')), JSON.stringify(['friends']));

      // Friend list with privacy: cat (friends-only) shows progress to friends, a private friend does not.
      benList = await friends('ben');
      assert.deepEqual(benList.friends.map(f => f.username).sort(), [user('cat'), user('learner')].sort());
      assert.deepEqual(benList.friends.find(f => f.username === user('learner')).progress, { level: 3, currentStreak: 3, activeToday: true, friendStreak: 0, studyingNow: false });
      assert.equal((await profile('cat', 'ben')).data.visible, true, 'friends-only profile visible to a friend');
      assert.equal((await settings('cat', { visibility: 'private' })).status, 200);
      assert.equal((await friends('ben')).friends.find(f => f.username === user('cat')).progress, null, "a private friend's progress stays hidden");
      assert.equal((await profile('cat', 'ben')).data.visible, false, 'private means only the owner');
      assert.equal((await profile('learner', 'cat')).data.profile.friends, 1, 'public profile counts friends');
      // Remove a friend.
      assert.equal((await call('DELETE', '/friends/' + user('cat'), { as: 'ben' })).status, 200);
      await until(catLive, e => e.reason === 'updated', 'cat hears removal');
      assert.equal((await friends('cat')).friends.length, 0); assert.equal((await call('DELETE', '/friends/' + user('cat'), { as: 'ben' })).status, 404);
      // Not accepting requests; the setting survives a save that leaves it out.
      assert.equal((await settings('dan', { friendRequests: 'nobody' })).status, 200);
      assert.equal((await settings('dan', { bio: 'hi' })).status, 200);
      assert.equal((await call('GET', '/profile/me', { as: 'dan' })).data.friend_requests, 'nobody');
      assert.equal((await profile('dan', ana)).data.canRequest, false); assert.equal((await request('dan', ana)).status, 403);
      assert.equal((await request('learner', 'learner')).status, 400); assert.equal((await call('POST', '/friends/requests', { as: ana, body: { username: 'x y' } })).status, 400);
      // A direct message is announced live; blocking ends the friendship and hides both profiles.
      const conversation = (await call('POST', '/messages/conversations', { as: ana, body: { username: user('ben') } })).data.id;
      assert.equal((await call('POST', '/messages/conversations/' + conversation + '/messages', { as: ana, body: { body: 'こんにちは' } })).status, 201);
      await until(benLive, e => e.type === 'inbox', 'new message reaches ben');
      assert.equal((await call('PUT', '/messages/conversations/' + conversation + '/block', { as: 'ben', body: { blocked: true } })).status, 200);
      await until(anaLive, e => e.type === 'friends' && e.reason === 'updated' && anaLive.events.indexOf(e) > anaLive.events.indexOf(accepted), 'ana hears the friendship end');
      assert.equal((await friends(ana)).friends.length, 0);
      assert.equal((await profile('ben', ana)).status, 404); assert.equal((await profile('learner', 'ben')).status, 404); assert.equal((await request('ben', ana)).status, 404);
      // Rate limit: 20 requests an hour.
      const cat = await uid('cat');
      await client.query("INSERT INTO users (username, email, password) SELECT 'bulk_' || g, 'bulk' || g || '@example.com', 'x' FROM generate_series(1, 20) g");
      await client.query("INSERT INTO friendships (requester_id, addressee_id, status) SELECT $1, id, 'pending' FROM users WHERE username LIKE 'bulk_%'", [cat]);
      const limited = await request('learner', 'cat'); assert.equal(limited.status, 429); assert.match(limited.data.message, /hour/);
      console.log('PASS: notifications for requests, accepts, support replies (no admin named) and achievements, live, read when answered, removed when a request is cancelled, paged, marked read by id or all (own only); leaderboard of 7-day XP/lessons and streak with private friends counted not shown, yourself always shown; sign-in required (also for /events), admins excluded; profiles private by default, public shows level/streaks/units passed/achievements/friend count without private fields, friends-only for friends, private for the owner only; live events: request, accepted, silent decline and removal reach the other learner, other tabs refresh; duplicate request harmless; asking back accepts; only the receiver answers and only the sender cancels; 24-hour cool-down after a decline; private friends hide progress; "nobody" setting refuses requests and survives older saves; new direct messages announced live; blocking ends the friendship and hides both profiles; 20 requests an hour. Rolled back.');
    } finally { for (const s of streams) s.close(); }
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'friends-api.cjs'), head + tail);
console.log('written');
