import { useState, useMemo } from "react";
import { useCourses, useAttendanceForCourse } from "@/hooks";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { Calendar, UserCheck, UserX, Clock } from "lucide-react";

interface ProfileMap {
  [key: string]: string;
}

export function AdminAttendancePage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: records, isLoading } = useAttendanceForCourse(selectedCourse);
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
    if (!records) return { present: 0, absent: 0, leave: 0, total: 0 };
    const present = records.filter((r) => r.status === "PRESENT").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const leave = records.filter((r) => r.status === "LEAVE").length;
    return { present, absent, leave, total: records.length };
  }, [records]);

  const uniqueDates = useMemo(() => {
    if (!records) return [];
    return [...new Set(records.map((r) => r.date))].sort().reverse();
  }, [records]);

  const uniqueUserIds = useMemo(() => {
    if (!records) return [];
    return [...new Set(records.map((r) => r.userId))];
  }, [records]);

  const loadProfiles = () => fetchProfiles(uniqueUserIds);

  function getStatusVariant(status: string) {
    if (status === "PRESENT") return "default" as const;
    if (status === "ABSENT") return "destructive" as const;
    return "secondary" as const;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">View attendance records per course</p>
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
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  Present
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <UserX className="h-4 w-4 text-destructive" />
                  Absent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leave}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Attendance Records</CardTitle>
              <div className="flex gap-2">
                <button
                  className="text-xs text-primary underline"
                  onClick={loadProfiles}
                  disabled={loadingProfiles}
                >
                  {loadingProfiles ? "Loading names..." : "Load student names"}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : !records?.length ? (
                <EmptyState
                  title="No attendance records"
                  description="No attendance has been recorded for this course yet."
                  icon={<Calendar className="h-12 w-12" />}
                />
              ) : (
                <div className="space-y-4">
                  {uniqueDates.map((date) => {
                    const dayRecords = records.filter((r) => r.date === date);
                    return (
                      <div key={date}>
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        <div className="space-y-1">
                          {dayRecords.map((record) => (
                            <div
                              key={record.id}
                              className="flex items-center justify-between rounded border p-2"
                            >
                              <span className="text-sm">
                                {profiles[record.userId] || record.userId.slice(0, 8) + "..."}
                              </span>
                              <Badge variant={getStatusVariant(record.status)}>
                                {record.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
