import { useAuth, useCoursesForTeacher, useResultsForCourse, useAttendanceForCourse } from "@/hooks";
import { enrollmentService, profileService } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { TrendingUp } from "lucide-react";

interface StudentPerformanceData {
  userId: string;
  fullName: string;
  email: string;
  courseName: string;
  averageMarks: number;
  totalMarks: number;
  obtainedMarks: number;
  averagePercentage: number;
  attendancePercentage: number;
  quizCount: number;
  grade?: string;
}

export function TeacherPerformancePage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: results } = useResultsForCourse(selectedCourseId);
  const { data: attendanceRecords } = useAttendanceForCourse(selectedCourseId);

  const [performanceData, setPerformanceData] = useState<StudentPerformanceData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPerformance = useCallback(async () => {
    if (!selectedCourseId) {
      setPerformanceData([]);
      return;
    }

    setLoading(true);
    try {
      const enrollments = await enrollmentService.getEnrollmentsForCourse(
        selectedCourseId
      );
      const courseResults = results || [];
      const courseAttendance = attendanceRecords || [];

      const perfMap = new Map<string, StudentPerformanceData>();

      for (const enrollment of enrollments) {
        const profile = await profileService.getProfile(enrollment.userId);
        perfMap.set(enrollment.userId, {
          userId: enrollment.userId,
          fullName: profile?.full_name || "Unknown",
          email: profile?.email || "",
          courseName: "",
          averageMarks: 0,
          totalMarks: 0,
          obtainedMarks: 0,
          averagePercentage: 0,
          attendancePercentage: 0,
          quizCount: 0,
        });
      }

      for (const result of courseResults) {
        const entry = perfMap.get(result.userId);
        if (entry) {
          entry.totalMarks += result.totalMarks;
          entry.obtainedMarks += result.obtainedMarks;
          entry.quizCount += 1;
          entry.grade = result.grade;
        }
      }

      const attendanceByUser = new Map<string, { present: number; total: number }>();
      for (const record of courseAttendance) {
        const current = attendanceByUser.get(record.userId) || {
          present: 0,
          total: 0,
        };
        current.total += 1;
        if (record.status === "PRESENT") current.present += 1;
        attendanceByUser.set(record.userId, current);
      }

      const perfArray: StudentPerformanceData[] = [];
      perfMap.forEach((entry) => {
        entry.averageMarks =
          entry.quizCount > 0
            ? Math.round(entry.obtainedMarks / entry.quizCount)
            : 0;
        entry.averagePercentage =
          entry.totalMarks > 0
            ? Math.round((entry.obtainedMarks / entry.totalMarks) * 100)
            : 0;

        const attData = attendanceByUser.get(entry.userId);
        entry.attendancePercentage =
          attData && attData.total > 0
            ? Math.round((attData.present / attData.total) * 100)
            : 0;

        perfArray.push(entry);
      });

      perfArray.sort((a, b) => b.averagePercentage - a.averagePercentage);
      setPerformanceData(perfArray);
    } catch (err) {
      console.error("Failed to load performance:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, results, attendanceRecords]);

  useEffect(() => {
    loadPerformance();
  }, [loadPerformance]);

  const getPerformanceColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 60) return "text-blue-600";
    if (pct >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (pct: number) => {
    if (pct >= 80) return "default";
    if (pct >= 60) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Performance</h1>
        <p className="text-muted-foreground">Track and analyze student performance</p>
      </div>

      <div className="space-y-2">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to view student performance."
          icon={<TrendingUp className="h-12 w-12" />}
        />
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : performanceData.length === 0 ? (
        <EmptyState
          title="No data available"
          description="No students or results found for this course."
          icon={<TrendingUp className="h-12 w-12" />}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{performanceData.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    performanceData.reduce(
                      (sum, p) => sum + p.averagePercentage,
                      0
                    ) / performanceData.length
                  )}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    performanceData.reduce(
                      (sum, p) => sum + p.attendancePercentage,
                      0
                    ) / performanceData.length
                  )}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {performanceData.map((student, idx) => (
              <Card key={student.userId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-muted-foreground w-8">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-medium">{student.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Quizzes</p>
                        <p className="font-medium">{student.quizCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Marks</p>
                        <p className="font-medium">
                          {student.obtainedMarks}/{student.totalMarks}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Score</p>
                        <p
                          className={`font-bold ${getPerformanceColor(student.averagePercentage)}`}
                        >
                          {student.averagePercentage}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Attendance</p>
                        <p
                          className={`font-medium ${getPerformanceColor(student.attendancePercentage)}`}
                        >
                          {student.attendancePercentage}%
                        </p>
                      </div>
                      <Badge variant={getPerformanceBadge(student.averagePercentage)}>
                        {student.averagePercentage >= 80
                          ? "Excellent"
                          : student.averagePercentage >= 60
                            ? "Good"
                            : student.averagePercentage >= 40
                              ? "Average"
                              : "Needs Work"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
