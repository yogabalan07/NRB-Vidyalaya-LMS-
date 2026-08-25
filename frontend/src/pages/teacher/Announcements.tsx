import { useAuth, useCoursesForTeacher } from "@/hooks";
import { notificationService } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Bell, Send, CheckCircle } from "lucide-react";
import { supabase } from "@/services/supabase";

interface Announcement {
  id: string;
  title: string;
  message: string;
  courseId?: string;
  createdAt: string;
}

export function TeacherAnnouncementsPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "ANNOUNCEMENT")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setAnnouncements(
        (data || []).map((row) => ({
          id: row.id,
          title: row.title,
          message: row.message,
          courseId: row.course_id || undefined,
          createdAt: row.created_at,
        }))
      );
    } catch (err) {
      console.error("Failed to load announcements:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedCourseId) return;

    setSending(true);
    try {
      const { enrollmentService } = await import("@/services");
      const enrollments = await enrollmentService.getEnrollmentsForCourse(
        selectedCourseId
      );

      for (const enrollment of enrollments) {
        await notificationService.createNotification({
          user_id: enrollment.userId,
          title,
          message,
          type: "ANNOUNCEMENT",
        });
      }

      setShowForm(false);
      setTitle("");
      setMessage("");
      setSelectedCourseId("");
      await loadAnnouncements();
    } catch (err) {
      console.error("Failed to send announcement:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Create and view announcements for your students</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              New Announcement
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Send Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Course *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
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
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your announcement..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={sending || !selectedCourseId || !title || !message}>
                  {sending ? "Sending..." : "Send Announcement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Send your first announcement to students."
          icon={<Bell className="h-12 w-12" />}
        >
          <Button onClick={() => setShowForm(true)}>
            <Send className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <h3 className="font-medium">{ann.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {ann.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Sent: {new Date(ann.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
