import { useAuth, useCoursesForTeacher, useAttendanceForCourse, useMarkAttendance } from "@/hooks";
import { enrollmentService, profileService } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface StudentAttendance {
  userId: string;
  fullName: string;
  email: string;
  status: "PRESENT" | "ABSENT" | "LEAVE" | null;
  existingRecordId?: string;
}

export function TeacherAttendancePage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: attendanceRecords, isLoading: attendanceLoading } =
    useAttendanceForCourse(selectedCourseId);
  const markAttendance = useMarkAttendance();

  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loadingStudents, setLoadingStudents] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoadingStudents(true);
    try {
      const enrollments = await enrollmentService.getEnrollmentsForCourse(
        selectedCourseId
      );
      const studentList: StudentAttendance[] = [];

      for (const enrollment of enrollments) {
        const profile = await profileService.getProfile(enrollment.userId);
        const existingRecord = attendanceRecords?.find(
          (r) =>
            r.userId === enrollment.userId && r.date === selectedDate
        );

        studentList.push({
          userId: enrollment.userId,
          fullName: profile?.full_name || "Unknown",
          email: profile?.email || "",
          status: existingRecord?.status || null,
          existingRecordId: existingRecord?.id,
        });
      }

      setStudents(studentList);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoadingStudents(false);
    }
  }, [selectedCourseId, attendanceRecords, selectedDate]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleStatusChange = (userId: string, status: "PRESENT" | "ABSENT" | "LEAVE") => {
    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status } : s))
    );
  };

  const handleSave = async () => {
    if (!selectedCourseId || !user?.id) return;

    const records = students
      .filter((s) => s.status !== null)
      .map((s) => ({
        user_id: s.userId,
        course_id: selectedCourseId,
        date: selectedDate!,
        status: s.status as "PRESENT" | "ABSENT" | "LEAVE",
        marked_by: user.id,
      }));

    if (records.length === 0) return;

    try {
      await markAttendance.mutateAsync(records);
    } catch (err) {
      console.error("Failed to mark attendance:", err);
    }
  };

  const presentCount = students.filter((s) => s.status === "PRESENT").length;
  const absentCount = students.filter((s) => s.status === "ABSENT").length;
  const leaveCount = students.filter((s) => s.status === "LEAVE").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Mark and manage student attendance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Select Course</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSave} disabled={!selectedCourseId || markAttendance.isPending}>
            {markAttendance.isPending ? "Saving..." : "Save Attendance"}
          </Button>
        </div>
      </div>

      {selectedCourseId && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{presentCount}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{absentCount}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{leaveCount}</p>
                <p className="text-xs text-muted-foreground">Leave</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to mark attendance."
        />
      ) : loadingStudents || attendanceLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <EmptyState
          title="No students enrolled"
          description="No students are enrolled in this course."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {students.length} student{students.length !== 1 ? "s" : ""} - {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.userId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={student.status === "PRESENT" ? "default" : "outline"}
                      onClick={() =>
                        handleStatusChange(student.userId, "PRESENT")
                      }
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "ABSENT" ? "destructive" : "outline"}
                      onClick={() =>
                        handleStatusChange(student.userId, "ABSENT")
                      }
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Absent
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "LEAVE" ? "secondary" : "outline"}
                      onClick={() =>
                        handleStatusChange(student.userId, "LEAVE")
                      }
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Leave
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
