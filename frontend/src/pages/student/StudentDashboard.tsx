import { Link } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Trophy,
  CalendarCheck,
  Award,
  Bell,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useStudentStats, useEnrollments, useProgressOverview } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { FadeIn } from "@/components/animations";
import { AnimatedCounter } from "@/components/animations/AnimatedCounter";

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  href?: string;
}) {
  const numericValue = typeof value === "number" ? value : parseInt(String(value).replace(/[^0-9]/g, ""), 10);
  const suffix = typeof value === "string" ? value.replace(/[0-9]/g, "") : "";
  const content = (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">
              {isNaN(numericValue) ? value : <AnimatedCounter value={numericValue} suffix={suffix} />}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useStudentStats(user?.id || "");
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(
    user?.id || ""
  );
  const { data: progressOverview, isLoading: progressLoading } = useProgressOverview();

  if (statsLoading || enrollmentsLoading || progressLoading) {
    return <DashboardSkeleton />;
  }

  const recentEnrollments = (enrollments || []).slice(0, 5);
  const progressMap = new Map(
    (progressOverview?.data || []).map((p) => [p.courseId, p])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName || "Student"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FadeIn delay={0}>
          <StatCard
            title="Enrolled Courses"
            value={stats?.enrolledCourses || 0}
            icon={GraduationCap}
            href={ROUTES.STUDENT_COURSES}
          />
        </FadeIn>
        <FadeIn delay={100}>
          <StatCard
            title="Average Progress"
            value={`${stats?.averageProgress || 0}%`}
            icon={TrendingUp}
            description="Across all courses"
          />
        </FadeIn>
        <FadeIn delay={200}>
          <StatCard
            title="Completed Quizzes"
            value={stats?.completedQuizzes || 0}
            icon={ClipboardCheck}
            href={ROUTES.STUDENT_QUIZZES}
          />
        </FadeIn>
        <FadeIn delay={300}>
          <StatCard
            title="Certificates"
            value={stats?.certificates || 0}
            icon={Award}
            href={ROUTES.STUDENT_CERTIFICATES}
          />
        </FadeIn>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Courses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={ROUTES.STUDENT_COURSES}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No courses yet.{" "}
                  <Link
                    to={ROUTES.COURSES}
                    className="text-primary hover:underline"
                  >
                    Browse courses
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => {
                  const progress = progressMap.get(enrollment.courseId);
                  const progressPercent = progress?.progressPercent || enrollment.progressPercent || 0;
                  const completedLessons = progress?.completedLessons || 0;
                  const totalLessons = progress?.totalLessons || 0;
                  
                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Course</p>
                          <p className="text-xs text-muted-foreground">
                            {completedLessons}/{totalLessons} lessons • {progressPercent}% complete
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary animate-progress-fill transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to={ROUTES.STUDENT_COURSES}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <GraduationCap className="h-4 w-4" />
                  My Courses
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT_QUIZZES}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Quizzes
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT_ATTENDANCE}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Attendance
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT_NOTIFICATIONS}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT_AI_TUTOR}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Trophy className="h-4 w-4" />
                  AI Tutor
                </Button>
              </Link>
              <Link to={ROUTES.STUDENT_CERTIFICATES}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Award className="h-4 w-4" />
                  Certificates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
