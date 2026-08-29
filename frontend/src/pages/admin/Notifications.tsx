import { useState } from "react";
import { useAuth } from "@/hooks";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Bell,
  BellOff,
  CheckCheck,
  AlertCircle,
  Info,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";
import type { Notification } from "@/types/notification";

function getNotificationIcon(type: string) {
  switch (type) {
    case "ANNOUNCEMENT":
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    case "LESSON":
      return <BookOpen className="h-4 w-4 text-green-500" />;
    case "ASSIGNMENT":
    case "DEADLINE":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    case "QUIZ":
      return <GraduationCap className="h-4 w-4 text-purple-500" />;
    case "CERTIFICATE":
      return <Award className="h-4 w-4 text-yellow-500" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground" />;
  }
}

export function AdminNotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("id,user_id,title,message,type,is_read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setNotifications((data || []) as unknown as Notification[]);
      setLoaded(true);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const loadAllNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select("id,user_id,title,message,type,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (fetchError) throw fetchError;
      setNotifications((data || []) as unknown as Notification[]);
      setLoaded(true);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (!unreadIds.length) return;
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">View system notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNotifications} disabled={loading}>
            My Notifications
          </Button>
          <Button variant="outline" onClick={loadAllNotifications} disabled={loading}>
            All Notifications
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {loaded && unreadCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bell className="h-4 w-4" />
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !loaded ? (
            <EmptyState
              title="Load notifications"
              description="Click a button above to load notifications."
              icon={<Bell className="h-12 w-12" />}
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description="You have no notifications."
              icon={<BellOff className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-[10px] px-1">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
