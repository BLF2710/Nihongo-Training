import { Pool } from "pg";
import type { ClientConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

/** How to reach the database; also used for the dedicated live-update listener connection. */
export const connectionOptions: ClientConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

export const pool = new Pool(connectionOptions);
