import { useState, useMemo } from "react";
import { useCourses, useResultsForCourse } from "@/hooks";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { Award, TrendingUp, Users } from "lucide-react";
import type { Result } from "@/types/result";

interface ProfileMap {
  [key: string]: string;
}

export function AdminResultsPage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: results, isLoading } = useResultsForCourse(selectedCourse);
  const [profiles, setProfiles] = useState<ProfileMap>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const fetchProfiles = async (userIds: string[]) => {
    const unique = [...new Set(userIds)].filter((id) => !profiles[id]);
    if (!unique.length) return;
    setLoadingProfiles(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", unique);
      if (data) {
        const map: ProfileMap = {};
        data.forEach((p: Record<string, unknown>) => {
          map[p.id as string] = (p.full_name as string) || "Unknown";
        });
        setProfiles((prev) => ({ ...prev, ...map }));
      }
    } catch {
      // ignore
    } finally {
      setLoadingProfiles(false);
    }
  };

  const stats = useMemo(() => {
    if (!results?.length) return { avgPercentage: 0, highest: 0, lowest: 0, count: 0 };
    const percentages = results.map((r) => r.percentage);
    return {
      avgPercentage: Math.round(
        percentages.reduce((a, b) => a + b, 0) / percentages.length
      ),
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      count: results.length,
    };
  }, [results]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Results</h1>
        <p className="text-muted-foreground">View student results per course</p>
      </div>

      <div className="max-w-sm">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Total Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.count}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgPercentage}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.highest}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lowest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {stats.lowest}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Results</CardTitle>
              <button
                className="text-xs text-primary underline"
                onClick={() => fetchProfiles(results?.map((r) => r.userId) || [])}
                disabled={loadingProfiles}
              >
                {loadingProfiles ? "Loading names..." : "Load student names"}
              </button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : !results?.length ? (
                <EmptyState
                  title="No results yet"
                  description="Student results will appear here after quizzes are taken."
                  icon={<Award className="h-12 w-12" />}
                />
              ) : (
                <div className="space-y-2">
                  {results.map((result) => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      profileName={profiles[result.userId]}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function ResultRow({
  result,
  profileName,
}: {
  result: Result;
  profileName?: string;
}) {
  function getGradeVariant(percentage: number) {
    if (percentage >= 80) return "default" as const;
    if (percentage >= 50) return "secondary" as const;
    return "destructive" as const;
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">
          {profileName || result.userId.slice(0, 8) + "..."}
        </p>
        <p className="text-xs text-muted-foreground">
          {result.obtainedMarks}/{result.totalMarks} marks
          {result.grade && ` \u00b7 Grade: ${result.grade}`}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={getGradeVariant(result.percentage)}>
          {result.percentage}%
        </Badge>
      </div>
    </div>
  );
}
