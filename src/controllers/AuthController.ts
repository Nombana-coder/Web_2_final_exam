import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { UserRepository } from "../repositories/UserRepository";
import { asyncHandler } from "../middlewares/errorHandler";
import { BadRequest, Unauthorized } from "../security/AppError";
import { toPublicUser } from "../models/User";

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

/**
 * Lets the frontend rehydrate the session (role, name, active status)
 * from a stored JWT after a page reload, without re-sending credentials.
 * requireAuth already re-checks the user still exists and is active.
 */
export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw Unauthorized("Not authenticated");
  }

  const user = await UserRepository.findById(req.user.sub);
  if (!user) {
    throw Unauthorized("User no longer exists");
  }

  res.status(200).json(toPublicUser(user));
});
