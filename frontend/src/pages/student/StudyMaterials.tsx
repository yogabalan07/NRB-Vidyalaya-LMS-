import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks";
import { courseService, lessonService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { Lesson } from "@/types/lesson";

interface MaterialItem {
  lesson: Lesson;
  courseName: string;
  courseId: string;
}

function MaterialsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export function StudentMaterialsPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(userId);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enrollments?.length) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
        const items: MaterialItem[] = [];

        await Promise.all(
          courseIds.map(async (cid) => {
            const course = await courseService.getCourseById(cid);
            const lessons = await lessonService.getLessons(cid);
            lessons
              .filter((l) => l.content || l.videoUrl)
              .forEach((l) =>
                items.push({
                  lesson: l,
                  courseName: course?.title || "Course",
                  courseId: cid,
                })
              );
          })
        );

        setMaterials(items);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [enrollments]);

  const isLoading = enrollmentsLoading || loading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground">
          Access lesson content and resources from your courses.
        </p>
      </div>

      {isLoading ? (
        <MaterialsSkeleton />
      ) : materials.length === 0 ? (
        <EmptyState
          title="No materials available"
          description="Enroll in a course to access study materials."
          icon={<FileText className="h-12 w-12" />}
        >
          <Button asChild>
            <Link to={ROUTES.STUDENT_COURSES}>Browse Courses</Link>
          </Button>
        </EmptyState>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Materials ({materials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-lg border">
              {materials.map((item) => (
                <div
                  key={item.lesson.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.courseName}
                        {item.lesson.durationMinutes &&
                          ` · ${item.lesson.durationMinutes} min`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.lesson.content && (
                      <Badge variant="secondary" className="text-[10px]">
                        Content
                      </Badge>
                    )}
                    {item.lesson.videoUrl && (
                      <Badge variant="secondary" className="text-[10px]">
                        Video
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`${ROUTES.STUDENT_COURSES}/${item.courseId}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
