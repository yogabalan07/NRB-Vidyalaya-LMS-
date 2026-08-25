import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Trophy,
  Upload,
  CheckCircle,
  Clock,
  Send,
  Loader2,
  Download,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAssignment, useSubmissionsForUser, useSubmitAssignment } from "@/hooks";
import { storageService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Submission } from "@/types/assignment";

function getSubmissionStatusBadge(status: Submission["status"]) {
  switch (status) {
    case "GRADED":
      return (
        <Badge className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-1 h-3 w-3" />
          Graded
        </Badge>
      );
    case "RETURNED":
      return (
        <Badge variant="destructive">
          <MessageSquare className="mr-1 h-3 w-3" />
          Returned
        </Badge>
      );
    default:
      return (
        <Badge variant="default">
          <Clock className="mr-1 h-3 w-3" />
          Submitted
        </Badge>
      );
  }
}

export function StudentAssignmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const userId = user?.id || "";
  const assignmentId = id || "";

  const { data: assignment, isLoading: assignmentLoading, error: assignmentError } = useAssignment(assignmentId);
  const { data: submissions, isLoading: submissionsLoading } = useSubmissionsForUser(userId);
  const submitMutation = useSubmitAssignment();

  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingSubmission = (submissions || []).find(
    (s) => s.assignmentId === assignmentId
  );

  const isLoading = assignmentLoading || submissionsLoading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assignment || !userId) return;

    setUploadError(null);
    setUploading(true);

    try {
      let fileUrl: string | undefined;

      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `submissions/${userId}/${assignmentId}/${Date.now()}.${ext}`;
        const result = await storageService.upload("assignments", path, file);
        fileUrl = result.url;
      }

      await submitMutation.mutateAsync({
        assignment_id: assignmentId,
        user_id: userId,
        file_url: fileUrl,
        notes: notes.trim() || undefined,
      });

      setNotes("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (assignmentError || !assignment) {
    return (
      <div className="space-y-6">
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignments
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {assignmentError ? "Failed to load assignment." : "Assignment not found."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPastDeadline = assignment.deadline
    ? new Date(assignment.deadline) < new Date()
    : false;
  const canSubmit = !existingSubmission && !isPastDeadline;

  return (
    <div className="space-y-6">
      <Link
        to="/student/assignments"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-1">
                {assignment.description || "No description provided."}
              </CardDescription>
            </div>
            {existingSubmission && getSubmissionStatusBadge(existingSubmission.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {assignment.deadline && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  Deadline:{" "}
                  {new Date(assignment.deadline).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {isPastDeadline && (
                  <Badge variant="destructive" className="ml-1 text-[10px]">
                    Past deadline
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4" />
              <span>Maximum Marks: {assignment.maxMarks}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {existingSubmission ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Submitted At</p>
                <p className="text-sm">
                  {new Date(existingSubmission.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {existingSubmission.status === "GRADED" &&
                existingSubmission.marksObtained != null && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Marks Obtained</p>
                    <p className="text-lg font-bold">
                      {existingSubmission.marksObtained}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{assignment.maxMarks}
                      </span>
                    </p>
                  </div>
                )}
            </div>

            {existingSubmission.notes && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap text-sm">{existingSubmission.notes}</p>
              </div>
            )}

            {existingSubmission.fileUrl && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Submitted File</p>
                <a
                  href={existingSubmission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  View submitted file
                </a>
              </div>
            )}

            {existingSubmission.feedback && (
              <div className="space-y-1 rounded-md bg-muted p-3">
                <p className="text-sm font-medium text-muted-foreground">Teacher Feedback</p>
                <p className="whitespace-pre-wrap text-sm">{existingSubmission.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : canSubmit ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submit Your Work</CardTitle>
            <CardDescription>
              Upload your file and add notes, then submit before the deadline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or comments about your submission..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File Upload (optional)</Label>
                <div
                  className="flex items-center gap-3 rounded-md border border-dashed border-input p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    {file ? (
                      <p className="text-sm font-medium truncate">{file.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to choose a file (PDF, DOC, images, etc.)
                      </p>
                    )}
                  </div>
                  {file && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.zip"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitMutation.isPending || uploading}
                className="w-full sm:w-auto"
              >
                {submitMutation.isPending || uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {uploading ? "Uploading file..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Assignment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              The deadline for this assignment has passed. Submissions are no longer accepted.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
