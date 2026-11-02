// The island map (/map): fog over islands a learner has not reached, clearing with progress; the island panel
// (destinations, fog hint with the next step, Home stats), Esc and keyboard use; one screen on a laptop and a phone;
// the night palette; a failed progress request opens every island; links to and from the dashboard. Fixture API.
//   node island-map-ui.cjs <baseUrl> <shotsDir>
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);

const lesson = (slug, completed) => ({ id: slug, slug, title: `Lesson ${slug}`, description: "", isPlaceholder: false, allowed: true, reasons: [], completed });
const unit = (number, done, total = 4) => ({
  id: `japanese-n5-unit-${number}`, number, title: `Unit ${number}`, description: "", requiredLevel: 1, allowed: true, reasons: [],
  completedLessons: done, totalLessons: total, allLessonsCompleted: done === total, assessmentUnlocked: done === total, assessmentPassed: done === total,
  completed: done === total, bestScore: null, bestCorrect: null, questionCount: 0, passPercent: null,
  lessons: Array.from({ length: total }, (_, index) => lesson(`n5-${number}-${index + 1}`, index < done)),
});
const profile = { username: "aki", display_name: "Aki", bio: "", avatar: null, learning_language: "japanese", learning_goal: null, daily_goal: 10, profile_visibility: "private",
  xp: 120, level: 3, rank: "Beginner", lessons_completed: 0, current_streak: 4, achievements_count: 0, achievements: [],
  xpProgress: { currentLevelXp: 0, nextLevelXp: 200, progressXp: 120, progressPercent: 60 } };
