// Announcement audience: admin form, and what guests and learners see. The /site fixture behaves like the server:
// a "learners" announcement is only returned when the request carries a token.
//   node announce-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage(); const errors = [], saves = []; page.on('pageerror', e => errors.push(e.message));
    let settings = { registration_enabled: true, announcement: '', announcement_audience: 'everyone', updated_at: '2026-10-22T08:00:00.000Z' };
    let role = 'admin';
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
      const signedIn = Boolean(request.headers().authorization);
      if (p === '/site') return json({ registration_enabled: true, announcement: settings.announcement_audience === 'learners' && !signedIn ? '' : settings.announcement, disabled: [] });
      if (p === '/auth/login') return json({ token, user: { id: 1, username: role === 'admin' ? 'boss' : 'kai', email: 'x@example.com', role } });
      if (p === '/admin/access') return json({ id: 1, username: 'boss', role });
      if (p === '/admin/settings') { if (request.method() === 'PUT') { saves.push(request.postDataJSON()); settings = { ...settings, ...request.postDataJSON() }; } return json(settings); }
      if (p === '/admin/overview') return json({ users: { total: 1, active: 1, admins: 1 }, database: 'connected', databaseLatencyMs: 2, uptimeSeconds: 60, checkedAt: '2026-10-22T08:00:00.000Z', latestMigration: null });
      if (p === '/admin/analytics') return json({ generatedAt: '2026-10-22T08:00:00.000Z', learners: { total: 0, newLast30Days: 0, activeToday: 0, activeLast7Days: 0, activeLast30Days: 0 }, dailyActive: [], funnel: [], dropOffs: [], practice: [] });
      if (p === '/profile/me') return json({ username: 'kai', display_name: 'Kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      if (p === '/units') return json({ units: [] });
      if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0 });
      return json({});
    });
    const banner = text => page.getByRole('status').filter({ hasText: text });
    const signIn = async as => {
      role = as; await page.goto(base + '/login');
      await page.getByLabel('Email or username').fill(as); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click();
    };

    // ---- Admin posts a learners-only announcement.
    await signIn('admin'); await page.waitForURL('**/admin');
    await page.goto(base + '/admin/system/settings'); await page.getByRole('group', { name: 'Who sees the announcement' }).waitFor();
    assert.equal(await page.getByRole('radio', { name: /^Everyone/ }).isChecked(), true, 'everyone by default');
    await page.getByRole('textbox', { name: /^Announcement/ }).fill('New N4 units are out!');
    await page.getByRole('radio', { name: /Signed-in learners only/ }).check();
    await page.screenshot({ path: shots + '/announce-admin.png' });
    await page.getByRole('button', { name: 'Save settings' }).click(); await page.getByText('Settings saved.').waitFor();
    const { registration_enabled, announcement, announcement_audience } = saves.at(-1);
    assert.deepEqual({ registration_enabled, announcement, announcement_audience }, { registration_enabled: true, announcement: 'New N4 units are out!', announcement_audience: 'learners' });
    assert.equal(await banner('New N4 units').count(), 0, 'never shown inside the admin area');

    // ---- Logging out: the sign-in page does not show it.
    await page.getByRole('button', { name: 'Log out' }).click(); await page.waitForURL('**/login'); await page.waitForTimeout(400);
    assert.equal(await banner('New N4 units').count(), 0, 'not on the sign-in page');
    await page.goto(base + '/register'); await page.waitForTimeout(400); assert.equal(await banner('New N4 units').count(), 0, 'not on registration');
    await page.goto(base + '/'); await page.waitForTimeout(400); assert.equal(await banner('New N4 units').count(), 0, 'not on the guest landing page');

    // ---- A learner sees it after signing in, and it goes away on logout even on the same page.
    await signIn('learner'); await banner('New N4 units are out!').waitFor();
    await page.screenshot({ path: shots + '/announce-learner.png' });
    await page.goto(base + '/'); await banner('New N4 units are out!').waitFor();
    await page.getByRole('button', { name: 'Logout' }).click(); await page.waitForTimeout(500);
    assert.equal(await banner('New N4 units').count(), 0, 'gone after logging out on the same address');

    // ---- "Everyone" reaches the sign-in page.
    settings = { ...settings, announcement: 'Maintenance tonight 22:00', announcement_audience: 'everyone' };
    await page.goto(base + '/login'); await banner('Maintenance tonight 22:00').waitFor();
    assert.deepEqual(errors, []);
    console.log('PASS: admin form defaults to Everyone and saves "Signed-in learners only"; never shown in the admin area; after logging out the sign-in, registration and guest pages do not show a learners-only announcement; a learner sees it after signing in; it disappears on logout even without changing address; an "Everyone" announcement shows on the sign-in page; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
