// Kanji screens: "Add to flashcards" on a kanji's page (no inline flashcard any more), and the separate flashcard
// screen opened from the kanji list. Fixture API with a remembered list.
//   node kanji-flashcards-ui.cjs <baseUrl> <shotsDir>
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })();
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const catalog = JSON.parse(fs.readFileSync(ROOT + "/shared/kanji.json", "utf8"));
const n4Unit3 = new Set(catalog.lessonIntroductions.filter(item => item.lessonId.startsWith("japanese-n4-unit-3-")).flatMap(item => item.introducedKanji));

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async viewport => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(token => { localStorage.setItem("token", token); localStorage.setItem("app_language", "japanese"); localStorage.setItem("course_level", "N5"); }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString("base64url")}.x`);
      const state = { list: [], calls: [] };
      await context.route("http://localhost:5000/api/**", route => {
        const request = route.request(), p = new URL(request.url()).pathname.replace("/api", ""), method = request.method(), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === "/site") return json({ registration_enabled: true, announcement: "", disabled: [] });
        if (p === "/kanji/progress") return json({ progress: catalog.kanji.map(k => ({ kanjiId: k.id, correctCount: 0, wrongCount: 0, total: 0, accuracy: 0, status: "untested", lastPracticedAt: null })) });
        if (p === "/kanji/flashcards") return json({ kanjiIds: state.list });
        const card = p.match(/^\/kanji\/flashcards\/(.+)$/);
        if (card) {
          const id = decodeURIComponent(card[1]); state.calls.push(`${method} ${id}`);
          if (method === "PUT" && !state.list.includes(id)) state.list.push(id);
          if (method === "DELETE") state.list = state.list.filter(item => item !== id);
          return json({ kanjiIds: state.list });
        }
        if (p === "/inbox") return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        return json({});
      });
      const page = await context.newPage(); const errors = []; page.on("pageerror", e => errors.push(e.message));
      return { context, page, state, errors };
    };
    const noOverflow = async (page, label) => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} overflows`);

    let { context, page, state, errors } = await run({ width: 1280, height: 900 });
    // ---- A kanji's page: details, practice, Add to flashcards; no inline flashcard
    await page.goto(`${base}/learn/kanji/kanji-65e5`);
    await page.getByRole("heading", { name: "日", exact: true }).waitFor();
    assert.equal(await page.getByRole("button", { name: "Study flashcards" }).count(), 0, "no flashcard button on the details");
    assert.equal(await page.getByRole("article", { name: "Study 日" }).count(), 0, "no flashcard under the details");
    const addButton = page.getByRole("button", { name: "Add to flashcards" });
    await addButton.click();
    await page.getByText("In your flashcards ✓").waitFor();
    assert.deepEqual(state.calls, ["PUT kanji-65e5"]);
    await page.screenshot({ path: `${shots}/kanji-added.png` });
    await page.getByRole("button", { name: "Remove", exact: true }).click(); await addButton.waitFor();
    assert.deepEqual(state.list, []);
    await addButton.click(); await page.getByText("In your flashcards ✓").waitFor();
    // A second kanji, then reload: the list is remembered by the server.
    await page.goto(`${base}/learn/kanji/kanji-6708`); await page.getByRole("heading", { name: "月", exact: true }).waitFor();
    await addButton.click(); await page.getByText("In your flashcards ✓").waitFor();
    await page.reload(); await page.getByText("In your flashcards ✓").waitFor();

    // ---- The kanji list: "Study flashcards" goes to its own screen, keeping the chosen level and unit
    await page.goto(`${base}/learn/kanji?level=N4&unit=japanese-n4-unit-3`);
    await page.getByRole("heading", { name: "Kanji", exact: true }).waitFor();
    assert.equal(await page.getByRole("article").count(), 0, "no flashcards on the list screen");
    await page.getByRole("link", { name: "Study flashcards" }).click();
    await page.waitForURL("**/learn/kanji/flashcards?level=N4&unit=japanese-n4-unit-3");
    await page.getByRole("heading", { name: "Kanji flashcards" }).waitFor();
    // Own list first when it has cards
    const mine = page.getByRole("tab", { name: "My flashcards (2)" });
    await mine.waitFor(); assert.equal(await mine.getAttribute("aria-selected"), "true");
    await page.getByLabel("Card 1 of 2", { exact: true }).waitFor();
    await page.getByRole("article", { name: "Study 日" }).waitFor();
    await page.getByRole("button", { name: "Next →" }).click(); await page.getByRole("article", { name: "Study 月" }).waitFor();
    // The card shows three example words, the rest under "View more vocabulary", and no practice button.
    const card = page.getByRole("article", { name: "Study 月" });
    const examples = catalog.vocabularyForms.filter(form => form.kanjiIds.includes("kanji-6708")).length;
    assert.ok(examples > 3, "月 needs more than three example words for this check");
    assert.equal(await card.locator(":scope > div > div").first().locator("> ul > li").count(), 3);
    await card.getByText(`View more vocabulary (${examples - 3})`).waitFor();
    assert.equal(await card.getByRole("link", { name: "Mixed practice →" }).count(), 0);
    await page.screenshot({ path: `${shots}/kanji-flashcards.png`, fullPage: true });
    // The chosen set
    await page.getByRole("tab", { name: `N4 Unit 3 (${n4Unit3.size})` }).click();
    await page.getByLabel(`Card 1 of ${n4Unit3.size}`, { exact: true }).waitFor();
    // Manage the list: remove one card
    await page.getByRole("tab", { name: "My flashcards (2)" }).click();
    await page.getByText("Manage my list").click();
    await page.getByRole("button", { name: "Remove 日 from my flashcards" }).click();
    await page.getByRole("tab", { name: "My flashcards (1)" }).waitFor();
    await page.getByLabel("Card 1 of 1", { exact: true }).waitFor(); await page.getByRole("article", { name: "Study 月" }).waitFor();
    await noOverflow(page, "flashcards");
    await page.getByRole("link", { name: "← Back to the kanji list" }).click();
    await page.waitForURL("**/learn/kanji?level=N4&unit=japanese-n4-unit-3");
    assert.deepEqual(errors, []); await context.close();

    // ---- Empty list: the set is studied, and the list explains how to add cards; phone width
    ({ context, page, state, errors } = await run({ width: 375, height: 812 }));
    await page.goto(`${base}/learn/kanji/flashcards`);
    const setTab = page.getByRole("tab", { name: /^N5 kanji \(\d+\)$/ });
    await setTab.waitFor(); assert.equal(await setTab.getAttribute("aria-selected"), "true");
    await page.getByLabel(/^Card 1 of \d+$/).waitFor();
    await page.getByRole("tab", { name: "My flashcards (0)" }).click();
    await page.getByText("Your list is empty.").waitFor();
    await noOverflow(page, "flashcards phone");
    await page.getByRole("button", { name: "Study N5 kanji" }).click(); await page.getByLabel(/^Card 1 of \d+$/).waitFor();
    assert.deepEqual(errors, []); await context.close();

    console.log("PASS: a kanji's page has Add to flashcards (add, remove, remembered after reload) and no inline flashcard; the list's Study flashcards opens its own screen with the chosen level and unit; cards show 3 example words (rest in a dropdown) and no practice button; my list first when it has cards, the chosen set as a tab; remove from the list; back link keeps the filters; empty list explained and the set studied instead; fits phones; no page errors.");
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1800)); process.exitCode = 1; });
