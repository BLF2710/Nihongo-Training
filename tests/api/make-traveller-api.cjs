// Builds traveller-api.cjs: the review-api harness (temp copies of every table, rolled back) plus the learner's
// traveller look (GET and PUT /api/traveller/look).
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Traveller look API")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/traveller', src('routes/traveller.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/traveller.routes.ts', "'ben']"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const L = 'learner';
    const DEFAULT = { outfit: 'indigo', sash: 'red', skin: 'light', hair: 'black', hat: 'kasa', accessory: 'bundle' };
    const CHOSEN = { outfit: 'plum', sash: 'teal', skin: 'deep', hair: 'silver', hat: 'hachimaki', accessory: 'lantern' };
    const look = (as = L) => call('GET', '/traveller/look', { as });
    const dress = (body, as = L) => call('PUT', '/traveller/look', { as, body });
    for (const [method, url] of [['GET', '/traveller/look'], ['PUT', '/traveller/look']])
      assert.equal((await call(method, url, method === 'GET' ? {} : { body: CHOSEN })).status, 401, method + ' ' + url + ' needs sign-in');
    assert.deepEqual((await look()).data, DEFAULT, 'a new learner has the first look');
    const saved = await dress(CHOSEN);
    assert.equal(saved.status, 200, JSON.stringify(saved.data));
    assert.deepEqual(saved.data, CHOSEN);
    assert.deepEqual((await look()).data, CHOSEN, 'the look is kept');
    assert.deepEqual((await dress({ ...CHOSEN, hat: 'none' })).data.hat, 'none', 'a look can be changed again');
    assert.deepEqual((await look('ben')).data, DEFAULT, 'looks are per learner');
    for (const bad of [{ ...CHOSEN, outfit: 'rainbow' }, { ...CHOSEN, skin: undefined }, { ...CHOSEN, accessory: 7 }, []])
      assert.equal((await dress(bad)).status, 400, 'refused: ' + JSON.stringify(bad));
    assert.deepEqual((await look()).data.outfit, 'plum', 'a refused look changes nothing');
    console.log('PASS: sign-in required; a new learner has the first look; a chosen look saved, kept and changed again; per learner; unknown or missing choices refused without changing anything. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'traveller-api.cjs'), head + tail);
console.log('written');
