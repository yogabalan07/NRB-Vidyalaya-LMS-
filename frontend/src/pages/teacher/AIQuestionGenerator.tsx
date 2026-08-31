import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Copy,
  Download,
  CheckCircle,
  FileJson,
} from "lucide-react";

interface PromptForm {
  subject: string;
  topic: string;
  classLevel: string;
  difficulty: string;
  language: string;
  numberOfQuestions: number;
  marksPerQuestion: number;
  negativeMarks: number;
  questionType: string;
}

const defaultForm: PromptForm = {
  subject: "Hindi",
  topic: "Grammar",
  classLevel: "Beginner",
  difficulty: "Medium",
  language: "Hindi",
  numberOfQuestions: 5,
  marksPerQuestion: 1,
  negativeMarks: 0,
  questionType: "MCQ",
};

function buildQuizPrompt(form: PromptForm): string {
  const questionTypeLabel =
    form.questionType === "MCQ"
      ? "multiple-choice"
      : form.questionType === "TRUE_FALSE"
        ? "true/false"
        : form.questionType === "FILL_BLANK"
          ? "fill-in-the-blank"
          : form.questionType;

  const optionsInstruction =
    form.questionType === "MCQ"
      ? `- Every question must have exactly 4 options.
- Options must be A, B, C and D.
- There must be exactly one correct answer.
- The correct answer must be represented as A, B, C or D.`
      : form.questionType === "TRUE_FALSE"
        ? `- Every question must have exactly 2 options: "True" and "False".
- Options must be A (True) and B (False).
- The correct answer must be A or B.`
        : `- Provide the correct answer as plain text.`;

  const jsonStructure =
    form.questionType === "MCQ"
      ? `{
  "title": "${form.subject} ${form.topic} Quiz",
  "subject": "${form.subject}",
  "topic": "${form.topic}",
  "classLevel": "${form.classLevel}",
  "difficulty": "${form.difficulty}",
  "language": "${form.language}",
  "marksPerQuestion": ${form.marksPerQuestion},
  "negativeMarks": ${form.negativeMarks},
  "questionType": "MCQ",
  "questions": [
    {
      "question": "....",
      "options": {
        "A": "....",
        "B": "....",
        "C": "....",
        "D": "...."
      },
      "correctAnswer": "A"
    }
  ]
}`
      : form.questionType === "TRUE_FALSE"
        ? `{
  "title": "${form.subject} ${form.topic} Quiz",
  "subject": "${form.subject}",
  "topic": "${form.topic}",
  "classLevel": "${form.classLevel}",
  "difficulty": "${form.difficulty}",
  "language": "${form.language}",
  "marksPerQuestion": ${form.marksPerQuestion},
  "negativeMarks": ${form.negativeMarks},
  "questionType": "TRUE_FALSE",
  "questions": [
    {
      "question": "....",
      "options": {
        "A": "True",
        "B": "False"
      },
      "correctAnswer": "A"
    }
  ]
}`
        : `{
  "title": "${form.subject} ${form.topic} Quiz",
  "subject": "${form.subject}",
  "topic": "${form.topic}",
  "classLevel": "${form.classLevel}",
  "difficulty": "${form.difficulty}",
  "language": "${form.language}",
  "marksPerQuestion": ${form.marksPerQuestion},
  "negativeMarks": ${form.negativeMarks},
  "questionType": "FILL_BLANK",
  "questions": [
    {
      "question": "....",
      "options": {
        "A": "....",
        "B": "....",
        "C": "....",
        "D": "...."
      },
      "correctAnswer": "A"
    }
  ]
}`;

  return `You are an expert ${form.subject} teacher and educational question paper creator.

Create exactly ${form.numberOfQuestions} ${questionTypeLabel} questions for:

Subject: ${form.subject}
Topic: ${form.topic}
Class Level: ${form.classLevel}
Difficulty: ${form.difficulty}
Language: ${form.language}

Marks per question: ${form.marksPerQuestion}
Negative marks: ${form.negativeMarks}

Requirements:
- Create exactly ${form.numberOfQuestions} questions.
${optionsInstruction}
- Questions must be suitable for the specified class level.
- Questions must be grammatically correct.
- Avoid duplicate questions.
- Do not include explanations outside the JSON.
- Return ONLY valid JSON.
- Do not use markdown code fences.
- Do not include \`\`\`json.
- Do not include any introductory or explanatory text.

Return the JSON using EXACTLY this structure:

${jsonStructure}

The JSON must contain exactly ${form.numberOfQuestions} questions.`;
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function TeacherAIGeneratorPage() {
  const [form, setForm] = useState<PromptForm>(defaultForm);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleGenerate = () => {
    const prompt = buildQuizPrompt(form);
    setGeneratedPrompt(prompt);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (textareaRef.current) {
        textareaRef.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleDownload = () => {
    const filename = `quiz-prompt-${form.subject.toLowerCase()}-${form.topic.toLowerCase().replace(/\s+/g, "-")}.txt`;
    downloadFile(generatedPrompt, filename);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Question Generator</h1>
        <p className="text-muted-foreground">
          Generate a prompt for ChatGPT or any AI tool, then import the
          resulting JSON.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
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
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
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
                    numberOfQuestions: Number(e.target.value) || 5,
                  }))
                }
                min={1}
                max={50}
              />
            </div>
            <div className="space-y-2">
              <Label>Marks per Question</Label>
              <Input
                type="number"
                value={form.marksPerQuestion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    marksPerQuestion: Number(e.target.value) || 1,
                  }))
                }
                min={1}
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
                    negativeMarks: Number(e.target.value) || 0,
                  }))
                }
                min={0}
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
                <option value="MCQ">MCQ (Multiple Choice)</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="FILL_BLANK">Fill in the Blank</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerate}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedPrompt && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                Generated Prompt
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Prompt
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              readOnly
              value={generatedPrompt}
              className="min-h-[400px] font-mono text-xs leading-relaxed"
              onClick={(e: React.MouseEvent<HTMLTextAreaElement>) => (e.target as HTMLTextAreaElement).select()}
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Copy this prompt and paste it into ChatGPT, Claude, Gemini, or
              any AI tool. Then copy the AI's JSON response and import it
              using the{" "}
              <strong>JSON Importer</strong> on the Quizzes page.
            </p>
          </CardContent>
        </Card>
      )}

      {!generatedPrompt && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Ready to Generate</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Fill in the form above and click "Generate Prompt" to create a
                structured prompt for ChatGPT or any AI tool. The AI will
                generate quiz JSON that you can import back into the LMS.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
