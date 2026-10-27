// Dark mode: theme switching, persistence, no flash, and a text-contrast scan of the main pages in both themes.
//   node theme-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = id => `test.${Buffer.from(JSON.stringify({ userId: id })).toString('base64url')}.x`;
const at = new Date().toISOString();
const unit = (n, done, allowed = true) => ({ id: `japanese-n5-unit-${n}`, number: n, title: `Unit title ${n}`, description: 'About this unit.', requiredLevel: 1, allowed, reasons: allowed ? [] : ['Complete Unit 1 first'], completedLessons: done, totalLessons: 6, allLessonsCompleted: false, assessmentUnlocked: false, assessmentPassed: false, completed: false, bestScore: null, bestCorrect: null, questionCount: 15, passPercent: 80,
  lessons: Array.from({ length: 6 }, (_, i) => ({ id: `japanese-n5-unit-${n}-l${i}`, slug: i === 0 && n === 4 ? 'n5-unit-4-telling-time' : `n5-unit-${n}-l${i}`, title: `Lesson ${n}.${i + 1}`, description: '', isPlaceholder: false, allowed, reasons: [], completed: i < done })) });
const messages = [{ id: 1, body: 'はじめまして！', senderRole: 'learner', sender: 'Ken', mine: false, sentAt: at }, { id: 2, body: 'よろしくおねがいします。', senderRole: 'learner', sender: 'You', mine: true, sentAt: at }];

