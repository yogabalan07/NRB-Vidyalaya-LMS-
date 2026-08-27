import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BookOpen,
  Play,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCourseById, useLessons } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { AnimatedProgressRing } from "@/components/animations";

export function StudentCourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourseById(courseId || "");
  const { data: lessons, isLoading: lessonsLoading } = useLessons(courseId || "");
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  if (courseLoading || lessonsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="Course not found"
        description="The course you're looking for doesn't exist."
      >
        <Button asChild>
          <Link to="/student/courses">Back to My Courses</Link>
        </Button>
      </EmptyState>
    );
  }

  const publishedLessons = (lessons || []).filter((l) => l.isPublished);
  const activeLesson = publishedLessons[activeLessonIndex];
  const progressPercent =
    publishedLessons.length > 0
      ? Math.round((completedLessons.size / publishedLessons.length) * 100)
      : 0;

  const toggleLessonComplete = (lessonId: string) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student/courses" className="hover:text-foreground">
          My Courses
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{course.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground mt-1">
          {course.description || course.shortDescription || "No description"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {activeLesson ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{activeLesson.title}</CardTitle>
                  <Badge variant="secondary">
                    {activeLesson.durationMinutes
                      ? `${activeLesson.durationMinutes} min`
                      : "Self-paced"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeLesson.videoUrl ? (
                  <div className="aspect-video rounded-lg bg-black flex items-center justify-center">
                    <a
                      href={activeLesson.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white hover:underline"
                    >
                      <Play className="h-8 w-8" />
                      Watch Video
                    </a>
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No video for this lesson
                      </p>
                    </div>
                  </div>
                )}

                {activeLesson.content && (
                  <div className="prose prose-sm max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    onClick={() => toggleLessonComplete(activeLesson.id)}
                    variant={completedLessons.has(activeLesson.id) ? "default" : "outline"}
                  >
                    {completedLessons.has(activeLesson.id) ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>

                  {activeLessonIndex > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveLessonIndex((i) => i - 1)}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  {activeLessonIndex < publishedLessons.length - 1 && (
                    <Button
                      onClick={() => setActiveLessonIndex((i) => i + 1)}
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No lessons available"
              description="This course doesn't have any published lessons yet."
            />
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <AnimatedProgressRing progress={progressPercent} size={64} strokeWidth={5} />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium">
                      {completedLessons.size}/{publishedLessons.length}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary animate-progress-fill transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lessons</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {publishedLessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted transition-colors border-b last:border-0",
                      activeLessonIndex === index && "bg-muted"
                    )}
                  >
                    {completedLessons.has(lesson.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{lesson.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {lesson.durationMinutes
                          ? `${lesson.durationMinutes} min`
                          : "Self-paced"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
