import { Navigate, Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types/auth";
import { ROUTES } from "@/constants/routes";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  redirectPath?: string;
  portalName?: string;
}

const dashboardMap: Record<Role, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};

const portalLoginMap: Record<Role, string> = {
  STUDENT: ROUTES.STUDENT_LOGIN,
  TEACHER: ROUTES.TEACHER_LOGIN,
  ADMIN: ROUTES.ADMIN_LOGIN,
  SUPER_ADMIN: ROUTES.ADMIN_LOGIN,
};

function UnauthorizedAccess({ portalName }: { portalName: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 rounded-md bg-destructive/10 p-4">
          <p className="text-sm text-destructive font-medium">
            You do not have permission to access the {portalName} portal.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please use the appropriate login for your role.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Button asChild variant="outline">
            <Link to={ROUTES.STUDENT_LOGIN}>Student Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.TEACHER_LOGIN}>Teacher Login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.ADMIN_LOGIN}>Admin Login</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2">
            <Link to={ROUTES.HOME}>Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  allowedRoles,
  redirectPath = "/login",
  portalName = "this",
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const userDashboard = dashboardMap[user.role];
    const userLogin = portalLoginMap[user.role];

    // If user is trying to access a portal they don't belong to,
    // show them an unauthorized message instead of silently redirecting
    if (portalName !== "this") {
      return <UnauthorizedAccess portalName={portalName} />;
    }

    return <Navigate to={userDashboard || userLogin} replace />;
  }

  return <Outlet />;
}

export function StudentRoute() {
  return (
    <ProtectedRoute
      allowedRoles={["STUDENT"]}
      redirectPath={ROUTES.STUDENT_LOGIN}
      portalName="student"
    />
  );
}

export function TeacherRoute() {
  return (
    <ProtectedRoute
      allowedRoles={["TEACHER", "ADMIN", "SUPER_ADMIN"]}
      redirectPath={ROUTES.TEACHER_LOGIN}
      portalName="teacher"
    />
  );
}

export function AdminRoute() {
  return (
    <ProtectedRoute
      allowedRoles={["ADMIN", "SUPER_ADMIN"]}
      redirectPath={ROUTES.ADMIN_LOGIN}
      portalName="admin"
    />
  );
}
