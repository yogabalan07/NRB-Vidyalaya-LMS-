import { useState } from "react";
import { useGenerateQuestions, useCreateQuestionBankQuestion } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  CheckCircle2,
  Pencil,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

interface GeneratedQuestion {
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOption: string;
  explanation: string;
  marks: number;
}

interface GeneratorForm {
  subject: string;
  topic: string;
  classLevel: string;
  difficulty: string;
  language: string;
  numberOfQuestions: number;
  marks: number;
  negativeMarks: number;
  questionType: string;
}

const defaultForm: GeneratorForm = {
  subject: "Hindi",
  topic: "Grammar",
  classLevel: "Beginner",
  difficulty: "medium",
  language: "Hindi",
  numberOfQuestions: 5,
  marks: 1,
  negativeMarks: 0,
  questionType: "MCQ",
};

export function AdminAIGeneratorPage() {
  const generateQuestions = useGenerateQuestions();
  const saveQuestion = useCreateQuestionBankQuestion();

  const [form, setForm] = useState<GeneratorForm>(defaultForm);
  const [generated, setGenerated] = useState<GeneratedQuestion[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<GeneratedQuestion | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const handleGenerate = () => {
    generateQuestions.mutate(form, {
      onSuccess: (data) => {
        setGenerated(data.questions);
        setSavedIds(new Set());
      },
    });
  };

  const handleEdit = (idx: number) => {
    const q = generated[idx];
    if (!q) return;
    setEditingIdx(idx);
    setEditForm({
      question: q.question,
      options: [...q.options.map((o) => ({ ...o }))],
      correctOption: q.correctOption,
      explanation: q.explanation,
      marks: q.marks,
    });
  };

  const handleSaveEdit = () => {
    if (editingIdx === null || !editForm) return;
    setGenerated((prev) =>
      prev.map((q, i) => (i === editingIdx ? editForm : q))
    );
    setEditingIdx(null);
    setEditForm(null);
  };

  const handleRemove = (idx: number) => {
    setGenerated((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveToBank = (q: GeneratedQuestion, idx: number) => {
    saveQuestion.mutate(
      {
        question: q.question,
        options: q.options,
        correct_option: q.correctOption,
        explanation: q.explanation,
        subject: form.subject || undefined,
        topic: form.topic || undefined,
        difficulty: form.difficulty || undefined,
        language: form.language || undefined,
        marks: q.marks || undefined,
      },
      {
        onSuccess: () => {
          setSavedIds((prev) => new Set(prev).add(idx));
        },
      }
    );
  };

  const handleSaveAll = () => {
    generated.forEach((q, idx) => {
      if (!savedIds.has(idx)) {
        handleSaveToBank(q, idx);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Question Generator</h1>
        <p className="text-muted-foreground">
          Generate quiz questions using AI and save them to the question bank
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generation Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="Hindi"
              />
            </div>
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="Grammar"
              />
            </div>
            <div className="space-y-2">
              <Label>Class Level</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.classLevel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, classLevel: e.target.value }))
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
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
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm((f) => ({ ...f, language: e.target.value }))
                }
                placeholder="Hindi"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                value={form.numberOfQuestions}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    numberOfQuestions: Number(e.target.value),
                  }))
                }
                min={1}
                max={20}
              />
            </div>
            <div className="space-y-2">
              <Label>Marks per Question</Label>
              <Input
                type="number"
                value={form.marks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, marks: Number(e.target.value) }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Negative Marks</Label>
              <Input
                type="number"
                value={form.negativeMarks}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    negativeMarks: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.questionType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, questionType: e.target.value }))
                }
              >
                <option value="MCQ">MCQ</option>
                <option value="TRUE_FALSE">True/False</option>
                <option value="FILL_BLANK">Fill in the Blank</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleGenerate}
              disabled={generateQuestions.isPending}
            >
              {generateQuestions.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {generateQuestions.isPending
                ? "Generating..."
                : "Generate Questions"}
            </Button>
          </div>
          {generateQuestions.isError && (
            <p className="text-sm text-destructive mt-2">
              {generateQuestions.error instanceof Error
                ? generateQuestions.error.message
                : "Failed to generate questions"}
            </p>
          )}
        </CardContent>
      </Card>

      {generated.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Generated Questions ({generated.length})
            </CardTitle>
            <Button onClick={handleSaveAll} variant="saffron">
              <Save className="h-4 w-4 mr-2" />
              Save All to Bank
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generated.map((q, idx) => (
                <div key={idx} className="rounded-lg border p-4">
                  {editingIdx === idx && editForm ? (
                    <div className="space-y-3">
                      <textarea
                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editForm.question}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, question: e.target.value } : null
                          )
                        }
                      />
                      <div className="grid gap-2">
                        {editForm.options.map((opt, optIdx) => (
                          <div key={opt.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`edit-correct-${idx}`}
                              checked={editForm.correctOption === opt.id}
                              onChange={() =>
                                setEditForm((f) =>
                                  f ? { ...f, correctOption: opt.id } : null
                                )
                              }
                            />
                            <Input
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = editForm.options.map((o, i) =>
                                  i === optIdx ? { ...o, text: e.target.value } : o
                                );
                                setEditForm((f) =>
                                  f ? { ...f, options: newOpts } : null
                                );
                              }}
                              placeholder={`Option ${opt.id.toUpperCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                      <Input
                        value={editForm.explanation}
                        onChange={(e) =>
                          setEditForm((f) =>
                            f ? { ...f, explanation: e.target.value } : null
                          )
                        }
                        placeholder="Explanation"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingIdx(null);
                            setEditForm(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            {idx + 1}. {q.question}
                          </p>
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
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mt-2">
                              {q.explanation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {savedIds.has(idx) ? (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Saved
                            </Badge>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(idx)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(idx)}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveToBank(q, idx)}
                                disabled={saveQuestion.isPending}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
