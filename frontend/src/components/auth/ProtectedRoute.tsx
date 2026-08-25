import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/common/Loader";
import type { Role } from "@/types/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectPath?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectPath = "/login",
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard
    const dashboardMap: Record<Role, string> = {
      SUPER_ADMIN: "/admin/dashboard",
      ADMIN: "/admin/dashboard",
      TEACHER: "/teacher/dashboard",
      STUDENT: "/student/dashboard",
    };
    return <Navigate to={dashboardMap[user.role]} replace />;
  }

  return <Outlet />;
}

export function StudentRoute() {
  return <ProtectedRoute allowedRoles={["STUDENT"]} />;
}

export function TeacherRoute() {
  return <ProtectedRoute allowedRoles={["TEACHER", "ADMIN", "SUPER_ADMIN"]} />;
}

export function AdminRoute() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} />
  );
}