const FOGGED = ["Practice", "Review", "Games", "Kanji"];
const OUTLYING = ["Progress", "Community", "Assistant", "Time", "Achievements"];
const friend = (name, progress) => ({ username: name.toLowerCase(), displayName: name, since: "2026-01-01", progress });
const friends = { friends: [friend("Yui", { level: 4, currentStreak: 3, activeToday: true, friendStreak: 2, studyingNow: false }), friend("Mia", null)], incoming: [], outgoing: [] };

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const run = async (viewport, { units, theme = "light", hour = 12 }) => {
      const context = await browser.newContext({ viewport });
      await context.addInitScript(([token, theme]) => { localStorage.setItem("token", token); localStorage.setItem("app_language", "japanese"); localStorage.setItem("course_level", "N5"); localStorage.setItem("theme", theme); },
        [`test.${Buffer.from(JSON.stringify({ userId: 1 })).toString("base64url")}.x`, theme]);
      await context.route("http://localhost:5000/api/**", route => {
        const p = new URL(route.request().url()).pathname.replace("/api", ""), json = (data, status = 200) => route.fulfill({ status, json: data });
        if (p === "/site") return json({ registration_enabled: true, announcement: "", disabled: [] });
        if (p === "/units") return units ? json({ units }) : json({ message: "down" }, 500);
        if (p === "/profile/me") return json(profile);
        if (p === "/srs/summary") return json({ total: 20, newCards: 0, dueNow: 7, dueToday: 7, learned: 0, mature: 0, reviewedToday: 0, dueSoon: 0, suspended: 0, newToday: 0, dueTotal: 7 });
        if (p === "/friends") return json(friends);
        if (p === "/inbox") return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
        return json({});
      });
      const page = await context.newPage(); await page.clock.setFixedTime(new Date(2026, 10, 2, hour, 30)); const errors = []; page.on("pageerror", e => errors.push(e.message));
      return { context, page, errors, map: page.locator("main") };
    };
    const island = (map, name) => map.getByRole("button", { name: new RegExp(`^${name}([ ,]|$)`) });
    const fogged = async map => { const names = []; for (const name of ["Home", "Lessons", ...FOGGED, "Kana", ...OUTLYING]) if ((await island(map, name).getAttribute("aria-label")).includes("in fog")) names.push(name); return names.sort(); };
    // Fog appears once progress has loaded, so the check waits for the expected islands.
    const expectFogged = async (page, map, expected) => {
      const deadline = Date.now() + 5000; let names = [];
      while (Date.now() < deadline) { names = await fogged(map); if (JSON.stringify(names) === JSON.stringify([...expected].sort())) return; await page.waitForTimeout(100); }
      assert.deepEqual(names, [...expected].sort());
    };
    const fitsScreen = async (page, label) => assert.deepEqual(await page.evaluate(() => [document.documentElement.scrollHeight <= innerHeight, document.documentElement.scrollWidth <= innerWidth]), [true, true], `${label} scrolls`);

    // ---- A new learner: only Home, Lessons and Kana are clear; the fog explains itself and points to the next lesson
    let { context, page, errors, map } = await run({ width: 1366, height: 768 }, { units: [unit(1, 0)] });
    await page.goto(`${base}/map`);
    await page.getByRole("heading", { name: "Island map" }).waitFor();
    await island(map, "Lessons").waitFor();
    await expectFogged(page, map, FOGGED);
    assert.equal(await page.getByRole("navigation", { name: "Page navigation" }).count(), 0, "no Back bar on the map");
    await fitsScreen(page, "laptop map");
    await island(map, "Games").click();
    const panel = page.getByRole("region", { name: "Games" });
    await panel.getByText("This island is in fog").waitFor();
    await panel.getByText("Finish 3 more lessons to clear the fog.").waitFor();
    assert.equal(await panel.getByRole("link", { name: /Continue Lesson n5-1-1/ }).getAttribute("href"), "/lessons/japanese/n5-1-1");
    assert.equal(await panel.getByRole("link", { name: /Particle Drop/ }).getAttribute("href"), "/games/particles", "fog never blocks a destination");
    assert.equal(await island(map, "Games").getAttribute("aria-expanded"), "true");
    await fitsScreen(page, "laptop panel");
    await page.screenshot({ path: `${shots}/island-map-fog.png` });
    await page.keyboard.press("Escape");
    assert.equal(await panel.count(), 0, "Esc closes the panel");
    assert.equal(await island(map, "Games").evaluate(element => element === document.activeElement), true, "focus returns to the island");

    // ---- Keyboard: Tab to an island, Enter opens it with focus on Close; Home shows the learner's stats
    await island(map, "Home").focus(); await page.keyboard.press("Enter");
    const home = page.getByRole("region", { name: "Home" });
    assert.equal(await home.getByRole("button", { name: "Close Home" }).evaluate(element => element === document.activeElement), true);
    for (const [label, value] of [["Day streak", "🔥 4"], ["Level", "3"], ["Reviews due", "7"]]) await home.getByText(label).locator("xpath=following-sibling::dd").filter({ hasText: value }).waitFor();
    assert.equal(await home.getByRole("progressbar").getAttribute("aria-valuenow"), "60");
    assert.match(await island(map, "Review").getAttribute("aria-label"), /7 due/);
    await home.getByRole("button", { name: "Close Home" }).click();

    // ---- The outlying places: Fuji's climb, the harbour's friends, the tea house's question box
    await island(map, "Progress").click();
    const fuji = page.getByRole("region", { name: "Progress" });
    const climb = fuji.getByRole("list", { name: /Your climb/ });
    assert.equal(await climb.getByRole("listitem").count(), 5, "one station per JLPT level");
    await climb.getByRole("listitem").filter({ hasText: "N5" }).getByText("You are here").waitFor();
    await climb.getByText("0 of 1 units").waitFor();
    assert.equal(await fuji.getByRole("link", { name: /Mock exam/ }).getAttribute("href"), "/mock-exam");
    await fitsScreen(page, "laptop Fuji panel");
    await page.keyboard.press("Escape");
    await island(map, "Community").click();
    await page.getByRole("region", { name: "Community" }).getByText("Yui studied today.").waitFor();
    await page.keyboard.press("Escape");
    await island(map, "Achievements").click();
    const onsen = page.getByRole("region", { name: "Achievements" });
    await onsen.getByText("No badges yet.", { exact: false }).waitFor();
    assert.equal(await onsen.getByRole("link", { name: /All achievements/ }).getAttribute("href"), "/achievements");
    await page.keyboard.press("Escape");
    await island(map, "Assistant").click();
    await page.getByRole("region", { name: "Assistant" }).getByLabel("Ask sensei").fill("は or が?");
    await page.getByRole("region", { name: "Assistant" }).getByRole("button", { name: "Ask" }).click();
    await page.waitForURL(url => url.pathname === "/assistant" && url.searchParams.get("q") === "は or が?");
    assert.deepEqual(errors, []); await context.close();

    // ---- Progress clears the fog: three lessons open Games; a completed unit opens Kanji
    ({ context, page, errors, map } = await run({ width: 1366, height: 768 }, { units: [unit(1, 3)] }));
    await page.goto(`${base}/map`); await island(map, "Lessons").waitFor();
    await expectFogged(page, map, ["Kanji"]);
    await context.close();
    ({ context, page, errors, map } = await run({ width: 1366, height: 768 }, { units: [unit(1, 4), unit(2, 0)] }));
    await page.goto(`${base}/map`); await island(map, "Lessons").waitFor();
    await page.getByText("Lv 3").waitFor(); await page.waitForTimeout(300);
    await expectFogged(page, map, []);
    // The dashboard links to the map, and the map back to the dashboard.
    await page.getByRole("link", { name: "Classic dashboard" }).first().click(); await page.waitForURL(`${base}/`);
    await page.getByRole("link", { name: "Island map" }).click(); await page.waitForURL("**/map");
    await island(map, "Lessons").waitFor();
    assert.deepEqual(errors, []); await context.close();

    // ---- Phone, dark site: the map keeps its own time (day at noon); the Time island picks night, which survives a reload,
    //      and "Follow my clock" returns to the clock. One screen, the panel as a bottom sheet.
    const seaTop = map => map.evaluate(element => getComputedStyle(element).getPropertyValue("--sea-top").trim());
    ({ context, page, errors, map } = await run({ width: 390, height: 844 }, { units: [unit(1, 0)], theme: "dark", hour: 12 }));
    await page.goto(`${base}/map`); await island(map, "Kana").waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), true);
    assert.equal(await map.getAttribute("data-time"), "day", "the site's dark theme does not change the map");
    await fitsScreen(page, "phone map");
    await island(map, "Time").click();
    const time = page.getByRole("group", { name: "Time on the map" });
    assert.equal(await time.getByRole("radio", { name: /Follow my clock \(now day\)/ }).isChecked(), true);
    await time.locator("label", { hasText: "Night" }).click();
    assert.equal(await seaTop(map), "#131a26", "night sea");
    await page.reload(); await island(map, "Kana").waitFor();
    assert.equal(await map.getAttribute("data-time"), "night", "the chosen time is remembered");
    await island(map, "Time").click();
    await time.locator("label", { hasText: "Follow my clock" }).click();
    assert.equal(await map.getAttribute("data-time"), "day");
    await page.keyboard.press("Escape");
    await island(map, "Kana").click();
    await page.getByRole("region", { name: "Kana" }).getByRole("link", { name: /Hiragana/ }).waitFor();
    await fitsScreen(page, "phone panel");
    await page.screenshot({ path: `${shots}/island-map-phone-dark.png` });
    assert.deepEqual(errors, []); await context.close();

    // ---- The map follows the learner's clock: dawn 5–8, day 8–16, dusk 16–18, night otherwise
    for (const [hour, mood, seaTop] of [[6, "dawn", "#f7e7df"], [12, "day", "#e2f3f2"], [17, "dusk", "#f8d8b6"], [21, "night", "#131a26"]]) {
      ({ context, page, errors, map } = await run({ width: 1366, height: 768 }, { units: [unit(1, 0)], hour }));
      await page.goto(`${base}/map`); await island(map, "Lessons").waitFor();
      assert.equal(await map.getAttribute("data-time"), mood, `${hour}:30 is ${mood}`);
      assert.equal(await map.evaluate(element => getComputedStyle(element).getPropertyValue("--sea-top").trim()), seaTop, `${mood} sea`);
      if (mood === "dusk") await page.screenshot({ path: `${shots}/island-map-dusk.png` });
      assert.deepEqual(errors, []); await context.close();
    }

    // ---- Progress fails to load: the map says so and opens every island
    ({ context, page, errors, map } = await run({ width: 1366, height: 768 }, { units: null }));
    await page.goto(`${base}/map`);
    await page.getByRole("status").filter({ hasText: "every island is open" }).waitFor();
    await expectFogged(page, map, []);
    await context.close();

    console.log("PASS: the island map fogs Practice, Review, Games and Kanji for a new learner and clears them with lessons and a completed unit; an island opens a panel with its destinations (still reachable in fog), the fog hint and the next lesson; Esc closes it and returns focus; Enter opens an island from the keyboard; Home shows streak, level, progress and reviews due, and Review carries a due badge; Progress (Mt Fuji), Community (the harbour) and Assistant (the tea house) are never fogged — Progress shows one climb station per level with “You are here” and links to the mock exam, Community names friends who studied today, and Ask sensei opens the assistant with the question; no Back bar; one screen at 1366×768 and 390×844 (bottom sheet on phones); the map follows the clock (dawn, day, dusk, night) whatever the site theme, and the Time island keeps a chosen time across reloads or returns to the clock; a failed progress request opens every island; the dashboard and the map link to each other; no page errors.");
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 1800)); process.exitCode = 1; });
