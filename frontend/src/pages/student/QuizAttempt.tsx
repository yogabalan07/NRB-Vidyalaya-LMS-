import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trophy,
  RotateCcw,
  Home,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useQuiz,
  useQuestions,
  useStartQuizAttempt,
  useSubmitQuizAttempt,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/common/Loader";
import { ErrorState } from "@/components/common/ErrorState";
import { FadeIn, AnimatedSuccess, AnimatedStars } from "@/components/animations";
import type { Question } from "@/types/question";
import type { QuizAnswer } from "@/types/quiz";

const NEGATIVE_MARKS = 0.25;
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface QuizResult {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  answers: Array<{
    questionId: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
    marks: number;
  }>;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function QuestionNavSidebar({
  questions,
  answers,
  currentIndex,
  onSelect,
}: {
  questions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
        Questions ({Object.keys(answers).length}/{questions.length})
      </h3>
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const isAnswered = !!answers[q.id];
          const isActive = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => onSelect(i)}
              className={`h-9 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : isAnswered
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResultSummary({
  result,
  quizTitle,
  onRetry,
  onBackToQuizzes,
}: {
  result: QuizResult;
  quizTitle: string;
  onRetry?: () => void;
  onBackToQuizzes: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <FadeIn direction="up" duration="slow">
        <div className="text-center space-y-2 relative">
          {result.passed && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <AnimatedStars count={8} />
            </div>
          )}
          {result.passed ? (
            <AnimatedSuccess size={80} className="mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
          )}
          <h2 className="text-2xl font-bold">
            {result.passed ? "Congratulations!" : "Better Luck Next Time!"}
          </h2>
          <p className="text-muted-foreground">{quizTitle}</p>
        </div>
      </FadeIn>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">{result.score}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Score ({result.totalMarks} total)
              </p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">
                {result.percentage}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Percentage</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-500">
                {result.correctCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Correct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-destructive">
                {result.wrongCount}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Wrong</p>
            </div>
          </div>
          {result.skippedCount > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {result.skippedCount} question(s) skipped
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.answers.map((ans, i) => (
            <div
              key={ans.questionId}
              className={`p-3 rounded-lg border transition-all ${
                ans.isCorrect
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                  : ans.selectedOption
                    ? "border-destructive/30 bg-destructive/5"
                    : "border-muted bg-muted/30"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">Q{i + 1}</p>
                {ans.isCorrect ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                    +{ans.marks}
                  </Badge>
                ) : ans.selectedOption ? (
                  <Badge variant="destructive">
                    -{NEGATIVE_MARKS}
                  </Badge>
                ) : (
                  <Badge variant="secondary">Skipped</Badge>
                )}
              </div>
              {!ans.isCorrect && ans.selectedOption && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your answer: {ans.selectedOption} &middot; Correct:{" "}
                  {ans.correctOption}
                </p>
              )}
              {!ans.selectedOption && (
                <p className="text-xs text-muted-foreground mt-1">
                  Correct answer: {ans.correctOption}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retry Quiz
          </Button>
        )}
        <Button onClick={onBackToQuizzes}>
          <Home className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
}

export function StudentQuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: quiz,
    isLoading: quizLoading,
    error: quizError,
  } = useQuiz(quizId ?? "");

  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useQuestions(quizId ?? "");

  const startAttempt = useStartQuizAttempt();
  const submitAttempt = useSubmitQuizAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const sortedQuestions = useMemo(() => {
    if (!questions) return [];
    return [...questions].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
  }, [questions]);

  const currentQuestion: Question | undefined = sortedQuestions[currentIndex];

  const answeredCount = Object.keys(answers).length;
  useEffect(() => {
    if (quiz && quiz.timeLimitMinutes) {
      setTimeLeft(quiz.timeLimitMinutes * 60);
    } else {
      setTimeLeft(0);
    }
  }, [quiz]);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !sortedQuestions.length || !attemptId || !user) return;

    let score = 0;
    let totalMarks = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const detailedAnswers: QuizResult["answers"] = sortedQuestions.map((q) => {
      const selected = answers[q.id] || "";
      const isCorrect = selected === q.correctOption;
      totalMarks += q.marks;

      let marks = 0;
      if (selected) {
        if (isCorrect) {
          marks = q.marks;
          correctCount++;
        } else {
          marks = -NEGATIVE_MARKS;
          wrongCount++;
        }
      } else {
        skippedCount++;
      }
      score += marks;

      return {
        questionId: q.id,
        selectedOption: selected,
        correctOption: q.correctOption,
        isCorrect,
        marks,
      };
    });

    const finalScore = Math.max(0, score);
    const percentage =
      totalMarks > 0 ? Math.round((finalScore / totalMarks) * 100) : 0;

    const submissionAnswers: QuizAnswer[] = sortedQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] || "",
    }));

    try {
      await submitAttempt.mutateAsync({
        id: attemptId,
        answers: submissionAnswers,
        score: finalScore,
        totalMarks,
        percentage,
      });

      setResult({
        score: finalScore,
        totalMarks,
        percentage,
        passed: percentage >= (quiz.passPercentage ?? 50),
        answers: detailedAnswers,
        correctCount,
        wrongCount,
        skippedCount,
      });
      setQuizFinished(true);
    } catch {
      // Submission failed - will show error state on next render if needed
    }
  }, [
    quiz,
    sortedQuestions,
    answers,
    attemptId,
    user,
    submitAttempt,
  ]);

  useEffect(() => {
    if (!timerStarted || timeLeft <= 0 || quizFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, timeLeft, quizFinished, handleSubmit]);

  useEffect(() => {
    if (!quiz || !user || attemptId) return;

    startAttempt.mutateAsync(
      { quizId: quiz.id, userId: user.id },
      {
        onSuccess: (data) => {
          setAttemptId(data.id);
          setTimerStarted(true);
        },
      }
    );
  }, [quiz, user, attemptId, startAttempt]);

  const selectAnswer = (questionId: string, optionText: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleNext = () => {
    if (currentIndex < sortedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    navigate(0);
  };

  const handleBackToQuizzes = () => {
    navigate("/student/quizzes");
  };

  if (quizLoading || questionsLoading) {
    return <PageLoader />;
  }

  if (quizError || questionsError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToQuizzes}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <ErrorState
          title="Failed to load quiz"
          message="The quiz could not be loaded. Please try again."
          onRetry={() => navigate(0)}
        />
      </div>
    );
  }

  if (!quiz || !sortedQuestions.length) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToQuizzes}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <ErrorState
          title="Quiz not found"
          message="This quiz may have been removed or is not available."
        />
      </div>
    );
  }

  if (startAttempt.isError) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToQuizzes}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Quizzes
        </Button>
        <ErrorState
          title="Could not start quiz"
          message="Failed to start the quiz attempt. Please try again."
          onRetry={() => navigate(0)}
        />
      </div>
    );
  }

  if (quizFinished && result) {
    return (
      <div className="space-y-6">
        <ResultSummary
          result={result}
          quizTitle={quiz.title}
          onRetry={handleRetry}
          onBackToQuizzes={handleBackToQuizzes}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToQuizzes}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentIndex + 1} of {sortedQuestions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {quiz.timeLimitMinutes && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm font-semibold ${
                timeLeft <= 60
                  ? "bg-destructive/10 text-destructive animate-pulse"
                  : "bg-muted"
              }`}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
          <Badge variant="secondary">
            {answeredCount}/{sortedQuestions.length} answered
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
        <div className="space-y-4">
          {currentQuestion && (
            <Card key={currentQuestion.id} className="animate-fade-in-up duration-300">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-lg leading-relaxed">
                    {currentQuestion.question}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">
                      {currentQuestion.marks} mark
                      {currentQuestion.marks !== 1 ? "s" : ""}
                    </Badge>
                    {currentQuestion.difficulty && (
                      <Badge
                        variant={
                          currentQuestion.difficulty === "hard"
                            ? "destructive"
                            : currentQuestion.difficulty === "medium"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {currentQuestion.difficulty}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected =
                    answers[currentQuestion.id] === option.text;
                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        selectAnswer(currentQuestion.id, option.text)
                      }
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {OPTION_LABELS[optIdx]}
                      </span>
                      <span className="text-sm">{option.text}</span>
                      {isSelected && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentIndex < sortedQuestions.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="saffron"
                  onClick={() => setShowConfirmSubmit(true)}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <QuestionNavSidebar
                questions={sortedQuestions}
                answers={answers}
                currentIndex={currentIndex}
                onSelect={setCurrentIndex}
              />
              {answeredCount < sortedQuestions.length && (
                <p className="text-xs text-muted-foreground mt-3">
                  {sortedQuestions.length - answeredCount} question(s) remaining
                </p>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="lg:hidden">
        <Card>
          <CardContent className="p-4">
            <QuestionNavSidebar
              questions={sortedQuestions}
              answers={answers}
              currentIndex={currentIndex}
              onSelect={setCurrentIndex}
            />
          </CardContent>
        </Card>
      </div>

      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Submit Quiz?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You have answered {answeredCount} out of {sortedQuestions.length}{" "}
                questions.
                {answeredCount < sortedQuestions.length && (
                  <span className="block mt-1 text-amber-600 font-medium">
                    {sortedQuestions.length - answeredCount} question(s) are
                    unanswered.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmSubmit(false)}
                >
                  Go Back
                </Button>
                <Button
                  variant="saffron"
                  onClick={handleSubmit}
                  disabled={submitAttempt.isPending}
                >
                  {submitAttempt.isPending ? "Submitting..." : "Confirm Submit"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
