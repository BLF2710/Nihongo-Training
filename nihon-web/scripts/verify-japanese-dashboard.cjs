const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 950 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    let failed = false;
    const unit = { id: 'japanese-n5-unit-1', number: 1, title: 'Greetings & Introductions', description: '', allowed: true, reasons: [], completed: false, completedLessons: 0, totalLessons: 6, assessmentUnlocked: false, assessmentPassed: false,
      lessons: [{ id: 'hello', slug: 'n5-unit-1-hello', title: 'How to Say Hello', allowed: true, completed: false, isPlaceholder: false }] };
    const locked = { ...unit, id: 'japanese-n5-unit-2', number: 2, title: 'People, Family, Possession & Daily Preferences', allowed: false, reasons: ['Complete Unit 1 first'], lessons: [] };
    await page.addInitScript(() => { localStorage.setItem('token', 'dashboard-test'); localStorage.setItem('app_language', 'japanese'); });
    await page.route('**/api/units', route => failed ? route.fulfill({ status: 503, json: {} }) : route.fulfill({ json: { units: [unit, locked] } }));
    await page.route('**/api/profile/me', route => route.fulfill({ json: { display_name: 'Kai', username: 'kai', xp: 100, level: 2, rank: 'Beginner', current_streak: 3, achievements_count: 1, xpProgress: { nextLevelXp: 250, progressPercent: 0 } } }));
    const url = 'http://127.0.0.1:5181/';
    await page.goto(url);
    await page.getByRole('heading', { name: 'How to Say Hello', exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Continue learning →', exact: true }).getAttribute('href'), '/lessons/japanese/n5-unit-1-hello');
    await page.getByText('Level 2', { exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Open unit →', exact: true }).count(), 1);
    for (const href of ['/vocabulary', '/grammar', '/learn/hiragana', '/learn/katakana', '/learn/kanji', '/practice?type=hiragana', '/practice?type=katakana', '/review/hiragana', '/review/katakana', '/learn/kanji/practice', '/quizzes', '/profile', '/statistics/japanese']) {
      assert.ok(await page.locator(`main a[href="${href}"]`).count(), `Missing ${href}`);
    }
    assert.equal(await page.locator('main').getByText(/Ready for Phase 2|800 Essential|103 N5|JLPT N5-N1/).count(), 0);
    await page.screenshot({ path: process.env.TEMP + '/japanese-dashboard-desktop.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: process.env.TEMP + '/japanese-dashboard-mobile.png', fullPage: true });
    unit.completedLessons = 6; unit.assessmentUnlocked = true; unit.lessons[0].completed = true;
    await page.reload();
    await page.getByRole('link', { name: 'Start assessment →', exact: true }).waitFor();
    assert.equal(await page.getByRole('link', { name: 'Start assessment →', exact: true }).getAttribute('href'), '/quizzes/japanese-n5-unit-1');
    unit.completed = true; unit.assessmentPassed = true; locked.completed = true;
    await page.reload(); await page.getByRole('heading', { name: 'Your current course is complete!', exact: true }).waitFor();
    failed = true; await page.reload();
    await page.getByRole('alert').filter({ hasText: 'Course progress' }).waitFor();
    assert.ok(await page.locator('main a[href="/vocabulary"]').isVisible());
    failed = false; await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await page.getByRole('heading', { name: 'Your current course is complete!', exact: true }).waitFor();
    await page.evaluate(() => localStorage.setItem('app_language', 'english'));
    // Init script runs on refresh; use a separate context for the English regression.
    const english = await browser.newPage();
    await english.addInitScript(() => { localStorage.setItem('token','test'); localStorage.setItem('app_language','english'); });
    await english.goto(url);
    await english.getByRole('heading', { name: 'English Mini-Games & Arcade', exact: false }).waitFor();
    assert.equal(await english.getByRole('heading', { name: 'Your Japanese learning hub' }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: dashboard routes, new-user lesson, assessment-ready and complete states, server locks, real-field progress, failure/retry, mobile overflow and preserved English dashboard. Responses are fixtures; no progress writes.');
  } finally { await browser.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
