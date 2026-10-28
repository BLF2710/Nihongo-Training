// Gamification: the Achievements page (level, ranks, achievements with progress and filters, ways to earn XP with
// daily limits), the profile's level card, and level-up notifications. Against fixture APIs.
//   node gamification-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;

const achievement = (id, title, category, icon, goal, progress, earnedAt = null) => ({ id, title, description: `${title} description.`, xpReward: 50, category, icon, goal, progress, earnedAt });
const GAMIFICATION = {
  xp: 820, level: { level: 5, currentLevelXp: 700, nextLevelXp: 1000, progressXp: 120, progressPercent: 40 }, rank: 'Bronze', nextRank: { name: 'Silver', xp: 1000 },
  ranks: [['Beginner', 0], ['Bronze', 250], ['Silver', 1000], ['Gold', 2500], ['Platinum', 5000], ['Diamond', 10000], ['Master', 20000]].map(([name, xp]) => ({ name, xp })),
  streak: { current: 4, longest: 9 },
  today: { date: '2026-10-28', xp: 64, activities: [
    { source: 'lesson_completion', amount: 50, dailyCap: null, earned: 50 }, { source: 'review', amount: 2, dailyCap: 60, earned: 60 },
    { source: 'kanji', amount: 1, dailyCap: 30, earned: 4 }, { source: 'daily_goal', amount: 20, dailyCap: null, earned: 0 },
  ] },
  achievements: [
    achievement('first_steps', 'First Steps', 'lessons', '👣', 1, 1, '2026-10-20T08:00:00Z'),
    achievement('lessons_10', 'Steady Learner', 'lessons', '📘', 10, 9),
    achievement('kanji_10', 'Kanji Apprentice', 'kanji', '🖌️', 10, 3),
    achievement('week_warrior', 'Week Warrior', 'streaks', '⚔️', 7, 7, '2026-10-25T08:00:00Z'),
    achievement('friends_1', 'Study Buddy', 'friends', '🤝', 1, 0),
  ],
  recent: [{ source: 'review', amount: 2, createdAt: new Date().toISOString() }, { source: 'achievement', amount: 75, createdAt: new Date().toISOString() }],
};
const PROFILE = {
  username: 'kai', display_name: 'Kai', avatar: null, bio: '', learning_language: 'Japanese', native_language: null, learning_goal: null, daily_goal: 10,
  profile_visibility: 'private', friend_requests: 'everyone', xp: 820, level: 5, rank: 'Bronze', lessons_completed: 9, current_streak: 4, longest_streak: 9,
  achievements_count: 2, achievements: [{ id: 'week_warrior', title: 'Week Warrior', description: 'Study 7 days in a row.', icon: '⚔️' }, { id: 'first_steps', title: 'First Steps', description: 'Complete your first lesson.', icon: '👣' }],
  xpProgress: { currentLevelXp: 700, nextLevelXp: 1000, progressXp: 120, progressPercent: 40 }, email: 'kai@example.com', sign_in: { password: true, google: null },
};

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(t => { localStorage.setItem('token', t); localStorage.setItem('app_language', 'japanese'); localStorage.setItem('user_role', 'learner'); }, token);
    let failSummary = true;
    await context.route('http://localhost:5000/api/**', async route => {
      const p = new URL(route.request().url()).pathname.replace('/api', ''), json = (data, status = 200) => route.fulfill({ status, json: data });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (p === '/profile/me') return json(PROFILE);
      if (p === '/profile/me/gamification') { if (failSummary) { failSummary = false; return json({ message: 'Server error' }, 500); } return json(GAMIFICATION); }
      if (p === '/notifications') return json({ notifications: [{ id: 1, kind: 'level_up', createdAt: new Date().toISOString(), read: false, data: { level: 5 }, actor: null }], unread: 1 });
      if (p === '/notifications/unread') return json({ unread: 1 });
      return json({});
    });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));

    // ---- a failed load can be retried
    await page.goto(base + '/achievements');
    await page.getByRole('alert').getByText('Server error').waitFor();
    await page.getByRole('button', { name: 'Try again' }).click();

    // ---- the level, ranks and the achievements tab
    await page.getByRole('heading', { name: 'Bronze learner' }).waitFor();
    await page.getByText('820 XP in total · 180 XP to level 6').waitFor();
    assert.equal(await page.getByRole('progressbar', { name: 'Progress to level 6' }).getAttribute('aria-valuenow'), '40');
    assert.equal(await page.locator('[aria-current="step"]').innerText().then(text => text.includes('Bronze')), true, 'the current rank is marked');
    await page.getByText('180 XP').first().waitFor();
    assert.equal(await page.getByRole('link', { name: /Achievements/ }).first().getAttribute('aria-current'), 'page', 'the Achievements tab is active');
    await page.getByText('2 of 5 earned').waitFor();
    // Closest first: 9 of 10 lessons is closer than 3 of 10 kanji.
    const almost = page.getByRole('region', { name: 'Almost there' });
    assert.deepEqual(await almost.getByRole('heading', { level: 3 }).allInnerTexts(), ['Steady Learner', 'Kanji Apprentice', 'Study Buddy']);
    await almost.getByText('9 / 10').waitFor();
    await page.screenshot({ path: path.join(shots, 'achievements.png'), fullPage: true });

    // ---- the category filter
    const all = page.getByRole('region', { name: 'All achievements' });
    const filters = page.getByRole('group', { name: 'Show achievements in' });
    await filters.getByRole('button', { name: 'Kanji' }).click();
    assert.equal(await filters.getByRole('button', { name: 'Kanji' }).getAttribute('aria-pressed'), 'true');
    assert.deepEqual(await all.getByRole('heading', { level: 3 }).allInnerTexts(), ['Kanji Apprentice']);
    await filters.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await all.getByRole('heading', { level: 3 }).count(), 5);
    await all.getByText(/Earned .*ago/).first().waitFor();

    // ---- ways to earn XP: daily limits and recent XP
    await page.getByRole('link', { name: /Earning XP/ }).click();
    await page.waitForURL(/\/achievements\/xp$/);
    const ways = page.getByRole('region', { name: 'Ways to earn XP' });
    await ways.getByText("Today's limit reached — more tomorrow").waitFor();
    await ways.getByText('4 / 30 XP today').waitFor();
    assert.equal(await ways.getByText('No daily limit').count(), 2, 'lessons and the daily goal have no limit');
    assert.equal(await ways.getByRole('link', { name: /Daily review/ }).getAttribute('href'), '/srs');
    await page.getByRole('region', { name: 'Recent XP' }).getByText('+75').waitFor();
    await page.screenshot({ path: path.join(shots, 'achievements-xp.png'), fullPage: true });

    // ---- the profile's level card and latest achievements lead here
    await page.goto(base + '/profile');
    const level = page.getByRole('region', { name: 'Bronze learner' });
    await level.getByText('180 XP to level 6').waitFor();
    const latest = page.getByRole('region', { name: /Achievements \(2\)/ });
    await latest.getByText('Week Warrior').waitFor();
    await latest.getByRole('link', { name: 'See all →' }).click();
    await page.waitForURL(/\/achievements$/);

    // ---- a level-up notification
    await page.goto(base + '/notifications');
    await page.getByText('You reached level 5!').waitFor();

    // ---- phone width: no sideways scrolling
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(base + '/achievements');
    await page.getByRole('heading', { name: 'Bronze learner' }).waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'fits a phone');
    await page.screenshot({ path: path.join(shots, 'achievements-phone.png'), fullPage: true });

    assert.deepEqual(errors, []);
    console.log('PASS: failed load retried; level 5 hero (820 XP, 180 to level 6, 40% bar), Bronze marked on the rank ladder; 2 of 5 earned, Almost there sorted by progress (9/10 first); category filter (Kanji) and All; Earning XP tab: limit reached for reviews, 4/30 kanji, no limit for lessons and the daily goal, links to each activity, recent XP; profile level card and latest achievements link to the page; level-up notification text; fits a phone.');
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1500)); process.exitCode = 1; });
