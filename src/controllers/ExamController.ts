import { Request, Response } from 'express';
import { ExamService } from '../services/ExamService';
import { parsePagination } from '../utils/pagination';
import { BadRequest } from '../security/AppError';

const examService = new ExamService();

export class ExamController {
  async list(req: Request, res: Response) {
    const { page, limit, offset } = parsePagination(req.query);
    const courseId = req.query.course_id ? Number(req.query.course_id) : undefined;
    const result = await examService.list(page, limit, offset, courseId);
    res.status(200).json(result);
  }

  async getById(req: Request, res: Response) {
    const id = parseId(req.params.id);
    const exam = await examService.getById(id);
    res.status(200).json(exam);
  }

  async create(req: Request, res: Response) {
    const { course_id, title, description, start_at, end_at } = req.body ?? {};
    const exam = await examService.create({ course_id, title, description, start_at, end_at });
    res.status(201).json(exam);
  }

  async update(req: Request, res: Response) {
    const id = parseId(req.params.id);
    const { title, description, start_at, end_at } = req.body ?? {};
    const exam = await examService.update(id, { title, description, start_at, end_at });
    res.status(200).json(exam);
  }

  async delete(req: Request, res: Response) {
    const id = parseId(req.params.id);
    await examService.delete(id);
    res.status(204).send();
  }
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id)) throw BadRequest('Invalid id parameter');
  return id;
}
