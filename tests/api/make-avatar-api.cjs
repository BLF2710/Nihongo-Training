// Builds avatar-api.cjs: the review-api harness plus profile pictures (upload, re-encode, serve, replace, remove).
const fs = require('node:fs'), path = require('node:path');
const original = fs.readFileSync(path.join(__dirname, 'review-api.cjs'), 'utf8');
let head = original.slice(0, original.indexOf('    // ---- learner review'));
head = head.replace("// Unit review + question bank API", "// Profile pictures")
  .replace("app.use('/api/review', src('routes/review.routes.ts').default);",
    "app.use('/api/review', src('routes/review.routes.ts').default); app.use('/api/avatars', src('routes/avatar.routes.ts').default); app.use('/api/profile', src('routes/profile.routes.ts').default); app.use('/api', src('routes/friend.routes.ts').default);")
  .replace("process, Buffer, setTimeout, require:", "process, Buffer, setTimeout, setInterval, clearInterval, require:")
  .replace("for (const name of ['admin', 'learner']) {", "for (const name of ['admin', 'learner', 'ben']) {");
for (const needle of ['routes/avatar.routes.ts', "'learner', 'ben'"]) if (!head.includes(needle)) throw new Error('harness changed: ' + needle);

const tail = String.raw`    const sharp = require(path.join(API, 'node_modules/sharp'));
    const user = name => name + '_x1';
    const upload = (as, body, type = 'image/jpeg') => fetch(base + '/profile/me/avatar', { method: 'PUT', headers: { ...(as ? { Authorization: 'Bearer ' + tokens[as] } : {}), 'Content-Type': type }, body })
      .then(async r => ({ status: r.status, data: await r.json() }));
    const picture = url => fetch(base + url);
    // A large photo with camera details and a GPS position, as a phone would send it.
    const photo = await sharp({ create: { width: 2000, height: 1500, channels: 3, background: '#3a7' } })
      .composite([{ input: Buffer.from('<svg width="2000" height="1500"><circle cx="1000" cy="750" r="600" fill="#e33"/></svg>') }])
      .jpeg({ quality: 95 }).withExif({ IFD0: { Make: 'PhoneMaker', Model: 'X1' }, IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '35/1 41/1 0/1' } }).toBuffer();

    // ---- validation
    assert.equal((await upload(null, photo)).status, 401, 'sign-in required');
    assert.equal((await upload('learner', Buffer.from('hello'), 'text/plain')).status, 400, 'only image types');
    const garbage = await upload('learner', Buffer.from('not really a png'), 'image/png');
    assert.equal(garbage.status, 400); assert.match(garbage.data.message, /isn't an image/);
    const huge = await upload('learner', Buffer.alloc(4 * 1024 * 1024, 1));
    assert.equal(huge.status, 413); assert.match(huge.data.message, /too large/);

    // ---- upload: re-encoded small, metadata gone, served without sign-in, cached for good
    const first = await upload('learner', photo);
    assert.equal(first.status, 200, JSON.stringify(first.data)); assert.match(first.data.avatar, /^\/avatars\/[0-9a-f]{32}\.webp$/);
    assert.ok(photo.length > 30_000 && first.data.bytes < 10_000, 'a ' + photo.length + '-byte photo is stored in ' + first.data.bytes + ' bytes');
    const served = await picture(first.data.avatar);
    assert.equal(served.status, 200); assert.equal(served.headers.get('content-type'), 'image/webp');
    assert.match(served.headers.get('cache-control'), /immutable/); assert.equal(served.headers.get('cross-origin-resource-policy'), 'cross-origin');
    const meta = await sharp(Buffer.from(await served.arrayBuffer())).metadata();
    assert.deepEqual([meta.format, meta.width, meta.height, meta.exif], ['webp', 128, 128, undefined], 'a 128×128 WebP without camera or GPS data');
    assert.equal((await call('GET', '/profile/me', { as: 'learner' })).data.avatar, first.data.avatar);

    // ---- shown with the name: public profile and friends list
    await call('POST', '/friends/requests', { as: 'ben', body: { username: user('learner') } });
    assert.equal((await call('GET', '/people/' + user('learner'), { as: 'ben' })).data.avatar, first.data.avatar, 'on the public profile, even when progress is private');
    assert.equal((await call('GET', '/friends', { as: 'ben' })).data.outgoing[0].avatar, first.data.avatar);
    assert.equal((await call('GET', '/friends', { as: 'learner' })).data.incoming[0].avatar, null, 'no picture: null');
    assert.equal((await call('GET', '/friends/leaderboard', { as: 'learner' })).data.entries.find(e => e.self).avatar, first.data.avatar, 'on the leaderboard');

    // ---- replacing keeps one picture; the old address stops working
    const png = await sharp({ create: { width: 300, height: 600, channels: 4, background: '#00f8' } }).png().toBuffer();
    const second = await upload('learner', png, 'image/png');
    assert.equal(second.status, 200); assert.notEqual(second.data.avatar, first.data.avatar);
    assert.equal((await picture(first.data.avatar)).status, 404);
    assert.equal((await client.query('SELECT COUNT(*)::int AS n FROM user_avatars')).rows[0].n, 1, 'one stored picture per learner');

    // ---- addresses that aren't a picture key
    for (const bad of ['/avatars/abc.webp', '/avatars/' + 'g'.repeat(32) + '.webp', '/avatars/..%2F..%2Fetc']) assert.equal((await picture(bad)).status, 404, bad);

    // ---- a suspended account's picture is not served; removing deletes it
    await client.query("UPDATE users SET status = 'suspended' WHERE username = $1", [user('learner')]);
    assert.equal((await picture(second.data.avatar)).status, 404);
    await client.query("UPDATE users SET status = 'active' WHERE username = $1", [user('learner')]);
    assert.deepEqual((await call('DELETE', '/profile/me/avatar', { as: 'learner' })).data, { avatar: null });
    assert.equal((await picture(second.data.avatar)).status, 404);
    assert.equal((await client.query('SELECT COUNT(*)::int AS n FROM user_avatars')).rows[0].n, 0);
    assert.equal((await call('GET', '/profile/me', { as: 'learner' })).data.avatar, null);

    console.log('PASS: sign-in and image types required, unreadable and oversized uploads refused; a ' + Math.round(photo.length / 1024) + ' KB photo stored as a ' + first.data.bytes + '-byte 128×128 WebP without EXIF/GPS, served without sign-in with long caching; shown on the public profile, friends list and leaderboard; one picture per learner, old address 404 after replacing; bad addresses 404; suspended accounts hidden; remove deletes it');
  } finally { await queue.catch(() => {}); await client.query('ROLLBACK').catch(() => {}); client.release(); await new Promise(r => server ? (server.closeAllConnections?.(), server.close(r)) : r()); await pool.end(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
`;
fs.mkdirSync(path.join(__dirname, 'generated'), { recursive: true }); fs.writeFileSync(path.join(__dirname, 'generated', 'avatar-api.cjs'), head + tail);
console.log('written');
