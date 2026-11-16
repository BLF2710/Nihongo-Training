import { pool } from "../config/db";

/** A row of traveller_looks: one id per part of the look. */
export type StoredTravellerLook = { outfit: string; sash: string; skin: string; hair: string; hat: string; accessory: string; cheeks: string };

/** The learner's saved look, or null when they have never changed it. */
export async function findTravellerLook(userId: number): Promise<StoredTravellerLook | null> {
  const result = await pool.query("SELECT outfit, sash, skin, hair, hat, accessory, cheeks FROM traveller_looks WHERE user_id = $1", [userId]);
  return result.rows[0] ?? null;
}

/** Saves the learner's look, replacing the one before. */
export async function saveTravellerLook(userId: number, look: StoredTravellerLook): Promise<void> {
  await pool.query(
    `INSERT INTO traveller_looks (user_id, outfit, sash, skin, hair, hat, accessory, cheeks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) DO UPDATE SET outfit = $2, sash = $3, skin = $4, hair = $5, hat = $6, accessory = $7, cheeks = $8, updated_at = NOW()`,
    [userId, look.outfit, look.sash, look.skin, look.hair, look.hat, look.accessory, look.cheeks],
  );
}
