// XP rules, daily caps, levels and achievement progress. No network or database.
//   npm run test:gamification
require("ts-node").register({ transpileOnly: true, compilerOptions: { module: "commonjs" } });
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { cappedAmount, XP_RULES } = require("../src/gamification/xpRules");
const { ACHIEVEMENT_RULES, measureAchievements } = require("../src/gamification/achievementRules");
const { getLevelFromXP, getXPForLevel, getXPProgress, getNextRank, getRankFromXP } = require("../src/services/progression.service");

const NO_FACTS = {
  lessons: 0, perfectChallenges: 0, unitsPassed: 0, wordsLearned: 0, reviews: 0, matureCards: 0, mistakesCleared: 0, kanjiMastered: 0,
  longestStreak: 0, goalDays: 0, practiceSessions: 0, mockExamsPassed: 0, speakingTestsMet: 0, friends: 0, level: 1,
};

// ---- Daily caps
test("an uncapped source always pays in full", () => {
  assert.equal(cappedAmount("lesson_completion", 50, 10_000), 50);
});

test("a capped source pays only what is left of today's cap", () => {
  const cap = XP_RULES.review.dailyCap;
  assert.equal(cappedAmount("review", 2, cap - 1), 1);
});

test("a capped source pays nothing once today's cap is reached", () => {
  assert.equal(cappedAmount("review", 2, XP_RULES.review.dailyCap), 0);
});

test("achievement rewards are never capped", () => {
  assert.equal(cappedAmount("achievement", 500, 10_000), 500);
});

// ---- Levels
test("the first levels keep the thresholds learners already had", () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(getXPForLevel), [0, 100, 250, 450, 700, 1000]);
});

test("levels have no ceiling", () => {
  assert.equal(getLevelFromXP(getXPForLevel(60)), 60);
});

test("one XP short of a threshold stays on the level below", () => {
  for (const level of [2, 7, 25, 100]) assert.equal(getLevelFromXP(getXPForLevel(level) - 1), level - 1);
});

test("level progress counts XP from the start of the current level", () => {
  assert.deepEqual(getXPProgress(175), { level: 2, currentLevelXp: 100, nextLevelXp: 250, progressXp: 75, progressPercent: 50 });
});

test("negative XP reads as level 1", () => {
  assert.equal(getLevelFromXP(-5), 1);
});

test("the next rank is the first one above the learner's XP, none past the top", () => {
  assert.equal(getNextRank(300).name, "Silver");
  assert.equal(getNextRank(1_000_000), null);
  assert.equal(getRankFromXP(1000), "Silver");
});

// ---- Achievements
test("a learner with no work has no complete achievements", () => {
  assert.equal(measureAchievements(NO_FACTS).filter(item => item.isComplete).length, 0);
});

test("progress stops at the goal", () => {
  const lessons10 = measureAchievements({ ...NO_FACTS, lessons: 37 }).find(item => item.id === "lessons_10");
  assert.deepEqual(lessons10, { id: "lessons_10", goal: 10, progress: 10, isComplete: true });
});

test("passing a first unit assessment earns Japanese Beginner", () => {
  const beginner = measureAchievements({ ...NO_FACTS, unitsPassed: 1 }).find(item => item.id === "japanese_beginner");
  assert.equal(beginner.isComplete, true);
});

test("the longest streak counts, so a broken streak keeps its achievement", () => {
  const week = measureAchievements({ ...NO_FACTS, longestStreak: 9 }).find(item => item.id === "week_warrior");
  assert.equal(week.isComplete, true);
});

test("every achievement rule has a row in the migrations, and the ids are unique", () => {
  const sql = fs.readdirSync(path.join(__dirname, "../migrations")).map(file => fs.readFileSync(path.join(__dirname, "../migrations", file), "utf8")).join("\n");
  const ids = ACHIEVEMENT_RULES.map(rule => rule.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(ids.filter(id => !sql.includes(`('${id}',`)), []);
});
