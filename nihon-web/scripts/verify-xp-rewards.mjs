// The "+XP" pop-up's rules: reading a reward from a response, what is worth showing, and adding up rewards that
// arrive close together. Run with --experimental-strip-types (see package.json).
import assert from "node:assert/strict";
import { test } from "node:test";
import { addReward, isMilestone, isWorthShowing, readReward } from "../src/lib/xpRewards.ts";

const reward = (changes = {}) => ({ xpEarned: 2, xp: 102, level: 2, leveledUp: false, rank: "Beginner", rankedUp: false, unlocked: [], ...changes });
const STUDY_BUDDY = { id: "friends_1", title: "Study Buddy", icon: "🤝" };

test("a response's reward is read", () => {
  assert.deepEqual(readReward({ correct: true, reward: reward() }), reward());
});

test("a response without a reward, or with a failed one (null), has none", () => {
  assert.equal(readReward({ correct: true }), null);
  assert.equal(readReward({ reward: null }), null);
});

test("a malformed reward is ignored", () => {
  assert.equal(readReward({ reward: { ...reward(), xpEarned: "2" } }), null);
  assert.equal(readReward({ reward: { ...reward(), unlocked: [{ id: "x" }] } }), null);
});

test("a reward that earned nothing (daily limit reached) isn't shown", () => {
  assert.equal(isWorthShowing(reward({ xpEarned: 0 })), false);
});

test("an achievement is shown even without XP of its own", () => {
  assert.equal(isWorthShowing(reward({ xpEarned: 0, unlocked: [STUDY_BUDDY] })), true);
});

test("quick rewards add up into one total", () => {
  assert.equal(addReward(addReward(addReward(null, reward()), reward()), reward({ xpEarned: 1 })).xp, 5);
});

test("a level-up stays in the total when more XP follows", () => {
  const toast = addReward(addReward(null, reward({ leveledUp: true, level: 3 })), reward());
  assert.deepEqual([toast.level, isMilestone(toast)], [3, true]);
});

test("the same achievement is listed once", () => {
  const toast = addReward(addReward(null, reward({ unlocked: [STUDY_BUDDY] })), reward({ unlocked: [STUDY_BUDDY] }));
  assert.equal(toast.unlocked.length, 1);
});

test("XP alone is not a milestone", () => {
  assert.equal(isMilestone(addReward(null, reward())), false);
});
