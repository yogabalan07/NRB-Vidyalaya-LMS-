import type { Request, Response, NextFunction } from "express";

export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "STUDENT";

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: { role?: Role } }).user;
    if (!user || !roles.includes(user.role as Role)) {
      res.status(403).json({
        status: "error",
        message: "Insufficient permissions",
      });
      return;
    }
    next();
  };
}
