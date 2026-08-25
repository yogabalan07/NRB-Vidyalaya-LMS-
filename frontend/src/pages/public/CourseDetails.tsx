import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  Lock,
  Globe,
  BarChart3,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import {
  useCourse,
  useLessons,
  useEnrollCourse,
  useEnrollments,
  useUser,
} from "@/hooks";

const difficultyColor: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

function DetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="mb-6 h-6 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-4 h-5 w-1/3" />
      <Skeleton className="mt-8 h-40 w-full rounded-lg" />
      <div className="mt-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function CourseDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useUser();

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(slug || "");

  const { data: lessons, isLoading: lessonsLoading } = useLessons(
    course?.id || ""
  );

  const { data: enrollments } = useEnrollments(user?.id || "");
  const enrollMutation = useEnrollCourse();

  const isEnrolled =
    enrollments?.some((e) => e.courseId === course?.id) ?? false;

  const handleEnroll = () => {
    if (!user || !course) return;
    enrollMutation.mutate({ userId: user.id, courseId: course.id });
  };

  if (courseLoading) return <DetailSkeleton />;

  if (courseError || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorState
          title="Course not found"
          message="The course you are looking for does not exist or has been removed."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-16">
        <div className="container mx-auto px-4">
          <Link
            to="/courses"
            className="mb-6 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {course.difficulty && (
                <Badge
                  className={difficultyColor[course.difficulty] || ""}
                  variant="secondary"
                >
                  {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                </Badge>
              )}
              <Badge variant="outline" className="border-white/20 text-white">
                <Globe className="mr-1 h-3 w-3" />
                {course.language}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-white/70">
              {course.shortDescription || course.description || "No description available."}
            </p>
            <div className="mt-6 flex items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {lessons?.length || 0} lessons
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Updated {new Date(course.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              {course.description && (
                <div>
                  <h2 className="text-2xl font-bold">About This Course</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </div>
              )}

              {/* Lessons */}
              <div>
                <h2 className="text-2xl font-bold">Course Content</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lessons?.length || 0} lessons included
                </p>

                {lessonsLoading ? (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : lessons && lessons.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {lessons.map((lesson, idx) => (
                      <Card key={lesson.id}>
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.durationMinutes
                                ? `${lesson.durationMinutes} min`
                                : "Self-paced"}
                            </p>
                          </div>
                          {isEnrolled ? (
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground/40" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground/40" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No lessons available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BarChart3 className="h-4 w-4" />
                      <span>
                        Difficulty:{" "}
                        <span className="font-medium text-foreground capitalize">
                          {course.difficulty || "Not specified"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <span>
                        Language:{" "}
                        <span className="font-medium text-foreground">{course.language}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        Lessons:{" "}
                        <span className="font-medium text-foreground">
                          {lessons?.length || 0}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Updated:{" "}
                        <span className="font-medium text-foreground">
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  </div>

                  {user ? (
                    isEnrolled ? (
                      <Button className="w-full" size="lg" disabled>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Already Enrolled
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        size="lg"
                        variant="saffron"
                        onClick={handleEnroll}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" size="lg" variant="saffron" asChild>
                      <Link to="/login">
                        <User className="mr-2 h-5 w-5" />
                        Login to Enroll
                      </Link>
                    </Button>
                  )}

                  {enrollMutation.isError && (
                    <p className="text-sm text-destructive">
                      {enrollMutation.error?.message || "Failed to enroll. Please try again."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
