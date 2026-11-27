// The English isle's townsfolk: today's errands from the learner's English study, and what each townsperson says.
// Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { englishTownErrands, townsfolkNews } from "../src/lib/englishTown/townNews.ts";
import { TOWNSFOLK } from "../src/lib/englishTown/townsfolk.ts";

const UNKNOWN = { cards: null, nextStep: null, today: null, goal: null, streak: null, inbox: null, openMistakes: null };
const BUSY_DAY = {
  ...UNKNOWN,
  cards: { dueTotal: 5, reviewedToday: 0, total: 40 },
  nextStep: { title: "Daily routines", href: "/lessons/english/english-a2-unit-1-daily-routines" },
  today: { hasFinishedLesson: false, hasPractised: false },
  goal: { minutesToday: 5, goalMinutes: 15, isGoalMet: false },
};

test("a busy day has four errands: flashcards, a lesson, a listening or speaking round, and the goal", () => {
  assert.deepEqual(englishTownErrands(BUSY_DAY).map(({ id }) => id), ["flashcards", "lesson", "practice", "goal"]);
});

test("nothing known gives no errands", () => {
  assert.deepEqual(englishTownErrands(UNKNOWN), []);
});

test("the lesson errand leads to the next lesson", () => {
  assert.equal(englishTownErrands(BUSY_DAY).find(({ id }) => id === "lesson")?.href, BUSY_DAY.nextStep.href);
});

test("the flashcards errand is done once no card is due", () => {
  const cleared = { ...BUSY_DAY, cards: { dueTotal: 0, reviewedToday: 5, total: 40 } };
  assert.equal(englishTownErrands(cleared).find(({ id }) => id === "flashcards")?.isDone, true);
});

test("without flashcards to clear or review today, there is no flashcards errand", () => {
  const none = { ...BUSY_DAY, cards: { dueTotal: 0, reviewedToday: 0, total: 40 } };
  assert.equal(englishTownErrands(none).some(({ id }) => id === "flashcards"), false);
});

test("every errand is given by a townsperson", () => {
  assert.deepEqual(englishTownErrands(BUSY_DAY).filter(({ giver }) => !TOWNSFOLK[giver]).map(({ id }) => id), []);
});

test("the trader has news when cards are due, and counts them", () => {
  const news = townsfolkNews("barbarian", BUSY_DAY, englishTownErrands(BUSY_DAY));
  assert.deepEqual([news.hasNews, news.english, news.vietnamese], [true, "5 cards are waiting for you.", "Có 5 thẻ đang chờ bạn."]);
});

test("the knight names the next step, in English and Vietnamese", () => {
  const news = townsfolkNews("knight", BUSY_DAY, englishTownErrands(BUSY_DAY));
  assert.deepEqual([news.english, news.vietnamese], ["Your next step: Daily routines.", "Bước tiếp theo của bạn: Daily routines."]);
});

test("a townsperson whose errand is done thanks the learner and has no news", () => {
  const practised = { ...BUSY_DAY, today: { hasFinishedLesson: false, hasPractised: true } };
  const news = townsfolkNews("ranger", practised, englishTownErrands(practised));
  assert.deepEqual([news.hasNews, news.english], [false, "Thank you! Today's errand is done."]);
});

test("the messenger brings unread mail as news", () => {
  const news = townsfolkNews("rogue_hooded", { ...UNKNOWN, inbox: { messages: 2, friendRequests: 1 } }, []);
  assert.deepEqual([news.hasNews, news.english], [true, "Mail for you: 2 unread messages and 1 friend request."]);
});

test("without mail, the messenger points to the mistakes waiting in the notebook first", () => {
  const news = townsfolkNews("rogue_hooded", { ...UNKNOWN, inbox: { messages: 0, friendRequests: 0 }, openMistakes: 3 }, []);
  assert.deepEqual([news.english, news.links[0].href], ["3 mistakes to practise in your notebook.", "/mistakes"]);
});

test("the wise woman counts the day's minutes and the streak", () => {
  const news = townsfolkNews("mage", { ...BUSY_DAY, streak: 4 }, englishTownErrands(BUSY_DAY));
  assert.equal(news.english, "You've studied 5 minutes today, of your 15. You're on a 4-day streak.");
});

test("every townsperson greets the learner even when nothing is known", () => {
  const silent = Object.keys(TOWNSFOLK).filter(id => !townsfolkNews(id, UNKNOWN, []).english);
  assert.deepEqual(silent, []);
});

test("every townsperson's line has its Vietnamese", () => {
  const untranslated = Object.keys(TOWNSFOLK).filter(id => !townsfolkNews(id, BUSY_DAY, englishTownErrands(BUSY_DAY)).vietnamese);
  assert.deepEqual(untranslated, []);
});
