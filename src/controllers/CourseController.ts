import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import { parsePagination } from '../utils/pagination';
import { BadRequest } from '../security/AppError';

const courseService = new CourseService();

export class CourseController {
  async list(req: Request, res: Response) {
    const { page, limit, offset } = parsePagination(req.query);
    const result = await courseService.list(page, limit, offset);
    res.status(200).json(result);
  }

  async create(req: Request, res: Response) {
    const { code, name, description } = req.body ?? {};
    const course = await courseService.create({ code, name, description });
    res.status(201).json(course);
  }

  async update(req: Request, res: Response) {
    const id = parseId(req.params.id);
    const { code, name, description } = req.body ?? {};
    const course = await courseService.update(id, { code, name, description });
    res.status(200).json(course);
  }

  async delete(req: Request, res: Response) {
    const id = parseId(req.params.id);
    await courseService.delete(id);
    res.status(204).send();
  }
}

function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id)) throw BadRequest('Invalid id parameter');
  return id;
}
