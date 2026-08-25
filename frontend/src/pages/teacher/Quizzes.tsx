import { useAuth, useCoursesForTeacher, useAllQuizzes, useCreateQuiz, useDeleteQuiz, useQuestions } from "@/hooks";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Plus, Trash2, FileQuestion, Eye, EyeOff } from "lucide-react";
import type { Quiz } from "@/types/quiz";

interface QuizFormData {
  title: string;
  description: string;
  timeLimitMinutes: string;
  totalMarks: string;
  passPercentage: string;
  maxAttempts: string;
}

const emptyForm: QuizFormData = {
  title: "",
  description: "",
  timeLimitMinutes: "",
  totalMarks: "",
  passPercentage: "",
  maxAttempts: "",
};

function QuizQuestionCount({ quizId }: { quizId: string }) {
  const { data: questions } = useQuestions(quizId);
  return (
    <span className="text-xs text-muted-foreground">
      {questions?.length || 0} question{(questions?.length || 0) !== 1 ? "s" : ""}
    </span>
  );
}

export function TeacherQuizzesPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: quizzes, isLoading } = useAllQuizzes(selectedCourseId);
  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QuizFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      await createQuiz.mutateAsync({
        course_id: selectedCourseId,
        title: formData.title,
        description: formData.description || undefined,
        time_limit_minutes: formData.timeLimitMinutes
          ? parseInt(formData.timeLimitMinutes)
          : undefined,
        total_marks: formData.totalMarks ? parseInt(formData.totalMarks) : undefined,
        pass_percentage: formData.passPercentage
          ? parseInt(formData.passPercentage)
          : undefined,
        max_attempts: formData.maxAttempts ? parseInt(formData.maxAttempts) : undefined,
      });
      setShowForm(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Failed to create quiz:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuiz.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete quiz:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Create and manage quizzes</p>
        </div>
        {selectedCourseId && (
          <Button onClick={() => { setShowForm(true); setFormData(emptyForm); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {showForm && selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (min)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="1"
                    value={formData.timeLimitMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, timeLimitMinutes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalMarks">Total Marks</Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, totalMarks: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passPercent">Pass %</Label>
                  <Input
                    id="passPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, passPercentage: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAttempts: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createQuiz.isPending}>
                  {createQuiz.isPending ? "Creating..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to manage its quizzes."
          icon={<FileQuestion className="h-12 w-12" />}
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !quizzes || quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Create your first quiz for this course."
          icon={<FileQuestion className="h-12 w-12" />}
        >
          <Button onClick={() => { setShowForm(true); setFormData(emptyForm); }}>
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{quiz.title}</h3>
                      <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                        {quiz.isPublished ? (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <EyeOff className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </Badge>
                    </div>
                    {quiz.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {quiz.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <QuizQuestionCount quizId={quiz.id} />
                      {quiz.timeLimitMinutes && <span>{quiz.timeLimitMinutes} min</span>}
                      {quiz.totalMarks && <span>{quiz.totalMarks} marks</span>}
                      {quiz.passPercentage && <span>Pass: {quiz.passPercentage}%</span>}
                      {quiz.maxAttempts && <span>Max attempts: {quiz.maxAttempts}</span>}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(quiz)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? All questions will also be removed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
