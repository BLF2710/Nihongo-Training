const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

async function main() {
  const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
  const client = await pool.connect();
  try {
    const catalogs = {
      hiragana: (await client.query('SELECT id,kana,romaji FROM hiraganas ORDER BY id')).rows,
      katakana: (await client.query('SELECT id,kana,romaji FROM katakanas ORDER BY id')).rows,
    };
    await client.query('BEGIN');
    try {
      await client.query('CREATE TEMP TABLE katakanas (id SERIAL PRIMARY KEY, kana TEXT, romaji TEXT) ON COMMIT DROP');
      await client.query("INSERT INTO katakanas(kana,romaji) VALUES ('ア','a')");
      const sql = fs.readFileSync(path.resolve(__dirname, '../migrations/005_katakana_quiz_coverage.sql'), 'utf8');
      await client.query(sql); await client.query(sql);
      assert.equal(Number((await client.query('SELECT COUNT(*) FROM katakanas')).rows[0].count), 142);
      assert.equal((await client.query("SELECT id FROM katakanas WHERE kana='ア'")).rows[0].id, 1);
    } finally { await client.query('ROLLBACK'); }
    console.log('PASS: additive migration preserves existing IDs, 142 entries, idempotent rerun.');
    if (!process.argv.includes('--browser')) return;
    const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
    const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE || undefined });
    try {
      const page = await browser.newPage();
      const errors = []; const answers = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => { localStorage.setItem('token', `fixture.${btoa(JSON.stringify({ userId: 1 }))}.fixture`); localStorage.setItem('app_language','japanese'); });
      page.on('dialog', dialog => dialog.accept());
      await page.route('**/api/quiz/characters?*', route => {
        const type = new URL(route.request().url()).searchParams.get('type');
        return route.fulfill({ json: { type, characters: catalogs[type] } });
      });
      await page.route('**/api/quiz/answer', route => {
        const answer = route.request().postDataJSON(); answers.push(answer);
        const character = catalogs[answer.type].find(item => item.id === answer.kanaId);
        assert.ok(character);
        return route.fulfill({ json: { correct: answer.answer === character.romaji, correctAnswer: character.romaji, type: answer.type } });
      });
      for (const type of ['hiragana', 'katakana']) {
        await page.goto(`http://127.0.0.1:5181/practice?type=${type}`);
        const start = page.getByRole('button', { name: 'Start Quiz →', exact: true });
        await start.waitFor(); assert.ok(await start.isDisabled());
        const singles = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Single characters', exact: true }) });
        await singles.locator('summary').click();
        for (const [family, expected] of [['Vowels', 'a,i,u,e,o'], ['K', 'ka,ki,ku,ke,ko']]) {
          const column = singles.getByRole('group', { name: `${family} sound group`, exact: true });
          const buttons = column.locator('button:not([aria-label^="Select "])');
          assert.equal((await buttons.allTextContents()).map(text => text.trim().replace(/^[^a-z]+/, '')).join(','), expected);
          const first = await buttons.nth(0).boundingBox(); const second = await buttons.nth(1).boundingBox();
          assert.equal(first.x, second.x); assert.ok(second.y > first.y);
          const heading = column.getByRole('button', { name: /^Select .* column$/ });
          await heading.click();
          assert.equal(await buttons.count(), 5);
          for (const button of await buttons.all()) assert.equal(await button.getAttribute('aria-pressed'), 'true');
          await heading.click();
          for (const button of await buttons.all()) assert.equal(await button.getAttribute('aria-pressed'), 'false');
        }
        const scroll = singles.getByRole('region', { name: 'Single character columns', exact: true });
        assert.ok(await scroll.evaluate(element => element.scrollWidth > element.clientWidth));
        await page.getByRole('button', { name: 'Add all single', exact: true }).click();
        await page.getByRole('button', { name: 'Add all single', exact: true }).click();
        await page.getByRole('status').filter({ hasText: /^71 selected$/ }).waitFor();
        await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
        const name = type === 'katakana' ? 'Extended characters' : 'Double characters';
        const section = page.locator('section').filter({ has: page.getByRole('heading', { name, exact: true }) });
        await section.locator('summary').click();
        const character = catalogs[type].find(item => item.kana === (type === 'katakana' ? 'ファ' : 'きゃ'));
        await section.getByRole('button', { name: `${character.kana} ${character.romaji}`, exact: true }).click();
        await start.click();
        await page.getByPlaceholder('Type romaji...').fill(character.romaji);
        await page.getByText('Correct! ✅', { exact: true }).waitFor();
        await page.getByPlaceholder('Type romaji...').fill('wrong');
        await page.getByRole('button', { name: /Submit/ }).click();
        await page.getByText('Incorrect ❌', { exact: true }).waitFor();
        assert.ok(answers.filter(item => item.type === type).every(item => item.kanaId === character.id));
        await page.getByRole('button', { name: '← Change characters', exact: true }).click();
        await page.getByRole('status').filter({ hasText: /^1 selected$/ }).waitFor();
        await page.setViewportSize({ width: 390, height: 844 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        // A refresh now restores the game, rather than discarding the selection.
        await page.reload(); await page.getByText('Incorrect ❌', { exact: true }).waitFor();
        assert.equal(await page.getByPlaceholder('Type romaji...').inputValue(), 'wrong');
      }
      assert.deepEqual(errors, []);
      console.log('PASS: both setup screens, empty guard, group deduplication, individual/double/extended selections, selected-only questions, same answer endpoint, correct/wrong feedback, change selection, refresh and mobile. Browser grading is stubbed; no user progress is written.');
    } finally { await browser.close(); }
  } finally { client.release(); await pool.end(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
