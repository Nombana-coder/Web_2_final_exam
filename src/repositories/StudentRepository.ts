import { pool } from "../security/db";
import { User } from "../models/User";

export interface CreateStudentInput {
  name: string;
  email: string;
  password_hash: string;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
}

export const StudentRepository = {
  async findAllPaginated(
    limit: number,
    offset: number
  ): Promise<{ rows: User[]; total: number }> {
    const [rowsResult, countResult] = await Promise.all([
      pool.query<User>(
        `SELECT * FROM users
         WHERE role = 'student'
         ORDER BY id ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      pool.query<{ count: string }>(
        `SELECT COUNT(*) FROM users WHERE role = 'student'`
      ),
    ]);

    return {
      rows: rowsResult.rows,
      total: Number(countResult.rows[0].count),
    };
  },

  async findById(id: number): Promise<User | null> {
    const result = await pool.query<User>(
      `SELECT * FROM users WHERE id = $1 AND role = 'student'`,
      [id]
    );
    return result.rows[0] ?? null;
  },

  async create(input: CreateStudentInput): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (name, email, password_hash, role, active)
       VALUES ($1, $2, $3, 'student', true)
       RETURNING *`,
      [input.name, input.email, input.password_hash]
    );
    return result.rows[0];
  },

  async update(id: number, input: UpdateStudentInput): Promise<User | null> {
    const result = await pool.query<User>(
      `UPDATE users
       SET name = COALESCE($2, name),
           email = COALESCE($3, email)
       WHERE id = $1 AND role = 'student'
       RETURNING *`,
      [id, input.name ?? null, input.email ?? null]
    );
    return result.rows[0] ?? null;
  },

  async setActive(id: number, active: boolean): Promise<User | null> {
    const result = await pool.query<User>(
      `UPDATE users
       SET active = $2
       WHERE id = $1 AND role = 'student'
       RETURNING *`,
      [id, active]
    );
    return result.rows[0] ?? null;
  },

  async setPassword(id: number, passwordHash: string): Promise<User | null> {
    const result = await pool.query<User>(
      `UPDATE users
       SET password_hash = $2
       WHERE id = $1 AND role = 'student'
       RETURNING *`,
      [id, passwordHash]
    );
    return result.rows[0] ?? null;
  },
};
