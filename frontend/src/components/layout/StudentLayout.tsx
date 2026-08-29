import { useState, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  FileText,
  ClipboardCheck,
  Trophy,
  CalendarCheck,
  Award,
  Bot,
  Library,
  Bell,
  User,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { MobileDrawer } from "./MobileDrawer";

const studentNav = [
  { label: "Dashboard", to: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
  { label: "My Courses", to: ROUTES.STUDENT_COURSES, icon: GraduationCap },
  { label: "Lessons", to: ROUTES.STUDENT_LESSONS, icon: BookOpen },
  { label: "Assignments", to: ROUTES.STUDENT_ASSIGNMENTS, icon: FileText },
  { label: "Quizzes", to: ROUTES.STUDENT_QUIZZES, icon: ClipboardCheck },
  { label: "Results", to: ROUTES.STUDENT_RESULTS, icon: Trophy },
  { label: "Attendance", to: ROUTES.STUDENT_ATTENDANCE, icon: CalendarCheck },
  { label: "Certificates", to: ROUTES.STUDENT_CERTIFICATES, icon: Award },
  { label: "AI Hindi Tutor", to: ROUTES.STUDENT_AI_TUTOR, icon: Bot },
  { label: "Materials", to: ROUTES.STUDENT_MATERIALS, icon: Library },
  { label: "Notifications", to: ROUTES.STUDENT_NOTIFICATIONS, icon: Bell },
  { label: "Profile", to: ROUTES.STUDENT_PROFILE, icon: User },
];

interface PortalSidebarProps {
  title: string;
  navItems: typeof studentNav;
}

function PortalSidebar({ title, navItems }: PortalSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold">{title}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t p-3">
        <Separator className="mb-3" />
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">
              {user?.fullName || "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleClose = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen">
      <PortalSidebar title="Student" navItems={studentNav} />
      <MobileDrawer
        open={mobileOpen}
        onClose={handleClose}
        title="Student"
        navItems={studentNav}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden lg:flex shrink-0">
            <Link to={ROUTES.HOME}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold truncate">Student Portal</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
