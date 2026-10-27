import { pool } from "../config/db";
import { AVATAR_PATH_SQL } from "./avatar.repository";
import { ACTIVE_TODAY_SQL, EFFECTIVE_STREAK_SQL } from "./streak.repository";

export type ProfileUpdate = {
  displayName: string;
  bio: string;
  nativeLanguage: string | null;
  learningLanguage: string;
  learningGoal: string | null;
  dailyGoal: number;
  profileVisibility: string;
  friendRequests: string | null;
};

/** Account, profile, and gamification columns plus activity counters for one user. */
export async function findProfileSummary(userId: number) {
  const result = await pool.query(`SELECT u.id, u.username, u.email, u.email_verified_at, u.status, u.created_at, u.last_login_at,
      p.display_name, ${AVATAR_PATH_SQL("u.id")} AS avatar, p.bio, p.native_language, p.learning_language, p.learning_goal, p.daily_goal, p.profile_visibility, p.friend_requests,
      g.xp, ${EFFECTIVE_STREAK_SQL} AS current_streak, g.longest_streak, ${ACTIVE_TODAY_SQL} AS active_today, p.time_zone,
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
    "UPDATE user_profiles SET display_name=$1, bio=$2, native_language=$3, learning_language=$4, learning_goal=$5, daily_goal=$6, profile_visibility=$7, friend_requests=COALESCE($9, friend_requests), updated_at=NOW() WHERE user_id=$8",
    [profile.displayName, profile.bio, profile.nativeLanguage, profile.learningLanguage, profile.learningGoal, profile.dailyGoal, profile.profileVisibility, userId, profile.friendRequests]
  );
}
