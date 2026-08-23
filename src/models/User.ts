export type UserRole = "admin" | "student";

/** Full row as stored in the DB. Never send password_hash to the client. */
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  active: boolean;
  created_at: Date;
}

/** Safe shape to return to the client (no password_hash). */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}
