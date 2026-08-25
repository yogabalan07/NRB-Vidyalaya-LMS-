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

  const supabase = getSupabaseClient();
  supabase.auth
    .getUser(token)
    .then(({ data, error }) => {
      if (error || !data.user) {
        res.status(401).json({ status: "error", message: "Invalid token" });
        return;
      }

      const supabaseUser = data.user;

      // Read role from profiles table (database is source of truth, not JWT metadata)
      return supabase
        .from("profiles")
        .select("role")
        .eq("id", supabaseUser.id)
        .single()
        .then(({ data: profile, error: profileError }) => {
          if (profileError || !profile) {
            res.status(401).json({ status: "error", message: "Profile not found" });
            return;
          }

          const role = profile.role as Role;

          const authUser: AuthUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            role,
          };

          (req as { user?: AuthUser }).user = authUser;
          next();
        });
    })
    .catch(() => {
      res.status(401).json({ status: "error", message: "Authentication failed" });
    });
}
