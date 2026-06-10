import { pool } from "../config/db";

export async function findUserByEmail(
  email: string
) {
  const result = await pool.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
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
    WHERE email = $1
       OR username = $1
    `,
    [login]
  );

  return result.rows[0];
}