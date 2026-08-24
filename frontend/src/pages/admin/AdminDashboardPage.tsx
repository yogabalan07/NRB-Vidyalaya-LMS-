import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Users, GraduationCap, BookMarked, ListChecks, Bot, Award, BarChart3, Settings } from "lucide-react";

const quickLinks = [
  { label: "Students", to: ROUTES.ADMIN_STUDENTS, icon: Users },
  { label: "Teachers", to: ROUTES.ADMIN_TEACHERS, icon: GraduationCap },
  { label: "Courses", to: ROUTES.ADMIN_COURSES, icon: BookMarked },
  { label: "Quizzes", to: ROUTES.ADMIN_QUIZZES, icon: ListChecks },
  { label: "AI Generator", to: ROUTES.ADMIN_AI_GENERATOR, icon: Bot },
  { label: "Certificates", to: ROUTES.ADMIN_CERTIFICATES, icon: Award },
  { label: "Analytics", to: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
  { label: "Settings", to: ROUTES.ADMIN_SETTINGS, icon: Settings },
];

export function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage the entire NRB Vidyalaya platform.</p>
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
