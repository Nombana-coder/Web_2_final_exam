import jwt from "jsonwebtoken";
import { UserRole } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

if (!JWT_SECRET) {
  // Fail fast at startup rather than silently signing tokens with "undefined"
  throw new Error("JWT_SECRET is not set in the environment (.env)");
}

export interface JwtPayload {
  sub: number; // user id
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}
