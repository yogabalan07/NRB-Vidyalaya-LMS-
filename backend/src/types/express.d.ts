import type { Request } from "express";

export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
