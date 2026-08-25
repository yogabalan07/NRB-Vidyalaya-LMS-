import { useAuth, useQuestionBank, useCreateQuestionBankQuestion, useDeleteQuestionBankQuestion } from "@/hooks";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Plus, Trash2, Database } from "lucide-react";
import type { QuestionBankItem, QuestionOption } from "@/types/question";

interface QuestionFormData {
  question: string;
  options: [string, string, string, string];
  correctOption: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  language: string;
  marks: string;
}

const emptyForm: QuestionFormData = {
  question: "",
  options: ["", "", "", ""],
  correctOption: "a",
  explanation: "",
  subject: "",
  topic: "",
  difficulty: "medium",
  language: "Hindi",
  marks: "1",
};

export function TeacherQuestionBankPage() {
  useAuth();
  const [filters, setFilters] = useState<{
    subject?: string;
    topic?: string;
    difficulty?: string;
    language?: string;
  }>({});
  const { data: questions, isLoading } = useQuestionBank(filters);
  const createQuestion = useCreateQuestionBankQuestion();
  const deleteQuestion = useDeleteQuestionBankQuestion();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<QuestionBankItem | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const optionIds = ["a", "b", "c", "d"];
    const options: QuestionOption[] = formData.options
      .filter((opt) => opt.trim())
      .map((text, idx) => ({ id: optionIds[idx] || `opt_${idx}`, text }));

    try {
      await createQuestion.mutateAsync({
        question: formData.question,
        options,
        correct_option: formData.correctOption,
        explanation: formData.explanation || undefined,
        subject: formData.subject || undefined,
        topic: formData.topic || undefined,
        difficulty: formData.difficulty,
        language: formData.language,
        marks: formData.marks ? parseInt(formData.marks) : 1,
      });
      setShowForm(false);
      setFormData(emptyForm);
    } catch (err) {
      console.error("Failed to create question:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteQuestion.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case "easy":
        return "default";
      case "hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">Manage your question bank for quizzes</p>
        </div>
        <Button onClick={() => { setShowForm(true); setFormData(emptyForm); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input
            placeholder="e.g. Hindi Grammar"
            value={filters.subject || ""}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value || undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Topic</Label>
          <Input
            placeholder="e.g. Tenses"
            value={filters.topic || ""}
            onChange={(e) =>
              setFilters({ ...filters, topic: e.target.value || undefined })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Difficulty</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filters.difficulty || ""}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value || undefined })
            }
          >
            <option value="">All</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Input
            placeholder="e.g. Hindi"
            value={filters.language || ""}
            onChange={(e) =>
              setFilters({ ...filters, language: e.target.value || undefined })
            }
          />
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Question to Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <textarea
                  id="question"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Options</Label>
                {["a", "b", "c", "d"].map((letter, idx) => (
                  <div key={letter} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOption === letter}
                      onChange={() =>
                        setFormData({ ...formData, correctOption: letter })
                      }
                    />
                    <span className="w-6 text-sm font-medium uppercase">
                      {letter}.
                    </span>
                    <Input
                      placeholder={`Option ${letter}`}
                      value={formData.options[idx]}
                      onChange={(e) => {
                        const newOptions = [...formData.options] as [
                          string,
                          string,
                          string,
                          string,
                        ];
                        newOptions[idx] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <textarea
                  id="explanation"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={formData.topic}
                    onChange={(e) =>
                      setFormData({ ...formData, topic: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    min="1"
                    value={formData.marks}
                    onChange={(e) =>
                      setFormData({ ...formData, marks: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createQuestion.isPending}>
                  {createQuestion.isPending ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : !questions || questions.length === 0 ? (
        <EmptyState
          title="No questions in the bank"
          description="Add questions to build your question bank."
          icon={<Database className="h-12 w-12" />}
        >
          <Button onClick={() => { setShowForm(true); setFormData(emptyForm); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? "s" : ""} in bank
          </p>
          {questions.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={
                            opt.id === q.correctOption ? "font-medium text-green-600" : ""
                          }
                        >
                          {opt.id.toUpperCase()}. {opt.text}
                          {opt.id === q.correctOption && " ✓"}
                        </div>
                      ))}
                    </div>
                    {q.explanation && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Explanation: {q.explanation}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {q.subject && <Badge variant="outline">{q.subject}</Badge>}
                      {q.topic && <Badge variant="outline">{q.topic}</Badge>}
                      {q.difficulty && (
                        <Badge variant={getDifficultyColor(q.difficulty)}>
                          {q.difficulty}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {q.marks} mark{q.marks !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteTarget(q)}
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
        title="Delete Question"
        message="Are you sure you want to delete this question from the bank?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
