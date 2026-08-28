import { pool } from "./config/db";

async function testDB() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected:", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

testDB();