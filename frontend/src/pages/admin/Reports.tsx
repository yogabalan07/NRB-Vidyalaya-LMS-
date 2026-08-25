import { useState } from "react";
import { useCourses } from "@/hooks";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  FileText,
} from "lucide-react";

interface ReportData {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalQuizzes: number;
  totalPayments: number;
  totalRevenue: number;
  topCourses: Array<{ title: string; enrollments: number }>;
  recentEnrollments: number;
}

export function AdminReportsPage() {
  const { data: courses } = useCourses();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        { count: totalStudents },
        { count: totalTeachers },
        { count: totalCourses },
        { count: publishedCourses },
        { count: totalEnrollments },
        { count: totalLessons },
        { count: totalQuizzes },
        { count: totalPayments },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "STUDENT"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "TEACHER"),
        supabase
          .from("courses")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("lessons")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("quizzes")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("payments")
          .select("id", { count: "exact", head: true }),
      ]);

      const { data: paidData } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "PAID");

      const totalRevenue = (paidData || []).reduce(
        (sum: number, p: Record<string, unknown>) => sum + ((p.amount as number) || 0),
        0
      );

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const { count: recentEnrollments } = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .gte("enrolled_at", oneWeekAgo.toISOString());

      const topCourses: Array<{ title: string; enrollments: number }> = [];
      if (courses) {
        for (const course of courses.slice(0, 5)) {
          const { count } = await supabase
            .from("enrollments")
            .select("id", { count: "exact", head: true })
            .eq("course_id", course.id);
          topCourses.push({ title: course.title, enrollments: count || 0 });
        }
        topCourses.sort((a, b) => b.enrollments - a.enrollments);
      }

      setReport({
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        totalCourses: totalCourses || 0,
        publishedCourses: publishedCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalLessons: totalLessons || 0,
        totalQuizzes: totalQuizzes || 0,
        totalPayments: totalPayments || 0,
        totalRevenue,
        topCourses,
        recentEnrollments: recentEnrollments || 0,
      });
    } catch {
      setError("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Summary reports for the entire system
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Generate a comprehensive report of system data.
            </p>
            <button
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              onClick={generateReport}
              disabled={loading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalTeachers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {report.publishedCourses} published
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Enrollments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalEnrollments}</div>
                <p className="text-xs text-muted-foreground">
                  {report.recentEnrollments} this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalLessons}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.totalQuizzes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {report.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.totalPayments} payments
                </p>
              </CardContent>
            </Card>
          </div>

          {report.topCourses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Courses by Enrollment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.topCourses.map((c, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{idx + 1}</Badge>
                        <span className="text-sm font-medium">{c.title}</span>
                      </div>
                      <Badge variant="secondary">
                        {c.enrollments} enrollment{c.enrollments !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!report && !loading && (
        <EmptyState
          title="No report generated"
          description="Click 'Generate Report' to view a summary of all system data."
          icon={<BarChart3 className="h-12 w-12" />}
        />
      )}
    </div>
  );
}
