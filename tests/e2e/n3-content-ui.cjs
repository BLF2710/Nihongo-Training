// Every N3 lesson clicked through step by step, plus the N3 reading, listening, speaking, kanji and mock exam
// screens, against a fixture API built from the real course data. Fails on page errors or leftover markup.
//   node n3-content-ui.cjs <baseUrl> <shotsDir>
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const [base, shots] = process.argv.slice(2);
const ROOT = (() => { const { existsSync } = require('node:fs'), { dirname, join } = require('node:path'); let dir = __dirname; while (!existsSync(join(dir, 'nihon-api'))) dir = dirname(dir); return dir; })() + '/';
const read = file => JSON.parse(fs.readFileSync(ROOT + file, "utf8"));
const units = read("shared/course/units.json").filter(unit => unit.level === "N3");
const lessons = read("shared/course/lessons.json").filter(lesson => lesson.level === "N3");
const liveUnits = units.filter(unit => lessons.some(lesson => lesson.unitId === unit.id));
const catalog = read("shared/kanji.json");
const exam = read("shared/course/mock-exams.json").N3;
// Visible text must never show authoring shorthand or raw markup.
const LEFTOVER = /\{[ぁ-ゖァ-ヺー-]*\}|<\/?ruby|<\/?rt|undefined|NaN/;
const KANJI_PER_CONTENT_LESSON = 6;
const CONTENT_LESSONS_PER_UNIT = 5;

const courseUnit = unit => ({
  id: unit.id, number: unit.number, title: unit.title, description: unit.description, requiredLevel: 1, allowed: true, reasons: [],
  completedLessons: 6, totalLessons: 6, allLessonsCompleted: true, assessmentUnlocked: true, assessmentPassed: true, completed: true,
  bestScore: 100, bestCorrect: 15, questionCount: 15, passPercent: 80,
  lessons: lessons.filter(lesson => lesson.unitId === unit.id).map(lesson => ({ id: lesson.id, slug: lesson.slug, title: lesson.title, description: "", isPlaceholder: false, allowed: true, reasons: [], completed: true })),
});

(async () => {
  assert.ok(liveUnits.length > 0, "no N3 unit is imported yet");
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await context.addInitScript(token => {
      localStorage.setItem("token", token); localStorage.setItem("user_handle", "mika"); localStorage.setItem("app_language", "japanese"); localStorage.setItem("course_level", "N3");
    }, `test.${Buffer.from(JSON.stringify({ userId: 1 })).toString("base64url")}.x`);
    const mockPosts = [];
    await context.route("http://localhost:5000/api/**", route => {
      const request = route.request(), p = new URL(request.url()).pathname.replace("/api", ""), json = data => route.fulfill({ json: data });
      if (p === "/site") return json({ registration_enabled: true, announcement: "", disabled: [] });
      if (p === "/units") return json({ units: liveUnits.map(courseUnit) });
      if (/^\/lessons\/[^/]+\/access$/.test(p)) return json({ allowed: true });
      if (/^\/lessons\/[^/]+\/complete$/.test(p)) return json({ lessonCompleted: true, xpAwarded: 0 });
      if (p === "/mock-exams/N3/results" && request.method() === "POST") { mockPosts.push(request.postDataJSON()); return route.fulfill({ status: 201, json: { result: { id: 1, level: "N3", correct: 40, total: 40, percent: 100, passed: true, timedOut: false, sections: [], createdAt: new Date().toISOString() } } }); }
      if (p === "/mock-exams/N3/results") return json({ results: [], attempts: 0, bestPercent: null, hasPassed: false });
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

    // ---- Every N3 lesson, every step
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
    await page.screenshot({ path: `${shots}/n3-last-lesson.png`, fullPage: true });

    // ---- Reading: each live N3 unit's review passage
    for (const unit of liveUnits) {
      await page.goto(`${base}/reading?unit=${unit.id}`);
      const passage = lessons.find(lesson => lesson.unitId === unit.id && lesson.reading)?.reading;
      if (passage) await page.getByText(passage.genre).first().waitFor();
      await checkText(`reading ${unit.id}`);
    }

    // ---- Listening and speaking open on N3 material
    const lastUnit = liveUnits.at(-1);
    for (const skill of ["listening", "speaking"]) {
      await page.goto(`${base}/${skill}?unit=${lastUnit.id}`);
      assert.equal(await page.getByLabel("Choose a unit").inputValue(), lastUnit.id);
      await page.getByRole("button", { name: "Start practice →" }).click();
      await page.getByText(/Question 1 \//).first().waitFor();
      await checkText(`${skill} ${lastUnit.id}`);
    }

    // ---- Kanji: the N3 filter lists six kanji per content lesson of every live unit
    await page.goto(`${base}/learn/kanji?level=N3`);
    const n3Kanji = catalog.kanji.filter(kanji => catalog.lessonIntroductions.some(item => item.lessonId.startsWith("japanese-n3-") && item.introducedKanji.includes(kanji.id)));
    assert.equal(n3Kanji.length, liveUnits.length * CONTENT_LESSONS_PER_UNIT * KANJI_PER_CONTENT_LESSON);
    await page.getByText(n3Kanji[0].character, { exact: true }).first().waitFor();
    await page.getByText(n3Kanji.at(-1).character, { exact: true }).first().waitFor();
    await checkText("kanji N3");
    await page.screenshot({ path: `${shots}/n3-kanji.png` });

    // ---- Mock exam: all correct answers give 100%, sent to the server for grading
    const questionCount = exam.sections.flatMap(section => section.groups.flatMap(group => group.questions)).length;
    await page.goto(`${base}/mock-exam?level=N3`);
    await page.getByRole("heading", { name: "N3 mock exam" }).waitFor(); await page.getByText(`${exam.minutes} minutes`).waitFor();
    await page.getByRole("button", { name: "Start the exam →" }).click();
    for (const [index, section] of exam.sections.entries()) {
      if (index) await page.getByRole("button", { name: `${section.title} →` }).click();
      await checkText(`mock exam ${section.id}`);
      for (const question of section.groups.flatMap(group => group.questions)) {
        await page.locator("li", { has: page.locator(`#q-${question.id}`) }).getByRole("radio").nth(question.correctIndex).click();
      }
    }
    await page.getByText(`${questionCount} / ${questionCount} answered`).waitFor();
    await page.getByRole("button", { name: "Submit exam" }).click(); await page.getByRole("button", { name: "Yes, submit" }).click();
    await page.locator('section[aria-label="Exam result"]').getByText("100%").first().waitFor();
    await checkText("mock exam result");
    assert.equal(Object.keys(mockPosts[0].answers).length, questionCount);
    await page.screenshot({ path: `${shots}/n3-mock-exam-result.png` });

    console.log(`PASS: ${lessons.length} N3 lessons opened and clicked through (${stepsSeen} screens) without page errors or leftover markup; reading passages for ${liveUnits.length} unit(s); listening and speaking on N3 material; ${n3Kanji.length} N3 kanji listed; N3 mock exam (${questionCount} questions) answered, submitted and scored 100%.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(String(error.stack || error).slice(0, 2000)); process.exitCode = 1; });
