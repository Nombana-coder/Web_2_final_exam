import { pool } from '../security/db';
import { Exam, CreateExamInput, UpdateExamInput } from '../models/Exam';

export class ExamRepository {
  async findAll(limit: number, offset: number, courseId?: number): Promise<Exam[]> {
    if (courseId) {
      const result = await pool.query(
        `SELECT id, course_id, title, description, start_at, end_at, created_at, updated_at
         FROM exams
         WHERE course_id = $1
         ORDER BY id ASC
         LIMIT $2 OFFSET $3`,
        [courseId, limit, offset]
      );
      return result.rows;
    }

    const result = await pool.query(`
      SELECT id, title, start_at
      FROM exams
      ORDER BY start_at
    `);
    return result.rows;
  }

  async count(courseId?: number): Promise<number> {
    if (courseId) {
      const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM exams WHERE course_id = $1`,
        [courseId]
      );
      return result.rows[0].count;
    }

    const result = await pool.query(`SELECT COUNT(*)::int AS count FROM exams`);
    return result.rows[0].count;
  }

  async findById(id: number): Promise<Exam | null> {
    const result = await pool.query(
      `SELECT id, course_id, title, description, start_at, end_at, created_at, updated_at
       FROM exams
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async create(input: CreateExamInput): Promise<Exam> {
    const result = await pool.query(
      `INSERT INTO exams (course_id, title, description, start_at, end_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, course_id, title, description, start_at, end_at, created_at, updated_at`,
      [input.course_id, input.title, input.description ?? null, input.start_at, input.end_at]
    );
    return result.rows[0];
  }

  async update(id: number, input: UpdateExamInput): Promise<Exam | null> {
    const result = await pool.query(
      `UPDATE exams
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_at = COALESCE($3, start_at),
           end_at = COALESCE($4, end_at),
           updated_at = now()
       WHERE id = $5
       RETURNING id, course_id, title, description, start_at, end_at, created_at, updated_at`,
      [
        input.title ?? null,
        input.description ?? null,
        input.start_at ?? null,
        input.end_at ?? null,
        id,
      ]
    );
    return result.rows[0] ?? null;
  }

  /**
   * RG-09 : un examen qui possède des tentatives ne peut pas être supprimé.
   * La table `attempts` est créée par une tâche ultérieure (soumission
   * d'examen). Tant qu'elle n'existe pas encore, on considère qu'il n'y a
   * pas de tentative (undefined_table = code Postgres 42P01).
   */
  async hasAttempts(id: number): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT 1 FROM attempts WHERE exam_id = $1 LIMIT 1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (err: any) {
      if (err.code === '42P01') return false;
      throw err;
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
