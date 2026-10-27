// Friend streaks and friend challenge results. No network or database.
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");

const { friendStreak } = require("../src/social/friendStreak");
const { challengeOutcome } = require("../src/social/challengeOutcome");

const TODAY = "2026-10-27";

test("counts the days in a row both friends studied, ending today", () => {
  assert.equal(friendStreak(["2026-10-25", "2026-10-26", TODAY], ["2026-10-25", "2026-10-26", TODAY], TODAY), 3);
});

test("a shared run that ended yesterday still counts while today is not over", () => {
  assert.equal(friendStreak(["2026-10-25", "2026-10-26"], ["2026-10-25", "2026-10-26", TODAY], TODAY), 2);
});

test("a day only one friend studied breaks the friend streak", () => {
  assert.equal(friendStreak(["2026-10-24", "2026-10-25", "2026-10-26", TODAY], ["2026-10-24", "2026-10-26", TODAY], TODAY), 2);
});

test("is 0 when the last shared day was before yesterday", () => {
  assert.equal(friendStreak(["2026-10-24"], ["2026-10-24"], TODAY), 0);
});

test("crosses month boundaries", () => {
  assert.equal(friendStreak(["2026-09-30", "2026-10-01"], ["2026-09-30", "2026-10-01"], "2026-10-01"), 2);
});

test("the higher score wins a challenge and equal scores tie", () => {
  assert.deepEqual([challengeOutcome(120, 80), challengeOutcome(3, 5), challengeOutcome(4, 4)], ["won", "lost", "tied"]);
});
