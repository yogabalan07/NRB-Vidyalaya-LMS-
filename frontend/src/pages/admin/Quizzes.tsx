import { useState } from "react";
import {
  useCourses,
  useAllQuizzes,
  useQuestions,
  useCreateQuiz,
  useDeleteQuiz,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Plus,
  Trash2,
  ClipboardList,
  X,
  Clock,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import type { Quiz } from "@/types/quiz";

interface QuizFormData {
  course_id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  total_marks: number;
  pass_percentage: number;
  max_attempts: number;
}

const defaultForm: QuizFormData = {
  course_id: "",
  title: "",
  description: "",
  time_limit_minutes: 0,
  total_marks: 100,
  pass_percentage: 40,
  max_attempts: 1,
};

export function AdminQuizzesPage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: quizzes, isLoading } = useAllQuizzes(selectedCourse);
  const createQuiz = useCreateQuiz();
  const deleteQuiz = useDeleteQuiz();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QuizFormData>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<Quiz | null>(null);

  const resetForm = () => {
    setForm({ ...defaultForm, course_id: selectedCourse });
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.course_id) return;
    createQuiz.mutate(
      {
        course_id: form.course_id,
        title: form.title,
        description: form.description || undefined,
        time_limit_minutes: form.time_limit_minutes || undefined,
        total_marks: form.total_marks || undefined,
        pass_percentage: form.pass_percentage || undefined,
        max_attempts: form.max_attempts || undefined,
      },
      { onSuccess: resetForm }
    );
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteQuiz.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">Manage quizzes per course</p>
        </div>
        {selectedCourse && (
          <Button
            onClick={() => {
              setForm({ ...defaultForm, course_id: selectedCourse });
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quiz
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setShowForm(false);
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

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Quiz</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Quiz title"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Quiz description"
                />
              </div>
              <div className="space-y-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={form.time_limit_minutes || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      time_limit_minutes: Number(e.target.value),
                    }))
                  }
                  placeholder="0 for no limit"
                />
              </div>
              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input
                  type="number"
                  value={form.total_marks || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      total_marks: Number(e.target.value),
                    }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Pass Percentage</Label>
                <Input
                  type="number"
                  value={form.pass_percentage || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pass_percentage: Number(e.target.value),
                    }))
                  }
                  placeholder="40"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Attempts</Label>
                <Input
                  type="number"
                  value={form.max_attempts || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      max_attempts: Number(e.target.value),
                    }))
                  }
                  placeholder="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.title.trim() || createQuiz.isPending}
              >
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {quizzes?.length ?? 0} quiz{quizzes?.length !== 1 ? "zes" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : !quizzes?.length ? (
              <EmptyState
                title="No quizzes yet"
                description="Create quizzes for this course."
                icon={<ClipboardList className="h-12 w-12" />}
              />
            ) : (
              <div className="space-y-2">
                {quizzes.map((quiz) => (
                  <QuizRow
                    key={quiz.id}
                    quiz={quiz}
                    onDelete={setConfirmDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function QuizRow({
  quiz,
  onDelete,
}: {
  quiz: Quiz;
  onDelete: (q: Quiz) => void;
}) {
  const { data: questions } = useQuestions(quiz.id);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{quiz.title}</p>
          <Badge variant={quiz.isPublished ? "default" : "outline"}>
            {quiz.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            {questions?.length ?? 0} questions
          </span>
          {quiz.timeLimitMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {quiz.timeLimitMinutes} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {quiz.passPercentage}% pass
          </span>
          <span>{quiz.totalMarks} marks</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(quiz)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
