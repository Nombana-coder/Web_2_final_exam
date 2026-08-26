import { pool } from '../security/db';

export interface ChoiceInput {
  id?: number;
  text: string;
  isCorrect: boolean;
}

export interface QuestionData {
  id?: number;
  statement: string;
  points: number;
  choices: ChoiceInput[];
}

export class QuestionRepository {
  // Vérifie s'il existe déjà des tentatives sur l'examen (RG-08)
  static async hasAttempts(examId: number): Promise<boolean> {
    const res = await pool.query(
      'SELECT COUNT(*) FROM exam_attempts WHERE exam_id = $1',
      [examId]
    );
    return parseInt(res.rows[0].count, 10) > 0;
  }

  static async getExamIdByQuestionId(questionId: number): Promise<number | null> {
    const res = await pool.query(
      'SELECT exam_id FROM questions WHERE id = $1',
      [questionId]
    );
    return res.rows[0] ? res.rows[0].exam_id : null;
  }

  static async getQuestionsByExamId(examId: number) {
    const qRes = await pool.query(
      'SELECT id, statement, points FROM questions WHERE exam_id = $1 ORDER BY id ASC',
      [examId]
    );

    const questions = [];
    for (const q of qRes.rows) {
      const cRes = await pool.query(
        'SELECT id, text, is_correct AS "isCorrect" FROM choices WHERE question_id = $1 ORDER BY id ASC',
        [q.id]
      );
      questions.push({ ...q, choices: cRes.rows });
    }
    return questions;
  }

  static async createQuestion(examId: number, data: QuestionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const qRes = await client.query(
        'INSERT INTO questions (exam_id, statement, points) VALUES ($1, $2, $3) RETURNING id, statement, points',
        [examId, data.statement, data.points]
      );
      const newQuestion = qRes.rows[0];

      const insertedChoices = [];
      for (const choice of data.choices) {
        const cRes = await client.query(
          'INSERT INTO choices (question_id, text, is_correct) VALUES ($1, $2, $3) RETURNING id, text, is_correct AS "isCorrect"',
          [newQuestion.id, choice.text, choice.isCorrect]
        );
        insertedChoices.push(cRes.rows[0]);
      }

      await client.query('COMMIT');
      return { ...newQuestion, choices: insertedChoices };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async updateQuestion(questionId: number, data: QuestionData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE questions SET statement = $1, points = $2 WHERE id = $3',
        [data.statement, data.points, questionId]
      );

      await client.query('DELETE FROM choices WHERE question_id = $1', [questionId]);

      const insertedChoices = [];
      for (const choice of data.choices) {
        const cRes = await client.query(
          'INSERT INTO choices (question_id, text, is_correct) VALUES ($1, $2, $3) RETURNING id, text, is_correct AS "isCorrect"',
          [questionId, choice.text, choice.isCorrect]
        );
        insertedChoices.push(cRes.rows[0]);
      }

      await client.query('COMMIT');
      return { id: questionId, statement: data.statement, points: data.points, choices: insertedChoices };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async deleteQuestion(questionId: number) {
    await pool.query('DELETE FROM questions WHERE id = $1', [questionId]);
  }
}