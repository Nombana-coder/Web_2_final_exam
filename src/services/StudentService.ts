import bcrypt from "bcrypt";
import { StudentRepository } from "../repositories/StudentRepository";
import { UserRepository } from "../repositories/UserRepository";
import { BadRequest, Conflict, NotFound } from "../security/AppError";
import { toPublicUser, PublicUser } from "../models/User";
import {
  parsePagination,
  buildPaginatedResponse,
  PaginatedResponse,
} from "../utils/pagination";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

export interface CreateStudentDTO {
  name: string;
  email: string;
  password: string;
}

export interface UpdateStudentDTO {
  name?: string;
  email?: string;
}

export const StudentService = {
  async list(
    rawPage: unknown,
    rawLimit: unknown
  ): Promise<PaginatedResponse<PublicUser>> {
    const { page, limit, offset } = parsePagination({ page: rawPage, limit: rawLimit });
    const { rows, total } = await StudentRepository.findAllPaginated(
      limit,
      offset
    );
    return buildPaginatedResponse(rows.map(toPublicUser), total, page, limit);
  },

  async getById(id: number): Promise<PublicUser> {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw NotFound("Student not found");
    }
    return toPublicUser(student);
  },

  async create(input: CreateStudentDTO): Promise<PublicUser> {
    const existing = await UserRepository.findByEmail(input.email);
    if (existing) {
      throw Conflict("Email is already in use");
    }

    const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const student = await StudentRepository.create({
      name: input.name,
      email: input.email,
      password_hash,
    });

    return toPublicUser(student);
  },

  async update(id: number, input: UpdateStudentDTO): Promise<PublicUser> {
    // Re-check target exists (and is a student) before touching email uniqueness
    const current = await StudentRepository.findById(id);
    if (!current) {
      throw NotFound("Student not found");
    }

    if (input.email && input.email !== current.email) {
      const existing = await UserRepository.findByEmail(input.email);
      if (existing) {
        throw Conflict("Email is already in use");
      }
    }

    const updated = await StudentRepository.update(id, input);
    if (!updated) {
      throw NotFound("Student not found");
    }
    return toPublicUser(updated);
  },

  async setActive(id: number, active: boolean): Promise<PublicUser> {
    const updated = await StudentRepository.setActive(id, active);
    if (!updated) {
      throw NotFound("Student not found");
    }
    return toPublicUser(updated);
  },

  async resetPassword(id: number, password: string): Promise<PublicUser> {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw NotFound("Student not found");
    }

    if (typeof password !== "string" || password.length < 6) {
      throw BadRequest("Password must be at least 6 characters long");
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const updated = await StudentRepository.setPassword(id, password_hash);
    if (!updated) {
      throw NotFound("Student not found");
    }

    return toPublicUser(updated);
  },
};
