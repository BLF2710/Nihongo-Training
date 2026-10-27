// Builds comm-api.cjs: the review-api harness (temp copies of every table, rolled back) plus messaging checks.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Messaging, support and study assistant API")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    "await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));\n    await client.query(fs.readFileSync(path.join(API, 'migrations/011_communication.sql'), 'utf8').replaceAll('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api', src('middleware/content-availability.middleware.ts').enforceContentAvailability); app.use('/api', src('routes/communication.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben', 'cat']) {");
for (const needle of ['011_communication', 'communication.routes', "'ben', 'cat'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);
// The Claude provider is pointed at a local mock of the Messages API: no real call, no real key.
head = head.replace("(async () => {", `const http = require('node:http');
const mock = { requests: [], reply: null };
const mockServer = http.createServer((request, response) => { let raw = ''; request.on('data', c => raw += c); request.on('end', () => {
  mock.requests.push({ headers: request.headers, body: JSON.parse(raw || '{}'), path: request.url });
  const { status = 200, json, headers = {} } = mock.reply();
  response.writeHead(status, { 'content-type': 'application/json', ...headers }); response.end(JSON.stringify(json)); }); });
(async () => {
  await new Promise(r => mockServer.listen(0, '127.0.0.1', r));
  process.env.ANTHROPIC_BASE_URL = 'http://127.0.0.1:' + mockServer.address().port; process.env.ANTHROPIC_API_KEY = 'test-key-not-real'; process.env.ASSISTANT_PROVIDER = 'course';`);

const tail = String.raw`    const L = 'learner'; // username learner_x1 is "Ana" in these checks
    const get = (url, as) => call('GET', url, { as }), post = (url, body, as) => call('POST', url, { as, body }), put = (url, body, as) => call('PUT', url, { as, body });
    // ---- auth
    for (const url of ['/inbox', '/messages/conversations', '/support', '/assistant']) assert.equal((await get(url)).status, 401, url);
    // ---- starting a direct conversation: exact usernames of active learners only
    assert.equal((await post('/messages/conversations', { username: 'ben_x1' }, L)).status, 201);
    const first = await post('/messages/conversations', { username: 'BEN_X1' }, L); assert.equal(first.status, 201);
    const conv = first.data.id; assert.equal((await post('/messages/conversations', { username: 'learner_x1' }, 'ben')).data.id, conv, 'one conversation per pair');
    assert.equal((await post('/messages/conversations', { username: 'admin_x1' }, L)).status, 404, 'administrators are reached through support');
    assert.equal((await post('/messages/conversations', { username: 'learner_x1' }, L)).status, 400);
    assert.equal((await post('/messages/conversations', { username: 'x' }, L)).status, 400);
    assert.equal((await post('/messages/conversations', { username: 'nobody_here' }, L)).status, 404);
    // ---- sending, unread counts, reading
    for (const bad of ['', '   ', 'x'.repeat(2001), 42]) assert.equal((await post('/messages/conversations/' + conv + '/messages', { body: bad }, L)).status, 400);
    const sent = await post('/messages/conversations/' + conv + '/messages', { body: 'こんにちは、ベンさん！' }, L); assert.equal(sent.status, 201); assert.equal(sent.data.mine, true);
    assert.deepEqual((await get('/inbox', 'ben')).data, { direct: 1, support: 0, total: 1, friendRequests: 0, notifications: 0 });
    assert.deepEqual((await get('/inbox', L)).data, { direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 }, 'own messages are not unread');
    const benList = (await get('/messages/conversations', 'ben')).data.conversations;
    assert.equal(benList.length, 1); assert.equal(benList[0].unread, 1); assert.equal(benList[0].with.username, 'learner_x1'); assert.equal(benList[0].lastMessage.body, 'こんにちは、ベンさん！');
    const opened = (await get('/messages/conversations/' + conv, 'ben')).data;
    assert.equal(opened.messages.length, 1); assert.equal(opened.messages[0].mine, false); assert.equal(opened.canReply, true);
    assert.equal((await get('/inbox', 'ben')).data.total, 0, 'opening marks read');
    // ---- strangers cannot see or write into the conversation
    assert.equal((await get('/messages/conversations/' + conv, 'cat')).status, 404);
    assert.equal((await post('/messages/conversations/' + conv + '/messages', { body: 'hi' }, 'cat')).status, 404);
    for (const bad of ['abc', '0', '-1', '99999999']) assert.equal((await get('/messages/conversations/' + bad, L)).status, 404, bad);
    // ---- blocking
    assert.equal((await put('/messages/conversations/' + conv + '/block', { blocked: 'yes' }, 'ben')).status, 400);
    assert.equal((await put('/messages/conversations/' + conv + '/block', { blocked: true }, 'ben')).status, 200);
    assert.equal((await post('/messages/conversations/' + conv + '/messages', { body: 'hello?' }, L)).status, 403);
    assert.equal((await post('/messages/conversations', { username: 'ben_x1' }, L)).status, 403);
    assert.match((await post('/messages/conversations/' + conv + '/messages', { body: 'hi' }, 'ben')).data.message, /Unblock/);
    const blockedView = (await get('/messages/conversations/' + conv, 'ben')).data; assert.equal(blockedView.blockedByMe, true); assert.equal(blockedView.canReply, false);
    assert.equal((await get('/messages/conversations/' + conv, L)).data.canReply, false);
    await put('/messages/conversations/' + conv + '/block', { blocked: false }, 'ben');
    assert.equal((await post('/messages/conversations/' + conv + '/messages', { body: 'Sorry, hello!' }, 'ben')).status, 201);
    // ---- a suspended learner cannot receive messages
    await client.query("UPDATE users SET status='suspended' WHERE username='ben_x1'");
    assert.equal((await post('/messages/conversations/' + conv + '/messages', { body: 'still there?' }, L)).status, 403);
    await client.query("UPDATE users SET status='active' WHERE username='ben_x1'");
    // ---- rate limit
    let limited = 0; for (let i = 0; i < 25 && !limited; i++) { const r = await post('/messages/conversations/' + conv + '/messages', { body: 'msg ' + i }, L); if (r.status === 429) limited = i; }
    assert.ok(limited > 0 && limited <= 20, 'rate limited after ' + limited);
    // ---- reporting a message sends a copy to support
    const anaMessage = (await get('/messages/conversations/' + conv, 'ben')).data.messages.find(m => !m.mine);
    const benOwn = (await get('/messages/conversations/' + conv, 'ben')).data.messages.find(m => m.mine);
    assert.equal((await post('/messages/conversations/' + conv + '/messages/' + benOwn.id + '/report', {}, 'ben')).status, 404, 'cannot report your own message');
    const report = await post('/messages/conversations/' + conv + '/messages/' + anaMessage.id + '/report', { reason: 'Testing reports' }, 'ben'); assert.equal(report.status, 201);
    // ---- support requests
    assert.equal((await post('/support', { subject: 'Hi', body: 'x' }, L)).status, 400);
    const ticket = await post('/support', { subject: 'Cannot open lesson', body: 'Lesson 3 does not open for me.' }, L); assert.equal(ticket.status, 201);
    assert.equal((await get('/admin/support', L)).status, 403, 'learners cannot read the support inbox');
    const inbox = (await get('/admin/support', 'admin')).data; assert.equal(inbox.unreadOpen, 2);
    const listed = inbox.conversations.find(c => c.id === ticket.data.id); assert.equal(listed.unread, true); assert.equal(listed.learner.username, 'learner_x1');
    assert.ok(inbox.conversations.some(c => c.id === report.data.supportConversationId && /Report: message from @learner_x1/.test(c.subject)));
    const staffView = (await get('/admin/support/' + report.data.supportConversationId, 'admin')).data;
    assert.match(staffView.messages[0].body, /Reported message #\d+ from @learner_x1[\s\S]*Testing reports/);
    assert.equal((await get('/admin/support', 'admin')).data.unreadOpen, 1, 'opening the report marked it read');
    await get('/admin/support/' + ticket.data.id, 'admin'); assert.equal((await get('/admin/support', 'admin')).data.unreadOpen, 0, 'opening marks staff read');
    const reply = await post('/admin/support/' + ticket.data.id + '/messages', { body: 'Thanks, fixed now.' }, 'admin'); assert.equal(reply.status, 201);
    assert.deepEqual((await get('/inbox', L)).data.support, 1);
    const mine = (await get('/support/' + ticket.data.id, L)).data;
    assert.deepEqual(mine.messages.map(m => m.mine), [true, false]);
    assert.equal(mine.messages[1].sender, 'LingoHub support'); assert.equal((await get('/inbox', L)).data.support, 0);
    assert.equal((await get('/support/' + ticket.data.id, 'ben')).status, 404, 'other learners cannot read a request');
    assert.equal((await call('PATCH', '/admin/support/' + ticket.data.id, { as: 'admin', body: { status: 'done' } })).status, 400);
    assert.equal((await call('PATCH', '/admin/support/' + ticket.data.id, { as: 'admin', body: { status: 'closed' } })).data.status, 'closed');
    assert.equal((await get('/admin/support?status=open', 'admin')).data.conversations.some(c => c.id === ticket.data.id), false);
    await post('/support/' + ticket.data.id + '/messages', { body: 'It broke again.' }, L);
    assert.equal((await get('/support/' + ticket.data.id, L)).data.status, 'open', 'a learner reply reopens the request');
    // ---- administrator switches
    await client.query("INSERT INTO content_availability (content_key, enabled) VALUES ('messages', FALSE), ('assistant', FALSE)");
    assert.equal((await get('/messages/conversations', L)).status, 403); assert.equal((await get('/assistant', L)).status, 403);
    assert.equal((await get('/support', L)).status, 200); assert.equal((await get('/inbox', L)).status, 200);
    await client.query("DELETE FROM content_availability WHERE content_key IN ('messages', 'assistant')");
    // ---- study assistant: course helper (no AI configured)
    const empty = (await get('/assistant', 'cat')).data; assert.equal(empty.provider.id, 'course-helper'); assert.equal(empty.provider.ai, false); assert.equal(empty.conversationId, null);
    const asked = await post('/assistant/messages', { body: 'weather', level: 'N5' }, 'cat'); assert.equal(asked.status, 201);
    assert.match(asked.data.messages[1].body, /Here is what I found[\s\S]*(天気|てんき)/); assert.equal(asked.data.messages[1].sender, 'Study assistant');
    const chat = asked.data.conversationId;
    assert.match((await post('/assistant/messages', { body: 'zzzzqq', conversationId: chat }, 'cat')).data.messages[1].body, /couldn't find that/);
    const reopened = (await get('/assistant', 'cat')).data; assert.equal(reopened.conversationId, chat); assert.equal(reopened.messages.length, 4); assert.equal(reopened.conversations[0].title, 'weather');
    assert.equal((await post('/assistant/messages', { body: 'hi', conversationId: chat }, 'ben')).status, 404, 'cannot write into another learner\'s chat');
    assert.equal((await get('/assistant?conversation=' + chat, 'ben')).status, 404);
    assert.equal((await post('/assistant/messages', { body: 'x'.repeat(1001) }, 'cat')).status, 400);
    const fresh = await post('/assistant/conversations', {}, 'cat'); assert.equal(fresh.status, 201); assert.notEqual(fresh.data.conversationId, chat);
    // ---- study assistant: Claude provider against the mock Messages API
    process.env.ASSISTANT_PROVIDER = 'claude';
    mock.reply = () => ({ json: { id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: '天気 (てんき, weather) is a noun.' }], usage: { input_tokens: 10, output_tokens: 10 } } });
    const ai1 = await post('/assistant/messages', { body: 'What does てんき mean?', level: 'N4' }, 'cat'); assert.equal(ai1.status, 201);
    assert.equal(ai1.data.messages[1].body, '天気 (てんき, weather) is a noun.');
    const req1 = mock.requests.at(-1);
    assert.equal(req1.body.model, 'claude-opus-5-5'); assert.equal(req1.body.fallbacks, 'default'); assert.deepEqual(req1.body.output_config, { effort: 'low' });
    assert.match(req1.headers['anthropic-beta'], /server-side-fallback-2026-07-01/); assert.equal(req1.headers['x-api-key'], 'test-key-not-real');
    assert.match(req1.body.system, /studying level N4/); assert.match(req1.body.system, /Learner display name: cat_x1/);
    assert.deepEqual(req1.body.messages, [{ role: 'user', content: 'What does てんき mean?' }]);
    assert.equal(req1.body.thinking, undefined, 'thinking is left to the model default');
    await post('/assistant/messages', { body: 'And あめ?', conversationId: ai1.data.conversationId }, 'cat');
    assert.deepEqual(mock.requests.at(-1).body.messages.map(m => m.role), ['user', 'assistant', 'user'], 'history goes with the question');
    // A refusal is answered kindly; an overloaded or rate-limited API stores nothing and says so.
    mock.reply = () => ({ json: { id: 'msg_2', type: 'message', role: 'assistant', model: 'claude-opus-5-5', stop_reason: 'refusal', stop_details: { type: 'refusal', category: null }, content: [], usage: { input_tokens: 1, output_tokens: 0 } } });
    assert.match((await post('/assistant/messages', { body: 'something odd' }, 'cat')).data.messages[1].body, /can't help with that/);
    const before = Number((await client.query("SELECT COUNT(*) FROM messages")).rows[0].count);
    for (const status of [429, 529, 500]) {
      mock.reply = () => ({ status, headers: { 'x-should-retry': 'false' }, json: { type: 'error', error: { type: status === 429 ? 'rate_limit_error' : 'overloaded_error', message: 'busy' } } });
      const failed = await post('/assistant/messages', { body: 'are you there?' }, 'cat'); assert.equal(failed.status, 503, String(status)); assert.match(failed.data.message, /study assistant/);
    }
    mock.reply = () => ({ status: 401, json: { type: 'error', error: { type: 'authentication_error', message: 'bad key' } } });
    assert.equal((await post('/assistant/messages', { body: 'hello' }, 'cat')).status, 503);
    assert.equal(Number((await client.query("SELECT COUNT(*) FROM messages")).rows[0].count), before, 'failed answers store nothing');
    console.log('PASS: auth on every route; direct conversations by exact username only (one per pair, no admins, not yourself); send/unread/read; strangers refused; block both ways and unblock; suspended recipients; rate limit after ' + limited + ' messages; reports copied to support; support requests with staff inbox, unread, replies as "LingoHub support", close and reopen-on-reply, learners refused from the inbox; admin switches for messages and assistant (support stays open); course helper answers from lessons and keeps chats private; Claude provider sends claude-opus-5-5 with default fallbacks, low effort, level-aware system prompt and history, handles refusal kindly, and turns 429/529/500/401 into 503 with nothing stored. Rolled back; ' + mock.requests.length + ' requests went to the local mock, none to the real API.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); mockServer.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'comm-api.cjs'), head + tail);
console.log('written');
