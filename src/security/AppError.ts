export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const BadRequest = (message: string) => new AppError(400, message);
export const Unauthorized = (message: string) => new AppError(401, message);
export const Forbidden = (message: string) => new AppError(403, message);
export const NotFound = (message: string) => new AppError(404, message);
export const Conflict = (message: string) => new AppError(409, message);
 