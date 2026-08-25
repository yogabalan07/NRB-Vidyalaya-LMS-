import { useAuth, useCoursesForTeacher, useGenerateQuestions } from "@/hooks";
import { questionBankService } from "@/services";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/common/Loader";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";

interface GeneratedQuestion {
  question: string;
  options: Array<{ id: string; text: string }>;
  correctOption: string;
  explanation: string;
  marks: number;
}

export function TeacherAIGeneratorPage() {
  const { user } = useAuth();
  useCoursesForTeacher(user?.id || "");
  const generateQuestions = useGenerateQuestions();

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [language, setLanguage] = useState("Hindi");
  const [numberOfQuestions, setNumberOfQuestions] = useState("5");
  const [marks, setMarks] = useState("1");
  const [questionType, setQuestionType] = useState("MCQ");

  const [generated, setGenerated] = useState<GeneratedQuestion[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingAll, setSavingAll] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await generateQuestions.mutateAsync({
        subject,
        topic,
        classLevel,
        difficulty,
        language,
        numberOfQuestions: parseInt(numberOfQuestions) || 5,
        marks: parseInt(marks) || 1,
        negativeMarks: 0,
        questionType,
      });
      setGenerated(result.questions || []);
      setSavedIds(new Set());
    } catch (err) {
      console.error("Failed to generate questions:", err);
    }
  };

  const handleSaveToBank = async (question: GeneratedQuestion, index: number) => {
    try {
      await questionBankService.createQuestion({
        question: question.question,
        options: question.options,
        correct_option: question.correctOption,
        explanation: question.explanation,
        subject,
        topic,
        difficulty,
        language,
        marks: question.marks,
      });
      setSavedIds((prev) => new Set([...prev, index]));
    } catch (err) {
      console.error("Failed to save question:", err);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      const questionsToSave = generated
        .map((q) => ({
          question: q.question,
          options: q.options,
          correct_option: q.correctOption,
          explanation: q.explanation,
          subject,
          topic,
          difficulty,
          language,
          marks: q.marks,
          tags: [],
        }))
        .filter((_, idx) => !savedIds.has(idx));

      if (questionsToSave.length > 0) {
        await questionBankService.createQuestions(questionsToSave);
        setSavedIds(new Set(generated.map((_, idx) => idx)));
      }
    } catch (err) {
      console.error("Failed to save questions:", err);
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Question Generator</h1>
        <p className="text-muted-foreground">
          Generate questions using AI for your quizzes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Generate Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Hindi Grammar"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Tenses, Vocabulary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classLevel">Class Level</Label>
                <Input
                  id="classLevel"
                  value={classLevel}
                  onChange={(e) => setClassLevel(e.target.value)}
                  placeholder="e.g. Class 10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numQuestions">Number of Questions</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="50"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marks">Marks per Question</Label>
                <Input
                  id="marks"
                  type="number"
                  min="1"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <select
                  id="questionType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value)}
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={generateQuestions.isPending || !subject || !topic}
              >
                {generateQuestions.isPending ? (
                  <>
                    <Loader />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {generateQuestions.isError && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Failed to generate questions. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {generated.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Generated Questions ({generated.length})
              </CardTitle>
              <Button
                onClick={handleSaveAll}
                disabled={savingAll || savedIds.size === generated.length}
              >
                <Save className="mr-2 h-4 w-4" />
                {savingAll
                  ? "Saving..."
                  : savedIds.size === generated.length
                    ? "All Saved"
                    : "Save All to Bank"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generated.map((q, idx) => (
              <div key={idx} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {idx + 1}. {q.question}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={
                            opt.id === q.correctOption
                              ? "font-medium text-green-600"
                              : ""
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
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    {savedIds.has(idx) ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Saved
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveToBank(q, idx)}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {generated.length === 0 && !generateQuestions.isPending && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fill in the form above and click "Generate Questions" to create
                AI-powered quiz questions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
