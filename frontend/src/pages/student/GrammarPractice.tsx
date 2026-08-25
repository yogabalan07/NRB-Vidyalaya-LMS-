import { useState } from "react";
import {
  CheckCircle,
  AlertTriangle,
  PenLine,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCorrectWriting } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { AICorrection } from "@/types/ai";

export function StudentGrammarPracticePage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<AICorrection | null>(null);
  const correctWriting = useCorrectWriting();

  const handleCheck = async () => {
    const text = inputText.trim();
    if (!text || correctWriting.isPending) return;
    try {
      const res = await correctWriting.mutateAsync(text);
      setResult(res);
    } catch {
      setResult(null);
    }
  };

  const handleClear = () => {
    setInputText("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grammar Practice</h1>
        <p className="text-muted-foreground">
          Write Hindi text and get instant AI-powered grammar corrections.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenLine className="h-5 w-5 text-primary" />
            Enter Hindi Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hindi-text">Your text</Label>
            <textarea
              id="hindi-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="यहाँ अपना हिंदी पाठ लिखें..."
              rows={6}
              disabled={correctWriting.isPending}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCheck}
              disabled={!inputText.trim() || correctWriting.isPending}
            >
              {correctWriting.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Check Grammar
            </Button>
            <Button variant="ghost" onClick={handleClear} disabled={correctWriting.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {correctWriting.isPending && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      )}

      {correctWriting.isError && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">
              Failed to check grammar. Please try again.
            </p>
          </CardContent>
        </Card>
      )}

      {result && !correctWriting.isPending && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Corrected Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-green-50 p-4 dark:bg-green-950/30">
                <p className="text-sm leading-relaxed">{result.improvedVersion}</p>
              </div>
            </CardContent>
          </Card>

          {result.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Errors Found ({result.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.errors.map((err, i) => (
                    <div
                      key={i}
                      className="rounded-md border p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                          {err.category}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-destructive line-through">
                              {err.original}
                            </span>
                            <span className="text-muted-foreground">&rarr;</span>
                            <span className="font-medium text-green-600">
                              {err.corrected}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {err.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.errors.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                <p className="font-medium text-green-700 dark:text-green-300">
                  Excellent! No grammar errors found.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
