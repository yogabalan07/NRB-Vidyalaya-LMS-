import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks";
import { courseService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ROUTES } from "@/constants/routes";
import type { Course } from "@/types/course";
import type { Lesson } from "@/types/lesson";

interface LessonWithCourse extends Lesson {
  courseName: string;
  courseId: string;
}

function LessonsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function StudentLessonsPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(userId);
  const [allLessons, setAllLessons] = useState<LessonWithCourse[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enrollments?.length) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      try {
        const courseIds = [...new Set(enrollments.map((e) => e.courseId))];
        const courses: Course[] = [];
        const lessonsByCourse: LessonWithCourse[] = [];

        await Promise.all(
          courseIds.map(async (cid) => {
            const course = await courseService.getCourseById(cid);
            if (course) {
              courses.push(course);
              const lessons = await courseServiceCourseLessons(cid);
              lessons.forEach((l) =>
                lessonsByCourse.push({ ...l, courseName: course.title, courseId: cid })
              );
            }
          })
        );

        const map: Record<string, Course> = {};
        courses.forEach((c) => (map[c.id] = c));
        setCoursesMap(map);
        setAllLessons(
          lessonsByCourse.sort((a, b) => a.sortOrder - b.sortOrder)
        );
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
        <h1 className="text-2xl font-bold">Lessons</h1>
        <p className="text-muted-foreground">
          Access lessons from your enrolled courses.
        </p>
      </div>

      {isLoading ? (
        <LessonsSkeleton />
      ) : allLessons.length === 0 ? (
        <EmptyState
          title="No lessons available"
          description="Enroll in a course to access lessons."
          icon={<BookOpen className="h-12 w-12" />}
        >
          <Button asChild>
            <Link to={ROUTES.STUDENT_COURSES}>Browse Courses</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {Object.entries(
            allLessons.reduce<Record<string, LessonWithCourse[]>>((acc, l) => {
              if (!acc[l.courseId]) acc[l.courseId] = [];
              acc[l.courseId]?.push(l);
              return acc;
            }, {})
          ).map(([courseId, lessons]) => (
            <Card key={courseId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {coursesMap[courseId]?.title || "Course"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`${ROUTES.STUDENT_COURSES}/${courseId}`}>
                      View Course <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y rounded-lg border">
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {lesson.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.durationMinutes} min
                              </span>
                            )}
                            {lesson.content && <Badge variant="secondary" className="text-[10px]">Has content</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`${ROUTES.STUDENT_COURSES}/${courseId}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

async function courseServiceCourseLessons(courseId: string): Promise<Lesson[]> {
  const { lessonService } = await import("@/services");
  return lessonService.getLessons(courseId);
}
