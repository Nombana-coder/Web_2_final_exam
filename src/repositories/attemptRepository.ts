import { pool } from '../security/db';

export class AttemptRepository {
async findAvailableExams(studentId: number) {
    const query = `
    SELECT e.id, e.title, e.start_at, e.end_at, c.name as course_name
    FROM exams e
    JOIN courses c ON e.course_id = c.id
    WHERE CURRENT_TIMESTAMP BETWEEN e.start_at AND e.end_at -- RG-03
        AND e.id NOT IN (SELECT exam_id FROM attempts WHERE student_id = $1); -- RG-02
    `;
    const { rows } = await pool.query(query, [studentId]);
    return rows;
}

async findAttempt(studentId: number, examId: number) {
    const { rows } = await pool.query(
    `SELECT * FROM attempts WHERE student_id = $1 AND exam_id = $2`,
    [studentId, examId]
    );
    return rows[0];
}

async getExamForStudent(examId: number) {
    const query = `
    SELECT e.id, e.title, e.start_at, e.end_at,
            json_agg(json_build_object(
            'id', q.id, 
            'statement', q.statement, 
            'points', q.points,
            'choices', (
                SELECT json_agg(json_build_object('id', c.id, 'text', c.text))
                FROM choices c WHERE c.question_id = q.id
            )
            )) as questions
    FROM exams e
    JOIN questions q ON q.exam_id = e.id
    WHERE e.id = $1 AND CURRENT_TIMESTAMP BETWEEN e.start_at AND e.end_at -- RG-03
    GROUP BY e.id;
    `;
    const { rows } = await pool.query(query, [examId]);
    return rows[0];
}

/**
 * Persists an attempt and its answers. `answers` should already be
 * filtered down to only the questions that were actually answered
 * (RG-05: unanswered questions are simply omitted here).
 * Returns the DB-generated attempt id and submitted_at timestamp.
 */
async saveAttempt(
    studentId: number,
    examId: number,
    score: number,
    answers: { question_id: number; choice_id: number }[]
) {
    const client = await pool.connect();
    try {
    await client.query('BEGIN');
    const attemptRes = await client.query(
        `INSERT INTO attempts (student_id, exam_id, score) VALUES ($1, $2, $3) RETURNING id, submitted_at`,
        [studentId, examId, score]
    );
    const attemptId = attemptRes.rows[0].id;
    const submittedAt = attemptRes.rows[0].submitted_at;

    for (const answer of answers) {
        await client.query(
        `INSERT INTO answers (attempt_id, question_id, choice_id) VALUES ($1, $2, $3)`,
        [attemptId, answer.question_id, answer.choice_id]
        );
    }

    await client.query('COMMIT');
    return { attemptId, submittedAt };
    } catch (e) {
    await client.query('ROLLBACK');
    throw e;
    } finally {
    client.release();
    }
}

    async getStudentResults(studentId: number) {
        const { rows: results } = await pool.query(
            `SELECT a.id, a.score, a.submitted_at, e.title as exam_title
            FROM attempts a JOIN exams e ON a.exam_id = e.id
            WHERE a.student_id = $1 ORDER BY a.submitted_at DESC;`,
            [studentId]
        );
        const { rows: avg } = await pool.query(
            `SELECT AVG(score) as average FROM attempts WHERE student_id = $1;`,
            [studentId]
        );
        return { results, average: Number(avg[0]?.average || 0) };
    }

    async getAdminExamResults(examId: number) {
        const { rows } = await pool.query(
            `SELECT u.id as student_id, u.name, a.score, a.submitted_at
            FROM attempts a JOIN users u ON a.student_id = u.id
            WHERE a.exam_id = $1
            ORDER BY a.submitted_at DESC;`,
            [examId]
        );
        return rows;
    } 
}