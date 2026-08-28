import { AttemptRepository } from '../repositories/attemptRepository';
import { ExamRepository } from '../repositories/ExamRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { Conflict, BadRequest, NotFound, Forbidden } from '../security/AppError';

const repo = new AttemptRepository();
const examRepository = new ExamRepository();

export interface SubmitAnswerInput {
  question_id: number;
  choice_id: number | null;
}

export class AttemptService {
  async getAvailableExams(studentId: number) {
    return await repo.findAvailableExams(studentId);
  }

  async getExamForStudent(studentId: number, examId: number) {
    const existing = await repo.findAttempt(studentId, examId);
    if (existing) throw Conflict("Examen déjà passé.");

    const exam = await repo.getExamForStudent(examId);
    if (!exam) throw BadRequest("Examen indisponible.");

    return exam;
  }

  /**
   * POST /api/my/exams/:id/submit
   * Request:  { answers: [{ question_id, choice_id }] }  (API_CONTRACT.md)
   * Response: { score, max_score, submitted_at, corrections: [...] }  (RG-12)
   */
  async submitExam(studentId: number, examId: number, answers: SubmitAnswerInput[]) {
    // RG-02 : une seule tentative par étudiant et par examen.
    const existing = await repo.findAttempt(studentId, examId);
    if (existing) throw Conflict("Examen déjà soumis.");

    // RG-03 : l'examen doit être dans sa fenêtre horaire pour être soumis.
    const exam = await examRepository.findById(examId);
    if (!exam) throw NotFound("Examen introuvable.");

    const now = new Date();
    if (now < new Date(exam.start_at) || now > new Date(exam.end_at)) {
      throw Forbidden("Cet examen n'est pas ouvert actuellement.");
    }

    const questions = await QuestionRepository.getQuestionsByExamId(examId);
    if (questions.length === 0) {
      throw BadRequest("Cet examen ne comporte aucune question.");
    }

    let score = 0;
    let max_score = 0;

    const corrections = questions.map((q: any) => {
      max_score += q.points;

      // RG-05 : soumission partielle autorisée — question sans réponse
      // simplement absente du tableau `answers`, ou envoyée avec choice_id: null.
      const answer = answers.find((a) => Number(a.question_id) === q.id);
      const your_choice_id =
        answer?.choice_id !== undefined && answer?.choice_id !== null
          ? Number(answer.choice_id)
          : null;

      const correctChoice = q.choices.find((c: any) => c.is_correct);
      const correct_choice_id = correctChoice ? correctChoice.id : null;

      const is_correct = your_choice_id !== null && your_choice_id === correct_choice_id;
      if (is_correct) score += q.points;

      return {
        question_id: q.id,
        statement: q.statement,
        your_choice_id,
        correct_choice_id,
        is_correct,
        points: q.points,
      };
    });

    // Only persist real answers — the `answers` table's choice_id column is NOT NULL.
    const validAnswers = answers
      .filter((a) => a.choice_id !== null && a.choice_id !== undefined)
      .map((a) => ({ question_id: Number(a.question_id), choice_id: Number(a.choice_id) }));

    const { submittedAt } = await repo.saveAttempt(studentId, examId, score, validAnswers);

    return {
      score,
      max_score,
      submitted_at: submittedAt,
      corrections,
    };
  }

  async getStudentResults(studentId: number) {
    return await repo.getStudentResults(studentId);
  }

  /**
   * GET /api/exams/:id/results -> { exam_id, average_score, attempt_count, students: [...] }
   * (API_CONTRACT.md — previously returned a bare array, missing student_id/name).
   */
  async getAdminExamResults(examId: number) {
    const exam = await examRepository.findById(examId);
    if (!exam) throw NotFound("Examen introuvable.");

    const students = await repo.getAdminExamResults(examId);
    const attempt_count = students.length;
    const average_score =
      attempt_count > 0
        ? Math.round(
            (students.reduce((sum: number, s: any) => sum + Number(s.score), 0) / attempt_count) * 100
          ) / 100
        : 0;

    return {
      exam_id: examId,
      average_score,
      attempt_count,
      students,
    };
  }
}
