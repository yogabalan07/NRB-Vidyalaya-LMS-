import type { Role } from "./auth";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
