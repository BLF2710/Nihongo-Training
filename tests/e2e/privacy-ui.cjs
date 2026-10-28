// The privacy policy: readable without signing in, linked from sign-in, sign-up and Settings, sections and contact.
//   node privacy-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;

const routeApi = context => context.route('http://localhost:5000/api/**', route => {
  const p = new URL(route.request().url()).pathname.replace('/api', '');
  if (p === '/site') return route.fulfill({ json: { registration_enabled: true, announcement: '', disabled: [] } });
  if (p === '/profile/me') return route.fulfill({ json: { username: 'kai', display_name: 'Kai', avatar: null, bio: '', learning_language: 'Japanese', native_language: null, learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 0, level: 1, rank: 'Beginner', lessons_completed: 0, current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 100, progressPercent: 0 } } });
  if (p === '/profile/me/social') return route.fulfill({ json: { suggestMe: false, shareActivity: true, showStudyingNow: false } });
  return route.fulfill({ json: {} });
});

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const errors = [];
    // ---- a guest: from sign-in and sign-up to the policy
    const guest = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await routeApi(guest);
    const page = await guest.newPage(); page.on('pageerror', error => errors.push(error.message));
    for (const start of ['/login', '/register']) {
      await page.goto(base + start);
      await page.getByRole('link', { name: 'Privacy policy' }).click();
      await page.waitForURL('**/privacy');
      await page.getByRole('heading', { level: 1, name: 'Privacy policy' }).waitFor();
    }
    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    assert.deepEqual(headings, ['In short', 'What we collect', 'How we use it', 'Who can see what', 'Outside services', 'Stored in your browser', 'How long we keep it', 'Your choices and rights', 'Security', 'Children', 'Changes to this policy', 'Contact']);
    assert.match(await page.locator('main').innerText(), /Recordings from the speaking test are never stored/);
    assert.match(await page.locator('#contact').innerText(), /Help & support after signing in/, 'guests are told to sign in to write to support');
    await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Outside services' }).click();
    await page.waitForURL('**/privacy#services');
    await page.screenshot({ path: path.join(shots, 'privacy.png') });
    await page.setViewportSize({ width: 375, height: 800 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, 'fits a phone screen');

    // ---- a signed-in learner: from Settings, and the contact points to Help & support
    const learner = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await learner.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); }, token);
    await routeApi(learner);
    const signedIn = await learner.newPage(); signedIn.on('pageerror', error => errors.push(error.message));
    await signedIn.goto(base + '/settings/privacy');
    await signedIn.getByRole('link', { name: 'privacy policy' }).click();
    await signedIn.waitForURL('**/privacy');
    assert.equal(await signedIn.locator('#contact').getByRole('link', { name: 'Help & support' }).getAttribute('href'), '/support');

    assert.deepEqual(errors, []);
    console.log('PASS: policy readable signed out, linked from sign-in, sign-up and Settings; all sections and the contact; on-page links; fits phones; signed-in contact links to Help & support');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
