// Forgot / reset password, email confirmation, account security settings and session expiry, against fixture APIs.
//   node security-ui.cjs <baseUrl> <shotsDir>
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const token = `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString('base64url')}.x`;
const LINK = 'A'.repeat(43);
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    const page = await context.newPage(); const errors = [], calls = []; page.on('pageerror', e => errors.push(e.message));
    const state = { verified: false, revoked: false };
    await context.route('http://localhost:5000/api/**', route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace('/api', ''), method = request.method(), body = request.postDataJSON();
      const json = (data, status = 200) => route.fulfill({ status, json: data });
      if (method !== 'GET') calls.push({ p, body, auth: request.headers().authorization ?? null });
      if (p === '/site') return json({ registration_enabled: true, announcement: '', disabled: [] });
      if (state.revoked && request.headers().authorization) return json({ message: 'Your session has ended. Please sign in again.', code: 'session_expired' }, 401);
      if (p === '/auth/password/forgot') return json({ message: "If an account uses that address, we've sent it a link to reset the password. The link works for 1 hour." }, 202);
      if (p === '/auth/password/reset') return body.token === LINK ? json({ message: 'Your password has been changed.' }) : json({ message: 'This reset link has expired or was already used. Ask for a new one.' }, 400);
      if (p === '/auth/email/verify') return body.token === LINK ? json({ verified: true }) : json({ message: 'This confirmation link has expired or was already used. Sign in to send a new one.' }, 400);
      if (p === '/auth/email/resend') return json({ alreadyVerified: false, sentTo: 'kai@example.com' });
      if (p === '/auth/logout-all') return json({ message: "You've been signed out on every device." });
      if (p === '/profile/me/password') return body.currentPassword === 'right-pass' ? json({ message: "Password updated. You've been signed out on your other devices.", token: 'new.token.value' }) : json({ message: 'Current password is incorrect.' }, 401);
      if (p === '/auth/login') return json({ token, user: { id: 1, username: 'kai', email: 'kai@example.com', role: 'learner' } });
      if (p === '/profile/me') return json({ username: 'kai', display_name: 'Kai', email: 'kai@example.com', email_verified_at: state.verified ? '2026-10-26T00:00:00Z' : null, bio: '', learning_language: 'Japanese', learning_goal: null, daily_goal: 10, profile_visibility: 'private', friend_requests: 'everyone', xp: 0, level: 1, rank: 'Beginner', lessons_completed: 0, current_streak: 0, achievements_count: 0, achievements: [], xpProgress: { nextLevelXp: 100, progressPercent: 0 } });
      if (p === '/units') return json({ units: [] });
      if (p === '/inbox') return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
      return json({});
    });
    const status = text => page.getByRole('status').filter({ hasText: text });

    // ---- Forgot password: link from sign-in, generic answer
    await page.goto(base + '/login'); await page.getByRole('link', { name: 'Forgot password?' }).click(); await page.waitForURL('**/forgot-password');
    await page.getByLabel('Email address').fill('kai@example.com'); await page.getByRole('button', { name: 'Send reset link' }).click();
    await status("If an account uses that address, we've sent it a link").waitFor();
    assert.deepEqual(calls.at(-1), { p: '/auth/password/forgot', body: { email: 'kai@example.com' }, auth: null });
    await page.screenshot({ path: shots + '/forgot.png' });
    // ---- Reset: mismatch caught in the page, bad link, success → sign-in with notice
    await page.goto(base + '/reset-password'); await page.getByText('The reset link is incomplete.').waitFor();
    await page.goto(base + '/reset-password?token=' + 'B'.repeat(43));
    await page.getByLabel('New password', { exact: true }).fill('newpass123'); await page.getByLabel('Confirm new password', { exact: true }).fill('different1');
    await page.getByRole('button', { name: 'Set new password' }).click(); await page.getByRole('alert').getByText("The passwords don't match.").waitFor();
    await page.getByLabel('Confirm new password', { exact: true }).fill('newpass123'); await page.getByRole('button', { name: 'Set new password' }).click();
    await page.getByRole('alert').getByText('This reset link has expired').waitFor();
    await page.goto(base + '/reset-password?token=' + LINK);
    await page.getByLabel('New password', { exact: true }).fill('newpass123'); await page.getByLabel('Confirm new password', { exact: true }).fill('newpass123');
    await page.getByRole('button', { name: 'Set new password' }).click(); await page.waitForURL('**/login?reset=1');
    await status('Your password has been changed. Sign in with your new password.').waitFor();
    // ---- Email confirmation link (works signed out), used once, bad link
    await page.goto(base + '/verify-email?token=' + LINK); await status('✓ Your email is confirmed.').waitFor();
    assert.equal(calls.filter(c => c.p === '/auth/email/verify').length, 1, 'the link is sent once');
    await page.goto(base + '/verify-email?token=' + 'C'.repeat(43)); await page.getByRole('alert').getByText('This confirmation link has expired').waitFor();

    // ---- Signed in: dashboard banner, resend, remind me later
    await page.goto(base + '/login'); await page.getByLabel('Email or username').fill('kai'); await page.getByLabel('Password', { exact: true }).fill('x'); await page.getByRole('button', { name: 'Sign in' }).click(); await page.waitForURL(base + '/');
    const banner = page.getByRole('region', { name: 'Confirm your email' }); await banner.waitFor();
    await banner.getByRole('button', { name: 'Send a new link' }).click(); await banner.getByText("We've sent a confirmation link to kai@example.com").waitFor();
    await page.screenshot({ path: shots + '/verify-banner.png' });
    await banner.getByRole('button', { name: 'Remind me later' }).click(); assert.equal(await banner.count(), 0);
    await page.reload(); await page.getByRole('heading', { level: 1 }).waitFor(); assert.equal(await banner.count(), 0, 'stays hidden this session');

    // ---- Settings → Account security
    await page.goto(base + '/settings/account'); const security = page.getByRole('region', { name: 'Account security' }); await security.waitFor();
    await security.getByText('Not confirmed yet').waitFor();
    await security.getByLabel('Current password', { exact: true }).fill('wrong'); await security.getByLabel(/^New password/).fill('third1234'); await security.getByLabel('Confirm new password', { exact: true }).fill('third1234');
    await security.getByRole('button', { name: 'Change password' }).click(); await security.getByRole('alert').getByText('Current password is incorrect.').waitFor();
    await security.getByLabel('Current password', { exact: true }).fill('right-pass'); await security.getByRole('button', { name: 'Change password' }).click();
    await security.getByText("Password updated. You've been signed out on your other devices.").waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('token')), 'new.token.value', 'this device keeps working with the new token');
    assert.equal(await security.getByLabel('Current password', { exact: true }).inputValue(), '');
    await page.screenshot({ path: shots + '/security-settings.png', fullPage: true });
    await security.getByRole('button', { name: 'Sign out on all devices…' }).click(); await security.getByRole('button', { name: 'Cancel' }).click();
    await security.getByRole('button', { name: 'Sign out on all devices…' }).click(); await security.getByRole('button', { name: 'Sign out everywhere' }).click();
    await page.waitForURL('**/login?signedOut=all'); await status("You've been signed out on every device.").waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);

    // ---- A session revoked elsewhere signs this browser out with an explanation
    await page.evaluate(t => localStorage.setItem('token', t), token); state.verified = true;
    await page.goto(base + '/profile'); await page.getByRole('heading', { name: 'Kai' }).waitFor();
    state.revoked = true; await page.goto(base + '/settings/account');
    await page.waitForURL('**/login?expired=1'); await status('Your session has ended').waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('token')), null);

    // ---- Phones
    state.revoked = false; await page.setViewportSize({ width: 375, height: 812 });
    for (const path of ['/forgot-password', '/reset-password?token=' + LINK, '/login?expired=1']) { await page.goto(base + path); await page.getByRole('heading', { level: 1 }).waitFor(); assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'overflow ' + path); }
    assert.deepEqual(errors, []);
    console.log('PASS: "Forgot password?" from sign-in, generic answer; reset page: missing link, mismatch, expired link, success → sign-in notice; confirmation link works signed out and is sent once, bad link explained; dashboard banner resends and can be hidden for the session; settings: email status, wrong current password, change keeps this device with the new token, sign out everywhere (with cancel) → sign-in notice; a session revoked elsewhere signs out with an explanation; phones without overflow; no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(String(e.stack || e).slice(0, 1500)); process.exitCode = 1; });
