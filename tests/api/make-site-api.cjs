// Builds site-api.cjs: the review-api harness plus the announcement audience on /api/site and /api/admin/settings.
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Announcement audience")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/site', src('routes/site.routes.ts').default);")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'gone']) {");
for (const needle of ['site.routes', "'gone'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const settings = body => call('PUT', '/admin/settings', { as: 'admin', body });
    const site = as => call('GET', '/site', as === 'bad' ? { as: 'learner', badToken: true } : { as });
    const raw = async header => { const r = await fetch(base + '/site', { headers: header ? { Authorization: header } : {} }); return { status: r.status, cache: r.headers.get('cache-control'), data: await r.json() }; };
    // Default: an announcement reaches everyone, as before the setting existed (older clients leave it out).
    assert.equal((await settings({ registration_enabled: true, announcement: '  Maintenance tonight  ' })).data.announcement_audience, 'everyone');
    assert.equal((await raw()).data.announcement, 'Maintenance tonight', 'guests see an announcement for everyone');
    assert.equal((await site('learner')).data.announcement, 'Maintenance tonight');
    // Learners only: guests never receive the text.
    const saved = await settings({ registration_enabled: true, announcement: 'New N4 units are out!', announcement_audience: 'learners' });
    assert.deepEqual([saved.status, saved.data.announcement_audience], [200, 'learners']);
    assert.equal((await call('GET', '/admin/settings', { as: 'admin' })).data.announcement_audience, 'learners');
    const guest = await raw(); assert.deepEqual([guest.status, guest.data.announcement], [200, '']);
    assert.ok(!JSON.stringify(guest.data).includes('N4 units'), 'the text is not sent to guests at all');
    assert.ok(!('announcement_audience' in guest.data), 'the audience setting is not public');
    assert.match(guest.cache, /no-store/, 'answers differ by viewer, so they are not cached');
    assert.equal((await site('learner')).data.announcement, 'New N4 units are out!');
    assert.equal((await site('admin')).data.announcement, 'New N4 units are out!');
    // Broken, expired or suspended tokens count as guests and never fail the page.
    for (const header of ['Bearer nonsense', 'Basic abc', 'Bearer ' + tokens.learner + 'x']) { const r = await raw(header); assert.deepEqual([r.status, r.data.announcement], [200, ''], header.slice(0, 12)); }
    await client.query("UPDATE users SET status = 'suspended' WHERE username = 'gone_x1'");
    const suspended = await raw('Bearer ' + tokens.gone); assert.deepEqual([suspended.status, suspended.data.announcement], [200, '']);
    assert.ok(Array.isArray(guest.data.disabled) && 'registration_enabled' in guest.data, 'the rest of the site state is still public');
    // Validation, and admins only.
    assert.equal((await settings({ registration_enabled: true, announcement: 'x', announcement_audience: 'admins' })).status, 400);
    assert.equal((await call('PUT', '/admin/settings', { as: 'learner', body: { registration_enabled: true, announcement: 'x', announcement_audience: 'everyone' } })).status, 403);
    // Back to everyone.
    await settings({ registration_enabled: true, announcement: 'Hello all', announcement_audience: 'everyone' });
    assert.equal((await raw()).data.announcement, 'Hello all');
    console.log('PASS: announcements default to everyone (older clients unchanged); "learners only" is never sent to guests, broken/expired/suspended tokens or other headers (always 200), but reaches signed-in accounts; the audience is admin-only, validated and not public; /site is not cached; switching back to everyone works. Rolled back.');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? server.close(r) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'site-api.cjs'), head + tail);
console.log('written');