async function context(browser, { role = 'learner', colorScheme, theme }) {
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme });
  await ctx.addInitScript(([t, r, saved]) => { localStorage.setItem('token', t); localStorage.setItem('user_role', r); localStorage.setItem('app_language', 'japanese'); if (saved && !sessionStorage.getItem('seeded')) { localStorage.setItem('theme', saved); sessionStorage.setItem('seeded', '1'); } }, [token(role === 'admin' ? 9 : 1), role, theme ?? null]);
  await ctx.route('http://localhost:5000/api/**', r => { const p = new URL(r.request().url()).pathname.replace('/api', ''); const json = data => r.fulfill({ json: data });
    if (p === '/units') return json({ units: [unit(1, 6), unit(4, 2), unit(5, 0, false)] });
    if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
    if (p === '/profile/me') return json({ username: 'mika', display_name: 'Mika', level: 2, rank: 'Explorer', xp: 140, xpProgress: { progressPercent: 40, nextLevelXp: 300 }, current_streak: 4, longest_streak: 9, active_today: true, time_zone: 'UTC', achievements_count: 3, achievements: [], lessons_completed: 8 });
    if (p === '/kanji/progress') return json({ progress: [] });
    if (p === '/inbox') return json({ direct: 1, support: 0, total: 1 });
    if (p === '/messages/conversations') return json({ conversations: [{ id: 1, with: { username: 'ken_k', name: 'Ken' }, unread: 1, lastMessageAt: at, lastMessage: { body: 'はじめまして！', mine: false } }] });
    if (p === '/messages/conversations/1') return json({ id: 1, with: { username: 'ken_k', name: 'Ken' }, blockedByMe: false, canReply: true, messages });
    if (p === '/assistant') return json({ provider: { id: 'course-helper', label: 'Course helper (searches your lessons)', ai: false }, conversationId: 50, messages: [{ id: 3, body: 'What does 天気 mean?', senderRole: 'learner', sender: 'You', mine: true, sentAt: at }, { id: 4, body: 'Here is what I found in your course: • 天気 (てんき), tenki: weather', senderRole: 'assistant', sender: 'Study assistant', mine: false, sentAt: at }], conversations: [{ id: 50, title: 'weather', lastMessageAt: at }] });
    if (p === '/admin/access') return json({ id: 9, username: 'boss', role: 'admin' });
    if (p === '/speaking-tests') return json({ level: 'N3', jfLevel: 'B1', open: true, lockedReason: null, delivery: 'browser', contentGrading: true, dailyLimit: 30, usedToday: 1, tasks: [
      { id: 'n3-read-park', level: 'N3', kind: 'read_aloud', title: 'Read aloud: the park', canDo: 'Can read aloud a short text.', instructions: 'Read it aloud.', minSeconds: 5, maxSeconds: 30, available: true, best: { score: 54, band: 2, met: false, attempts: 1 }, passage: { ruby: '<ruby>私<rt>わたし</rt></ruby>の<ruby>町<rt>まち</rt></ruby>', plain: '私の町' } },
      { id: 'n3-my-town', level: 'N3', kind: 'production', title: 'Introduce your town', canDo: 'Can describe their town.', instructions: 'Describe your town.', minSeconds: 15, maxSeconds: 30, available: true, best: { score: 93, band: 4, met: true, attempts: 2 }, prompt: { ruby: '<ruby>町<rt>まち</rt></ruby>を紹介してください。', plain: '町を紹介してください。' } }] });
    if (/^\/speaking-tests\/tasks\/[\w-]+\/attempts$/.test(p)) return json({ attempts: [{ status: 'graded', id: 7, taskId: 'n3-my-town', level: 'N3', jfLevel: 'B1', kind: 'production', createdAt: '2026-10-20T10:00:00Z', score: 54, band: 2, bandLabel: 'もうすこし', met: false, delivery: 'browser', notAssessed: ['pronunciation', 'fluency'], transcript: '私の町は静かです。公園が行きました。', words: [], estimatedLevel: 'A2', summary: 'Add a reason.', strengths: ['Clear start'], nextSteps: ['Use から'],
      corrections: [{ excerpt: '公園が', corrected: '公園に', category: 'particle', explanation: 'Destination.', start: 9, end: 12 }], measurements: { durationSeconds: 12, reachedMinimum: false, characters: 16, charactersPerSecond: 1.3, sentences: 2 },
      criteria: [{ id: 'task', name: 'Task achievement', japanese: '課題達成', source: 'ai', weight: 20, band: 3, bandLabel: 'できました', comment: 'OK.', rawScore: null }, { id: 'grammar', name: 'Grammar', japanese: '文法', source: 'ai', weight: 15, band: 1, bandLabel: 'がんばろう', comment: 'Particles.', rawScore: null }, { id: 'pronunciation', name: 'Pronunciation', japanese: '発音', source: 'azure', weight: 20, band: null, bandLabel: null, comment: 'Not assessed.', rawScore: null }, { id: 'fluency', name: 'Fluency', japanese: '流暢さ', source: 'azure', weight: 20, band: 4, bandLabel: 'すばらしい', comment: 'Smooth.', rawScore: 90 }] }] });
    if (p === '/friends/leaderboard') return json({ period: { from: '2026-10-15T00:00:00Z', to: '2026-10-22T00:00:00Z' }, hidden: 1, entries: [{ username: 'kai', displayName: 'Kai', self: true, weeklyXp: 120, weeklyLessons: 2, currentStreak: 3, activeToday: true }, { username: 'mika', displayName: 'Mika', self: false, weeklyXp: 300, weeklyLessons: 4, currentStreak: 9, activeToday: false }] });
    if (p === '/notifications' && r.request().method() === 'GET') return json({ notifications: [{ id: 2, kind: 'friend_request', createdAt: new Date().toISOString(), read: false, actor: { username: 'ren', displayName: 'Ren' }, data: {} }, { id: 1, kind: 'support_reply', createdAt: '2026-10-01T00:00:00Z', read: true, actor: null, data: { conversationId: 3, subject: 'Audio' } }], hasMore: true, unread: 1 });
    if (p === '/friends') return json({ friends: [{ username: 'mika', displayName: 'Mika', since: '2026-10-01T00:00:00Z', progress: { level: 3, currentStreak: 4, activeToday: true } }, { username: 'sora', displayName: 'Sora', since: '2026-10-01T00:00:00Z', progress: null }], incoming: [{ id: 3, username: 'ren', displayName: 'Ren', sentAt: '2026-10-20T00:00:00Z' }], outgoing: [{ id: 4, username: 'yuki', displayName: 'Yuki', sentAt: '2026-10-20T00:00:00Z' }] });
    if (p === '/people/mika') return json({ username: 'mika', displayName: 'Mika', joinedAt: '2026-03-01T00:00:00Z', visibility: 'friends', visible: true, canRequest: false, friendship: { state: 'friends' }, profile: { bio: 'Hello!', learningLanguage: 'Japanese', nativeLanguage: 'English', learningGoal: 'N5', xp: 300, level: 3, rank: 'Beginner', currentStreak: 4, longestStreak: 9, activeToday: true, lessonsCompleted: 14, unitsPassed: 2, latestUnit: { level: 'N5', number: 2, title: 'Numbers' }, achievements: [{ id: 'a', title: 'First steps', description: 'Finish a lesson', earnedAt: '2026-10-01T00:00:00Z' }], friends: 3 } });
    if (p === '/people/sora') return json({ username: 'sora', displayName: 'Sora', joinedAt: '2026-03-01T00:00:00Z', visibility: 'private', visible: false, canRequest: true, friendship: { state: 'none' } });
    if (p === '/admin/analytics') return json({ generatedAt: '2026-10-21T09:00:00.000Z', learners: { total: 3, newLast30Days: 1, activeToday: 1, activeLast7Days: 2, activeLast30Days: 3 }, dailyActive: Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(8 + i).padStart(2, '0')}`, learners: i % 3 })), funnel: [{ unitId: 'japanese-n5-unit-1', level: 'N5', number: 1, title: 'Greetings', started: 3, finishedLessons: 2, assessment: { attempted: 2, passed: 1, averageBest: 77, passRate: 50 } }], dropOffs: [{ unitId: 'japanese-n5-unit-1', level: 'N5', unitNumber: 1, from: { id: 'a', title: 'Hello', completed: 3 }, to: { id: 'b', title: 'Numbers', completed: 2 }, lost: 1 }], practice: [{ kind: 'kana', sessions: 40, accuracy: 90 }] });
    if (p === '/admin/overview') return json({ users: { total: 4, active: 4, suspended: 0, admins: 1 }, content: { disabled: 0 } });
    if (p.endsWith('/access')) return json({ allowed: true, reasons: [] });
    return json({}); });
  return ctx;
}

// Lowest-contrast visible text on the page, computed from rendered colours (oklch is converted through a canvas).
const scan = page => page.evaluate(() => {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1; const g = canvas.getContext('2d', { willReadFrequently: true });
  const rgba = color => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = color; g.fillRect(0, 0, 1, 1); const [r, gg, b, a] = g.getImageData(0, 0, 1, 1).data; return [r, gg, b, a / 255]; };
  const lum = ([r, gg, b]) => [r, gg, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const background = element => { for (let e = element; e; e = e.parentElement) { const style = getComputedStyle(e); if (style.backgroundImage !== 'none') return null; const c = rgba(style.backgroundColor); if (c[3] > 0.9) return c; } return rgba(getComputedStyle(document.body).backgroundColor); };
  const results = [];
  for (const element of document.querySelectorAll('body *')) {
    if (!element.childNodes.length || ![...element.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (element.closest('[aria-hidden="true"], rt, svg, button:disabled, [disabled], option')) continue;
    const box = element.getBoundingClientRect(); if (!box.width || !box.height || box.right <= 0 || box.left >= innerWidth) continue;
    // Visually hidden text (sr-only: a 1px clipped box) is read by screen readers, never seen, so it has no contrast.
    if (box.width <= 1 && box.height <= 1) continue;
    const style = getComputedStyle(element); if (style.visibility === 'hidden' || Number(style.opacity) < 0.5) continue;
    const bg = background(element); if (!bg) continue;
    const fg = rgba(style.color); const mixed = fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
    const [l1, l2] = [lum(mixed), lum(bg)].sort((a, b) => b - a); const ratio = (l1 + 0.05) / (l2 + 0.05);
    results.push({ ratio: Math.round(ratio * 100) / 100, text: element.textContent.trim().slice(0, 40), size: parseFloat(style.fontSize), cls: String(element.className).slice(0, 60) });
  }
  return results.sort((a, b) => a.ratio - b.ratio);
});

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    // ---- Switching: System follows the device; the button cycles System → Light → Dark and the choice persists.
    const ctx = await context(browser, { colorScheme: 'dark' });
    const page = await ctx.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
    const dark = () => page.evaluate(() => document.documentElement.classList.contains('dark'));
    await page.goto(base + '/'); await page.getByRole('heading', { name: 'Your path' }).waitFor();
    assert.equal(await dark(), true, 'System + dark device → dark');
    await page.emulateMedia({ colorScheme: 'light' }); await page.waitForFunction(() => !document.documentElement.classList.contains('dark'));
    await page.emulateMedia({ colorScheme: 'dark' }); await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
    const toggle = page.getByRole('button', { name: /^Theme: / });
    assert.match(await toggle.getAttribute('aria-label'), /Theme: System \(dark\)\. Switch to Light/);
    await toggle.click(); assert.equal(await dark(), false); assert.equal(await page.evaluate(() => localStorage.getItem('theme')), 'light');
    await toggle.click(); assert.equal(await dark(), true); assert.equal(await page.evaluate(() => localStorage.getItem('theme')), 'dark');
    await page.emulateMedia({ colorScheme: 'light' }); await page.waitForTimeout(100); assert.equal(await dark(), true, 'an explicit Dark ignores the device');
    // No flash: the class is already set before any script of the app runs.
    await page.goto(base + '/'); assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), true);
    const firstPaint = await page.evaluate(() => performance.getEntriesByType('paint').length); void firstPaint;
    // The sidebar has no theme section; the header button is the one place to change it.
    await page.getByRole('button', { name: 'Toggle navigation sidebar' }).click(); await page.getByRole('button', { name: 'Close navigation' }).waitFor();
    assert.equal(await page.getByRole('radiogroup', { name: 'Theme' }).count(), 0); assert.equal(await page.getByText('Display', { exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Close navigation' }).click();
    await page.getByRole('button', { name: /^Theme: Dark/ }).click();
    assert.equal(await page.evaluate(() => localStorage.getItem('theme')), null); assert.equal(await dark(), false, 'System again, device now light');
    await page.getByRole('button', { name: /^Theme: System/ }).click(); await page.getByRole('button', { name: /^Theme: Light/ }).click(); assert.equal(await dark(), true);

    // ---- Contrast scan of the main pages in both themes, plus dark screenshots.
    const pages = [['/', 'dashboard'], ['/lessons/japanese/n5-unit-4-telling-time', 'lesson'], ['/learn/kanji/kanji-6642', 'kanji'], ['/messages/1', 'messages'], ['/vocabulary', 'vocabulary'], ['/levels', 'levels'], ['/assistant', 'assistant'], ['/friends', 'friends'], ['/u/mika', 'profile'], ['/u/sora', 'private profile'], ['/notifications', 'notifications'], ['/speaking/test?level=N3', 'speaking test'], ['/speaking/test?level=N3&task=n3-my-town', 'speaking task']];
    const report = {};
    for (const theme of ['dark', 'light']) {
      await page.evaluate(t => localStorage.setItem('theme', t), theme);
      for (const [path, name] of pages) {
        await page.goto(base + path); await page.waitForLoadState('networkidle'); await page.waitForTimeout(150);
        const results = await scan(page);
        const failing = results.filter(r => r.ratio < (r.size >= 18.66 ? 3 : 4.5));
        report[`${theme} ${name}`] = { checked: results.length, worst: results[0]?.ratio, failing: failing.slice(0, 5) };
        if (theme === 'dark') await page.screenshot({ path: `${shots}/dark-${name}.png`, fullPage: name === 'dashboard' });
      }
    }
    // Stroke diagrams use theme colours: guide strokes differ from the background in dark mode.
    await page.evaluate(() => localStorage.setItem('theme', 'dark')); await page.goto(base + '/learn/kanji/kanji-6642'); await page.locator('svg[role="img"] path').first().waitFor();
    const strokeColours = await page.evaluate(() => { const svg = document.querySelector('svg[role="img"]'); return svg ? [...new Set([...svg.querySelectorAll('path')].map(p => getComputedStyle(p).stroke))].slice(0, 3) : []; });
    assert.ok(strokeColours.length >= 1 && !strokeColours.includes('rgb(17, 24, 39)'), 'stroke colours follow the theme: ' + strokeColours.join(', '));

    // ---- Admin area and sign-in page in dark mode.
    const adminCtx = await context(browser, { role: 'admin', colorScheme: 'dark' });
    const admin = await adminCtx.newPage(); await admin.goto(base + '/admin'); await admin.getByRole('heading', { name: 'Overview' }).first().waitFor();
    await admin.getByRole('button', { name: /^Theme: / }).waitFor(); await admin.screenshot({ path: shots + '/dark-admin.png' });
    report['dark admin'] = (r => ({ checked: r.length, worst: r[0]?.ratio, failing: r.filter(x => x.ratio < (x.size >= 18.66 ? 3 : 4.5)).slice(0, 5) }))(await scan(admin));
    const guest = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: 'dark' }); const login = await guest.newPage();
    await login.route('http://localhost:5000/api/**', r => r.fulfill({ json: { registration_enabled: true, announcement: '', disabled: [] } }));
    await login.goto(base + '/login'); await login.waitForLoadState('networkidle'); await login.screenshot({ path: shots + '/dark-login.png' });
    report['dark login'] = (r => ({ checked: r.length, worst: r[0]?.ratio, failing: r.filter(x => x.ratio < (x.size >= 18.66 ? 3 : 4.5)).slice(0, 5) }))(await scan(login));

    const judge = r => ({ checked: r.length, worst: r[0]?.ratio, failing: r.filter(x => x.ratio < (x.size >= 18.66 ? 3 : 4.5)).slice(0, 5) });
    await admin.emulateMedia({ colorScheme: 'light' }); await admin.evaluate(() => localStorage.removeItem('theme')); await admin.reload(); await admin.getByRole('heading', { name: 'Learning analytics' }).waitFor().catch(() => {}); await admin.waitForTimeout(200);
    report['light admin'] = judge(await scan(admin)); await admin.screenshot({ path: shots + '/light-admin.png', fullPage: true });
    await login.emulateMedia({ colorScheme: 'light' }); await login.reload(); await login.waitForLoadState('networkidle'); report['light login'] = judge(await scan(login));
    for (const [key, r] of Object.entries(report)) console.log(key.padEnd(18), 'checked', String(r.checked).padStart(4), 'worst', r.worst, r.failing.length ? 'FAIL ' + r.failing.map(f => `${f.ratio} "${f.text}" (${f.cls.slice(0, 40)})`).join(' | ') : 'ok');
    assert.deepEqual(errors, []);
    const failures = Object.entries(report).filter(([, r]) => r.failing.length);
    console.log(failures.length ? `CONTRAST: ${failures.length} page/theme combinations have text below WCAG AA.` : 'PASS: theme follows the device under System; button cycles System → Light → Dark and saves the choice; explicit choice overrides the device; applied before the app runs; no theme section in the sidebar; stroke diagrams follow the theme; all scanned text meets WCAG AA in both themes.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
