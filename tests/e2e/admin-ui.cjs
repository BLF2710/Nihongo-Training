// Admin area + learner-side site settings, against fixture APIs only.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2], shots = process.argv[3];
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage();
    const errors = [], writes = [];
    page.on('pageerror', e => errors.push(e.message));
    let role = 'admin';
    let site = { registration_enabled: true, announcement: '', disabled: [] };
    const users = [
      { id: 1, username: 'kai', email: 'kai@example.com', role: 'admin', status: 'active', created_at: '2026-01-01T00:00:00Z', last_login_at: '2026-10-01T00:00:00Z' },
      { id: 2, username: 'mika', email: 'mika@example.com', role: 'learner', status: 'active', created_at: '2026-02-01T00:00:00Z', last_login_at: null },
    ];
    const content = [
      { key: 'lesson:japanese-n5-unit-1-hello', title: 'How to Say Hello', category: 'Lessons', paths: ['/lessons/japanese/n5-unit-1-hello'], source: 'Course source files', enabled: true },
      { key: 'vocabulary', title: 'Japanese vocabulary & flashcards', category: 'Vocabulary', paths: ['/vocabulary'], source: 'Existing course vocabulary', enabled: true },
      { key: 'kanji', title: 'Kanji learning & flashcards', category: 'Kana & Kanji', paths: ['/learn/kanji'], source: 'Existing Kanji catalog', enabled: true },
      { key: 'english-games', title: 'English word match & scramble', category: 'Games', paths: ['/arcade', '/games/english'], source: 'Existing English arcade', enabled: true },
      { key: 'assessment:japanese-n5-unit-1', title: 'Unit 1: Greetings & Introductions', category: 'Quizzes', paths: ['/quizzes/japanese-n5-unit-1'], source: 'Assessment source files', enabled: true },
    ];
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname.replace('/api', ''), body = request.postDataJSON();
      if (request.method() !== 'GET') writes.push({ method: request.method(), path, body });
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (path === '/auth/login') return json({ token, user: { id: 1, username: 'kai', email: 'kai@example.com', role } });
      if (path === '/site') return json(site);
      if (path === '/admin/access') return json({ id: 1, username: 'kai', role });
      if (path.startsWith('/admin/') && role !== 'admin') return json({ message: 'Administrator access is required.' }, 403);
      if (path === '/admin/analytics') return json({ generatedAt: '2026-10-21T09:00:00.000Z', learners: { total: 1, newLast30Days: 1, activeToday: 0, activeLast7Days: 1, activeLast30Days: 1 }, dailyActive: Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(8 + i).padStart(2, '0')}`, learners: i === 5 ? 1 : 0 })), funnel: [], dropOffs: [], practice: [] });
      if (path === '/admin/overview') return json({ users: { total: 2, active: 2, admins: 1 }, database: 'connected', databaseLatencyMs: 4, uptimeSeconds: 3720, checkedAt: '2026-10-08T09:00:00.000Z', latestMigration: { name: '007_admin_controls.sql', applied_at: '2026-10-08T08:00:00Z' } });
      if (path === '/admin/users') { const q = (url.searchParams.get('search') || '').toLowerCase(); const found = users.filter(u => u.username.includes(q) || u.email.includes(q)); return json({ users: found, page: 1, total: found.length, pageSize: 20 }); }
      if (/^\/admin\/users\/\d+$/.test(path)) { Object.assign(users.find(u => u.id === Number(path.split('/').pop())), body); return json(body); }
      if (path === '/admin/settings') { if (request.method() === 'PUT') site = { ...site, ...body }; return json({ registration_enabled: site.registration_enabled, announcement: site.announcement, updated_at: '2026-10-08T09:00:00.000Z' }); }
      if (path === '/admin/content') return json({ items: content });
      if (path.startsWith('/admin/content/')) { const item = content.find(c => c.key === decodeURIComponent(path.slice('/admin/content/'.length))); item.enabled = body.enabled; site = { ...site, disabled: content.filter(c => !c.enabled).map(({ key, title, paths }) => ({ key, title, paths })) }; return json({ key: item.key, enabled: item.enabled }); }
      if (path === '/units') return json({ units: [] });
      if (path === '/profile/me') return json({ display_name: 'Kai', username: 'kai', xp: 0, level: 1, rank: 'Beginner', current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { progressPercent: 0, nextLevelXp: 100 } });
      if (path === '/kanji/progress') return json({ progress: [] });
      return json({});
    });
    const signIn = async () => { await page.goto(base + '/login'); await page.evaluate(() => localStorage.clear()); await page.goto(base + '/login'); await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click(); };
    const heading = name => page.getByRole('heading', { name, exact: true });

    // Not signed in: the admin area is behind the normal route guard.
    await page.goto(base + '/admin'); await page.waitForURL('**/login');

    // A learner who signs in gets no Admin link and is refused by the page itself.
    role = 'learner';
    await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click();
    await heading('Your path').waitFor();
    assert.equal(await page.getByRole('button', { name: /Admin$/ }).count(), 0);
    await page.goto(base + '/admin'); await heading('Administrator access required').waitFor();
    await page.getByRole('link', { name: 'Return to learning' }).click(); await heading('Your path').waitFor();

    // An administrator gets the link, the dashboard and the sidebar.
    role = 'admin';
    await page.evaluate(() => localStorage.clear()); await page.goto(base + '/login');
    await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click();
    await heading('Overview').waitFor(); assert.equal(new URL(page.url()).pathname, '/admin', 'admin login lands on the admin area');
    // Learner pages send an administrator back to the admin area.
    for (const path of ['/', '/vocabulary', '/profile', '/lessons', '/practice?type=hiragana', '/statistics']) { await page.goto(base + path); await heading('Overview').waitFor(); assert.equal(new URL(page.url()).pathname, '/admin', path); } await page.getByText('Total users').waitFor();
    const nav = page.getByRole('navigation', { name: 'Admin navigation' });
    assert.deepEqual(await nav.getByRole('link').allTextContents(), ['Overview', 'Users & roles', 'Manage content', 'Question bank', 'Support inbox', 'Reports', 'Lesson editor', 'Audit log', 'System status', 'System settings']);
    assert.equal(await page.getByRole('navigation', { name: 'Page navigation' }).count(), 0, 'learner navbar must not render inside admin');
    await page.screenshot({ path: shots + '/admin-overview.png' });

    // Manage users: search, edit, save.
    await nav.getByRole('link', { name: 'Users & roles' }).click(); await heading('Users & roles').waitFor(); await heading('Role permissions').waitFor();
    await page.getByLabel('Search users').fill('mika'); await page.getByRole('button', { name: 'Search', exact: true }).click();
    await page.getByRole('button', { name: 'Edit mika' }).click();
    await page.getByLabel('Account status').selectOption('suspended'); await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText('User updated.').waitFor();
    assert.deepEqual(writes.at(-1), { method: 'PATCH', path: '/admin/users/2', body: { username: 'mika', email: 'mika@example.com', role: 'learner', status: 'suspended' } });
    await page.screenshot({ path: shots + '/admin-users.png' });

    // Roles are edited on the same page; your own role and status are locked. The old roles address leads here.
    await page.goto(base + '/admin/system/roles'); await heading('Users & roles').waitFor(); assert.equal(new URL(page.url()).pathname, '/admin/users');
    await page.getByRole('button', { name: 'Edit kai' }).click();
    assert.ok(await page.getByLabel('Role').isDisabled()); assert.ok(await page.getByLabel('Account status').isDisabled()); assert.equal(await page.getByLabel('Username').count(), 1);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await page.getByRole('button', { name: 'Edit mika' }).click(); await page.getByLabel('Role').selectOption('admin'); await page.getByRole('button', { name: 'Save changes' }).click();
    await page.getByText('User updated.').waitFor(); assert.equal(writes.at(-1).body.role, 'admin');

    // System status and settings.
    await nav.getByRole('link', { name: 'System status' }).click(); await heading('System status').first().waitFor();
    await page.getByText('007_admin_controls.sql').waitFor(); await page.getByText('1h 2m').waitFor();
    await nav.getByRole('link', { name: 'System settings' }).click(); await heading('System settings').waitFor();
    await page.getByRole('textbox', { name: /^Announcement/ }).fill('Maintenance tonight at 22:00'); await page.getByLabel(/Allow new registrations/).uncheck();
    await page.getByRole('button', { name: 'Save settings' }).click(); await page.getByText('Settings saved.').waitFor();
    assert.deepEqual(writes.at(-1).body, { registration_enabled: false, announcement: 'Maintenance tonight at 22:00', updated_at: '2026-10-08T09:00:00.000Z' });
    assert.equal(await page.getByText('📣').count(), 0, 'announcement is for learner pages, not the admin area');

    // Manage content: filter and disable.
    await nav.getByRole('link', { name: 'Manage content' }).click(); await heading('Manage content').waitFor();
    assert.equal(await page.locator('article').count(), 5);
    await page.getByLabel('Category').selectOption('Games'); assert.equal(await page.locator('article').count(), 1);
    await page.getByLabel('Category').selectOption('All');
    for (const title of ['Japanese vocabulary & flashcards', 'Kanji learning & flashcards', 'How to Say Hello']) {
      await page.locator('article').filter({ hasText: title }).getByRole('button', { name: 'Disable' }).click();
      await page.getByText(`${title} is now unavailable.`).waitFor();
    }
    await page.screenshot({ path: shots + '/admin-content.png', fullPage: true });

    // Learner side: banner everywhere, disabled pages blocked, the rest untouched.
    assert.equal(await page.getByRole('link', { name: 'Return to learning' }).count(), 0);
    assert.equal(await page.getByRole('link', { name: /Open learner page/ }).count(), 0);
    await page.getByRole('button', { name: 'Log out' }).click(); await page.waitForURL('**/login');
    assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);
    role = 'learner'; await signIn(); await heading('Your path').waitFor();
    await page.getByText('📣 Maintenance tonight at 22:00').waitFor();
    for (const [path, title] of [['/vocabulary', 'Japanese vocabulary & flashcards'], ['/learn/kanji', 'Kanji learning & flashcards'], ['/learn/kanji/kanji-65e5', 'Kanji learning & flashcards'], ['/lessons/japanese/n5-unit-1-hello', 'How to Say Hello']]) {
      await page.goto(base + path); await heading('Temporarily unavailable').waitFor(); await page.getByText(`${title} has been switched off`).waitFor();
    }
    await page.screenshot({ path: shots + '/learner-unavailable.png' });
    await page.goto(base + '/learn/kanji/practice'); await page.waitForTimeout(600); assert.equal(await heading('Temporarily unavailable').count(), 0, 'Kanji practice is managed separately');
    await page.goto(base + '/grammar'); await heading('Grammar').waitFor(); assert.equal(await heading('Temporarily unavailable').count(), 0);
    await page.getByRole('link', { name: 'Return to dashboard' }).count();

    // Re-enable restores the page; unknown admin path; mobile layout has no horizontal overflow.
    role = 'admin'; await signIn(); await heading('Overview').waitFor();
    await page.goto(base + '/admin/content');
    await page.locator('article').filter({ hasText: 'Japanese vocabulary & flashcards' }).getByRole('button', { name: 'Enable' }).click(); await page.getByText('is now available.').waitFor();
    role = 'learner'; await signIn(); await heading('Your path').waitFor();
    await page.goto(base + '/vocabulary'); await heading('Vocabulary').waitFor();
    // A demoted administrator with a stale stored role is not trapped in a redirect loop.
    await page.evaluate(() => localStorage.setItem('user_role', 'admin')); await page.goto(base + '/');
    await heading('Administrator access required').waitFor();
    await page.getByRole('link', { name: 'Return to learning' }).click(); await heading('Your path').waitFor();
    role = 'admin'; await signIn(); await heading('Overview').waitFor();
    await page.goto(base + '/admin/nope'); await heading('Page not found').waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ['/admin', '/admin/users', '/admin/content', '/admin/system/settings']) {
      await page.goto(base + path); await page.waitForTimeout(500);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} overflows on mobile`);
    }
    await page.goto(base + '/admin'); await page.getByRole('button', { name: 'Toggle admin navigation' }).click(); await page.waitForTimeout(300);
    await page.screenshot({ path: shots + '/admin-mobile.png' });
    // Logging out removes the Admin link's stored role.
    await page.setViewportSize({ width: 1366, height: 900 }); await page.goto(base + '/admin');
    await page.getByRole('button', { name: 'Log out' }).click(); await page.waitForURL('**/login');
    assert.equal(await page.evaluate(() => localStorage.getItem('user_role')), null);
    assert.deepEqual(errors, []);
    console.log('PASS: route guard, learner refusal, admin login lands on /admin, learner pages redirect admins, stale-role recovery, dashboard, six sidebar sections, users and roles on one page, status, settings, content toggles, learner banner + unavailable pages, re-enable, mobile overflow, logout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 900)); process.exitCode = 1; });
