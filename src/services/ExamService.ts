import { ExamRepository } from '../repositories/ExamRepository';
import { CourseRepository } from '../repositories/CourseRepository';
import { Exam, CreateExamInput, UpdateExamInput } from '../models/Exam';
import { NotFound, Conflict, BadRequest } from '../security/AppError';
import { buildPaginatedResponse, PaginatedResponse } from '../utils/pagination';

const examRepository = new ExamRepository();
const courseRepository = new CourseRepository();

export class ExamService {
  async list(
    page: number,
    limit: number,
    offset: number,
    courseId?: number
  ): Promise<PaginatedResponse<Exam>> {
    const [items, total] = await Promise.all([
      examRepository.findAll(limit, offset, courseId),
      examRepository.count(courseId),
    ]);
    return buildPaginatedResponse(items, total, page, limit);
  }

  async getById(id: number): Promise<Exam> {
    if (!Number.isInteger(id)) throw BadRequest('Invalid exam id');

    const exam = await examRepository.findById(id);
    if (!exam) throw NotFound('Exam not found');
    return exam;
  }

  async create(input: CreateExamInput): Promise<Exam> {
    await this.validateCreate(input);
    return examRepository.create(input);
  }

  async update(id: number, input: UpdateExamInput): Promise<Exam> {
    const existing = await this.getById(id); // 404 si absent

    const start_at = input.start_at ?? existing.start_at.toISOString();
    const end_at = input.end_at ?? existing.end_at.toISOString();
    this.validateWindow(start_at, end_at);

    const updated = await examRepository.update(id, input);
    if (!updated) throw NotFound('Exam not found');
    return updated;
  }

  async delete(id: number): Promise<void> {

    const hasAttempts = await examRepository.hasAttempts(id);
    if (hasAttempts) {
      throw Conflict('Cannot delete an exam that has attempts');
    }

    try {
      await examRepository.delete(id);
    } catch (err: any) {
      if (err.code === '23503') {
        throw Conflict('Cannot delete an exam that has attempts');
      }
      throw err;
    }
  }

  private async validateCreate(input: CreateExamInput): Promise<void> {
    if (!input.course_id) throw BadRequest('course_id is required');
    if (!input.title || input.title.trim().length === 0) {
      throw BadRequest('Exam title is required');
    }
    if (!input.start_at || !input.end_at) {
      throw BadRequest('start_at and end_at are required');
    }
    this.validateWindow(input.start_at, input.end_at);

    const course = await courseRepository.findById(input.course_id);
    if (!course) {
      throw BadRequest('course_id does not reference an existing course');
    }
  }

  private validateWindow(start_at: string, end_at: string): void {
    const start = new Date(start_at);
    const end = new Date(end_at);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw BadRequest('start_at and end_at must be valid ISO 8601 dates');
    }
    if (end <= start) {
      throw BadRequest('end_at must be after start_at');
    }
  }
}
