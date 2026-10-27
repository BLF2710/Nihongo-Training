import { pool } from "../config/db";

export type SocialSettings = { suggestMe: boolean; shareActivity: boolean; showStudyingNow: boolean };

export async function findSocialSettings(userId: number): Promise<SocialSettings> {
  const result = await pool.query("SELECT suggest_me, share_activity, show_studying_now FROM user_profiles WHERE user_id = $1", [userId]);
  const row = result.rows[0];
  return { suggestMe: Boolean(row?.suggest_me), shareActivity: row ? Boolean(row.share_activity) : true, showStudyingNow: Boolean(row?.show_studying_now) };
}

export async function saveSocialSettings(userId: number, settings: SocialSettings) {
  await pool.query(
    `INSERT INTO user_profiles (user_id, display_name, suggest_me, share_activity, show_studying_now)
     SELECT id, username, $2, $3, $4 FROM users WHERE id = $1
     ON CONFLICT (user_id) DO UPDATE SET suggest_me = $2, share_activity = $3, show_studying_now = $4`,
    [userId, settings.suggestMe, settings.shareActivity, settings.showStudyingNow]);
}
