// Builds social-api.cjs: the review-api harness plus blocking and reporting from a profile, the blocked list,
// friend suggestions, the activity feed, cheers, nudges, friend streaks, "studying now" and friend challenges.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Friends, part two")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default); app.use('/api', src('routes/communication.routes.ts').default); app.use('/api', src('routes/friend.routes.ts').default);")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat', 'dan', 'eve', 'fay']) {");
for (const needle of ['setInterval, clearInterval', 'friend.routes', "'eve', 'fay'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const user = name => name + '_x1'; const ana = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [user(name)])).rows[0].id;
    const friends = as => call('GET', '/friends', { as }).then(r => r.data);
    const befriend = async (a, b) => {
      assert.equal((await call('POST', '/friends/requests', { as: a, body: { username: user(b) } })).status, 201);
      assert.equal((await call('POST', '/friends/requests', { as: b, body: { username: user(a) } })).status, 201, 'answering with a request accepts it');
    };
    const settings = async (as, change) => {
      const p = (await call('GET', '/profile/me', { as })).data;
      const r = await call('PUT', '/profile/me', { as, body: { displayName: p.display_name, avatar: '', bio: p.bio, learningLanguage: p.learning_language, learningGoal: p.learning_goal ?? '', dailyGoal: p.daily_goal, nativeLanguage: '', profileVisibility: change.visibility ?? p.profile_visibility, ...(change.friendRequests ? { friendRequests: change.friendRequests } : {}) } });
      assert.equal(r.status, 200, JSON.stringify(r.data));
    };
    const social = (as, body) => call('PUT', '/profile/me/social', { as, body });
    const challenges = as => call('GET', '/friends/challenges', { as }).then(r => r.data.challenges);
    const notes = async (name, kind) => (await client.query('SELECT data FROM notifications WHERE user_id = $1 AND kind = $2 ORDER BY id', [await uid(name), kind])).rows.map(r => r.data);

    // ---- block and report from a profile; the blocked list
    await befriend(ana, 'ben');
    assert.equal((await call('POST', '/friends/challenges', { as: ana, body: { username: user('ben'), metric: 'xp', days: 3 } })).status, 201);
    assert.equal((await call('PUT', '/people/' + user(ana) + '/block', { as: ana })).status, 400, 'no blocking yourself');
    assert.equal((await call('PUT', '/people/' + user('ben') + '/block', { as: ana })).status, 200);
    assert.equal((await friends(ana)).friends.length, 0, 'blocking ends the friendship');
    assert.equal((await challenges(ana)).length, 0, 'and the open challenge');
    assert.equal((await call('GET', '/people/' + user(ana), { as: 'ben' })).status, 404, 'the blocked learner cannot find the blocker');
    assert.equal((await call('POST', '/friends/requests', { as: 'ben', body: { username: user(ana) } })).status, 404);
    const blocked = (await call('GET', '/blocks', { as: ana })).data.blocked;
    assert.deepEqual(blocked.map(b => b.username), [user('ben')]);
    assert.equal((await call('DELETE', '/blocks/' + user('cat'), { as: ana })).status, 404, 'only learners on the list can be unblocked');
    assert.equal((await call('DELETE', '/blocks/' + user('ben'), { as: ana })).status, 200);
    assert.equal((await call('GET', '/blocks', { as: ana })).data.blocked.length, 0);
    assert.equal((await call('GET', '/people/' + user(ana), { as: 'ben' })).status, 200, 'unblocked: visible again');
    assert.equal((await call('POST', '/people/' + user('cat') + '/report', { as: ana, body: { reason: '  ' } })).status, 400, 'a report needs a reason');
    const report = await call('POST', '/people/' + user('cat') + '/report', { as: ana, body: { reason: 'Rude bio' } });
    assert.equal(report.status, 201);
    const ticket = (await client.query('SELECT c.kind, c.subject, m.body FROM conversations c JOIN messages m ON m.conversation_id = c.id WHERE c.id = $1', [report.data.supportConversationId])).rows[0];
    assert.equal(ticket.kind, 'support'); assert.equal(ticket.subject, 'Report: learner @' + user('cat')); assert.match(ticket.body, /Rude bio/);

    // ---- opt-in settings
    assert.deepEqual((await call('GET', '/profile/me/social', { as: ana })).data, { suggestMe: false, shareActivity: true, showStudyingNow: false });
    assert.equal((await social(ana, { suggestMe: 'yes' })).status, 400);
    assert.deepEqual((await social(ana, { showStudyingNow: true })).data, { suggestMe: false, shareActivity: true, showStudyingNow: true }, 'fields left out are kept');

    // ---- friend suggestions: only for learners who opted in, only showing others who opted in
    await befriend(ana, 'cat'); await befriend('cat', 'dan');
    assert.deepEqual((await call('GET', '/friends/suggestions', { as: ana })).data, { enabled: false, suggestions: [] });
    for (const name of [ana, 'dan', 'eve', 'fay', 'ben']) await social(name, { suggestMe: true });
    await settings('fay', { friendRequests: 'nobody' });
    for (const name of [ana, 'eve', 'fay']) await client.query("INSERT INTO lesson_progress (user_id, lesson_id, completed_at) VALUES ($1, 'japanese-n4-unit-1-test', NOW())", [await uid(name)]);
    await call('PUT', '/people/' + user('ben') + '/block', { as: ana });
    const suggested = (await call('GET', '/friends/suggestions', { as: ana })).data;
    assert.equal(suggested.enabled, true);
    assert.deepEqual(suggested.suggestions.map(s => [s.username, s.mutualFriends, s.sameLevel]), [[user('dan'), 1, null], [user('eve'), 0, 'N4']],
      'a friend of a friend, then the same level; not friends already (cat), not closed to requests (fay), not blocked (ben)');
    await call('DELETE', '/blocks/' + user('ben'), { as: ana });

    // ---- the activity feed and cheers
    const cat = await uid('cat');
    await settings('cat', { visibility: 'friends' });
    await client.query("INSERT INTO lesson_progress (user_id, lesson_id, completed_at) VALUES ($1, 'japanese-n5-unit-1-a', NOW() - INTERVAL '1 hour'), ($1, 'japanese-n5-unit-1-b', NOW() - INTERVAL '50 minutes')", [cat]);
    const assessment = src('data/units.ts').UNITS.find(unit => unit.assessmentId && !unit.isPlaceholder);
    await client.query("INSERT INTO user_assessment_progress (user_id, assessment_id, best_score, last_score, passed_at) VALUES ($1, $2, 90, 90, NOW() - INTERVAL '2 hours')", [cat, assessment.assessmentId]);
    await client.query("INSERT INTO achievements (id, title, description) VALUES ('test-badge', 'Test badge', 'For tests') ON CONFLICT DO NOTHING");
    await client.query("INSERT INTO user_achievements (user_id, achievement_id, earned_at) VALUES ($1, 'test-badge', NOW() - INTERVAL '3 hours')", [cat]);
    await client.query("INSERT INTO lesson_progress (user_id, lesson_id, completed_at) VALUES ($1, 'japanese-n5-unit-1-a', NOW())", [await uid('dan')]);
    const feed = (await call('GET', '/friends/activity', { as: ana })).data.items;
    assert.deepEqual(feed.map(item => [item.person.username, item.kind]), [[user('cat'), 'lessons'], [user('cat'), 'unit'], [user('cat'), 'achievement']], 'only friends, newest first');
    assert.equal(feed[0].lessons, 2); assert.equal(feed[1].unit.number, assessment.number); assert.equal(feed[2].achievement.title, 'Test badge');
    assert.equal((await call('POST', '/friends/' + user('cat') + '/cheers', { as: ana, body: { item: 'lessons:1999-01-01' } })).status, 404);
    assert.equal((await call('POST', '/friends/' + user('cat') + '/cheers', { as: ana, body: { item: feed[0].key } })).status, 201);
    assert.equal((await call('POST', '/friends/' + user('cat') + '/cheers', { as: ana, body: { item: feed[0].key } })).status, 409, 'one cheer per item');
    assert.deepEqual((await notes('cat', 'cheer')).map(d => d.reason), ['completing 2 lessons']);
    assert.equal((await call('GET', '/friends/activity', { as: ana })).data.items[0].cheered, true);
    await social('cat', { shareActivity: false });
    assert.equal((await call('GET', '/friends/activity', { as: ana })).data.items.length, 0, 'sharing off');
    await social('cat', { shareActivity: true }); await settings('cat', { visibility: 'private' });
    assert.equal((await call('GET', '/friends/activity', { as: ana })).data.items.length, 0, 'a private profile shares nothing');
    await settings('cat', { visibility: 'friends' });

    // ---- nudges
    const today = "(NOW() AT TIME ZONE 'UTC')::date";
    await client.query('INSERT INTO activity_days (user_id, day) VALUES ($1, ' + today + ')', [cat]);
    const studied = await call('POST', '/friends/' + user('cat') + '/nudge', { as: ana });
    assert.equal(studied.status, 409); assert.match(studied.data.message, /already studied today/);
    await client.query('DELETE FROM activity_days WHERE user_id = $1', [cat]);
    assert.equal((await call('POST', '/friends/' + user('cat') + '/nudge', { as: ana })).status, 201);
    assert.equal((await call('POST', '/friends/' + user('cat') + '/nudge', { as: ana })).status, 429, 'once a day');
    assert.equal((await call('POST', '/friends/' + user('dan') + '/nudge', { as: ana })).status, 404, 'friends only');
    await befriend(ana, 'ben');
    await client.query('INSERT INTO activity_days (user_id, day) VALUES ($1, ' + today + ')', [await uid('ben')]);
    assert.equal((await call('POST', '/friends/' + user('ben') + '/nudge', { as: ana })).status, 201, 'a private friend is never reported as having studied');

    // ---- friend streaks and "studying now"
    const me = await uid(ana);
    await src('repositories/streak.repository.ts').recordActivity(client, me);
    assert.equal((await client.query('SELECT COUNT(*)::int AS n FROM activity_days WHERE user_id = $1 AND day = ' + today, [me])).rows[0].n, 1, 'learning activity records the day');
    for (const back of [1, 2]) await client.query("INSERT INTO activity_days (user_id, day) VALUES ($1, " + today + " - $2::int)", [me, back]);
    for (const back of [0, 1, 2, 4]) await client.query("INSERT INTO activity_days (user_id, day) VALUES ($1, " + today + " - $2::int)", [cat, back]);
    const catRow = async () => (await friends(ana)).friends.find(f => f.username === user('cat')).progress;
    assert.equal((await catRow()).friendStreak, 3);
    assert.equal((await friends(ana)).friends.find(f => f.username === user('ben')).progress, null, 'nothing shown for a private friend');
    await client.query("INSERT INTO study_time (user_id, day, seconds, last_credited_at) VALUES ($1, " + today + ", 60, NOW())", [cat]);
    assert.equal((await catRow()).studyingNow, false, 'only when they chose to show it');
    await social('cat', { showStudyingNow: true });
    assert.equal((await catRow()).studyingNow, true);
    await client.query("UPDATE study_time SET last_credited_at = NOW() - INTERVAL '10 minutes' WHERE user_id = $1", [cat]);
    assert.equal((await catRow()).studyingNow, false, 'not after a few minutes without study');
    assert.equal((await call('GET', '/people/' + user('cat'), { as: ana })).data.profile.friendStreak, 3);

    // ---- friend challenges
    const challenge = body => call('POST', '/friends/challenges', { as: ana, body: { username: user('cat'), ...body } });
    assert.equal((await challenge({ metric: 'kanji', days: 3 })).status, 400);
    assert.equal((await challenge({ metric: 'xp', days: 5 })).status, 400);
    assert.equal((await call('POST', '/friends/challenges', { as: ana, body: { username: user('dan'), metric: 'xp', days: 3 } })).status, 404, 'friends only');
    const created = await challenge({ metric: 'xp', days: 3 }); assert.equal(created.status, 201);
    assert.equal((await challenge({ metric: 'lessons', days: 7 })).status, 409, 'one open challenge per pair');
    const invited = (await challenges('cat'))[0];
    assert.deepEqual([invited.status, invited.sentByMe, invited.friend.username], ['pending', false, user(ana)]);
    assert.deepEqual((await notes('cat', 'challenge')).map(d => d.event), ['invited']);
    assert.equal((await call('PUT', '/friends/challenges/' + created.data.id, { as: ana, body: { accept: true } })).status, 404, 'only the friend answers');
    assert.equal((await call('PUT', '/friends/challenges/' + created.data.id, { as: 'cat', body: { accept: true } })).status, 200);
    // One transaction runs the whole test, so NOW() never moves: place the challenge in the past instead.
    await client.query("UPDATE friend_challenges SET starts_at = NOW() - INTERVAL '1 hour', ends_at = NOW() + INTERVAL '3 days' WHERE id = $1", [created.data.id]);
    await client.query("INSERT INTO xp_events (user_id, amount, source, reference_id, created_at) VALUES ($1, 50, 'lesson', 'challenge-test', NOW() - INTERVAL '30 minutes'), ($1, 20, 'lesson', 'before-start', NOW() - INTERVAL '2 hours')", [me]);
    const running = (await challenges(ana))[0];
    assert.deepEqual([running.status, running.myScore, running.theirScore], ['active', 50, 0], 'only XP earned after the start counts');
    await client.query("UPDATE friend_challenges SET ends_at = NOW() - INTERVAL '1 minute' WHERE id = $1", [created.data.id]);
    const finished = (await challenges(ana))[0];
    assert.deepEqual([finished.status, finished.outcome], ['finished', 'won']);
    assert.equal((await challenges('cat'))[0].outcome, 'lost');
    assert.deepEqual((await notes(ana, 'challenge')).map(d => [d.event, d.outcome ?? null]), [['accepted', null], ['finished', 'won']], 'the result is sent once');
    const second = await challenge({ metric: 'lessons', days: 7 }); assert.equal(second.status, 201);
    assert.equal((await call('DELETE', '/friends/challenges/' + second.data.id, { as: 'cat' })).status, 404, 'only the sender cancels');
    assert.equal((await call('DELETE', '/friends/challenges/' + second.data.id, { as: ana })).status, 200);
    const third = await challenge({ metric: 'lessons', days: 7 });
    assert.equal((await call('PUT', '/friends/challenges/' + third.data.id, { as: 'cat', body: { accept: false } })).status, 200);
    assert.deepEqual((await challenges(ana)).map(c => c.status), ['finished'], 'declined and cancelled challenges leave the list');
    await challenge({ metric: 'xp', days: 3 });
    assert.equal((await call('DELETE', '/friends/' + user('cat'), { as: ana })).status, 200);
    assert.equal((await client.query("SELECT COUNT(*)::int AS n FROM friend_challenges WHERE status IN ('pending', 'active')")).rows[0].n, 0, 'removing a friend cancels the open challenge');

    console.log('PASS: block and report from a profile, blocked list and unblock; opt-in settings; suggestions (friends of friends, same level, opt-in only); activity feed with sharing and privacy, cheers once per item; nudges once a day, never revealing a private friend; friend streaks, studying now; challenges (validation, one per pair, accept, live and final scores, result sent once, decline, cancel, ended by removing a friend)');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'social-api.cjs'), head + tail);
console.log('written');
