// Builds srs-deck-api.cjs: the review-api harness (temp copies of every table, rolled back) plus the daily review
// deck: listing cards, suspending and restoring one, and reviewing ahead.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Daily review deck: suspend, restore, review ahead")
  .replace("await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));",
    `await client.query(fs.readFileSync(path.join(API, 'migrations/008_review_question_bank.sql'), 'utf8').replace('CREATE TABLE IF NOT EXISTS', 'CREATE TEMP TABLE IF NOT EXISTS'));
    await client.query('INSERT INTO pg_temp.kanji_catalog SELECT * FROM public.kanji_catalog');`)
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/srs', src('routes/srs.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/srs.routes.ts', "'ben']", 'kanji_catalog']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const uid = async name => (await client.query('SELECT id FROM users WHERE username = $1', [name + '_x1'])).rows[0].id;
    const learnerId = await uid(L);
    const [SUN, ONE, TWO] = ['kanji-65e5', 'kanji-4e00', 'kanji-4e8c'];
    const deck = async (as = L) => (await call('GET', '/srs/cards', { as })).data.cards;
    const summary = async () => (await call('GET', '/srs/summary', { as: L })).data;
    const queuedIds = async (query = '') => (await call('GET', '/srs/queue' + query, { as: L })).data.cards.map(card => card.itemId).sort();
    const suspend = (itemId, suspended, as = L, itemType = 'kanji') => call('PATCH', '/srs/cards/' + itemType + '/' + encodeURIComponent(itemId), { as, body: { suspended } });
    const grade = (itemId, body = {}) => call('POST', '/srs/reviews', { as: L, body: { itemType: 'kanji', itemId, grade: 'good', ...body } });

    // ---- the deck lists every card with its status
    assert.equal((await call('GET', '/srs/cards')).status, 401);
    await call('POST', '/srs/cards', { as: L, body: { items: [SUN, ONE, TWO].map(itemId => ({ itemType: 'kanji', itemId })) } });
    assert.equal((await deck()).length, 3); assert.ok((await deck()).every(card => card.status === 'new' && card.dueAt === null));
    assert.deepEqual(await deck('ben'), [], 'per learner');

    // ---- suspending: out of the queue and counts, kept in the deck, can't be reviewed; restoring brings it back
    for (const [response, status, why] of [
      [await suspend(SUN, 'yes'), 400, 'suspended must be true or false'],
      [await suspend(SUN, true, L, 'grammar'), 400, 'unknown item type'],
      [await suspend('kanji-nope', true), 404, 'not in the deck'],
      [await suspend(SUN, true, 'ben'), 404, "another learner's card"],
    ]) assert.equal(response.status, status, why);
    assert.deepEqual((await suspend(SUN, true)).data, { itemType: 'kanji', itemId: SUN, suspended: true });
    assert.deepEqual(await queuedIds(), [ONE, TWO].sort());
    let counts = await summary();
    assert.deepEqual([counts.total, counts.newCards, counts.suspended], [3, 2, 1]);
    assert.equal((await deck()).find(card => card.itemId === SUN).status, 'suspended');
    assert.equal((await grade(SUN)).status, 409);
    // Adding it again (a lesson re-synced) keeps it suspended.
    assert.equal((await call('POST', '/srs/cards', { as: L, body: { items: [{ itemType: 'kanji', itemId: SUN }] } })).data.added, 0);
    assert.equal((await deck()).find(card => card.itemId === SUN).status, 'suspended');
    assert.equal((await suspend(SUN, false)).status, 200);
    assert.deepEqual(await queuedIds(), [SUN, ONE, TWO].sort());

    // ---- review ahead: studied cards due within a day, only when asked
    for (const itemId of [SUN, ONE, TWO]) assert.equal((await grade(itemId)).status, 200);
    await client.query("UPDATE srs_cards SET due_at = NOW() + INTERVAL '12 hours' WHERE user_id = $1 AND item_id = $2", [learnerId, SUN]);
    await client.query("UPDATE srs_cards SET due_at = NOW() + INTERVAL '3 days' WHERE user_id = $1 AND item_id = $2", [learnerId, ONE]);
    await client.query("UPDATE srs_cards SET due_at = NOW() + INTERVAL '6 hours' WHERE user_id = $1 AND item_id = $2", [learnerId, TWO]);
    await suspend(TWO, true);
    counts = await summary();
    assert.deepEqual([counts.dueNow, counts.dueSoon], [0, 1], 'one card due within a day (the suspended one left out)');
    assert.deepEqual(await queuedIds(), [], 'nothing due now');
    assert.deepEqual(await queuedIds('?ahead=1'), [SUN]);
    assert.equal((await grade(SUN)).status, 409, 'not due without asking to review ahead');
    const early = await grade(SUN, { ahead: true });
    assert.equal(early.status, 200); assert.ok(early.data.intervalDays > 1, 'reviewed early, it moves further out');
    assert.equal((await grade(ONE, { ahead: true })).status, 409, 'three days away is too far ahead');
    assert.equal((await grade(TWO, { ahead: true })).status, 409, 'a suspended card is never reviewed');
    // The deck shows when each card comes back.
    const states = Object.fromEntries((await deck()).map(card => [card.itemId, card]));
    assert.deepEqual([states[SUN].status, states[ONE].status, states[TWO].status], ['learning', 'learning', 'suspended']);
    assert.ok(new Date(states[ONE].dueAt) > new Date(), 'due date shown');
    console.log('PASS: deck lists every card (new, no due date) per learner; suspend validated (true/false, item type, own card), leaves the queue and counts, stays in the deck, refuses reviews, survives re-adding, restores; review ahead offers studied cards due within a day (suspended left out), only when asked, not cards three days away; the deck shows statuses and due dates. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'srs-deck-api.cjs'), head + tail);
console.log('written');
