import { useMemo } from "react";
import {
  CalendarCheck,
  Calendar,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useEnrollments,
  useAttendanceSummary,
  useAttendance,
  useCourseById,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { AttendanceRecord } from "@/types/attendance";

function CourseAttendanceCard({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}) {
  const { data: course } = useCourseById(courseId);
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(
    userId,
    courseId
  );
  const { data: records, isLoading: recordsLoading } = useAttendance(
    userId,
    courseId
  );

  const monthlyData = useMemo(() => {
    const grouped: Record<string, AttendanceRecord[]> = {};
    (records || []).forEach((r) => {
      const date = new Date(r.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, recs]) => {
        const parts = key.split("-");
        const year = parts[0] || "";
        const month = parts[1] || "";
        const monthName = new Date(
          parseInt(year, 10),
          parseInt(month, 10) - 1
        ).toLocaleString("default", { month: "long", year: "numeric" });
        const present = recs.filter((r) => r.status === "PRESENT").length;
        const absent = recs.filter((r) => r.status === "ABSENT").length;
        const leave = recs.filter((r) => r.status === "LEAVE").length;
        const total = recs.length;
        return { monthName, present, absent, leave, total };
      });
  }, [records]);

  if (summaryLoading || recordsLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          {course?.title || "Unknown Course"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Present</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary?.present || 0}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Absent</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary?.absent || 0}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-600">
              <MinusCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Leave</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{summary?.leave || 0}</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-primary">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Percentage</span>
            </div>
            <p className="mt-1 text-2xl font-bold">
              {summary?.percentage || 0}%
            </p>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${summary?.percentage || 0}%` }}
          />
        </div>

        {monthlyData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Monthly Breakdown
            </h4>
            <div className="space-y-2">
              {monthlyData.map((month) => (
                <div
                  key={month.monthName}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{month.monthName}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {month.present}P
                    </Badge>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {month.absent}A
                    </Badge>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                      {month.leave}L
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {month.total} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-16" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StudentAttendancePage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments(
    user?.id || ""
  );
  const { data: allAttendance, isLoading: allLoading } = useAttendance(
    user?.id || ""
  );

  const overallStats = useMemo(() => {
    const records = allAttendance || [];
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const leave = records.filter((r) => r.status === "LEAVE").length;
    const total = records.length;
    return {
      present,
      absent,
      leave,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  }, [allAttendance]);

  const courseIds = useMemo(() => {
    return [...new Set((enrollments || []).map((e) => e.courseId))];
  }, [enrollments]);

  if (enrollmentsLoading || allLoading) {
    return <AttendanceSkeleton />;
  }

  if (courseIds.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No courses enrolled"
          description="Enroll in courses to start tracking your attendance."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">
          Track your attendance across all enrolled courses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-700">Present</p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {overallStats.present}
              </p>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <p className="text-sm font-medium text-red-700">Absent</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {overallStats.absent}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center">
              <p className="text-sm font-medium text-yellow-700">Leave</p>
              <p className="mt-1 text-3xl font-bold text-yellow-600">
                {overallStats.leave}
              </p>
            </div>
            <div className="rounded-lg bg-primary/10 p-4 text-center">
              <p className="text-sm font-medium text-primary">
                Attendance Rate
              </p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {overallStats.percentage}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {courseIds.map((courseId) => (
          <CourseAttendanceCard
            key={courseId}
            userId={user?.id || ""}
            courseId={courseId}
          />
        ))}
      </div>
    </div>
  );
}
