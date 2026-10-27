// Profile pictures: upload from Settings (shrunk in the browser first), shown on the profile and friends list,
// unreadable files explained, remove. Against fixture APIs.
//   node avatar-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
// A real PNG, drawn by the browser itself (a 600×400 photo-sized image).
let PNG;
const KEY = 'a'.repeat(32);

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); }, token);
    let avatar = null; const uploads = []; let deletes = 0;
    const me = () => ({ username: 'kai', display_name: 'Kai', avatar, bio: '', learning_language: 'Japanese', native_language: null, learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 0, level: 1, rank: 'Beginner', lessons_completed: 0, current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 100, progressPercent: 0 }, email: 'kai@example.com', sign_in: { password: true, google: null } });
    await context.route('http://localhost:5000/api/**', async route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), method = request.method(), json = (data, status = 200) => route.fulfill({ status, json: data });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/profile/me') return json(me());
      if (p === '/profile/me/avatar' && method === 'PUT') { uploads.push({ type: request.headers()['content-type'], bytes: request.postDataBuffer()?.length ?? 0 }); avatar = `/avatars/${KEY}.webp`; return json({ avatar, bytes: 600 }); }
      if (p === '/profile/me/avatar' && method === 'DELETE') { deletes++; avatar = null; return json({ avatar: null }); }
      if (p.startsWith('/avatars/')) return route.fulfill({ status: 200, contentType: 'image/png', body: PNG });
      if (p === '/friends/leaderboard') return json({ period: { from: '2026-10-20T00:00:00Z', to: '2026-10-27T00:00:00Z' }, entries: [{ username: 'kai', displayName: 'Kai', avatar, self: true, weeklyXp: 50, weeklyLessons: 1, currentStreak: 1, activeToday: true }, { username: 'ren', displayName: 'Ren', avatar: `/avatars/${'b'.repeat(32)}.webp`, self: false, weeklyXp: 0, weeklyLessons: 0, currentStreak: 0, activeToday: false }], hidden: 0 });
      if (p === '/friends') return json({ friends: [{ username: 'ren', displayName: 'Ren', avatar: `/avatars/${'b'.repeat(32)}.webp`, since: '2026-10-01T00:00:00Z', progress: null }], incoming: [], outgoing: [] });
      return json({});
    });
    const page = await context.newPage();
    PNG = Buffer.from((await page.evaluate(() => { const canvas = Object.assign(document.createElement('canvas'), { width: 600, height: 400 }); const g = canvas.getContext('2d'); g.fillStyle = '#3a7'; g.fillRect(0, 0, 600, 400); g.fillStyle = '#e33'; g.beginPath(); g.arc(300, 200, 150, 0, 7); g.fill(); return canvas.toDataURL('image/png'); })).split(',')[1], 'base64');
    const errors = []; page.on('pageerror', error => errors.push(error.message));

    await page.goto(base + '/settings/profile');
    await page.getByText('Upload picture').waitFor();
    // An unreadable file is explained, and nothing is uploaded.
    await page.locator('input[type=file]').setInputFiles({ name: 'notes.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
    await page.getByText("That file isn't an image this browser can read.").waitFor();
    assert.equal(uploads.length, 0);
    await page.locator('input[type=file]').setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: PNG });
    await page.getByText('Picture saved.').waitFor();
    assert.equal(uploads.length, 1); assert.match(uploads[0].type, /^image\/(webp|png)$/, 'shrunk in the browser to WebP (or PNG)');
    const img = page.getByRole('region', { name: 'Profile' }).locator('img').first();
    assert.equal(await img.getAttribute('src'), `http://localhost:5000/api/avatars/${KEY}.webp`);
    assert.ok(await img.evaluate(element => element.complete && element.naturalWidth > 0), 'the picture loads');
    await page.screenshot({ path: path.join(shots, 'avatar-settings.png') });

    // The header's account button and menu show it at once, without reloading.
    await page.getByRole('banner').locator(`img[src$="${KEY}.webp"]`).first().waitFor();
    await page.goto(base + '/profile');
    await page.locator(`main img[src$="${KEY}.webp"]`).waitFor();
    await page.goto(base + '/friends');
    await page.locator(`img[src$="${'b'.repeat(32)}.webp"]`).first().waitFor();
    assert.equal(await page.getByRole('region', { name: /Leaderboard/ }).locator(`img[src$="${KEY}.webp"]`).count(), 1, 'your picture on the leaderboard');

    await page.goto(base + '/settings/profile');
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByText('Picture removed.').waitFor();
    assert.equal(deletes, 1);
    await page.getByText('Upload picture').waitFor();
    assert.equal(await page.getByRole('banner').locator('img[src*="/avatars/"]').count(), 0, 'the header goes back to the initial');

    assert.deepEqual(errors, []);
    console.log('PASS: upload from Settings (shrunk to ' + uploads[0].type + ' before upload), unreadable file explained without uploading, picture on Settings, the header (at once), profile, friends list and leaderboard, remove (header back to the initial)');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
