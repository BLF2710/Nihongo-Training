// Builds moderation-api.cjs: the review-api harness plus the administrator audit log, repeated learner reports and
// lesson editing (draft, publish, discard, revert) with the published edits the site reads.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Moderation and lesson editing")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/admin', src('routes/admin.routes.ts').default); app.use('/api/site', src('routes/site.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default); app.use('/api', src('routes/communication.routes.ts').default); app.use('/api', src('routes/friend.routes.ts').default);")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat', 'dan', 'eve', 'fay']) {");
for (const needle of ['routes/admin.routes.ts', 'routes/site.routes.ts', "'eve', 'fay'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const user = name => name + '_x1'; const A = 'admin';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [user(name)])).rows[0].id;
    const account = async name => (await client.query('SELECT id, username, email, role, status FROM users WHERE username = $1', [user(name)])).rows[0];
    const log = async (query = '') => (await call('GET', '/admin/audit-log' + query, { as: A })).data.entries;
    const editUser = async (name, change) => { const a = await account(name); return call('PATCH', '/admin/users/' + a.id, { as: A, body: { username: a.username, email: a.email, role: a.role, status: a.status, ...change } }); };

    // ---- system status: administrators only; reports what is configured, never a secret
    assert.equal((await call('GET', '/admin/status', { as: 'cat' })).status, 403);
    const status = await call('GET', '/admin/status', { as: A });
    assert.equal(status.status, 200);
    assert.deepEqual(Object.keys(status.data).sort(), ['api', 'checkedAt', 'database', 'integrations', 'realtime']);
    assert.ok(status.data.database.migrationFiles >= 26 && typeof status.data.database.sizeBytes === 'number' && typeof status.data.database.latencyMs === 'number');
    assert.deepEqual(Object.keys(status.data.integrations).sort(), ['anthropic', 'azureSpeech', 'email', 'google']);
    assert.ok(['memory', 'postgres'].includes(status.data.realtime.sharedState));
    const raw = JSON.stringify(status.data);
    for (const secret of [process.env.DB_PASSWORD, process.env.JWT_SECRET, process.env.ANTHROPIC_API_KEY, process.env.AZURE_SPEECH_KEY].filter(value => value && value.length > 3)) assert.ok(!raw.includes(secret), 'no secret in the status');
    assert.ok(!/:[^/@\s]+@/.test(status.data.integrations.email.detail), 'no SMTP password in the email detail');

    // ---- audit log: account changes, lesson access, settings, content, support
    assert.equal((await editUser('ben', { status: 'suspended' })).status, 200);
    assert.equal((await editUser('ben', { status: 'active', role: 'admin' })).status, 200);
    assert.equal((await editUser('ben', { role: 'learner', email: 'ben.new@example.com' })).status, 200);
    assert.equal((await call('PUT', '/admin/users/' + await uid('cat') + '/lesson-access', { as: A, body: { unlocked: true } })).status, 200);
    assert.equal((await call('PUT', '/admin/settings', { as: A, body: { registration_enabled: true, announcement: 'Maintenance on Sunday', announcement_audience: 'everyone' } })).status, 200);
    assert.equal((await call('PUT', '/admin/content/friends', { as: A, body: { enabled: false } })).status, 200);
    assert.equal((await call('PUT', '/admin/content/friends', { as: A, body: { enabled: true } })).status, 200);
    const ticket = (await call('POST', '/support', { as: 'eve', body: { subject: 'Help', body: 'My streak is wrong' } })).data;
    assert.equal((await call('POST', '/admin/support/' + ticket.id + '/messages', { as: A, body: { body: 'Fixed it.' } })).status, 201);
    assert.equal((await call('PATCH', '/admin/support/' + ticket.id, { as: A, body: { status: 'closed' } })).status, 200);
    assert.equal((await call('PATCH', '/admin/support/' + ticket.id, { as: A, body: { status: 'closed' } })).status, 200, 'closing twice is fine');
    const entries = await log();
    assert.deepEqual(entries.map(e => e.action), ['support.closed', 'support.replied', 'content.enabled', 'content.disabled', 'settings.updated', 'user.lessons_unlocked',
      'user.details_changed', 'user.role_changed', 'user.role_changed', 'user.reactivated', 'user.suspended'], 'newest first; one entry per change; closing twice is logged once');
    assert.ok(entries.every(e => e.actor === user(A)));
    assert.deepEqual(entries.find(e => e.action === 'user.details_changed').details, { email: 'changed' }, 'the email address itself is not logged');
    assert.deepEqual(entries.filter(e => e.action === 'user.role_changed').map(e => e.details), [{ from: 'admin', to: 'learner' }, { from: 'learner', to: 'admin' }]);
    assert.equal(entries[0].targetUser, user('eve')); assert.equal(entries[0].targetRef, 'support:' + ticket.id);
    assert.deepEqual((await log('?action=user')).map(e => e.action).every(a => a.startsWith('user.')), true, 'filter by group');
    assert.equal((await log('?action=user.suspended')).length, 1);
    assert.equal((await log('?target=' + user('ben'))).length, 5);
    assert.equal((await log('?actor=' + user('ben'))).length, 0);
    assert.equal((await call('GET', '/admin/audit-log?action=drop.tables', { as: A })).status, 400);
    assert.equal((await call('GET', '/admin/audit-log', { as: 'cat' })).status, 403, 'administrators only');

    // ---- an administrator sends a password-reset link (never sees the password); optionally signs the account out
    const eve = await uid('eve');
    const versionBefore = (await client.query('SELECT token_version FROM users WHERE id = $1', [eve])).rows[0].token_version;
    assert.equal((await call('POST', '/admin/users/' + eve + '/password-reset', { as: 'cat', body: {} })).status, 403, 'administrators only');
    const reset = await call('POST', '/admin/users/' + eve + '/password-reset', { as: A, body: { signOut: true } });
    assert.equal(reset.status, 200, JSON.stringify(reset.data)); assert.deepEqual(reset.data, { sentTo: 'eve@example.com', signedOut: true });
    assert.equal((await client.query("SELECT COUNT(*)::int AS n FROM account_tokens WHERE user_id = $1 AND purpose = 'password_reset' AND used_at IS NULL", [eve])).rows[0].n, 1, 'a reset link exists');
    assert.ok((await client.query('SELECT token_version FROM users WHERE id = $1', [eve])).rows[0].token_version > versionBefore, 'signed out everywhere');
    assert.deepEqual((await log('?action=user.password_reset_sent'))[0].details, { signedOut: true });
    assert.equal((await call('POST', '/admin/users/999999/password-reset', { as: A, body: {} })).status, 404);
    await client.query("UPDATE users SET status = 'suspended' WHERE id = $1", [eve]);
    assert.equal((await call('POST', '/admin/users/' + eve + '/password-reset', { as: A, body: {} })).status, 409, 'not for a suspended account');
    await client.query("UPDATE users SET status = 'active' WHERE id = $1", [eve]);
    tokens.eve = (await call('POST', '/auth/login', { body: { login: user('eve'), password: 'password123' } })).data.token;

    // ---- repeated reports about one learner are handled together
    const report = (as, about, reason) => call('POST', '/people/' + user(about) + '/report', { as, body: { reason } });
    const first = await report('cat', 'dan', 'Rude bio'); assert.equal(first.status, 201); assert.equal(first.data.merged, false);
    const again = await report('cat', 'dan', 'Still rude'); assert.equal(again.data.supportConversationId, first.data.supportConversationId, 'a second report by the same learner joins the open request');
    assert.equal(again.data.merged, true);
    assert.equal((await report('ben', 'dan', 'Spam')).status, 201);
    let queue = (await call('GET', '/admin/reports', { as: A })).data;
    assert.deepEqual(queue.learners.map(l => [l.learner.username, l.openReports, l.reporters, l.isRepeated]), [[user('dan'), 3, 2, false]]);
    assert.equal((await report('eve', 'dan', 'Mean messages')).status, 201);
    queue = (await call('GET', '/admin/reports', { as: A })).data;
    assert.deepEqual([queue.learners[0].reporters, queue.learners[0].isRepeated, queue.repeatReporters], [3, true, 3], 'three different learners: reported repeatedly');
    const detail = (await call('GET', '/admin/support/' + first.data.supportConversationId, { as: A })).data;
    assert.equal(detail.reports.learner.username, user('dan')); assert.equal(detail.reports.openReports, 4); assert.equal(detail.reports.ticketIds.length, 3);
    assert.equal((await call('GET', '/admin/support/' + ticket.id, { as: A })).data.reports, null, 'an ordinary request has no reports');
    const dan = await uid('dan');
    const resolve = body => call('POST', '/admin/reports/' + dan + '/resolve', { as: A, body });
    assert.equal((await resolve({ resolution: 'banish' })).status, 400);
    assert.equal((await resolve({ resolution: 'warned' })).status, 400, 'a warning needs its text');
    assert.equal((await resolve({ resolution: 'warned', warning: 'Please keep your bio friendly.' })).status, 200);
    const warning = (await client.query("SELECT c.subject, m.body FROM conversations c JOIN messages m ON m.conversation_id = c.id WHERE c.created_by = $1 AND c.kind = 'support'", [dan])).rows;
    assert.deepEqual(warning, [{ subject: 'A message from the support team', body: 'Please keep your bio friendly.' }]);
    const closed = (await client.query("SELECT id, status FROM conversations WHERE id = ANY($1::int[])", [detail.reports.ticketIds])).rows;
    assert.ok(closed.length === 3 && closed.every(c => c.status === 'closed'), 'every report request is answered and closed');
    assert.equal((await client.query("SELECT COUNT(*)::int AS n FROM notifications WHERE kind = 'support_reply' AND user_id = ANY($1::int[])", [[await uid('cat'), await uid('ben'), await uid('eve')]])).rows[0].n, 4, 'each reporter is told (eve also had her own request answered)');
    assert.deepEqual((await call('GET', '/admin/reports', { as: A })).data.learners, []);
    assert.equal((await resolve({ resolution: 'dismissed' })).status, 404, 'nothing left to resolve');
    assert.deepEqual((await log('?action=reports'))[0].details, { resolution: 'warned', reports: 4, warning: 'Please keep your bio friendly.' });
    const later = await report('cat', 'dan', 'Again');
    assert.notEqual(later.data.supportConversationId, first.data.supportConversationId, 'after resolution a new report opens a new request');
    assert.equal((await call('GET', '/admin/reports', { as: A })).data.learners[0].earlierResolved, 4);
    assert.equal((await resolve({ resolution: 'suspended' })).status, 200);
    assert.equal((await account('dan')).status, 'suspended');
    assert.deepEqual((await log()).slice(0, 2).map(e => e.action), ['reports.resolved', 'user.suspended']);
    const fay = await uid('fay');
    await client.query("INSERT INTO learner_reports (reporter_id, reported_id, kind) SELECT $1, $2, 'profile' FROM generate_series(1, 10)", [fay, await uid('ben')]);
    assert.equal((await report('fay', 'eve', 'x')).status, 429, 'at most 10 reports a day');

    // ---- lesson editing: draft, publish, discard, revert
    const lessons = JSON.parse(fs.readFileSync(path.join(API, '../shared/course/lessons.json'), 'utf8'));
    const lesson = lessons[0];
    const editable = ({ title, titleJp, objectives, vocabulary, concept, examples, dialogue, grammar, practice, challenge }) => ({ title, titleJp, objectives, vocabulary, concept, examples, dialogue, grammar, practice, challenge });
    const draft = { ...editable(lesson), title: 'Telling the time (edited)' };
    const lessonUrl = '/admin/lessons/' + lesson.id;
    const published = async () => (await call('GET', '/site/lesson-edits')).data;
    const before = await published();
    assert.deepEqual(before.lessons, {}, 'nothing published yet; no sign-in needed');
    assert.equal((await call('PUT', lessonUrl + '/draft', { as: 'cat', body: { content: draft } })).status, 403);
    assert.equal((await call('PUT', '/admin/lessons/no-such-lesson/draft', { as: A, body: { content: draft } })).status, 404);
    const broken = await call('PUT', lessonUrl + '/draft', { as: A, body: { content: { ...draft, title: '', practice: [] } } });
    assert.equal(broken.status, 400); assert.deepEqual(broken.data.errors, ['title: is required', 'practice: needs at least 1']);
    assert.equal((await call('POST', lessonUrl + '/publish', { as: A })).status, 404, 'nothing to publish yet');
    const saved = await call('PUT', lessonUrl + '/draft', { as: A, body: { content: draft } });
    assert.equal(saved.status, 200); assert.equal(saved.data.draft.title, 'Telling the time (edited)'); assert.equal(saved.data.draftBy, user(A));
    assert.deepEqual((await published()).lessons, {}, 'a draft is not shown to learners');
    const afterPublish = await call('POST', lessonUrl + '/publish', { as: A });
    assert.equal(afterPublish.status, 200); assert.equal(afterPublish.data.draft, null); assert.equal(afterPublish.data.published.title, 'Telling the time (edited)');
    const live = await published();
    assert.equal(live.lessons[lesson.id].title, 'Telling the time (edited)'); assert.ok(live.revision > before.revision);
    const exported = (await call('GET', '/admin/lessons/export', { as: A })).data;
    assert.equal(exported.lessons[lesson.id].title, 'Telling the time (edited)', 'the export has every published edit');
    assert.equal((await call('GET', '/admin/lessons/export', { as: 'cat' })).status, 403);
    assert.deepEqual((await call('GET', '/admin/lessons/edits', { as: A })).data.edits.map(e => [e.lessonId, e.hasDraft, e.isPublished]), [[lesson.id, false, true]]);
    await call('PUT', lessonUrl + '/draft', { as: A, body: { content: { ...draft, title: 'Second try' } } });
    assert.equal((await call('DELETE', lessonUrl + '/draft', { as: A })).status, 200);
    assert.equal((await call('GET', lessonUrl + '/edit', { as: A })).data.draft, null);
    assert.equal((await published()).lessons[lesson.id].title, 'Telling the time (edited)', 'discarding a draft keeps the published version');
    assert.equal((await call('DELETE', lessonUrl + '/published', { as: A })).status, 200);
    assert.deepEqual((await published()).lessons, {}, 'reverted: learners see the course version again');
    assert.equal((await call('DELETE', lessonUrl + '/published', { as: A })).status, 404);
    assert.deepEqual((await log('?action=lesson')).map(e => [e.action, e.targetRef]), [['lesson.reverted', lesson.id], ['lesson.draft_discarded', lesson.id], ['lesson.published', lesson.id]]);

    console.log('PASS: audit log (suspend, reactivate, role, details without the email, lesson access, settings, content, support reply and close once; filters by group, action, target, actor; admins only); reports (same reporter merged, repeated by three learners flagged, summary on the request, warn with a message to the learner, every reporter answered and closed, new report after resolution, suspend, 10 a day); lesson editing (validation with every problem, admins only, draft hidden, publish live without sign-in, discard keeps the published version, revert, all logged)');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'moderation-api.cjs'), head + tail);
console.log('written');
