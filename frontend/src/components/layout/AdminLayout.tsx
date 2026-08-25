import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  ClipboardCheck,
  Banknote,
  CalendarCheck,
  BarChart3,
  Bot,
  Bell,
  Settings,
  BookMarked,
  Library,
  Award,
  MessageSquare,
  ListChecks,
  LogOut,
  ChevronLeft,
  FileBarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const adminNav = [
  { label: "Dashboard", to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: "Users", to: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Students", to: ROUTES.ADMIN_STUDENTS, icon: GraduationCap },
  { label: "Teachers", to: ROUTES.ADMIN_TEACHERS, icon: Users },
  { label: "Courses", to: ROUTES.ADMIN_COURSES, icon: BookMarked },
  { label: "Lessons", to: ROUTES.ADMIN_LESSONS, icon: BookOpen },
  { label: "Materials", to: ROUTES.ADMIN_MATERIALS, icon: Library },
  { label: "Assignments", to: ROUTES.ADMIN_ASSIGNMENTS, icon: ClipboardCheck },
  { label: "Quizzes", to: ROUTES.ADMIN_QUIZZES, icon: ListChecks },
  { label: "Question Bank", to: ROUTES.ADMIN_QUESTION_BANK, icon: Banknote },
  { label: "AI Generator", to: ROUTES.ADMIN_AI_GENERATOR, icon: Bot },
  { label: "Attendance", to: ROUTES.ADMIN_ATTENDANCE, icon: CalendarCheck },
  { label: "Results", to: ROUTES.ADMIN_RESULTS, icon: BarChart3 },
  { label: "Certificates", to: ROUTES.ADMIN_CERTIFICATES, icon: Award },
  { label: "Blog", to: ROUTES.ADMIN_BLOG, icon: FileText },
  { label: "Announcements", to: ROUTES.ADMIN_ANNOUNCEMENTS, icon: MessageSquare },
  { label: "Notifications", to: ROUTES.ADMIN_NOTIFICATIONS, icon: Bell },
  { label: "Payments", to: ROUTES.ADMIN_PAYMENTS, icon: Banknote },
  { label: "Reports", to: ROUTES.ADMIN_REPORTS, icon: FileBarChart },
  { label: "Analytics", to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { label: "Settings", to: ROUTES.ADMIN_SETTINGS, icon: Settings },
];

const teacherNav = [
  { label: "Dashboard", to: ROUTES.TEACHER_DASHBOARD, icon: LayoutDashboard },
  { label: "Students", to: ROUTES.TEACHER_STUDENTS, icon: Users },
  { label: "Courses", to: ROUTES.TEACHER_COURSES, icon: BookMarked },
  { label: "Lessons", to: ROUTES.TEACHER_LESSONS, icon: BookOpen },
  { label: "Assignments", to: ROUTES.TEACHER_ASSIGNMENTS, icon: ClipboardCheck },
  { label: "Submissions", to: ROUTES.TEACHER_SUBMISSIONS, icon: FileText },
  { label: "Quizzes", to: ROUTES.TEACHER_QUIZZES, icon: ListChecks },
  { label: "Question Bank", to: ROUTES.TEACHER_QUESTION_BANK, icon: Banknote },
  { label: "Attendance", to: ROUTES.TEACHER_ATTENDANCE, icon: CalendarCheck },
  { label: "Performance", to: ROUTES.TEACHER_PROGRESS, icon: BarChart3 },
  { label: "Announcements", to: ROUTES.TEACHER_ANNOUNCEMENTS, icon: MessageSquare },
];

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PortalSidebarProps {
  title: string;
  navItems: NavItem[];
}

function PortalSidebar({ title, navItems }: PortalSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.LOGIN, { replace: true });
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
                : title[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium">
              {user?.fullName || title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "admin@nrb.com"}
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

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <PortalSidebar title="Admin" navItems={adminNav} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link to={ROUTES.HOME}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Admin Portal</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function TeacherLayout() {
  return (
    <div className="flex min-h-screen">
      <PortalSidebar title="Teacher" navItems={teacherNav} />
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Button variant="ghost" size="icon" asChild className="lg:hidden">
            <Link to={ROUTES.HOME}>
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Teacher Portal</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
