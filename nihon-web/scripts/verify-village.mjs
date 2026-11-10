// The village square: today's errands from the learner's data, what each villager says, and the square's map (every
// villager can be walked up to). Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { CAST } from "../src/lib/cast.ts";
import { isBlocked } from "../src/lib/errands/townMap.ts";
import { blockedTilesWithOpenGates } from "../src/lib/errands/village.ts";
import { dailyErrands, villagerNews } from "../src/lib/village/villageNews.ts";
import { shortcutPath } from "../src/lib/village/villageShortcuts.ts";
import { nearbyThing } from "../src/lib/village/villageDoors.ts";
import { homeSign, withHomeSign } from "../src/lib/village/homeSign.ts";
import { HOME_BUILDING_ID, VILLAGE_DOORS, VILLAGE_SQUARE as square } from "../src/data/village/villageSquare.ts";

const UNKNOWN = { reviews: null, inbox: null, nextStep: null, goal: null, today: null, streak: null, openMistakes: null };
const busyDay = {
  reviews: { dueTotal: 12, reviewedToday: 0, total: 80 },
  inbox: { messages: 2, friendRequests: 1 },
  nextStep: { title: "At the shop", href: "/lessons/japanese/n5-unit-3-shop" },
  goal: { minutesToday: 4, goalMinutes: 15, isGoalMet: false },
  today: { hasFinishedLesson: false, hasPractised: false },
  streak: 6, openMistakes: 3,
};
const doneDay = {
  ...busyDay,
  reviews: { dueTotal: 0, reviewedToday: 12, total: 80 },
  goal: { minutesToday: 20, goalMinutes: 15, isGoalMet: true },
  today: { hasFinishedLesson: true, hasPractised: true },
};
const ids = errands => errands.map(errand => `${errand.id}:${errand.isDone ? "done" : "to do"}`);

test("a busy day gives four errands, none done", () => {
  assert.deepEqual(ids(dailyErrands(busyDay)), ["review:to do", "lesson:to do", "practice:to do", "goal:to do"]);
});

test("errands are ticked from what the learner did today", () => {
  assert.deepEqual(ids(dailyErrands(doneDay)), ["review:done", "lesson:done", "practice:done", "goal:done"]);
});

test("the lesson errand leads to the next lesson", () => {
  assert.equal(dailyErrands(busyDay).find(errand => errand.id === "lesson").href, "/lessons/japanese/n5-unit-3-shop");
});

test("with nothing known yet there are no errands", () => {
  assert.deepEqual(dailyErrands(UNKNOWN), []);
});

test("no review errand before the deck has anything due or reviewed", () => {
  assert.ok(!dailyErrands({ ...busyDay, reviews: { dueTotal: 0, reviewedToday: 0, total: 0 } }).some(errand => errand.id === "review"));
});

test("no lesson errand once every lesson is done, unless one was finished today", () => {
  assert.ok(!dailyErrands({ ...busyDay, nextStep: null }).some(errand => errand.id === "lesson"));
  assert.ok(dailyErrands({ ...doneDay, nextStep: null }).some(errand => errand.id === "lesson"));
});

test("Zen counts the cards waiting", () => {
  const news = villagerNews("zen", busyDay, dailyErrands(busyDay));
  assert.equal(news.japanese, "カードが 12まい まって います。");
  assert.equal(news.english, "12 cards are waiting for you.");
  assert.ok(news.hasNews);
});

