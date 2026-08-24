import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Users, BookOpen, ClipboardCheck, FileText, ListChecks, CalendarCheck, BarChart3, MessageSquare } from "lucide-react";

const quickLinks = [
  { label: "Students", to: ROUTES.TEACHER_STUDENTS, icon: Users },
  { label: "Courses", to: ROUTES.TEACHER_COURSES, icon: BookOpen },
  { label: "Assignments", to: ROUTES.TEACHER_ASSIGNMENTS, icon: ClipboardCheck },
  { label: "Submissions", to: ROUTES.TEACHER_SUBMISSIONS, icon: FileText },
  { label: "Quizzes", to: ROUTES.TEACHER_QUIZZES, icon: ListChecks },
  { label: "Attendance", to: ROUTES.TEACHER_ATTENDANCE, icon: CalendarCheck },
  { label: "Progress", to: ROUTES.TEACHER_PROGRESS, icon: BarChart3 },
  { label: "Announcements", to: ROUTES.TEACHER_ANNOUNCEMENTS, icon: MessageSquare },
];

export function TeacherDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage your students and courses.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.label} className="transition-colors hover:border-primary/20">
              <CardContent className="p-6">
                <Link to={link.to} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-semibold">{link.label}</p>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
