import { AttemptRepository } from '../repositories/attemptRepository';
import { Conflict, BadRequest } from '../security/AppError';

const repo = new AttemptRepository();

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

async submitExam(studentId: number, examId: number, choices: number[]) {
    const existing = await repo.findAttempt(studentId, examId);
    if (existing) throw Conflict("Examen déjà soumis.");

    const score = await repo.calculateScore(examId, choices); 
    const attemptId = await repo.saveAttempt(studentId, examId, score, choices);

    return { attemptId, score };
}

async getStudentResults(studentId: number) {
    return await repo.getStudentResults(studentId);
}

async getAdminExamResults(examId: number) {
    return await repo.getAdminExamResults(examId);
}
}