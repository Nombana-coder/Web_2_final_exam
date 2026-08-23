import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { asyncHandler } from "../middlewares/errorHandler";
import { BadRequest } from "../security/AppError";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== "string") {
    throw BadRequest("Email is required");
  }
  if (!password || typeof password !== "string") {
    throw BadRequest("Password is required");
  }

  const result = await AuthService.login(email, password);
  res.status(200).json(result);
});
