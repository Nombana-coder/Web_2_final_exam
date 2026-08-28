/**
 * Standard application error, used across the whole API so that every
 * error response follows RG-13: { "message": "..." } with the right
 * HTTP status code (400 / 401 / 403 / 404 / 409).
 *
 * Usage in a Service/Controller:
 *   throw new AppError(404, "Course not found");
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Convenience helpers for the most common cases
export const BadRequest = (message: string) => new AppError(400, message);
export const Unauthorized = (message: string) => new AppError(401, message);
export const Forbidden = (message: string) => new AppError(403, message);
export const NotFound = (message: string) => new AppError(404, message);
export const Conflict = (message: string) => new AppError(409, message);
 