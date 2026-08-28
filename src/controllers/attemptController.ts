import { Request, Response } from 'express';
import { AttemptService } from '../services/attemptService';
import { Unauthorized } from '../security/AppError';

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
    const { choices } = req.body;
    const data = await service.submitExam(req.user.sub, Number(req.params.id), choices);
    res.status(201).json(data);
}

async getStudentResults(req: Request, res: Response) {
    if (!req.user) throw Unauthorized("Not authenticated");
    res.json(await service.getStudentResults(req.user.sub));
}

async getAdminExamResults(req: Request, res: Response) {
    res.json(await service.getAdminExamResults(Number(req.params.id)));
}
}