test("a villager whose errand is done thanks the learner and has no news", () => {
  const news = villagerNews("zen", doneDay, dailyErrands(doneDay));
  assert.match(news.english, /Today's errand is done/);
  assert.equal(news.hasNews, false);
});

test("Hato tells about unread messages and friend requests", () => {
  assert.equal(villagerNews("hato", busyDay, []).english, "Mail for you: 2 unread messages and 1 friend request.");
  assert.equal(villagerNews("hato", { ...busyDay, inbox: { messages: 0, friendRequests: 0 } }, []).hasNews, false);
});

test("Hakase points to the next lesson first", () => {
  assert.deepEqual(villagerNews("hakase", busyDay, dailyErrands(busyDay)).links[0], { label: "At the shop", href: "/lessons/japanese/n5-unit-3-shop" });
});

test("every villager has something to say and somewhere to go, even with no data", () => {
  for (const id of Object.keys(CAST)) {
    const news = villagerNews(id, UNKNOWN, []);
    assert.ok(news.japanese && news.english && news.links.length > 0, id);
    assert.equal(news.hasNews, false, `${id} has no news without data`);
  }
});

test("the whole cast lives in the square", () => {
  assert.deepEqual(square.villagers.map(villager => villager.id).sort(), Object.keys(CAST).sort());
});

test("every villager in the square can be walked up to from the start", () => {
  const blocked = blockedTilesWithOpenGates(square, []);
  const start = [Math.floor(square.start.x), Math.floor(square.start.y)];
  const seen = new Set([start.join()]), queue = [start];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const next = [x + dx, y + dy];
      if (!seen.has(next.join()) && !isBlocked(square.map, blocked, ...next)) { seen.add(next.join()); queue.push(next); }
    }
  }
  for (const { id, tile: { x, y } } of square.villagers) {
    assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => seen.has(`${x + dx},${y + dy}`)), id);
  }
});

const press = (code, extra = {}, place = "village") => shortcutPath({ code, repeat: false, shiftKey: false, ctrlKey: false, altKey: false, metaKey: false, isFocusTaken: false, ...extra }, place);

test("Tab leaves the square for the dashboard and M for the island map (the home page)", () => {
  assert.deepEqual([press("Tab"), press("KeyM")], ["/dashboard", "/"]);
});

test("the same key goes back to the square, and the other one does nothing there", () => {
  assert.deepEqual([press("Tab", {}, "dashboard"), press("KeyM", {}, "map"), press("KeyM", {}, "dashboard"), press("Tab", {}, "map")], ["/village", "/village", null, null]);
});

test("the shortcuts leave other keys, held keys and modified keys alone", () => {
  assert.deepEqual([press("KeyE"), press("KeyM", { repeat: true }), press("Tab", { shiftKey: true }), press("KeyM", { ctrlKey: true })], [null, null, null, null]);
});

test("Tab moves focus as usual once a control has it", () => {
  assert.equal(press("Tab", { isFocusTaken: true }), null);
});

const door = { id: "home", tile: { x: 5, y: 5 }, href: "/profile", label: "Your house" };

test("standing at a door, the traveller can go through it", () => {
  assert.deepEqual(nearbyThing({ x: 5.5, y: 5.6 }, [], [door]), { kind: "door", door });
});

test("a villager nearer than the door is talked to instead", () => {
  assert.deepEqual(nearbyThing({ x: 6.6, y: 5.5 }, [{ id: "pon", tile: { x: 6, y: 5 } }], [door]), { kind: "villager", id: "pon" });
});

test("nothing is in reach far from doors and villagers", () => {
  assert.equal(nearbyThing({ x: 15, y: 15 }, [{ id: "pon", tile: { x: 6, y: 5 } }], [door]), null);
});

test("the learner's house door opens onto the profile, from a tile that can be reached", () => {
  const [home] = VILLAGE_DOORS;
  const blocked = blockedTilesWithOpenGates(square, []);
  assert.equal(home.href, "/profile");
  assert.equal(isBlocked(square.map, blocked, home.tile.x, home.tile.y), false);
  assert.equal(isBlocked(square.map, blocked, home.tile.x, home.tile.y - 1), true, "the door is in the house's front wall");
});

test("the learner's house is signed with their name", () => {
  assert.equal(homeSign("Kai"), "Kai のいえ");
});

test("a house without a known name keeps the plain sign", () => {
  assert.deepEqual([homeSign(null), homeSign("   ")], ["いえ", "いえ"]);
});

test("a long name is cut short by whole characters, so the sign still fits", () => {
  assert.equal(homeSign("たなかはなこさんのいもうと"), "たなかはなこさんの… のいえ");
});

test("only the learner's house gets the name", () => {
  const signed = withHomeSign(square, HOME_BUILDING_ID, "Kai");
  assert.deepEqual(signed.buildings.filter(building => building.sign !== square.buildings.find(({ id }) => id === building.id)?.sign).map(({ id }) => id), [HOME_BUILDING_ID]);
});
