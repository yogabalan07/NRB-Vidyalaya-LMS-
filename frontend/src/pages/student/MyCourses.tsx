import { Link } from "react-router-dom";
import { BookOpen, Clock, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { courseService } from "@/services";
import { useQuery } from "@tanstack/react-query";

function CourseCard({
  enrollment,
}: {
  enrollment: {
    id: string;
    courseId: string;
    progressPercent: number;
    enrolledAt: string;
  };
}) {
  const { data: course } = useQuery({
    queryKey: ["course", enrollment.courseId],
    queryFn: () => courseService.getCourseById(enrollment.courseId),
    enabled: !!enrollment.courseId,
  });

  return (
    <Link to={`/student/courses/${enrollment.courseId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
          {course?.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {course?.difficulty || "Hindi"}
              </Badge>
            </div>
            <h3 className="font-semibold line-clamp-2">{course?.title || "Loading..."}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course?.shortDescription || course?.description || "No description"}
            </p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{enrollment.progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${enrollment.progressPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                {enrollment.progressPercent}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function StudentCoursesPage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading } = useEnrollments(user?.id || "");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Courses you are enrolled in
        </p>
      </div>

      {(!enrollments || enrollments.length === 0) ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No courses yet"
          description="You haven't enrolled in any courses yet. Browse our catalog to get started."
        >
          <Button asChild>
            <Link to="/courses">Browse Courses</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <CourseCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
