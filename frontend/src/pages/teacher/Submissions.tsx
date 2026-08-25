import { useAuth, useCoursesForTeacher, useAssignments, useSubmissionsForAssignment, useGradeSubmission } from "@/hooks";
import { profileService } from "@/services";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ClipboardCheck, ExternalLink } from "lucide-react";
import type { Submission } from "@/types/assignment";

interface SubmissionWithStudent extends Submission {
  studentName: string;
  studentEmail: string;
  assignmentTitle: string;
  maxMarks: number;
}

export function TeacherSubmissionsPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: assignments } = useAssignments(selectedCourseId);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const { data: submissions, isLoading } = useSubmissionsForAssignment(selectedAssignmentId);
  const gradeSubmission = useGradeSubmission();

  const [submissionsWithStudents, setSubmissionsWithStudents] = useState<SubmissionWithStudent[]>([]);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");

  useEffect(() => {
    if (!submissions) {
      setSubmissionsWithStudents([]);
      return;
    }
    if (submissions.length === 0) {
      setSubmissionsWithStudents([]);
      return;
    }

    async function enrichSubmissions() {
      const assignment = assignments?.find((a) => a.id === selectedAssignmentId);
      const currentSubmissions = submissions ?? [];
      const enriched = await Promise.all(
        currentSubmissions.map(async (sub) => {
          const profile = await profileService.getProfile(sub.userId);
          return {
            ...sub,
            studentName: profile?.full_name || "Unknown",
            studentEmail: profile?.email || "",
            assignmentTitle: assignment?.title || "",
            maxMarks: assignment?.maxMarks || 100,
          };
        })
      );
      setSubmissionsWithStudents(enriched);
    }

    enrichSubmissions();
  }, [submissions, assignments, selectedAssignmentId]);

  const handleGrade = async (submissionId: string) => {
    const marks = parseInt(gradeMarks);
    if (isNaN(marks)) return;

    try {
      await gradeSubmission.mutateAsync({
        id: submissionId,
        marks,
        feedback: gradeFeedback || undefined,
      });
      setGradingId(null);
      setGradeMarks("");
      setGradeFeedback("");
    } catch (err) {
      console.error("Failed to grade submission:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "GRADED":
        return "default";
      case "RETURNED":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground">Review and grade student submissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Select Course</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              setSelectedAssignmentId("");
            }}
          >
            <option value="">Choose a course...</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label>Select Assignment</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            disabled={!selectedCourseId}
          >
            <option value="">Choose an assignment...</option>
            {assignments?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedCourseId || !selectedAssignmentId ? (
        <EmptyState
          title="Select course and assignment"
          description="Choose a course and assignment to view submissions."
          icon={<ClipboardCheck className="h-12 w-12" />}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : submissionsWithStudents.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="No students have submitted this assignment yet."
          icon={<ClipboardCheck className="h-12 w-12" />}
        />
      ) : (
        <div className="space-y-3">
          {submissionsWithStudents.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{sub.studentName}</h3>
                      <Badge variant={getStatusColor(sub.status)}>
                        {sub.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sub.studentEmail}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted: {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                    {sub.notes && (
                      <p className="mt-2 text-sm italic">"{sub.notes}"</p>
                    )}
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View submission file
                      </a>
                    )}
                    {sub.status === "GRADED" && sub.marksObtained !== undefined && (
                      <div className="mt-2 rounded-md bg-muted p-2">
                        <p className="text-sm font-medium">
                          Grade: {sub.marksObtained} / {sub.maxMarks}
                        </p>
                        {sub.feedback && (
                          <p className="text-sm text-muted-foreground">
                            Feedback: {sub.feedback}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    {sub.status === "SUBMITTED" && (
                      <>
                        {gradingId === sub.id ? (
                          <div className="w-64 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Marks (out of {sub.maxMarks})</Label>
                              <Input
                                type="number"
                                min="0"
                                max={sub.maxMarks}
                                value={gradeMarks}
                                onChange={(e) => setGradeMarks(e.target.value)}
                                placeholder="Marks"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Feedback</Label>
                              <textarea
                                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                                value={gradeFeedback}
                                onChange={(e) => setGradeFeedback(e.target.value)}
                                placeholder="Optional feedback..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleGrade(sub.id)}
                                disabled={gradeSubmission.isPending || !gradeMarks}
                              >
                                {gradeSubmission.isPending ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setGradingId(null);
                                  setGradeMarks("");
                                  setGradeFeedback("");
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              setGradingId(sub.id);
                              setGradeMarks("");
                              setGradeFeedback("");
                            }}
                          >
                            Grade
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
