/**
 * RG-01: no self-registration — the first admin account is created by
 * this script only.
 *
 * Run with:
 *   npx ts-node src/db/seed/seedAdmin.ts
 *
 * Change the email/password below before running, or pass them via env vars.
 */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { pool } from "../../security/db";

dotenv.config();

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@examhub.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
  const name = process.env.SEED_ADMIN_NAME || "Administrator";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    console.log(`Admin account already exists for ${email}, skipping.`);
    await pool.end();
    return;
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role, active)
     VALUES ($1, $2, $3, 'admin', true)`,
    [name, email, passwordHash]
  );

  console.log(`Admin account created: ${email} / ${password}`);
  console.log("Change this password after first login in a real deployment.");

  await pool.end();
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
