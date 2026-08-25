import { useState } from "react";
import {
  useQuestionBank,
  useCreateQuestionBankQuestion,
  useDeleteQuestionBankQuestion,
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
  Filter,
  HelpCircle,
  X,
} from "lucide-react";
import type { QuestionBankItem, QuestionOption } from "@/types/question";

interface QuestionFormData {
  question: string;
  options: QuestionOption[];
  correct_option: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  language: string;
  marks: number;
  tags: string[];
}

const defaultForm: QuestionFormData = {
  question: "",
  options: [
    { id: "a", text: "" },
    { id: "b", text: "" },
    { id: "c", text: "" },
    { id: "d", text: "" },
  ],
  correct_option: "a",
  explanation: "",
  subject: "",
  topic: "",
  difficulty: "medium",
  language: "Hindi",
  marks: 1,
  tags: [],
};

export function AdminQuestionBankPage() {
  const [filters, setFilters] = useState<{
    subject?: string;
    topic?: string;
    difficulty?: string;
  }>({});
  const { data: questions, isLoading } = useQuestionBank(filters);
  const createQuestion = useCreateQuestionBankQuestion();
  const deleteQuestion = useDeleteQuestionBankQuestion();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QuestionFormData>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<QuestionBankItem | null>(null);
  const [searchSubject, setSearchSubject] = useState("");
  const [searchTopic, setSearchTopic] = useState("");

  const resetForm = () => {
    setForm(defaultForm);
    setShowForm(false);
  };

  const handleOptionChange = (idx: number, value: string) => {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => (i === idx ? { ...o, text: value } : o)),
    }));
  };

  const handleSubmit = () => {
    if (!form.question.trim()) return;
    createQuestion.mutate(
      {
        question: form.question,
        options: form.options.filter((o) => o.text.trim()),
        correct_option: form.correct_option,
        explanation: form.explanation || undefined,
        subject: form.subject || undefined,
        topic: form.topic || undefined,
        difficulty: form.difficulty || undefined,
        language: form.language || undefined,
        marks: form.marks || undefined,
        tags: form.tags.length ? form.tags : undefined,
      },
      { onSuccess: resetForm }
    );
  };

  const handleApplyFilters = () => {
    setFilters({
      subject: searchSubject || undefined,
      topic: searchTopic || undefined,
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteQuestion.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  function getDifficultyVariant(d?: string) {
    if (d === "hard") return "destructive" as const;
    if (d === "easy") return "secondary" as const;
    return "default" as const;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Question Bank</h1>
          <p className="text-muted-foreground">
            Manage reusable questions across quizzes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <Label>Subject</Label>
          <Input
            placeholder="e.g. Hindi Grammar"
            value={searchSubject}
            onChange={(e) => setSearchSubject(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1">
          <Label>Topic</Label>
          <Input
            placeholder="e.g. Nouns"
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchSubject("");
              setSearchTopic("");
              setFilters({});
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Add Question</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question *</Label>
                <textarea
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                  placeholder="Enter the question"
                />
              </div>

              <div className="space-y-2">
                <Label>Options</Label>
                <div className="grid gap-2">
                  {form.options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={form.correct_option === opt.id}
                        onChange={() =>
                          setForm((f) => ({ ...f, correct_option: opt.id }))
                        }
                        className="h-4 w-4"
                      />
                      <span className="text-xs font-mono w-4">{opt.id.toUpperCase()}.</span>
                      <Input
                        value={opt.text}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${opt.id.toUpperCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Explanation</Label>
                <Input
                  value={form.explanation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, explanation: e.target.value }))
                  }
                  placeholder="Why is this the correct answer?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    placeholder="e.g. Hindi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Topic</Label>
                  <Input
                    value={form.topic}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, topic: e.target.value }))
                    }
                    placeholder="e.g. Grammar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficulty: e.target.value }))
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={form.marks || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, marks: Number(e.target.value) }))
                    }
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !form.question.trim() ||
                    !form.options.some((o) => o.text.trim()) ||
                    createQuestion.isPending
                  }
                >
                  Add Question
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {questions?.length ?? 0} question{(questions?.length ?? 0) !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !questions?.length ? (
            <EmptyState
              title="No questions yet"
              description="Add questions to the bank."
              icon={<HelpCircle className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{q.question}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.options.map((opt) => (
                          <Badge
                            key={opt.id}
                            variant={
                              opt.id === q.correctOption
                                ? "default"
                                : "outline"
                            }
                            className="text-xs"
                          >
                            {opt.id.toUpperCase()}: {opt.text}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {q.subject && <Badge variant="secondary">{q.subject}</Badge>}
                        {q.topic && <Badge variant="outline">{q.topic}</Badge>}
                        {q.difficulty && (
                          <Badge variant={getDifficultyVariant(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        )}
                        <span>{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(q)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question from the bank?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
