import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { getXPProgress, getRankFromXP } from "../services/progression.service";

const userId = (req: Request) => Number((req as any).user.userId);
const stringOrNull = (value: unknown, max: number) => typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

export async function getMyProfile(req: Request, res: Response) {
  try {
    const result = await pool.query(`SELECT u.id, u.username, u.email, u.status, u.created_at, u.last_login_at,
      p.display_name, p.avatar, p.bio, p.native_language, p.learning_language, p.learning_goal, p.daily_goal, p.profile_visibility,
      g.xp, g.current_streak, g.longest_streak,
      (SELECT COUNT(*) FROM user_game_scores WHERE user_id = u.id) AS games_played,
      (SELECT COALESCE(SUM(correct_count + wrong_count), 0) FROM user_progress WHERE user_id = u.id) +
      (SELECT COALESCE(SUM(correct_count + wrong_count), 0) FROM user_katakana_progress WHERE user_id = u.id) AS practice_answers,
      (SELECT COUNT(*) FROM lesson_progress WHERE user_id = u.id) AS lessons_completed,
      (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) AS achievements_count
      FROM users u JOIN user_profiles p ON p.user_id = u.id JOIN user_gamification g ON g.user_id = u.id WHERE u.id = $1`, [userId(req)]);
    if (!result.rows[0]) return res.status(404).json({ message: "Profile not found" });
    const profile = result.rows[0];
    const xp = Number(profile.xp);
    const achievements = await pool.query("SELECT a.id, a.title, a.description, a.xp_reward, ua.earned_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=$1 ORDER BY ua.earned_at DESC", [userId(req)]);
    const xpProgress = getXPProgress(xp);
    return res.json({ ...profile, xp, level: xpProgress.level, rank: getRankFromXP(xp), xpProgress, achievements: achievements.rows });
  } catch (error) { console.error("getMyProfile", error); return res.status(500).json({ message: "Server error" }); }
}

export async function updateMyProfile(req: Request, res: Response) {
  try {
    const { displayName, avatar, bio, nativeLanguage, learningLanguage, learningGoal, dailyGoal, profileVisibility } = req.body;
    if (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 80) return res.status(400).json({ message: "Display name is required and must be at most 80 characters." });
    const daily = Number(dailyGoal);
    if (!Number.isInteger(daily) || daily < 1 || daily > 1440 || !["private", "public"].includes(profileVisibility)) return res.status(400).json({ message: "Invalid learning or privacy settings." });
    await pool.query(`UPDATE user_profiles SET display_name=$1, avatar=$2, bio=$3, native_language=$4, learning_language=$5, learning_goal=$6, daily_goal=$7, profile_visibility=$8, updated_at=NOW() WHERE user_id=$9`,
      [displayName.trim(), stringOrNull(avatar, 500), typeof bio === "string" ? bio.trim().slice(0, 500) : "", stringOrNull(nativeLanguage, 80), stringOrNull(learningLanguage, 80) || "Japanese", stringOrNull(learningGoal, 120), daily, profileVisibility, userId(req)]);
    return getMyProfile(req, res);
  } catch (error) { console.error("updateMyProfile", error); return res.status(500).json({ message: "Server error" }); }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword !== confirmPassword) return res.status(400).json({ message: "New passwords must match and contain at least 8 characters." });
    const result = await pool.query("SELECT password FROM users WHERE id=$1", [userId(req)]);
    if (!result.rows[0] || typeof currentPassword !== "string" || !(await bcrypt.compare(currentPassword, result.rows[0].password))) return res.status(401).json({ message: "Current password is incorrect." });
    await pool.query("UPDATE users SET password=$1, updated_at=NOW() WHERE id=$2", [await bcrypt.hash(newPassword, 12), userId(req)]);
    return res.json({ message: "Password updated" });
  } catch (error) { console.error("changePassword", error); return res.status(500).json({ message: "Server error" }); }
}

export async function deactivateAccount(req: Request, res: Response) {
  try {
    const { password } = req.body;
    const result = await pool.query("SELECT password FROM users WHERE id=$1", [userId(req)]);
    if (!result.rows[0] || typeof password !== "string" || !(await bcrypt.compare(password, result.rows[0].password))) return res.status(401).json({ message: "Password is incorrect." });
    await pool.query("UPDATE users SET status='inactive', updated_at=NOW() WHERE id=$1", [userId(req)]);
    return res.json({ message: "Account deactivated" });
  } catch (error) { console.error("deactivateAccount", error); return res.status(500).json({ message: "Server error" }); }
}
