import { useState, useMemo } from "react";
import { useAllProfiles, useUpdateProfile } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Search, Users as UsersIcon, Ban, CheckCircle } from "lucide-react";
import type { Profile } from "@/types/auth";

const ROLES = ["ALL", "STUDENT", "TEACHER", "ADMIN", "SUPER_ADMIN"] as const;

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive" as const;
    case "ADMIN":
      return "default" as const;
    case "TEACHER":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

export function AdminUsersPage() {
  const { data: profiles, isLoading, error } = useAllProfiles();
  const updateProfile = useUpdateProfile();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [confirmToggle, setConfirmToggle] = useState<Profile | null>(null);

  const filtered = useMemo(() => {
    if (!profiles) return [];
    return (profiles as unknown as Profile[]).filter((p) => {
      const matchesRole = roleFilter === "ALL" || p.role === roleFilter;
      const matchesSearch =
        !search ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.email?.toLowerCase().includes(search.toLowerCase());
      return matchesRole && matchesSearch;
    });
  }, [profiles, search, roleFilter]);

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
        <p className="text-destructive">Failed to load users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all system users</p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(role)}
            >
              {role === "ALL" ? "All Roles" : role.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try adjusting your search or filter."
              icon={<UsersIcon className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {profile.full_name || "No name"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {profile.role}
                    </Badge>
                    <Badge
                      variant={
                        profile.status === "active" ? "default" : "destructive"
                      }
                    >
                      {profile.status || "active"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmToggle(profile)}
                      title={
                        profile.status === "active"
                          ? "Suspend user"
                          : "Activate user"
                      }
                    >
                      {profile.status === "active" ? (
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
        title={confirmToggle?.status === "active" ? "Suspend User" : "Activate User"}
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
