import { Request, Response, NextFunction } from "express";
import { AppError } from "../security/AppError";

/**
 * Central error handler. Every route/service should throw AppError
 * (or let unexpected errors bubble up) — this is the single place
 * that turns them into the RG-13 JSON shape: { "message": "..." }
 *
 * Register this LAST, after all routes, in src/index.ts:
 *   app.use(errorHandler);
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Unexpected/unhandled error: don't leak internals, but log for debugging
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
}

/**
 * Wrap async route handlers so thrown errors/rejected promises reach
 * errorHandler instead of crashing the process. Use it on every
 * controller function:
 *
 *   router.get("/students", asyncHandler(getStudents));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
