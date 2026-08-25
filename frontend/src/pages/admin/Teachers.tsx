import { useState, useMemo } from "react";
import { useProfilesByRole } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { Search, GraduationCap, Mail, Phone } from "lucide-react";
import type { Profile } from "@/types/auth";

export function AdminTeachersPage() {
  const { data: teachers, isLoading, error } = useProfilesByRole("TEACHER");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!teachers) return [];
    return (teachers as unknown as Profile[]).filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q)
      );
    });
  }, [teachers, search]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load teachers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Teachers</h1>
        <p className="text-muted-foreground">Manage teacher accounts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers?.length ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(teachers as unknown as Profile[] | undefined)?.filter(
                (t) => t.status === "active"
              ).length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} teacher{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No teachers found"
              description="No teachers match your search."
              icon={<GraduationCap className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-sm font-semibold text-secondary-foreground">
                      {teacher.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {teacher.full_name || "No name"}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {teacher.email}
                        </span>
                        {teacher.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      teacher.status === "active" ? "default" : "destructive"
                    }
                  >
                    {teacher.status || "active"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
