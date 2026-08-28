import { CourseRepository } from '../repositories/CourseRepository';
import { Course, CreateCourseInput, UpdateCourseInput } from '../models/Course';
import { AppError, NotFound, Conflict, BadRequest } from '../security/AppError';
import { buildPaginatedResponse, PaginatedResponse } from '../utils/pagination';

const courseRepository = new CourseRepository();

export class CourseService {
  async list(page: number, limit: number, offset: number): Promise<PaginatedResponse<Course>> {
    const [items, total] = await Promise.all([
      courseRepository.findAll(limit, offset),
      courseRepository.count(),
    ]);
    return buildPaginatedResponse(items, total, page, limit);
  }

  async getById(id: number): Promise<Course> {
    if (!Number.isInteger(id)) throw BadRequest('Invalid course id');

    const course = await courseRepository.findById(id);
    if (!course) throw NotFound('Course not found');
    return course;
  }

  async create(input: CreateCourseInput): Promise<Course> {
    this.validate(input);

    const existing = await courseRepository.findByCode(input.code);
    if (existing) throw Conflict('Course code already exists');

    try {
      return await courseRepository.create(input);
    } catch (err: any) {
      if (err.code === '23505') throw Conflict('Course code already exists');
      throw err;
    }
  }

  async update(id: number, input: UpdateCourseInput): Promise<Course> {
    await this.getById(id); // 404 si absent

    if (input.code) {
      const existing = await courseRepository.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw Conflict('Course code already exists');
      }
    }

    try {
      const updated = await courseRepository.update(id, input);
      if (!updated) throw NotFound('Course not found');
      return updated;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      if (err.code === '23505') throw Conflict('Course code already exists');
      throw err;
    }
  }

  async delete(id: number): Promise<void> {
    await this.getById(id); // 404 si absent

    const hasExams = await courseRepository.hasExams(id);
    if (hasExams) {
      throw Conflict('Cannot delete a course that has exams');
    }

    try {
      await courseRepository.delete(id);
    } catch (err: any) {
      if (err.code === '23503') {
        throw Conflict('Cannot delete a course that has exams');
      }
      throw err;
    }
  }

  private validate(input: CreateCourseInput): void {
    if (!input.code || input.code.trim().length === 0) {
      throw BadRequest('Course code is required');
    }
    if (!input.name || input.name.trim().length === 0) {
      throw BadRequest('Course name is required');
    }
  }
}
