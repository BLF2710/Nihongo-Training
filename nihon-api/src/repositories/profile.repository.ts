import { pool } from "../config/db";

export type ProfileUpdate = {
  displayName: string;
  avatar: string | null;
  bio: string;
  nativeLanguage: string | null;
  learningLanguage: string;
  learningGoal: string | null;
  dailyGoal: number;
  profileVisibility: string;
};

/** Account, profile, and gamification columns plus activity counters for one user. */
export async function findProfileSummary(userId: number) {
  const result = await pool.query(`SELECT u.id, u.username, u.email, u.status, u.created_at, u.last_login_at,
      p.display_name, p.avatar, p.bio, p.native_language, p.learning_language, p.learning_goal, p.daily_goal, p.profile_visibility,
      g.xp, g.current_streak, g.longest_streak,
      (SELECT COUNT(*) FROM user_game_scores WHERE user_id = u.id) AS games_played,
      (SELECT COALESCE(SUM(correct_count + wrong_count), 0) FROM user_progress WHERE user_id = u.id) +
      (SELECT COALESCE(SUM(correct_count + wrong_count), 0) FROM user_katakana_progress WHERE user_id = u.id) AS practice_answers,
      (SELECT COUNT(*) FROM lesson_progress WHERE user_id = u.id) AS lessons_completed,
      (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) AS achievements_count
      FROM users u JOIN user_profiles p ON p.user_id = u.id JOIN user_gamification g ON g.user_id = u.id WHERE u.id = $1`, [userId]);
  return result.rows[0];
}

export async function updateProfile(userId: number, profile: ProfileUpdate) {
  await pool.query(
    "UPDATE user_profiles SET display_name=$1, avatar=$2, bio=$3, native_language=$4, learning_language=$5, learning_goal=$6, daily_goal=$7, profile_visibility=$8, updated_at=NOW() WHERE user_id=$9",
    [profile.displayName, profile.avatar, profile.bio, profile.nativeLanguage, profile.learningLanguage, profile.learningGoal, profile.dailyGoal, profile.profileVisibility, userId]
  );
}
