import { useAuth, useCoursesForTeacher } from "@/hooks";
import { enrollmentService, profileService } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Users, Search } from "lucide-react";

interface StudentInfo {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  courseName: string;
  enrolledAt: string;
  progress: number;
}

export function TeacherStudentsPage() {
  const { user } = useAuth();
  const { data: courses, isLoading: coursesLoading } = useCoursesForTeacher(
    user?.id || ""
  );

  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadStudents = useCallback(async () => {
    if (!courses || courses.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const allStudents: StudentInfo[] = [];

      for (const course of courses) {
        const enrollments = await enrollmentService.getEnrollmentsForCourse(
          course.id
        );

        for (const enrollment of enrollments) {
          const profile = await profileService.getProfile(enrollment.userId);

          allStudents.push({
            id: enrollment.userId,
            fullName: profile?.full_name || "Unknown",
            email: profile?.email || "",
            phone: profile?.phone,
            courseName: course.title,
            enrolledAt: enrollment.enrolledAt,
            progress: enrollment.progressPercent,
          });
        }
      }

      const uniqueStudents = allStudents.reduce<StudentInfo[]>((acc, student) => {
        const existing = acc.find((s) => s.id === student.id);
        if (existing) {
          existing.courseName += `, ${student.courseName}`;
          existing.progress = Math.max(existing.progress, student.progress);
        } else {
          acc.push(student);
        }
        return acc;
      }, []);

      setStudents(uniqueStudents);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  }, [courses]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (coursesLoading || loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Students</h1>
        <p className="text-muted-foreground">
          Students enrolled in your courses
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description={
            students.length === 0
              ? "No students are enrolled in your courses yet."
              : "No students match your search criteria."
          }
          icon={<Users className="h-12 w-12" />}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filteredStudents.length} student
            {filteredStudents.length !== 1 ? "s" : ""} found
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{student.fullName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  {student.phone && (
                    <p className="text-sm text-muted-foreground">
                      {student.phone}
                    </p>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Courses
                    </p>
                    <p className="text-sm">{student.courseName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Progress
                    </p>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {student.progress}% complete
                    </p>
                  </div>
                  <Badge
                    variant={
                      student.progress >= 80
                        ? "default"
                        : student.progress >= 40
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {student.progress >= 80
                      ? "On Track"
                      : student.progress >= 40
                        ? "In Progress"
                        : "Getting Started"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
