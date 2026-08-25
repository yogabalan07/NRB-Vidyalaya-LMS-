import { useMemo } from "react";
import { TrendingUp, Trophy, BookOpen, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function ProgressSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  let color = "bg-primary";
  if (percent >= 75) color = "bg-green-500";
  else if (percent >= 50) color = "bg-amber-500";
  else if (percent >= 25) color = "bg-orange-500";

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function StudentProgressPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const { data: enrollments, isLoading } = useEnrollments(userId);

  const stats = useMemo(() => {
    if (!enrollments?.length) {
      return { avgProgress: 0, completed: 0, inProgress: 0, total: 0 };
    }
    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.progressPercent >= 100).length;
    const inProgress = total - completed;
    const avgProgress = Math.round(
      enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / total
    );
    return { avgProgress, completed, inProgress, total };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress</h1>
        <p className="text-muted-foreground">
          Track your learning progress across all courses.
        </p>
      </div>

      {isLoading ? (
        <ProgressSkeleton />
      ) : !enrollments?.length ? (
        <EmptyState
          title="No progress to show"
          description="Enroll in a course to start tracking your progress."
          icon={<BarChart3 className="h-12 w-12" />}
        >
          <Button asChild>
            <Link to={ROUTES.STUDENT_COURSES}>Browse Courses</Link>
          </Button>
        </EmptyState>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Progress
                    </p>
                    <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <Trophy className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold">{stats.inProgress}</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                    <BookOpen className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <div className="flex-1">
                  <ProgressBar percent={stats.avgProgress} />
                </div>
                <span className="text-lg font-bold">{stats.avgProgress}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You have completed {stats.completed} of {stats.total} enrolled
                courses.
              </p>
            </CardContent>
          </Card>

          {/* Per-Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Course {enrollment.courseId.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            enrollment.progressPercent >= 100
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {enrollment.progressPercent >= 100
                            ? "Completed"
                            : `${enrollment.progressPercent}%`}
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar percent={enrollment.progressPercent} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
