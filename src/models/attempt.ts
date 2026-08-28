export interface Attempt {
    id?: number;
    student_id: number;
    exam_id: number;
    score: number;
    submitted_at?: Date;
    }

export interface Answer {
    id?: number;
    attempt_id: number;
    question_id: number;
    choice_id: number;
}

export interface StudentExamResult {
    id: number;
    exam_title: string;
    score: number;
    submitted_at: Date;
}

export interface AdminExamResult {
    id: number;
    email: string;
    score: number;
    submitted_at: Date;
}