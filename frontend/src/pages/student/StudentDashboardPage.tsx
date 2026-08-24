import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, FileText, Trophy, CalendarCheck, Award, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

const quickLinks = [
  { label: "My Courses", to: ROUTES.STUDENT_COURSES, icon: GraduationCap, count: "3" },
  { label: "Assignments", to: ROUTES.STUDENT_ASSIGNMENTS, icon: FileText, count: "2" },
  { label: "Quizzes", to: ROUTES.STUDENT_QUIZZES, icon: Trophy, count: "1" },
  { label: "Attendance", to: ROUTES.STUDENT_ATTENDANCE, icon: CalendarCheck, count: "92%" },
  { label: "Certificates", to: ROUTES.STUDENT_CERTIFICATES, icon: Award, count: "1" },
  { label: "AI Tutor", to: ROUTES.STUDENT_AI_TUTOR, icon: Bot, count: "" },
];

export function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Continue your Hindi learning journey.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card key={link.label} className="transition-colors hover:border-primary/20">
              <CardContent className="p-6">
                <Link to={link.to} className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{link.label}</p>
                    {link.count && (
                      <p className="text-sm text-muted-foreground">{link.count}</p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity. Start a course to begin learning!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
