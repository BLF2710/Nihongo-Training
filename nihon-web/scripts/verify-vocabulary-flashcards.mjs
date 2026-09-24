import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Uses an externally supplied browser-test runtime; no application dependency.
// Start Vite on 5181, then set PLAYWRIGHT_MODULE_PATH if Playwright is not local.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  const writes = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(request.url()); });
  await page.addInitScript(() => {
    // Study references are local data; this only passes the client route guard.
    localStorage.setItem('token', 'flashcard-ui-test');
    window.testSpokenTexts = [];
    window.speechSynthesis.speak = utterance => { window.testSpokenTexts.push(utterance.text); };
  });
  await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:5181/vocabulary');
  await page.getByRole('heading', { name: 'Vocabulary', exact: true }).waitFor();
  const filters = page.getByRole('navigation', { name: 'Filter by lesson' });
  const list = page.getByRole('button', { name: 'List', exact: true });
  const flashcards = page.getByRole('button', { name: 'Flashcards', exact: true });
  assert.equal(await list.getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('article').count(), 38);
  const original = await page.locator('article h3').allTextContents();
  const card = () => page.getByRole('button', { name: /^(Reveal|Hide) meaning of / });
  const previous = page.getByRole('button', { name: '← Previous', exact: true });
  const next = page.getByRole('button', { name: 'Next →', exact: true });
  const progress = () => page.getByRole('navigation', { name: 'Flashcard navigation' }).getByRole('status');

  for (const [lesson, count] of [[1, 8], [2, 4], [3, 7], [4, 7], [5, 12]]) {
    await list.click();
    await filters.getByRole('button', { name: `Lesson ${lesson}`, exact: true }).click();
    assert.equal(await page.locator('article').count(), count);
    const expected = await page.locator('article h3').allTextContents();
    const expectedMeaning = await page.locator('article p.font-semibold').first().textContent();
    await flashcards.click();
    assert.equal(await progress().textContent(), `1 / ${count}`);
    assert.equal(await previous.isDisabled(), true);
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    assert.equal(await card().getByText(expectedMeaning, { exact: true }).count(), 0);
    await card().click();
    assert.equal(await card().getByText(expectedMeaning, { exact: true }).count(), 1);
    await card().press('Enter');
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    await card().press('Space');
    assert.equal(await card().getAttribute('aria-pressed'), 'true');
    await next.click();
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    await previous.click();
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    await page.getByRole('button', { name: /^Listen to / }).click();
    assert.equal(await page.evaluate(() => window.testSpokenTexts.at(-1)), expected[0]);
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    await card().click();
    await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
    assert.equal(await progress().textContent(), `1 / ${count}`);
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
    assert.equal(await filters.getByRole('button', { name: `Lesson ${lesson}`, exact: true }).getAttribute('aria-pressed'), 'true');
    const seen = [];
    for (let index = 0; index < count; index++) {
      seen.push(await card().locator('[lang="ja"]').textContent());
      assert.ok((await card().textContent()).includes(`Lesson ${lesson} ·`));
      assert.equal(await progress().textContent(), `${index + 1} / ${count}`);
      if (index < count - 1) await next.click();
    }
    assert.equal(await next.isDisabled(), true);
    assert.deepEqual([...seen].sort(), [...expected].sort());
    assert.equal(new Set(seen).size, count);
    await card().click();
    await filters.getByRole('button', { name: 'All', exact: true }).click();
    assert.equal(await progress().textContent(), '1 / 38');
    assert.equal(await card().getAttribute('aria-pressed'), 'false');
  }
  await page.getByRole('button', { name: 'Shuffle', exact: true }).click();
  const seenAll = [];
  for (let index = 0; index < 38; index++) {
    seenAll.push((await card().textContent()).replace('Click to reveal', ''));
    if (index < 37) await next.click();
  }
  assert.equal(new Set(seenAll).size, 38); // A word reused in two lessons has distinct lesson associations.
  await list.click();
  assert.deepEqual(await page.locator('article h3').allTextContents(), original, 'shuffle must leave list order intact');
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const listWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    await flashcards.click();
    await filters.getByRole('button', { name: 'Lesson 2', exact: true }).click();
    for (let index = 0; index < 4; index++) {
      await card().click();
      const layout = await page.evaluate(() => ({
        width: window.innerWidth, scroll: document.documentElement.scrollWidth,
        overflowing: [...document.querySelectorAll('main *')].filter(element => element.getBoundingClientRect().right > window.innerWidth).map(element => ({ tag: element.tagName, text: element.textContent.slice(0, 60), width: element.getBoundingClientRect().width })),
      }));
      assert.equal(layout.overflowing.length, 0, `Flashcard content overflows at ${width}px: ${JSON.stringify(layout)}`);
      assert.ok(layout.scroll <= listWidth, `Flashcards add overflow compared with List at ${width}px`);
      if (index < 3) await next.click();
    }
    await list.click();
  }
  assert.deepEqual(writes, [], 'study interactions must not write statistics or progress');
  assert.deepEqual(errors, []);
  console.log('PASS: list/toggle; all five filters; click/Enter/Space; hidden meanings; navigation/bounds/counters; reset on card/filter/shuffle; deck coverage; unchanged list order; selected-word TTS invocation; 320/768/1280px layout; no writes or browser errors.');
} finally { await browser.close(); }
