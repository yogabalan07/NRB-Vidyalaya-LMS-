import { useState, useMemo } from "react";
import { useProfilesByRole, useUpdateProfile } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Search,
  Users,
  Ban,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react";
import type { Profile } from "@/types/auth";

export function AdminStudentsPage() {
  const { data: students, isLoading, error } = useProfilesByRole("STUDENT");
  const updateProfile = useUpdateProfile();
  const [search, setSearch] = useState("");
  const [confirmToggle, setConfirmToggle] = useState<Profile | null>(null);

  const filtered = useMemo(() => {
    if (!students) return [];
    return (students as unknown as Profile[]).filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      );
    });
  }, [students, search]);

  const activeCount = useMemo(() => {
    if (!students) return 0;
    return (students as unknown as Profile[]).filter(
      (p) => p.status === "active"
    ).length;
  }, [students]);

  const handleToggleStatus = (profile: Profile) => {
    const newStatus = profile.status === "active" ? "suspended" : "active";
    updateProfile.mutate(
      { userId: profile.id, updates: { status: newStatus } },
      { onSuccess: () => setConfirmToggle(null) }
    );
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load students.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground">Manage student accounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {(students?.length ?? 0) - activeCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} student{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No students found"
              description="No students match your search."
              icon={<Users className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {student.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {student.full_name || "No name"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </span>
                        {student.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        student.status === "active" ? "default" : "destructive"
                      }
                    >
                      {student.status || "active"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmToggle(student)}
                    >
                      {student.status === "active" ? (
                        <Ban className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.status === "active" ? "Suspend Student" : "Activate Student"}
        message={`Are you sure you want to ${
          confirmToggle?.status === "active" ? "suspend" : "activate"
        } ${confirmToggle?.full_name || confirmToggle?.email}?`}
        confirmLabel={confirmToggle?.status === "active" ? "Suspend" : "Activate"}
        variant={confirmToggle?.status === "active" ? "destructive" : "default"}
        onConfirm={() => confirmToggle && handleToggleStatus(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
}
