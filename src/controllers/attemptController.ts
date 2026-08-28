import { Request, Response } from 'express';
import { AttemptService, SubmitAnswerInput } from '../services/attemptService';
import { Unauthorized, BadRequest } from '../security/AppError';

const service = new AttemptService();

export class AttemptController {
async getAvailableExams(req: Request, res: Response) {
    if (!req.user) throw Unauthorized("Not authenticated");
    res.json(await service.getAvailableExams(req.user.sub));
}

async getExamForStudent(req: Request, res: Response) {
    if (!req.user) throw Unauthorized("Not authenticated");
    res.json(await service.getExamForStudent(req.user.sub, Number(req.params.id)));
}

async submitExam(req: Request, res: Response) {
    if (!req.user) throw Unauthorized("Not authenticated");

    const { answers } = req.body ?? {};
    if (!Array.isArray(answers)) {
        throw BadRequest("`answers` must be an array of { question_id, choice_id }");
    }
    for (const a of answers as SubmitAnswerInput[]) {
        if (typeof a?.question_id !== "number") {
            throw BadRequest("Each answer requires a numeric `question_id`");
        }
        if (a.choice_id !== null && a.choice_id !== undefined && typeof a.choice_id !== "number") {
            throw BadRequest("`choice_id` must be a number or null");
        }
    }

    const data = await service.submitExam(req.user.sub, Number(req.params.id), answers);
    res.status(200).json(data);
}

async getStudentResults(req: Request, res: Response) {
    if (!req.user) throw Unauthorized("Not authenticated");
    res.json(await service.getStudentResults(req.user.sub));
}

async getAdminExamResults(req: Request, res: Response) {
    res.json(await service.getAdminExamResults(Number(req.params.id)));
}
}
