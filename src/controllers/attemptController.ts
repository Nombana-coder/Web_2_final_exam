import { Request, Response } from 'express';
import { AttemptService } from '../services/attemptService';

const service = new AttemptService();

export class AttemptController {
async getAvailableExams(req: Request, res: Response) {
    try {
    const data = await service.getAvailableExams(req.user.id);
    res.json(data);
    } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
    }
}

async getExamForStudent(req: Request, res: Response) {
    try {
    const data = await service.getExamForStudent(req.user.id, Number(req.params.id));
    res.json(data);
    } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
    }
}

async submitExam(req: Request, res: Response) {
    try {
    const { choices } = req.body;
    const data = await service.submitExam(req.user.id, Number(req.params.id), choices);
    res.status(201).json(data);
    } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
    }
}

async getStudentResults(req: Request, res: Response) {
    try {
    const data = await service.getStudentResults(req.user.id);
    res.json(data);
    } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
    }
}

async getAdminExamResults(req: Request, res: Response) {
    try {
    const data = await service.getAdminExamResults(Number(req.params.id));
    res.json(data);
    } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
    }
}
}