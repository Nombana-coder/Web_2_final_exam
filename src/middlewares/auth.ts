import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../security/jwt";
import { UserRepository } from "../repositories/UserRepository";
import { Unauthorized, Forbidden } from "../security/AppError";
import { UserRole } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw Unauthorized("Missing or invalid Authorization header");
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);

    const user = await UserRepository.findById(payload.sub);
    if (!user) {
      throw Unauthorized("User no longer exists");
    }
    if (!user.active) {
      throw Forbidden("Account is deactivated");
    }

    req.user = { sub: user.id, role: user.role };
    next();
  } catch (err) {
    next(err instanceof Error && "statusCode" in err ? err : Unauthorized("Invalid or expired token"));
  }
}


export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(Unauthorized("Not authenticated"));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(Forbidden("You do not have access to this resource"));
      return;
    }
    next();
  };
}
