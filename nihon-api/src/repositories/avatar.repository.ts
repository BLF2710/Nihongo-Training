import { pool } from "../config/db";

/** SQL for a learner's picture address (relative to the API), or NULL. `userId` is a column or parameter. */
export const AVATAR_PATH_SQL = (userId: string) =>
  `(SELECT '/avatars/' || av.image_key || '.webp' FROM user_avatars av WHERE av.user_id = ${userId})`;

/** Stores the learner's picture, replacing any earlier one. */
export async function saveAvatar(userId: number, key: string, image: Buffer) {
  await pool.query(
    `INSERT INTO user_avatars (user_id, image_key, image, updated_at) VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE SET image_key = $2, image = $3, updated_at = NOW()`, [userId, key, image]);
}

export async function deleteAvatar(userId: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM user_avatars WHERE user_id = $1", [userId]);
  return Boolean(result.rowCount);
}

/** The picture with this key, if the account is active. */
export async function findAvatarImage(key: string): Promise<Buffer | undefined> {
  const result = await pool.query(
    "SELECT av.image FROM user_avatars av JOIN users u ON u.id = av.user_id WHERE av.image_key = $1 AND u.status = 'active'", [key]);
  return result.rows[0]?.image;
}
