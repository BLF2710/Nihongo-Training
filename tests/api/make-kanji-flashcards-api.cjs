// Builds kanji-flashcards-api.cjs: the review-api harness (temp copies of every table, rolled back) plus the
// learner's kanji flashcard list.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Kanji flashcard list API")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);", "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/kanji', src('routes/kanji.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/kanji.routes.ts', "'ben']"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const catalog = JSON.parse(fs.readFileSync(ROOT + '/shared/kanji.json', 'utf8')).kanji;
    const [first, second] = catalog;
    const list = (as = L) => call('GET', '/kanji/flashcards', { as });
    const add = (id, as = L) => call('PUT', '/kanji/flashcards/' + encodeURIComponent(id), { as });
    const remove = (id, as = L) => call('DELETE', '/kanji/flashcards/' + encodeURIComponent(id), { as });
    assert.equal((await call('GET', '/kanji/flashcards')).status, 401);
    assert.deepEqual((await list()).data, { kanjiIds: [] });
    assert.deepEqual((await add(first.id)).data, { kanjiIds: [first.id] });
    assert.deepEqual((await add(first.id)).data, { kanjiIds: [first.id] }, 'adding twice changes nothing');
    assert.deepEqual((await add(second.id)).data, { kanjiIds: [first.id, second.id] }, 'kept in the order added');
    for (const bad of ['kanji-nope', "kanji-65e5'; DROP TABLE users; --"]) assert.equal((await add(bad)).status, 404, bad);
    assert.deepEqual((await list('ben')).data, { kanjiIds: [] }, 'lists are per learner');
    assert.deepEqual((await remove(first.id, 'ben')).data, { kanjiIds: [] }, "removing from your own list never touches another learner's");
    assert.deepEqual((await list()).data, { kanjiIds: [first.id, second.id] });
    assert.deepEqual((await remove(first.id)).data, { kanjiIds: [second.id] });
    assert.deepEqual((await remove(first.id)).data, { kanjiIds: [second.id] }, 'removing a missing card is harmless');
    assert.equal((await remove('kanji-nope')).status, 404);
    // A kanji no longer in the catalog is left out of the list.
    const learnerId = (await client.query("SELECT id FROM users WHERE username = 'learner_x1'")).rows[0].id;
    await client.query("INSERT INTO kanji_flashcards (user_id, kanji_id) VALUES ($1, 'kanji-retired')", [learnerId]);
    assert.deepEqual((await list()).data, { kanjiIds: [second.id] });
    // The list has a limit.
    await client.query("INSERT INTO kanji_flashcards (user_id, kanji_id) SELECT $1, 'filler-' || n FROM generate_series(1, 498) AS n", [learnerId]);
    const full = await add(first.id); assert.equal(full.status, 409); assert.match(full.data.message, /full/);
    console.log('PASS: sign-in required; empty list; add (idempotent, in order); unknown or injected ids refused; per-learner lists; remove (harmless when missing); retired kanji left out; limit of 500. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'kanji-flashcards-api.cjs'), head + tail);
console.log('written');
