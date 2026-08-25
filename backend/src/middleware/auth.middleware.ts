import type { Request, Response, NextFunction } from "express";
import { getSupabaseClient } from "../config/database.js";
import type { AuthUser, Role } from "../types/express.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ status: "error", message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  // Use Supabase to verify the JWT token
  const supabase = getSupabaseClient();
  supabase.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        res.status(401).json({ status: "error", message: "Invalid token" });
        return;
      }

      const supabaseUser = data.user;
      const role =
        (supabaseUser.app_metadata?.role as Role) ||
        (supabaseUser.user_metadata?.role as Role) ||
        "STUDENT";

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        role,
      };

      (req as { user?: AuthUser }).user = authUser;
      next();
    })
    .catch(() => {
      res.status(401).json({ status: "error", message: "Authentication failed" });
    });
}
