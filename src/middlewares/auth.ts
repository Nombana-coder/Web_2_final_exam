import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../security/jwt";
import { UserRepository } from "../repositories/UserRepository";
import { Unauthorized, Forbidden } from "../security/AppError";
import { UserRole } from "../models/User";

// Extend Express's Request type so req.user is typed everywhere downstream
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the JWT in the Authorization header, re-checks the user is
 * still active in the DB (in case they were deactivated after the token
 * was issued), and attaches { sub, role } to req.user.
 *
 * Use on every protected route:
 *   router.get("/students", requireAuth, getStudents);
 */
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

    // Re-check current state in DB — a token issued before deactivation
    // must stop working immediately (RG-11 applies beyond just login).
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

/**
 * Restricts a route to one or more roles. Use AFTER requireAuth:
 *   router.get("/students", requireAuth, requireRole("admin"), getStudents);
 */
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
