import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
 
/**
 * Shared PostgreSQL connection pool. Import `pool` in any Repository
 * and use parameterized queries only:
 *
 *   import { pool } from "../security/db";
 *   const result = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
 */
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export async function testDbConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("Database connection OK");
  } finally {
    client.release();
  }
}
