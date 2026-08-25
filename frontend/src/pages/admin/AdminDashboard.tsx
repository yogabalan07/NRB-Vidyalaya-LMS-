import { useDashboardStats } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  ClipboardList,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold">Failed to load dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your LMS system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
          description={`${stats?.activeStudents ?? 0} active`}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers ?? 0}
          icon={GraduationCap}
        />
        <StatCard
          title="Courses"
          value={stats?.totalCourses ?? 0}
          icon={BookOpen}
          description={`${stats?.publishedCourses ?? 0} published`}
        />
        <StatCard
          title="Lessons"
          value={stats?.totalLessons ?? 0}
          icon={FileText}
        />
        <StatCard
          title="Quizzes"
          value={stats?.totalQuizzes ?? 0}
          icon={ClipboardList}
        />
        <StatCard
          title="Enrollments"
          value={stats?.totalEnrollments ?? 0}
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <a
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">
                  View and manage all user accounts
                </p>
              </div>
            </a>
            <a
              href="/admin/courses"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Manage Courses</p>
                <p className="text-xs text-muted-foreground">
                  Create, edit, and publish courses
                </p>
              </div>
            </a>
            <a
              href="/admin/question-bank"
              className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Question Bank</p>
                <p className="text-xs text-muted-foreground">
                  Manage quiz questions
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
