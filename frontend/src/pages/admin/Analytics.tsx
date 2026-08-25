import { useDashboardStats, useCourses, useAllPayments } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import type { Course } from "@/types/course";

interface PaymentRow {
  amount: number;
  status: string;
  created_at: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: payments, isLoading: paymentsLoading } = useAllPayments();

  const isLoading = statsLoading || coursesLoading || paymentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const coursesList = (courses || []) as Course[];
  const paymentsList = (payments || []) as unknown as PaymentRow[];

  const publishedCount = coursesList.filter((c) => c.isPublished).length;
  const draftCount = coursesList.length - publishedCount;

  const totalRevenue = paymentsList
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = paymentsList.filter((p) => p.status === "PENDING").length;

  const difficultyBreakdown = {
    beginner: coursesList.filter((c) => c.difficulty === "beginner").length,
    intermediate: coursesList.filter((c) => c.difficulty === "intermediate").length,
    advanced: coursesList.filter((c) => c.difficulty === "advanced").length,
  };

  const enrollmentRate = stats
    ? stats.totalStudents > 0
      ? Math.round((stats.totalEnrollments / stats.totalStudents) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Dashboard analytics and system insights
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Students"
          value={stats?.totalStudents ?? 0}
          icon={Users}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers ?? 0}
          icon={Users}
          color="text-blue-500"
        />
        <StatCard
          title="Courses"
          value={stats?.totalCourses ?? 0}
          icon={BookOpen}
          color="text-green-500"
        />
        <StatCard
          title="Enrollments"
          value={stats?.totalEnrollments ?? 0}
          icon={TrendingUp}
          color="text-purple-500"
        />
        <StatCard
          title="Revenue"
          value={totalRevenue.toLocaleString()}
          icon={DollarSign}
          color="text-yellow-500"
        />
        <StatCard
          title="Enrollment Rate"
          value={`${enrollmentRate}%`}
          icon={BarChart3}
          color="text-orange-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Published</span>
                <span className="text-sm font-bold">{publishedCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      coursesList.length
                        ? (publishedCount / coursesList.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Drafts</span>
                <span className="text-sm font-bold">{draftCount}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      coursesList.length
                        ? (draftCount / coursesList.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(difficultyBreakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm capitalize">{key}</span>
                    <span className="text-sm font-bold">{value}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${
                          coursesList.length
                            ? (value / coursesList.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Payments</span>
                <span className="font-bold">{paymentsList.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending</span>
                <span className="font-bold text-orange-500">{pendingPayments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Revenue</span>
                <span className="font-bold text-green-600">
                  {totalRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg. Enrollments/Course</span>
                <span className="font-bold">
                  {coursesList.length
                    ? Math.round(
                        (stats?.totalEnrollments ?? 0) / coursesList.length
                      )
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Lessons/Course</span>
                <span className="font-bold">
                  {coursesList.length
                    ? Math.round(
                        (stats?.totalLessons ?? 0) / coursesList.length
                      )
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Quizzes/Course</span>
                <span className="font-bold">
                  {coursesList.length
                    ? Math.round(
                        (stats?.totalQuizzes ?? 0) / coursesList.length
                      )
                    : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Students</span>
                <span className="font-bold text-green-600">
                  {stats?.activeStudents ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Published Courses</span>
                <span className="font-bold">{publishedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Content</span>
                <span className="font-bold">
                  {(stats?.totalLessons ?? 0) + (stats?.totalQuizzes ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
