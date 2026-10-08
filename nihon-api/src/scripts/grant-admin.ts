import { pool } from "../config/db";
async function main() {
  const email = process.argv[2]?.trim();
  if (!email) throw new Error("Usage: npm run admin:grant -- existing-account@example.com");
  const result = await pool.query("UPDATE users SET role='admin', updated_at=NOW() WHERE LOWER(email)=LOWER($1) AND status='active' RETURNING id, username", [email]);
  if (!result.rowCount) throw new Error("No active account matches that email. Register the account first.");
  console.log(`Administrator access granted to ${result.rows[0].username} (ID ${result.rows[0].id}).`);
}
main().catch(error => { console.error(error.message); process.exitCode=1; }).finally(() => pool.end());
