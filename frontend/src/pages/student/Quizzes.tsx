import { Link } from "react-router-dom";
import { ClipboardCheck, Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuizAttempts } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { enrollmentService, quizService, courseService } from "@/services";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Course } from "@/types/course";

function QuizCard({
  quiz,
  userId,
  courseMap,
}: {
  quiz: { id: string; title: string; description?: string; timeLimitMinutes?: number; totalMarks: number; passPercentage: number; maxAttempts: number; courseId: string };
  userId: string;
  courseMap: Map<string, Course>;
}) {
  const { data: attemptCount = 0 } = useQuizAttempts(quiz.id, userId);
  const course = courseMap.get(quiz.courseId);
  const hasAttempts = attemptCount >= quiz.maxAttempts;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            {course && (
              <p className="text-sm text-muted-foreground mt-1">{course.title}</p>
            )}
          </div>
          <Badge variant={hasAttempts ? "secondary" : "default"} className="shrink-0 ml-2">
            {hasAttempts ? "Completed" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {quiz.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {quiz.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {quiz.timeLimitMinutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {quiz.timeLimitMinutes} min
            </div>
          )}
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {quiz.totalMarks} marks
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {quiz.passPercentage}% to pass
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            {attemptCount}/{quiz.maxAttempts} attempts used
          </div>
        </div>
        <Button
          asChild
          disabled={hasAttempts}
          className="w-full"
        >
          {hasAttempts ? (
            <span>
              <CheckCircle className="mr-2 h-4 w-4" />
              Max Attempts Reached
            </span>
          ) : (
            <Link to={`/student/quizzes/${quiz.id}/attempt`}>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              Start Quiz
            </Link>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudentQuizzesPage() {
  const { user } = useAuth();

  const { data: allQuizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["quizzes", "student"],
    queryFn: async () => {
      const enrs = await enrollmentService.getEnrollmentsForUser(user?.id || "");
      const allQuizLists = await Promise.all(
        enrs.map((e) => quizService.getPublishedQuizzes(e.courseId))
      );
      return allQuizLists.flat();
    },
    enabled: !!user?.id,
  });

  const courseIds = useMemo(
    () => [...new Set((allQuizzes || []).map((q) => q.courseId))],
    [allQuizzes]
  );

  const { data: courseMap } = useQuery({
    queryKey: ["courses", "batch", courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map((id) => courseService.getCourseById(id))
      );
      const map = new Map<string, Course>();
      results.forEach((c) => {
        if (c) map.set(c.id, c);
      });
      return map;
    },
    enabled: courseIds.length > 0,
  });

  if (quizzesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground">
          Take quizzes from your enrolled courses
        </p>
      </div>

      {(!allQuizzes || allQuizzes.length === 0) ? (
        <EmptyState
          icon={<ClipboardCheck className="h-12 w-12" />}
          title="No quizzes available"
          description="There are no published quizzes for your enrolled courses yet."
        >
          <Button asChild>
            <Link to="/student/courses">Browse Courses</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {allQuizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              userId={user?.id || ""}
              courseMap={courseMap || new Map()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
