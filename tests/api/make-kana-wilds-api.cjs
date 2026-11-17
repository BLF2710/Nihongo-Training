// Builds kana-wilds-api.cjs: the review-api harness (temp copies of every table, rolled back) plus the Kana Wilds
// collection (starter choice, catches) and battles recorded as practice sessions.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Kana Wilds collection API")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/kana-wilds', src('routes/kana-wilds.routes.ts').default); app.use('/api/activity', src('routes/activity.routes.ts').default); app.use('/api/quiz', src('routes/quiz.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {")
  // The kana's answers are read off the hiragana catalog, so the test needs its rows (the other temp tables start empty).
  .replace("await client.query('INSERT INTO pg_temp.achievements SELECT * FROM public.achievements');",
    "await client.query('INSERT INTO pg_temp.achievements SELECT * FROM public.achievements'); await client.query('INSERT INTO pg_temp.hiraganas SELECT * FROM public.hiraganas');");
for (const needle of ['routes/kana-wilds.routes.ts', 'routes/activity.routes.ts', 'routes/quiz.routes.ts', "'ben']", 'pg_temp.hiraganas SELECT']) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const VOWELS = [1, 2, 3, 4, 5], KA = 6, SA = 11, KI = 7, N = 46, GA = 47, GI = 48, DA = 57, ZA = 52;
    // The small-kana combinations き and ぎ evolve into: きゃ きゅ きょ (72–74), ぎゃ ぎゅ ぎょ (93–95).
    const KYA = [72, 73, 74], GYA = [93, 94, 95];
    const collection = (as = L) => call('GET', '/kana-wilds/collection', { as });
    const starter = (body, as = L) => call('POST', '/kana-wilds/starter', { as, body });
    const caught = (kanaId, as = L) => call('POST', '/kana-wilds/catches', { as, body: { kanaId } });
    const fresh = ids => ids.map(kanaId => ({ kanaId, correct: 0, wrong: 0 }));
    const answerKana = (kanaId, answer, as = L) => call('POST', '/quiz/answer', { as, body: { type: 'hiragana', kanaId, answer, submissionId: require('node:crypto').randomUUID() } });
    const won = (challenger, as = L) => call('POST', '/kana-wilds/challengers/' + challenger + '/wins', { as, body: {} });
    for (const [method, url] of [['GET', '/kana-wilds/collection'], ['POST', '/kana-wilds/starter'], ['POST', '/kana-wilds/catches'], ['POST', '/kana-wilds/challengers/chun/wins']])
      assert.equal((await call(method, url, method === 'GET' ? {} : { body: {} })).status, 401, url + ' needs sign-in');
    assert.deepEqual((await collection()).data, { starter: null, kanaIds: [], answers: [], beatenChallengers: [] }, 'a new player has nothing yet');
    const early = await caught(KI); assert.equal(early.status, 409, 'no catching before a starter'); assert.match(early.data.message, /starter/);
    for (const bad of [{ starter: 'na' }, { starter: 'KA' }, {}, { starter: ['ka'] }]) assert.equal((await starter(bad)).status, 400, JSON.stringify(bad));
    const chosen = await starter({ starter: 'ka' });
    assert.equal(chosen.status, 201); assert.deepEqual(chosen.data, { starter: 'ka', kanaIds: [...VOWELS, KA], answers: fresh([...VOWELS, KA, GA]), beatenChallengers: [] }, 'the vowels, the starter and what it evolves into, not yet answered');
    const twice = await starter({ starter: 'sa' }); assert.equal(twice.status, 409, 'one starter only');
    assert.deepEqual((await collection()).data, { starter: 'ka', kanaIds: [...VOWELS, KA], answers: fresh([...VOWELS, KA, GA]), beatenChallengers: [] });
    for (const bad of [0, GA, 1.5, '7', null]) assert.equal((await caught(bad)).status, 400, 'only the 46 basic hiragana: ' + bad);
    const first = await caught(KI);
    assert.equal(first.status, 200); assert.equal(first.data.isNew, true); assert.deepEqual(first.data.kanaIds, [...VOWELS, KA, KI]);
    assert.ok(first.data.reward && first.data.reward.xpEarned > 0, 'a new catch pays XP');
    const again = await caught(KI);
    assert.deepEqual([again.data.isNew, again.data.reward, again.data.kanaIds], [false, null, [...VOWELS, KA, KI]], 'catching it again changes nothing');
    // Rows held back until a challenger is beaten: さ and た wait on Chun, the rest of the table (ん too) on Tama.
    const heldSa = await caught(SA); assert.equal(heldSa.status, 409, 'さ waits on Chun'); assert.match(heldSa.data.message, /beat Chun/);
    const heldN = await caught(N); assert.equal(heldN.status, 409, 'ん waits on Tama'); assert.match(heldN.data.message, /beat Tama/);
    assert.deepEqual((await collection()).data.kanaIds, [...VOWELS, KA, KI], 'a held-back kana is not added');
    // Collections are per learner.
    assert.deepEqual((await collection('ben')).data, { starter: null, kanaIds: [], answers: [], beatenChallengers: [] });
    assert.deepEqual((await starter({ starter: 'sa' }, 'ben')).data, { starter: 'sa', kanaIds: [...VOWELS, SA], answers: fresh([...VOWELS, SA, ZA]), beatenChallengers: [] });
    assert.deepEqual((await collection()).data.kanaIds, [...VOWELS, KA, KI]);
    // Each collected kana's answers, from anywhere on the site (here the kana quiz, as a battle's defence sends them).
    for (const answer of ['ka', 'ka', 'ka', 'ki']) assert.equal((await answerKana(KA, answer)).status, 200, 'answered ' + answer);
    assert.equal((await answerKana(KI, 'ki')).status, 200);
    assert.equal((await answerKana(GA, 'ga')).status, 200, 'が is answered: it is what か evolves into');
    assert.equal((await answerKana(DA, 'da')).status, 200, 'だ is answered, but た is not collected');
    const answered = (await collection()).data.answers;
    assert.deepEqual(answered.find(row => row.kanaId === KA), { kanaId: KA, correct: 3, wrong: 1 }, 'か: three right, one wrong');
    assert.deepEqual(answered.find(row => row.kanaId === KI), { kanaId: KI, correct: 1, wrong: 0 });
    assert.deepEqual(answered.find(row => row.kanaId === GA), { kanaId: GA, correct: 1, wrong: 0 }, 'an evolution of a collected kana has its answers, for its own level');
    assert.deepEqual(answered.map(row => row.kanaId).sort((a, b) => a - b), [...VOWELS, KA, KI, GA, GI, ...KYA, ...GYA], 'only collected kana and what they evolve into, small kana too, by way of ぎ (not だ)');
    assert.deepEqual((await collection('ben')).data.answers, fresh([...VOWELS, SA, ZA]), 'answers are per learner');
    assert.deepEqual((await caught(KI)).data.answers.find(row => row.kanaId === KA), { kanaId: KA, correct: 3, wrong: 1 }, 'a catch returns the answers too');
    // Challengers: a win is recorded once (XP the first time), per learner, and only for a known challenger.
    assert.equal((await won('chun', 'admin')).status, 409, 'no challenge before a starter');
    assert.equal((await won('nobody')).status, 404, 'unknown challenger');
    const beat = await won('chun');
    assert.equal(beat.status, 200); assert.deepEqual([beat.data.isNew, beat.data.beatenChallengers], [true, ['chun']]);
    assert.ok(beat.data.reward && beat.data.reward.xpEarned > 0, 'the first win pays XP');
    const beatAgain = await won('chun');
    assert.deepEqual([beatAgain.data.isNew, beatAgain.data.reward, beatAgain.data.beatenChallengers], [false, null, ['chun']], 'winning again changes nothing');
    assert.deepEqual((await collection()).data.beatenChallengers, ['chun']);
    assert.deepEqual((await collection('ben')).data.beatenChallengers, [], 'wins are per learner');
    assert.equal((await caught(SA)).data.isNew, true, 'beating Chun brings さ into the wilds');
    assert.equal((await caught(N)).status, 409, 'ん still waits on Tama');
    assert.equal((await won('tama')).data.isNew, true, 'tama is a real challenger');
    assert.equal((await caught(N)).data.isNew, true, 'beating Tama brings ん into the wilds');
    const ponWin = await won('pon');
    assert.equal(ponWin.data.isNew, true, 'pon is a real challenger');
    assert.ok(!ponWin.data.reward.achievements.includes('sharp_eyes'), 'Sharp Eyes is a skill in the game, not an achievement');
    assert.equal((await won('sensei')).data.isNew, true, 'sensei is a real challenger');
    assert.equal((await won('zen')).data.isNew, true, 'zen is a real challenger');
    assert.equal((await won('kurama')).data.isNew, true, 'kurama is a real challenger');
    assert.deepEqual([...(await collection()).data.beatenChallengers].sort(), ['chun', 'kurama', 'pon', 'sensei', 'tama', 'zen']);
    // A finished battle is recorded as practice (graded in the browser, like the other games).
    const battle = await call('POST', '/activity/practice', { as: L, body: { kind: 'battle', scope: 'N5', answered: 6, correct: 5 } });
    assert.equal(battle.status, 201, JSON.stringify(battle.data));
    assert.equal((await call('POST', '/activity/practice', { as: L, body: { kind: 'battle', scope: 'N5', answered: 2, correct: 2 } })).status, 400, 'too short to count');
    console.log('PASS: sign-in required; empty collection; no catch before a starter; bad starters refused; starter gives the vowels plus its kana; one starter only; only basic hiragana catchable; the さ/た rows held back until Chun is beaten and the rest (ん too) until Tama; a new catch pays XP, a repeat changes nothing; per-learner collections; each collected kana’s right and wrong answers (from the quiz), only for collected kana and what they evolve into (voiced and small kana), per learner; challenger wins (Sensei, Zen and Kurama too) recorded once with XP, no Sharp Eyes achievement, per learner, known challengers only, after a starter; battles recorded as practice. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'kana-wilds-api.cjs'), head + tail);
console.log('written');
