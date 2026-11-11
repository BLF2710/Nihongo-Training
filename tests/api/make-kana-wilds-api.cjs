// Builds kana-wilds-api.cjs: the review-api harness (temp copies of every table, rolled back) plus the Kana Wilds
// collection (starter choice, catches) and battles recorded as practice sessions.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Kana Wilds collection API")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/kana-wilds', src('routes/kana-wilds.routes.ts').default); app.use('/api/activity', src('routes/activity.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/kana-wilds.routes.ts', 'routes/activity.routes.ts', "'ben']"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const VOWELS = [1, 2, 3, 4, 5], KA = 6, SA = 11, KI = 7, N = 46, GA = 47;
    const collection = (as = L) => call('GET', '/kana-wilds/collection', { as });
    const starter = (body, as = L) => call('POST', '/kana-wilds/starter', { as, body });
    const caught = (kanaId, as = L) => call('POST', '/kana-wilds/catches', { as, body: { kanaId } });
    for (const [method, url] of [['GET', '/kana-wilds/collection'], ['POST', '/kana-wilds/starter'], ['POST', '/kana-wilds/catches']])
      assert.equal((await call(method, url, method === 'GET' ? {} : { body: {} })).status, 401, url + ' needs sign-in');
    assert.deepEqual((await collection()).data, { starter: null, kanaIds: [] }, 'a new player has nothing yet');
    const early = await caught(KI); assert.equal(early.status, 409, 'no catching before a starter'); assert.match(early.data.message, /starter/);
    for (const bad of [{ starter: 'na' }, { starter: 'KA' }, {}, { starter: ['ka'] }]) assert.equal((await starter(bad)).status, 400, JSON.stringify(bad));
    const chosen = await starter({ starter: 'ka' });
    assert.equal(chosen.status, 201); assert.deepEqual(chosen.data, { starter: 'ka', kanaIds: [...VOWELS, KA] }, 'the vowels and the starter');
    const twice = await starter({ starter: 'sa' }); assert.equal(twice.status, 409, 'one starter only');
    assert.deepEqual((await collection()).data, { starter: 'ka', kanaIds: [...VOWELS, KA] });
    for (const bad of [0, GA, 1.5, '7', null]) assert.equal((await caught(bad)).status, 400, 'only the 46 basic hiragana: ' + bad);
    const first = await caught(KI);
    assert.equal(first.status, 200); assert.equal(first.data.isNew, true); assert.deepEqual(first.data.kanaIds, [...VOWELS, KA, KI]);
    assert.ok(first.data.reward && first.data.reward.xpEarned > 0, 'a new catch pays XP');
    const again = await caught(KI);
    assert.deepEqual([again.data.isNew, again.data.reward, again.data.kanaIds], [false, null, [...VOWELS, KA, KI]], 'catching it again changes nothing');
    assert.equal((await caught(N)).data.isNew, true, 'ん is in the wilds too');
    // Collections are per learner.
    assert.deepEqual((await collection('ben')).data, { starter: null, kanaIds: [] });
    assert.deepEqual((await starter({ starter: 'sa' }, 'ben')).data, { starter: 'sa', kanaIds: [...VOWELS, SA] });
    assert.deepEqual((await collection()).data.kanaIds, [...VOWELS, KA, KI, N]);
    // A finished battle is recorded as practice (graded in the browser, like the other games).
    const battle = await call('POST', '/activity/practice', { as: L, body: { kind: 'battle', scope: 'N5', answered: 6, correct: 5 } });
    assert.equal(battle.status, 201, JSON.stringify(battle.data));
    assert.equal((await call('POST', '/activity/practice', { as: L, body: { kind: 'battle', scope: 'N5', answered: 2, correct: 2 } })).status, 400, 'too short to count');
    console.log('PASS: sign-in required; empty collection; no catch before a starter; bad starters refused; starter gives the vowels plus its kana; one starter only; only basic hiragana catchable; a new catch pays XP, a repeat changes nothing; per-learner collections; battles recorded as practice. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'kana-wilds-api.cjs'), head + tail);
console.log('written');
