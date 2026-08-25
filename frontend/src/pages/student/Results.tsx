import { useState, useMemo } from "react";
import {
  Trophy,
  TrendingUp,
  ClipboardCheck,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useResults, useCourses } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";

function getGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function getGradeColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-blue-600";
  if (percentage >= 40) return "text-yellow-600";
  return "text-red-600";
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export function StudentResultsPage() {
  const { user } = useAuth();
  const { data: results, isLoading: resultsLoading } = useResults(
    user?.id || ""
  );
  const { data: courses } = useCourses();
  const [sortField, setSortField] = useState<"createdAt" | "percentage">(
    "createdAt"
  );
  const [sortAsc, setSortAsc] = useState(false);

  const courseMap = useMemo(() => {
    const map = new Map<string, string>();
    (courses || []).forEach((c) => map.set(c.id, c.title));
    return map;
  }, [courses]);

  const sortedResults = useMemo(() => {
    const list = [...(results || [])];
    list.sort((a, b) => {
      const valA = sortField === "createdAt"
        ? new Date(a.createdAt).getTime()
        : a.percentage;
      const valB = sortField === "createdAt"
        ? new Date(b.createdAt).getTime()
        : b.percentage;
      return sortAsc ? valA - valB : valB - valA;
    });
    return list;
  }, [results, sortField, sortAsc]);

  const stats = useMemo(() => {
    const list = results || [];
    if (list.length === 0)
      return { avgPercentage: 0, total: 0, avgMarks: 0, highest: 0 };
    const totalPerc = list.reduce((sum, r) => sum + r.percentage, 0);
    const totalObtained = list.reduce((sum, r) => sum + r.obtainedMarks, 0);
    const totalAll = list.reduce((sum, r) => sum + r.totalMarks, 0);
    return {
      avgPercentage: Math.round(totalPerc / list.length),
      total: list.length,
      avgMarks: totalAll > 0 ? Math.round((totalObtained / totalAll) * 100) : 0,
      highest: Math.max(...list.map((r) => r.percentage)),
    };
  }, [results]);

  const toggleSort = (field: "createdAt" | "percentage") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (resultsLoading) {
    return <ResultsSkeleton />;
  }

  const resultsList = results || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Results</h1>
        <p className="text-muted-foreground">
          Track your quiz and exam performance
        </p>
      </div>

      {resultsList.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-12 w-12" />}
          title="No results yet"
          description="Complete quizzes and exams to see your results here."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Score
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.avgPercentage}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Quizzes
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <ClipboardCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Highest Score
                    </p>
                    <p className="text-2xl font-bold">{stats.highest}%</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Overall Marks
                    </p>
                    <p className="text-2xl font-bold">{stats.avgMarks}%</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Course
                      </th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Total Marks
                      </th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Obtained
                      </th>
                      <th
                        className="pb-3 text-left font-medium text-muted-foreground cursor-pointer select-none"
                        onClick={() => toggleSort("percentage")}
                      >
                        <span className="flex items-center gap-1">
                          Percentage
                          {sortField === "percentage" ? (
                            sortAsc ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </span>
                      </th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">
                        Grade
                      </th>
                      <th
                        className="pb-3 text-left font-medium text-muted-foreground cursor-pointer select-none"
                        onClick={() => toggleSort("createdAt")}
                      >
                        <span className="flex items-center gap-1">
                          Date
                          {sortField === "createdAt" ? (
                            sortAsc ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedResults.map((result) => {
                      const grade = result.grade || getGrade(result.percentage);
                      return (
                        <tr key={result.id} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">
                            {courseMap.get(result.courseId) || "Unknown Course"}
                          </td>
                          <td className="py-3 pr-4">{result.totalMarks}</td>
                          <td className="py-3 pr-4">{result.obtainedMarks}</td>
                          <td className="py-3 pr-4">
                            <span
                              className={`font-semibold ${getGradeColor(result.percentage)}`}
                            >
                              {result.percentage}%
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={
                                result.percentage >= 50 ? "default" : "destructive"
                              }
                            >
                              {grade}
                            </Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatDate(result.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
