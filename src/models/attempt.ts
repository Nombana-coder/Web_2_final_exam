export interface Attempt {
    id?: number;
    studentId: number;
    examId: number;
    score: number;
    submittedAt?: Date;
    }

export interface Answer {
    id?: number;
    attemptId: number;
    questionId: number;
    choiceId: number;
}

export interface StudentExamResult {
    id: number;
    examTitle: string;
    score: number;
    submittedAt: Date;
}

export interface AdminExamResult {
    id: number;
    email: string;
    score: number;
    submittedAt: Date;
}