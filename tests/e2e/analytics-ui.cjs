// Admin overview learning analytics, against a fixture /admin/analytics payload.
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.argv[2], shots = process.argv[3];
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.fixture`;
const days = Array.from({ length: 14 }, (_, i) => ({ day: new Date(Date.UTC(2026, 9, 8 + i)).toISOString().slice(0, 10), learners: [0, 1, 2, 0, 3, 5, 4, 2, 0, 1, 6, 3, 2, 4][i] }));
const unit = (level, number, started, finished, attempted, passed, averageBest) => ({ unitId: `japanese-${level.toLowerCase()}-unit-${number}`, level, number, title: `${level} unit ${number} title`, started, finishedLessons: finished, assessment: { attempted, passed, averageBest, passRate: attempted ? Math.round(passed * 100 / attempted) : null } });
const analytics = {
  generatedAt: '2026-10-21T09:00:00.000Z',
  learners: { total: 12, newLast30Days: 5, activeToday: 4, activeLast7Days: 8, activeLast30Days: 10 },
  dailyActive: days,
  funnel: [unit('N5', 1, 10, 7, 6, 4, 81), unit('N5', 2, 6, 3, 2, 1, 70), unit('N5', 3, 0, 0, 0, 0, 0), unit('N4', 1, 2, 0, 0, 0, 0)],
  dropOffs: [{ unitId: 'japanese-n5-unit-1', level: 'N5', unitNumber: 1, from: { id: 'a', title: 'How to Say Hello', completed: 10 }, to: { id: 'b', title: 'Numbers 1–10', completed: 7 }, lost: 3 }],
  practice: [{ kind: 'reading', sessions: 4, accuracy: 75 }, { kind: 'kana', sessions: 120, accuracy: 88 }, { kind: 'mock-exam', sessions: 2, accuracy: 64 }],
};
const empty = { ...analytics, learners: { total: 0, newLast30Days: 0, activeToday: 0, activeLast7Days: 0, activeLast30Days: 0 }, dailyActive: days.map(d => ({ ...d, learners: 0 })), funnel: analytics.funnel.map(f => ({ ...f, started: 0, finishedLessons: 0, assessment: { attempted: 0, passed: 0, averageBest: 0, passRate: null } })), dropOffs: [], practice: [] };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme });
      await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('user_role', 'admin'); localStorage.setItem('app_language', 'japanese'); }, token);
      let payload = analytics, failing = false;
      await context.route('http://localhost:5000/api/**', route => {
        const path = new URL(route.request().url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (path === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
        if (path === '/admin/access') return json({ id: 1, username: 'kai', role: 'admin' });
        if (path === '/admin/overview') return json({ users: { total: 13, active: 13, admins: 1 }, database: 'connected', databaseLatencyMs: 4, uptimeSeconds: 3720, checkedAt: '2026-10-21T09:00:00.000Z', latestMigration: { name: '013_practice_sessions.sql', applied_at: '2026-10-21T08:00:00.000Z' } });
        if (path === '/admin/status') return json({ checkedAt: '2026-10-21T09:00:00.000Z', api: { environment: 'development', nodeVersion: 'v22.14.0', uptimeSeconds: 3720 },
          database: { latencyMs: 4, sizeBytes: 12_000_000, appliedMigrations: 27, migrationFiles: 27, latestMigration: { name: '027_gamification.sql', applied_at: '2026-10-21T08:00:00.000Z' } },
          realtime: { sharedState: 'memory', connections: 1, learners: 1 },
          integrations: { email: { configured: true, detail: 'SMTP' }, google: { configured: false }, azureSpeech: { configured: false }, anthropic: { configured: false } } });
        if (path === '/admin/analytics') return failing ? json({ message: 'Database unavailable.' }, 503) : json(payload);
        return json({});
      });
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.goto(base + '/admin'); const section = page.locator('section[aria-labelledby="analytics-heading"]');
      await section.getByRole('heading', { name: 'Learning analytics' }).waitFor();
      // Learner tiles
      for (const [label, value] of [['Active today', '4'], ['Active this week', '8'], ['Active this month', '10'], ['Learners', '12']]) assert.equal(await section.locator('dt', { hasText: new RegExp(`^${label}$`) }).locator('xpath=following-sibling::dd[1]').innerText(), value);
      await section.getByText('5 new in 30 days').waitFor(); await section.getByText('33% of learners').waitFor();
      // Daily chart: 14 bars, accessible names, hover and keyboard tooltip, table view
      const bars = section.getByRole('list', { name: 'Daily active learners chart' }).getByRole('button');
      assert.equal(await bars.count(), 14);
      assert.match(await bars.nth(10).getAttribute('aria-label'), /: 6 learners$/);
      await bars.nth(10).hover(); assert.match(await section.getByRole('status').innerText(), /6\s+learners/);
      await bars.nth(1).focus(); assert.match(await section.getByRole('status').innerText(), /1\s+learner$/);
      const heights = await bars.locator('span').evaluateAll(spans => spans.map(s => s.getBoundingClientRect().height));
      assert.equal(heights[10], Math.max(...heights), 'tallest bar is the busiest day'); assert.equal(heights[0], 0);
      await section.getByText('Show as table').click(); assert.equal(await section.locator('details tbody tr').count(), 14);
      // Funnel: empty units hidden by default, level filter, pass rate
      const funnel = section.locator('table', { has: page.locator('caption', { hasText: 'Unit completion funnel' }) });
      assert.equal(await funnel.locator('tbody tr').count(), 3, 'N5 Unit 3 has no learners and is hidden');
      const u1 = funnel.locator('tbody tr').first(); assert.match(await u1.innerText(), /N5 · Unit 1[\s\S]*10[\s\S]*7[\s\S]*70%[\s\S]*6[\s\S]*4[\s\S]*67%[\s\S]*81%/);
      await section.getByLabel('Show units nobody has started').check(); assert.equal(await funnel.locator('tbody tr').count(), 4);
      await section.getByLabel('Level').selectOption('N4'); assert.equal(await funnel.locator('tbody tr').count(), 1); assert.match(await funnel.innerText(), /N4 · Unit 1[\s\S]*–/);
      await section.getByLabel('Level').selectOption('all');
      // Drop-offs and practice
      await section.getByText('3 stopped').waitFor(); await section.getByText('(30%)').waitFor();
      const practice = section.locator('table', { has: page.locator('caption', { hasText: 'Practice volume by kind' }) });
      assert.deepEqual((await practice.locator('tbody tr').allInnerTexts()).map(t => t.replace(/\s+/g, ' ').trim()), ['Kana answers 120 88%', 'Reading passages 4 75%', 'Mock exams 2 64%']);
      await page.screenshot({ path: `${shots}/analytics-${colorScheme}.png`, fullPage: true });
      // The status-only page does not show analytics
      await page.goto(base + '/admin/system/status'); await page.getByText('All systems running').waitFor();
      assert.equal(await page.getByRole('heading', { name: 'Learning analytics' }).count(), 0);
      // Empty state, then an error with a working retry
      payload = empty; await page.goto(base + '/admin'); await section.getByText('No learner activity in this period.').waitFor();
      await section.getByText('No learner has started a unit yet.').waitFor(); await section.getByText('No drop-offs yet.').waitFor(); await section.getByText('No practice recorded yet.').waitFor();
      failing = true; await section.getByRole('button', { name: 'Refresh analytics' }).click(); await section.getByRole('alert').getByText('Database unavailable.').waitFor();
      failing = false; payload = analytics; await section.getByRole('button', { name: 'Refresh analytics' }).click(); await section.getByText('3 stopped').waitFor();
      assert.equal(await section.getByRole('alert').count(), 0, 'a successful refresh clears the error');
      // Phone width: no page overflow
      await page.setViewportSize({ width: 375, height: 812 }); await page.goto(base + '/admin'); await section.getByText('3 stopped').waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal page scroll on phones');
      await page.screenshot({ path: `${shots}/analytics-${colorScheme}-mobile.png`, fullPage: true });
      assert.deepEqual(errors, []);
      await context.close();
    }
    console.log('PASS (light + dark): learner tiles with share of learners; 14-day chart with scaled bars, hover and keyboard tooltips, accessible names and table view; unit funnel hides untouched units, toggles them, filters by level, shows pass rate and average best; drop-offs; practice by kind in a fixed order; hidden on the status page; empty states; error then retry; no overflow on phones; no page errors.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1200)); process.exitCode = 1; });
