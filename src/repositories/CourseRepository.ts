import { pool } from '../security/db';
import { Course, CreateCourseInput, UpdateCourseInput } from '../models/Course';

export class CourseRepository {
  async findAll(limit: number, offset: number): Promise<Course[]> {
    const result = await pool.query(
      `SELECT id, code, name, description, created_at, updated_at
       FROM courses
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  }

  async count(): Promise<number> {
    const result = await pool.query(`SELECT COUNT(*)::int AS count FROM courses`);
    return result.rows[0].count;
  }

  async findById(id: number): Promise<Course | null> {
    const result = await pool.query(
      `SELECT id, code, name, description, created_at, updated_at
       FROM courses
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findByCode(code: string): Promise<Course | null> {
    const result = await pool.query(
      `SELECT id, code, name, description, created_at, updated_at
       FROM courses
       WHERE code = $1`,
      [code]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateCourseInput): Promise<Course> {
    const result = await pool.query(
      `INSERT INTO courses (code, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, code, name, description, created_at, updated_at`,
      [input.code, input.name, input.description ?? null]
    );
    return result.rows[0];
  }

  async update(id: number, input: UpdateCourseInput): Promise<Course | null> {
    const result = await pool.query(
      `UPDATE courses
       SET code = COALESCE($1, code),
           name = COALESCE($2, name),
           description = COALESCE($3, description),
           updated_at = now()
       WHERE id = $4
       RETURNING id, code, name, description, created_at, updated_at`,
      [input.code ?? null, input.name ?? null, input.description ?? null, id]
    );
    return result.rows[0] ?? null;
  }

  /**
   * RG-09 : utilisé par CourseService pour refuser la suppression d'un
   * cours qui possède au moins un examen (renvoie 409).
   */
  async hasExams(id: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1 FROM exams WHERE course_id = $1 LIMIT 1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
