import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import { signToken } from "../security/jwt";
import { Unauthorized, Forbidden } from "../security/AppError";
import { toPublicUser, PublicUser } from "../models/User";

export interface LoginResult {
  token: string;
  user: PublicUser;
}

export const AuthService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const user = await UserRepository.findByEmail(email);

    // Same generic message whether the email doesn't exist or the password
    // is wrong — never reveal which one it was.
    if (!user) {
      throw Unauthorized("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      throw Unauthorized("Invalid credentials");
    }

    // RG-11: a deactivated account gets an explicit, distinct rejection —
    // checked AFTER the password so we don't leak active-status via timing/response
    // on a wrong password attempt.
    if (!user.active) {
      throw Forbidden("Account is deactivated");
    }

    const token = signToken({ sub: user.id, role: user.role });

    return { token, user: toPublicUser(user) };
  },
};
