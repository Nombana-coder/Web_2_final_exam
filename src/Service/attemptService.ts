import { AttemptRepository } from '../repositories/attemptRepository';

const repo = new AttemptRepository();

export class AttemptService {
async getAvailableExams(studentId: number) {
    return await repo.findAvailableExams(studentId);
}

async getExamForStudent(studentId: number, examId: number) {
    const existing = await repo.findAttempt(studentId, examId);
    if (existing) throw { status: 409, message: "Examen déjà passé." }; 

    const exam = await repo.getExamForStudent(examId);
    if (!exam) throw { status: 400, message: "Examen indisponible." }; 

    return exam;
}

async submitExam(studentId: number, examId: number, choices: number[]) {
    const existing = await repo.findAttempt(studentId, examId);
    if (existing) throw { status: 409, message: "Examen déjà soumis." }; 

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