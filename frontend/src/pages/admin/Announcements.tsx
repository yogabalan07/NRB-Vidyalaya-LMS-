import { useState } from "react";
import { supabase } from "@/services/supabase";
import { useCourses } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Send, Users } from "lucide-react";
import type { Profile } from "@/types/auth";

interface AnnouncementForm {
  title: string;
  message: string;
  targetCourseId: string;
  targetRole: string;
}

const defaultForm: AnnouncementForm = {
  title: "",
  message: "",
  targetCourseId: "",
  targetRole: "",
};

interface SentAnnouncement {
  id: string;
  title: string;
  sentAt: string;
  recipientCount: number;
}

export function AdminAnnouncementsPage() {
  const { data: courses } = useCourses();
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<SentAnnouncement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      let targetUsers: Profile[] = [];

      if (form.targetCourseId) {
        const { data: enrollments } = await supabase
          .from("enrollments")
          .select("user_id")
          .eq("course_id", form.targetCourseId);

        const userIds = (enrollments || []).map(
          (e: Record<string, unknown>) => e.user_id as string
        );
        if (userIds.length) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id")
            .in("id", userIds);
          targetUsers = (profiles || []) as unknown as Profile[];
        }
      } else if (form.targetRole) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", form.targetRole);
        targetUsers = (profiles || []) as unknown as Profile[];
      } else {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id");
        targetUsers = (profiles || []) as unknown as Profile[];
      }

      const notifications = targetUsers.map((u) => ({
        user_id: u.id,
        title: form.title,
        message: form.message,
        type: "ANNOUNCEMENT",
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from("notifications")
          .insert(notifications);
        if (insertError) throw insertError;
      }

      setSent((prev) => [
        {
          id: Date.now().toString(),
          title: form.title,
          sentAt: new Date().toISOString(),
          recipientCount: targetUsers.length,
        },
        ...prev,
      ]);

      setSuccess(`Announcement sent to ${targetUsers.length} user(s).`);
      setForm(defaultForm);
    } catch {
      setError("Failed to send announcement. Check notifications table exists.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-muted-foreground">
          Create and send announcements to students
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <Label>Message *</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="Write your announcement message"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Target Course (optional)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.targetCourseId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetCourseId: e.target.value,
                      targetRole: "",
                    }))
                  }
                >
                  <option value="">All users (or select role)</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (enrolled students)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Target Role (optional)</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.targetRole}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      targetRole: e.target.value,
                      targetCourseId: "",
                    }))
                  }
                >
                  <option value="">All roles</option>
                  <option value="STUDENT">All Students</option>
                  <option value="TEACHER">All Teachers</option>
                </select>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600">{success}</p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSend}
                disabled={
                  !form.title.trim() ||
                  !form.message.trim() ||
                  sending
                }
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send Announcement"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {sent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {s.recipientCount}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
