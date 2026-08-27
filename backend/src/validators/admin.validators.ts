import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(1, "Full name is required").max(200),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]).default("STUDENT"),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().optional(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
});

export const createMaterialSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  title: z.string().min(2, "Title must be at least 2 characters").max(200).transform((v) => v.trim()),
  description: z.string().optional(),
  driveUrl: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      try {
        new URL(v);
        return v;
      } catch {
        return undefined;
      }
    }),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.union([z.number(), z.string()]).optional().transform((v) => {
    if (v === undefined || v === null) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  }),
  mimeType: z.string().optional(),
});

export const updateMaterialSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(2).max(200).optional().transform((v) => v?.trim()),
  description: z.string().optional(),
  driveUrl: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      try {
        new URL(v);
        return v;
      } catch {
        return undefined;
      }
    }),
  filePath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.union([z.number(), z.string()]).optional().transform((v) => {
    if (v === undefined || v === null) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  }),
  mimeType: z.string().optional(),
});
