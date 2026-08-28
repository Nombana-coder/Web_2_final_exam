
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import { signToken } from "../security/jwt";
import { Unauthorized, Forbidden } from "../security/AppError";

export class AuthService {
  static async login(email: string, password: string) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw Unauthorized("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw Unauthorized("Invalid credentials");
    }

    if (!user.active) {
      throw Forbidden("Account is deactivated");
    }

    const token = signToken({ sub: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}