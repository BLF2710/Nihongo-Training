import { pool } from "../config/db";

export async function findUserByEmail(
  email: string
) {
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE LOWER(email) = LOWER($1)
    `,
    [email]
  );

  return result.rows[0];
}

export async function findUserByLogin(
  login: string
) {
  const result = await pool.query(
    `
    SELECT *
    FROM users
    WHERE LOWER(email) = LOWER($1)
       OR LOWER(username) = LOWER($1)
    `,
    [login]
  );

  return result.rows[0];
}

export async function findUserByUsername(username: string) {
  const result = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  return result.rows[0];
}
