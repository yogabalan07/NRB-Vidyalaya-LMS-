export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export const ALL_ROLES: Role[] = ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"];

export const STUDENT_ROLE: Role = "STUDENT";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
  avatar_url?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}
