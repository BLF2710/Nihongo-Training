// Every N4 lesson clicked through step by step, plus the N4 reading, listening, speaking, kanji and mock exam
// screens, against a fixture API built from the real course data. Fails on page errors or leftover markup.
//   node n4-content-ui.cjs <baseUrl> <shotsDir>
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })() + '/';
const read = file => JSON.parse(fs.readFileSync(ROOT + file, "utf8"));
const units = read("shared/course/units.json").filter(unit => unit.level === "N4");
const lessons = read("shared/course/lessons.json").filter(lesson => lesson.level === "N4");
const exam = read("shared/course/mock-exams.json").N4;
const catalog = read("shared/kanji.json");
// Visible text must never show authoring shorthand or raw markup.
const LEFTOVER = /\{[ぁ-ゖァ-ヺー-]*\}|<\/?ruby|<\/?rt|undefined|NaN/;

const courseUnit = unit => ({
  id: unit.id, number: unit.number, title: unit.title, description: unit.description, requiredLevel: 1, allowed: true, reasons: [],
  completedLessons: 6, totalLessons: 6, allLessonsCompleted: true, assessmentUnlocked: true, assessmentPassed: true, completed: true,
  bestScore: 100, bestCorrect: 15, questionCount: 15, passPercent: 80,
  lessons: lessons.filter(lesson => lesson.unitId === unit.id).map(lesson => ({ id: lesson.id, slug: lesson.slug, title: lesson.title, description: "", isPlaceholder: false, allowed: true, reasons: [], completed: true })),
});

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(token => {
      localStorage.setItem("token", token); localStorage.setItem("user_handle", "mika"); localStorage.setItem("app_language", "japanese"); localStorage.setItem("course_level", "N4");
    }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString("base64url")}.x`);
    const mockPosts = [];
    await context.route("http://localhost:5000/api/**", route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace("/api", ""), json = data => route.fulfill({ json: data });
      if (p === "/site") return json({ registration_enabled: true, announcement: "", disabled: [] });
      if (p === "/units") return json({ units: units.map(courseUnit) });
      if (/^\/lessons\/[^/]+\/access$/.test(p)) return json({ allowed: true });
      if (/^\/lessons\/[^/]+\/complete$/.test(p)) return json({ lessonCompleted: true, xpAwarded: 0 });
      if (p === "/mock-exams/N4/results" && request.method() === "POST") { mockPosts.push(request.postDataJSON()); return route.fulfill({ status: 201, json: { result: { id: 1, level: "N4", correct: 36, total: 36, percent: 100, passed: true, timedOut: false, sections: [], createdAt: new Date().toISOString() } } }); }
      if (p === "/mock-exams/N4/results") return json({ results: [], attempts: 0, bestPercent: null, hasPassed: false });
      if (p === "/profile/me") return json({ username: "mika", display_name: "Mika", level: 1, rank: "Beginner", xp: 0, xpProgress: { progressPercent: 0, nextLevelXp: 100 }, current_streak: 0, achievements_count: 0 });
      if (p === "/inbox") return json({ direct: 0, support: 0, total: 0, friendRequests: 0, notifications: 0 });
      return json({});
    });
    const page = await context.newPage();
    const errors = []; page.on("pageerror", error => errors.push(error.message));
    const checkText = async label => {
      const text = await page.locator("main").innerText();
      const leftover = text.match(LEFTOVER);
      assert.equal(leftover, null, `${label}: leftover markup "${leftover?.[0]}"`);
      assert.deepEqual(errors, [], `${label}: page errors`);
    };

    // ---- Every N4 lesson, every step
    let stepsSeen = 0;
    const clearSavedSession = async () => page.url().startsWith(base) && page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith("learning-session-v1:")).forEach(key => localStorage.removeItem(key)));
    for (const lesson of lessons) {
      // The previous lesson was left unfinished on purpose; drop its saved place so the next one opens directly.
      await clearSavedSession();
      await page.goto(`${base}/lessons/japanese/${lesson.slug}`);
      await page.getByText(lesson.title, { exact: true }).first().waitFor();
      for (let step = 0; step < 6; step++) {
        await checkText(`${lesson.id} step ${step}`); stepsSeen++;
        if (step === 5) {
          // Practice: answer every question (the first option of each), which unlocks the challenge.
          const groups = page.locator("main div.mt-4.space-y-2");
          const count = await groups.count();
          for (let index = 0; index < count; index++) await groups.nth(index).locator("button").first().click();
        }
        await page.getByRole("button", { name: "Continue →" }).click();
      }
      await checkText(`${lesson.id} challenge`); stepsSeen++;
    }
    await page.screenshot({ path: `${shots}/n4-last-lesson.png`, fullPage: true });

    // ---- Reading: each N4 unit's review passage
    for (const unit of units) {
      await page.goto(`${base}/reading?unit=${unit.id}`);
      const passage = lessons.find(lesson => lesson.unitId === unit.id && lesson.reading)?.reading;
      if (passage) await page.getByText(passage.genre).first().waitFor();
      await checkText(`reading ${unit.id}`);
    }

    // ---- Listening and speaking open on N4 material
    for (const skill of ["listening", "speaking"]) {
      await page.goto(`${base}/${skill}?unit=${units[8].id}`);
      await page.getByText(/Question 1 \//).first().waitFor();
      assert.equal(await page.getByLabel("Choose a unit").inputValue(), units[8].id);
      await checkText(`${skill} ${units[8].id}`);
    }

    // ---- Kanji: the N4 filter lists the 147 N4 kanji
    await page.goto(`${base}/learn/kanji?level=N4`);
    const n4Kanji = catalog.kanji.filter(kanji => catalog.lessonIntroductions.some(item => item.lessonId.startsWith("japanese-n4-") && item.introducedKanji.includes(kanji.id)));
    assert.equal(n4Kanji.length, 147);
    await page.getByText(n4Kanji[0].character, { exact: true }).first().waitFor();
    await page.getByText(n4Kanji.at(-1).character, { exact: true }).first().waitFor();
    await checkText("kanji N4");

    // ---- Mock exam: all correct answers give 100%, sent to the server for grading
    await page.goto(`${base}/mock-exam?level=N4`);
    await page.getByRole("heading", { name: "N4 mock exam" }).waitFor(); await page.getByText("50 minutes").waitFor();
    await page.getByRole("button", { name: "Start the exam →" }).click();
    for (const [index, section] of exam.sections.entries()) {
      if (index) await page.getByRole("button", { name: `${section.title} →` }).click();
      await checkText(`mock exam ${section.id}`);
      for (const question of section.groups.flatMap(group => group.questions)) {
        await page.locator("li", { has: page.locator(`#q-${question.id}`) }).getByRole("radio").nth(question.correctIndex).click();
      }
    }
    await page.getByText("36 / 36 answered").waitFor();
    await page.getByRole("button", { name: "Submit exam" }).click(); await page.getByRole("button", { name: "Yes, submit" }).click();
    await page.locator('section[aria-label="Exam result"]').getByText("100%").first().waitFor();
    await checkText("mock exam result");
    assert.equal(Object.keys(mockPosts[0].answers).length, 36);
    await page.screenshot({ path: `${shots}/n4-mock-exam-result.png` });

    console.log(`PASS: ${lessons.length} N4 lessons opened and clicked through (${stepsSeen} screens) without page errors or leftover markup; reading passages for ${units.length} units; listening and speaking on N4 material; ${n4Kanji.length} N4 kanji listed; N4 mock exam (36 questions) answered, submitted and scored 100%.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
