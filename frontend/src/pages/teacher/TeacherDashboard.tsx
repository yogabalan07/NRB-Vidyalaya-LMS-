import { useAuth, useCoursesForTeacher, useNotifications } from "@/hooks";
import { enrollmentService, assignmentService, quizService, submissionService } from "@/services";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  ClipboardList,
  FileQuestion,
  Bell,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStat {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  trend?: string;
}

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: "submission" | "enrollment" | "quiz" | "assignment";
  createdAt: string;
}

export function TeacherDashboardPage() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCoursesForTeacher(
    user?.id || ""
  );
  const { data: notifications } = useNotifications(user?.id || "");

  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!courses) return;
    if (courses.length === 0) {
      setLoadingStats(false);
      return;
    }

    async function loadStats() {
      const currentCourses = courses;
      if (!currentCourses) return;
      try {
        let totalStudents = 0;
        let pendingSubmissions = 0;
        let upcomingQuizzes = 0;

        for (const course of currentCourses) {
          const enrollments = await enrollmentService.getEnrollmentsForCourse(
            course.id
          );
          totalStudents += enrollments.length;

          const assignments = await assignmentService.getAssignments(course.id);
          for (const assignment of assignments) {
            const submissions =
              await submissionService.getSubmissionsForAssignment(assignment.id);
            pendingSubmissions += submissions.filter(
              (s) => s.status === "SUBMITTED"
            ).length;
          }

          const quizzes = await quizService.getQuizzes(course.id);
          const now = new Date();
          upcomingQuizzes += quizzes.filter(
            (q) => new Date(q.createdAt) > now || !q.isPublished
          ).length;
        }

        const recentActivities: ActivityItem[] = [];

        for (const course of currentCourses.slice(0, 3)) {
          const assignments = await assignmentService.getAssignments(course.id);
          for (const assignment of assignments.slice(0, 2)) {
            const submissions =
              await submissionService.getSubmissionsForAssignment(assignment.id);
            for (const sub of submissions.slice(0, 1)) {
              recentActivities.push({
                id: sub.id,
                title: `New submission for "${assignment.title}"`,
                description: `Student submitted their work`,
                type: "submission",
                createdAt: sub.submittedAt,
              });
            }
          }
        }

        recentActivities.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setStats([
          {
            title: "Assigned Courses",
            value: currentCourses.length,
            icon: <BookOpen className="h-5 w-5" />,
            description: "Courses you are teaching",
          },
          {
            title: "Total Students",
            value: totalStudents,
            icon: <Users className="h-5 w-5" />,
            description: "Across all your courses",
          },
          {
            title: "Pending Submissions",
            value: pendingSubmissions,
            icon: <ClipboardList className="h-5 w-5" />,
            description: "Awaiting your review",
            trend: pendingSubmissions > 0 ? "Needs attention" : undefined,
          },
          {
            title: "Upcoming Quizzes",
            value: upcomingQuizzes,
            icon: <FileQuestion className="h-5 w-5" />,
            description: "Scheduled quizzes",
          },
        ]);

        setActivities(recentActivities.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, [courses]);

  const unreadNotifications = notifications?.filter((n) => !n.isRead) || [];

  if (coursesLoading || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName || "Teacher"}!
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {unreadNotifications.length} new
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              {stat.trend && (
                <div className="mt-1 flex items-center text-xs text-orange-600">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  {stat.trend}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity to display.
              </p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5" />
              My Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!courses || courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No courses assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.difficulty || "All levels"} · {course.language}
                      </p>
                    </div>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
