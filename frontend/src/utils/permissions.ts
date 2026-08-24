import type { Role } from "@/types/auth";

type Permission =
  | "manage:users"
  | "manage:courses"
  | "manage:lessons"
  | "manage:quizzes"
  | "manage:attendance"
  | "manage:payments"
  | "manage:blog"
  | "view:analytics"
  | "grade:assignments"
  | "create:announcements"
  | "use:ai-tutor"
  | "take:quizzes"
  | "view:certificates"
  | "view:own-data";

const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    "manage:users",
    "manage:courses",
    "manage:lessons",
    "manage:quizzes",
    "manage:attendance",
    "manage:payments",
    "manage:blog",
    "view:analytics",
    "grade:assignments",
    "create:announcements",
    "use:ai-tutor",
    "take:quizzes",
    "view:certificates",
    "view:own-data",
  ],
  ADMIN: [
    "manage:courses",
    "manage:lessons",
    "manage:quizzes",
    "manage:attendance",
    "manage:payments",
    "manage:blog",
    "view:analytics",
    "grade:assignments",
    "create:announcements",
    "use:ai-tutor",
    "take:quizzes",
    "view:certificates",
    "view:own-data",
  ],
  TEACHER: [
    "manage:lessons",
    "manage:quizzes",
    "manage:attendance",
    "grade:assignments",
    "create:announcements",
    "use:ai-tutor",
    "view:analytics",
    "view:own-data",
  ],
  STUDENT: [
    "use:ai-tutor",
    "take:quizzes",
    "view:certificates",
    "view:own-data",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
