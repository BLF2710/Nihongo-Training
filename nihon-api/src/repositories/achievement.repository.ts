import { pool } from "../config/db";
import type { AchievementFacts } from "../gamification/achievementRules";

export type AchievementRow = { id: string; title: string; description: string; xpReward: number; category: string; icon: string; earnedAt: Date | null };

export async function listEarnedAchievements(userId: number) {
  const result = await pool.query(
    "SELECT a.id, a.title, a.description, a.xp_reward, a.icon, ua.earned_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=$1 ORDER BY ua.earned_at DESC",
    [userId]
  );
  return result.rows;
}

/** Every achievement in display order, with when this learner earned it (null when not yet). */
export async function listAchievementCatalog(userId: number): Promise<AchievementRow[]> {
  const result = await pool.query(
    `SELECT a.id, a.title, a.description, a.xp_reward, a.category, a.icon, ua.earned_at FROM achievements a
       LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = $1 ORDER BY a.sort_order, a.id`, [userId]);
  return result.rows.map(row => ({
    id: row.id, title: row.title, description: row.description, xpReward: Number(row.xp_reward), category: row.category, icon: row.icon, earnedAt: row.earned_at,
  }));
}

export async function listEarnedAchievementIds(userId: number): Promise<Set<string>> {
  const result = await pool.query("SELECT achievement_id FROM user_achievements WHERE user_id = $1", [userId]);
  return new Set(result.rows.map(row => String(row.achievement_id)));
}

// Mastered Kanji and mature cards use the same definitions as the statistics pages (character-progress, srs).
const MASTERED_ACCURACY = 0.8;
const MASTERED_CORRECT = 3;
const MATURE_INTERVAL_DAYS = 21;

/** The learner's facts, with total XP in place of the level (the service works the level out). */
export async function getAchievementFacts(userId: number): Promise<Omit<AchievementFacts, "level"> & { xp: number }> {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1)::int AS lessons,
       (SELECT COUNT(*) FROM lesson_progress WHERE user_id = $1 AND challenge_score = 100)::int AS perfect_challenges,
       (SELECT COUNT(*) FROM user_assessment_progress WHERE user_id = $1 AND passed_at IS NOT NULL)::int AS units_passed,
       (SELECT COUNT(*) FROM srs_cards WHERE user_id = $1 AND item_type = 'vocabulary' AND repetitions > 0)::int AS words_learned,
       (SELECT COUNT(*) FROM srs_reviews WHERE user_id = $1)::int AS reviews,
       (SELECT COUNT(*) FROM srs_cards WHERE user_id = $1 AND interval_days >= $4)::int AS mature_cards,
       (SELECT COUNT(*) FROM mistakes WHERE user_id = $1 AND resolved_at IS NOT NULL)::int AS mistakes_cleared,
       (SELECT COUNT(*) FROM user_kanji_progress WHERE user_id = $1 AND correct_count >= $3
          AND correct_count >= $2::numeric * (correct_count + wrong_count))::int AS kanji_mastered,
       (SELECT longest_streak FROM user_gamification WHERE user_id = $1)::int AS longest_streak,
       (SELECT COUNT(*) FROM xp_events WHERE user_id = $1 AND source = 'daily_goal')::int AS goal_days,
       (SELECT COUNT(*) FROM practice_sessions WHERE user_id = $1 AND kind <> 'mock-exam')::int AS practice_sessions,
       (SELECT COUNT(*) FROM mock_exam_results WHERE user_id = $1 AND passed)::int AS mock_exams_passed,
       (SELECT COUNT(*) FROM speaking_attempts WHERE user_id = $1 AND met)::int AS speaking_tests_met,
       (SELECT COUNT(*) FROM friendships WHERE status = 'accepted' AND $1 IN (requester_id, addressee_id))::int AS friends,
       (SELECT xp FROM user_gamification WHERE user_id = $1)::int AS xp`,
    [userId, MASTERED_ACCURACY, MASTERED_CORRECT, MATURE_INTERVAL_DAYS]);
  const row = result.rows[0];
  const count = (value: unknown) => Number(value ?? 0);
  return {
    lessons: count(row.lessons), perfectChallenges: count(row.perfect_challenges), unitsPassed: count(row.units_passed), wordsLearned: count(row.words_learned),
    reviews: count(row.reviews), matureCards: count(row.mature_cards), mistakesCleared: count(row.mistakes_cleared), kanjiMastered: count(row.kanji_mastered),
    longestStreak: count(row.longest_streak), goalDays: count(row.goal_days), practiceSessions: count(row.practice_sessions),
    mockExamsPassed: count(row.mock_exams_passed), speakingTestsMet: count(row.speaking_tests_met), friends: count(row.friends), xp: count(row.xp),
  };
}

/** Grants the achievement once; false when the user already had it. */
export async function grantAchievement(userId: number, achievementId: string): Promise<boolean> {
  const result = await pool.query(
    "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING achievement_id",
    [userId, achievementId]
  );
  return Boolean(result.rowCount);
}

export async function findAchievement(achievementId: string): Promise<{ title: string; xpReward: number } | undefined> {
  const result = await pool.query("SELECT title, xp_reward FROM achievements WHERE id=$1", [achievementId]);
  const row = result.rows[0];
  return row && { title: String(row.title), xpReward: Number(row.xp_reward) };
}
