// Admin Users page: the "Unlock all lessons" switch, against a fixture API.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2], shots = process.argv[3];
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('user_role', 'admin'); }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`);
    const users = [
      { id: 1, username: 'kai', email: 'kai@example.com', role: 'admin', status: 'active', all_lessons_unlocked: false, created_at: '2026-01-01T00:00:00Z', last_login_at: '2026-10-01T00:00:00Z' },
      { id: 2, username: 'mika', email: 'mika@example.com', role: 'learner', status: 'active', all_lessons_unlocked: false, created_at: '2026-02-01T00:00:00Z', last_login_at: null },
    ];
    const writes = []; let fail = false;
    await context.route('http://localhost:5000/api/**', route => { const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), body = request.postDataJSON();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (p === '/admin/access') return json({ id: 1, username: 'kai', role: 'admin' });
      if (p === '/admin/users') return json({ users, page: 1, total: users.length, pageSize: 20 });
      const match = p.match(/^\/admin\/users\/(\d+)\/lesson-access$/);
      if (match) { writes.push({ method: request.method(), path: p, body }); if (fail) { fail = false; return json({ message: 'Could not change lesson access.' }, 500); } const user = users.find(u => u.id === Number(match[1])); user.all_lessons_unlocked = body.unlocked; return json({ id: user.id, all_lessons_unlocked: user.all_lessons_unlocked }); }
      return json({}); });
    const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/admin/users'); await page.getByRole('heading', { name: 'Users & roles', exact: true }).waitFor();
    const row = name => page.locator('tbody tr').filter({ hasText: name });
    await row('mika').getByText('Normal', { exact: true }).waitFor();
    assert.deepEqual(await page.locator('thead th').allInnerTexts(), ['User', 'Role', 'Status', 'Lessons', 'Last login', 'Action']);
    fail = true; await page.getByRole('button', { name: 'Unlock all lessons for mika' }).click(); await page.getByRole('alert').filter({ hasText: 'Could not change lesson access.' }).waitFor(); await row('mika').getByText('Normal', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Unlock all lessons for mika' }).click();
    await page.getByRole('status').filter({ hasText: 'All lessons unlocked for mika. Their progress and XP are unchanged.' }).waitFor();
    assert.deepEqual(writes.at(-1), { method: 'PUT', path: '/admin/users/2/lesson-access', body: { unlocked: true } });
    await row('mika').getByText('All unlocked', { exact: true }).waitFor(); await row('kai').getByText('Normal', { exact: true }).waitFor();
    await page.screenshot({ path: shots + '/admin-unlock.png' });
    await page.getByRole('button', { name: 'Restore normal lessons for mika' }).click(); await page.getByRole('status').filter({ hasText: 'Normal lesson progression restored for mika.' }).waitFor();
    assert.deepEqual(writes.at(-1).body, { unlocked: false }); await row('mika').getByText('Normal', { exact: true }).waitFor();
    // The role-only view keeps to roles.
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(base + '/admin/users'); await row('mika').waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'users page overflows on mobile');
    assert.deepEqual(errors, []);
    console.log('PASS: Lessons column and switch on Manage users; failure shown and state kept; unlock and relock send the right request and update the badge; mobile.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1000)); process.exitCode = 1; });
