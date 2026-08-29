import { Request, Response } from "express";
import { StudentService } from "../services/StudentService";
import { asyncHandler } from "../middlewares/errorHandler";
import { BadRequest } from "../security/AppError";

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await StudentService.list(req.query.page, req.query.limit);
  res.status(200).json(result);
});

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw BadRequest("Invalid student id");
  }
  const student = await StudentService.getById(id);
  res.status(200).json(student);
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body ?? {};

  if (!name || typeof name !== "string") {
    throw BadRequest("Name is required");
  }
  if (!email || typeof email !== "string") {
    throw BadRequest("Email is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    throw BadRequest("Password is required (min 6 characters)");
  }

  const student = await StudentService.create({ name, email, password });
  res.status(201).json(student);
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw BadRequest("Invalid student id");
  }

  const { name, email } = req.body ?? {};
  if (name !== undefined && typeof name !== "string") {
    throw BadRequest("Name must be a string");
  }
  if (email !== undefined && typeof email !== "string") {
    throw BadRequest("Email must be a string");
  }

  const student = await StudentService.update(id, { name, email });
  res.status(200).json(student);
});

export const setStudentActive = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw BadRequest("Invalid student id");
  }

  const { active } = req.body ?? {};
  if (typeof active !== "boolean") {
    throw BadRequest("`active` must be a boolean");
  }

  const student = await StudentService.setActive(id, active);
  res.status(200).json(student);
});

export const resetStudentPassword = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw BadRequest("Invalid student id");
  }

  const { password } = req.body ?? {};
  if (!password || typeof password !== "string" || password.length < 6) {
    throw BadRequest("Password must be at least 6 characters long");
  }

  const student = await StudentService.resetPassword(id, password);
  res.status(200).json({
    message: "Password reset successfully",
    student,
  });
});
