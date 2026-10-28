/** What the app knows about a learner's work, gathered in one query (achievement.repository). */
export type AchievementFacts = {
  lessons: number; perfectChallenges: number; unitsPassed: number; wordsLearned: number; reviews: number; matureCards: number;
  mistakesCleared: number; kanjiMastered: number; longestStreak: number; goalDays: number; practiceSessions: number;
  mockExamsPassed: number; speakingTestsMet: number; friends: number; level: number;
};

export type AchievementRule = { id: string; fact: keyof AchievementFacts; goal: number };

// Checked in this order; add an achievement by adding a rule here and its row in a migration.
export const ACHIEVEMENT_RULES: readonly AchievementRule[] = [
  { id: "first_steps", fact: "lessons", goal: 1 },
  { id: "lessons_10", fact: "lessons", goal: 10 },
  { id: "lessons_50", fact: "lessons", goal: 50 },
  { id: "perfect_score", fact: "perfectChallenges", goal: 1 },
  { id: "perfect_10", fact: "perfectChallenges", goal: 10 },
  { id: "japanese_beginner", fact: "unitsPassed", goal: 1 },
  { id: "units_5", fact: "unitsPassed", goal: 5 },
  { id: "units_10", fact: "unitsPassed", goal: 10 },
  { id: "vocabulary_starter", fact: "wordsLearned", goal: 100 },
  { id: "reviews_100", fact: "reviews", goal: 100 },
  { id: "reviews_1000", fact: "reviews", goal: 1000 },
  { id: "mature_50", fact: "matureCards", goal: 50 },
  { id: "mistakes_10", fact: "mistakesCleared", goal: 10 },
  { id: "mistakes_100", fact: "mistakesCleared", goal: 100 },
  { id: "kanji_10", fact: "kanjiMastered", goal: 10 },
  { id: "kanji_50", fact: "kanjiMastered", goal: 50 },
  { id: "kanji_150", fact: "kanjiMastered", goal: 150 },
  { id: "streak_3", fact: "longestStreak", goal: 3 },
  { id: "week_warrior", fact: "longestStreak", goal: 7 },
  { id: "streak_30", fact: "longestStreak", goal: 30 },
  { id: "streak_100", fact: "longestStreak", goal: 100 },
  { id: "goal_7", fact: "goalDays", goal: 7 },
  { id: "practice_10", fact: "practiceSessions", goal: 10 },
  { id: "mock_pass", fact: "mockExamsPassed", goal: 1 },
  { id: "speaking_pass", fact: "speakingTestsMet", goal: 1 },
  { id: "friends_1", fact: "friends", goal: 1 },
  { id: "friends_5", fact: "friends", goal: 5 },
  { id: "level_5", fact: "level", goal: 5 },
  { id: "level_10", fact: "level", goal: 10 },
  { id: "level_20", fact: "level", goal: 20 },
];

export type AchievementProgress = { id: string; goal: number; progress: number; isComplete: boolean };

/** How far the learner is toward each achievement; progress never shows more than the goal. */
export function measureAchievements(facts: AchievementFacts): AchievementProgress[] {
  return ACHIEVEMENT_RULES.map(rule => {
    const value = facts[rule.fact];
    return { id: rule.id, goal: rule.goal, progress: Math.min(value, rule.goal), isComplete: value >= rule.goal };
  });
}
