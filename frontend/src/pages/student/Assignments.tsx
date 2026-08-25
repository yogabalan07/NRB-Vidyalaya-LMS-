import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Calendar, Trophy, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEnrollments, useSubmissionsForUser } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { assignmentService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { Assignment } from "@/types/assignment";
import type { Submission } from "@/types/assignment";

interface AssignmentWithCourse extends Assignment {
  courseTitle: string;
}

function getDeadlineStatus(deadline: string | undefined): { label: string; variant: "default" | "secondary" | "destructive" } {
  if (!deadline) return { label: "No deadline", variant: "secondary" };
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", variant: "destructive" };
  if (diffDays === 0) return { label: "Due today", variant: "destructive" };
  if (diffDays <= 3) return { label: `${diffDays} days left`, variant: "secondary" };
  return { label: `${diffDays} days left`, variant: "default" };
}

function AssignmentRow({
  assignment,
  submission,
}: {
  assignment: AssignmentWithCourse;
  submission: Submission | undefined;
}) {
  const deadlineInfo = getDeadlineStatus(assignment.deadline);
  const isSubmitted = !!submission;
  const isGraded = submission?.status === "GRADED";

  return (
    <Link to={`/student/assignments/${assignment.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{assignment.title}</h3>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground">{assignment.courseTitle}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {assignment.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(assignment.deadline).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {assignment.maxMarks} marks
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {isGraded && submission?.marksObtained != null ? (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {submission.marksObtained}/{assignment.maxMarks}
                </Badge>
              ) : isSubmitted ? (
                <Badge variant="default">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Submitted
                </Badge>
              ) : (
                <Badge variant="outline">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Not submitted
                </Badge>
              )}
              <Badge variant={deadlineInfo.variant} className="text-[10px]">
                {deadlineInfo.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function StudentAssignmentsPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(userId);
  const { data: submissions, isLoading: submissionsLoading } = useSubmissionsForUser(userId);

  const courseIds = useMemo(
    () => (enrollments || []).map((e) => e.courseId),
    [enrollments]
  );

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", "student", courseIds],
    queryFn: async () => {
      const results = await Promise.all(
        courseIds.map(async (courseId) => {
          const [assignments, course] = await Promise.all([
            assignmentService.getAssignments(courseId),
            import("@/services").then((s) => s.courseService.getCourseById(courseId)),
          ]);
          return assignments.map((a) => ({
            ...a,
            courseTitle: course?.title || "Unknown Course",
          }));
        })
      );
      return results.flat();
    },
    enabled: courseIds.length > 0,
  });

  const submissionMap = useMemo(() => {
    const map = new Map<string, Submission>();
    (submissions || []).forEach((s) => {
      const existing = map.get(s.assignmentId);
      if (!existing || new Date(s.submittedAt) > new Date(existing.submittedAt)) {
        map.set(s.assignmentId, s);
      }
    });
    return map;
  }, [submissions]);

  const isLoading = enrollmentsLoading || submissionsLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const assignments = assignmentsData || [];
  const sortedAssignments = [...assignments].sort((a, b) => {
    const aSubmitted = submissionMap.has(a.id);
    const bSubmitted = submissionMap.has(b.id);
    if (aSubmitted !== bSubmitted) return aSubmitted ? 1 : -1;
    if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-muted-foreground">
          View and submit assignments from your enrolled courses
        </p>
      </div>

      {sortedAssignments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="No assignments yet"
          description="There are no assignments for your enrolled courses yet. Check back later."
        />
      ) : (
        <div className="space-y-3">
          {sortedAssignments.map((assignment) => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              submission={submissionMap.get(assignment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
