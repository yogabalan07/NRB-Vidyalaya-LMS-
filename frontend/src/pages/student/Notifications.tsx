import { Bell, Check, CheckCheck, AlertTriangle, Award, BookOpen, ClipboardCheck, Megaphone, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { Notification } from "@/types/notification";

const TYPE_CONFIG: Record<
  Notification["type"],
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  LESSON: {
    label: "Lesson",
    icon: BookOpen,
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  ASSIGNMENT: {
    label: "Assignment",
    icon: ClipboardCheck,
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  DEADLINE: {
    label: "Deadline",
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  QUIZ: {
    label: "Quiz",
    icon: ClipboardCheck,
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  CERTIFICATE: {
    label: "Certificate",
    icon: Award,
    className: "bg-green-100 text-green-800 border-green-200",
  },
  ANNOUNCEMENT: {
    label: "Announcement",
    icon: Megaphone,
    className: "bg-pink-100 text-pink-800 border-pink-200",
  },
  SYSTEM: {
    label: "System",
    icon: Settings,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  const config = TYPE_CONFIG[notification.type];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
        notification.isRead
          ? "bg-background"
          : "bg-primary/5 border-primary/20"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.className}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium truncate">{notification.title}</h4>
          {!notification.isRead && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDate(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            className="h-8 w-8 p-0"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function StudentNotificationsPage() {
  const { user } = useAuth();
  const {
    data: notifications,
    isLoading,
  } = useNotifications(user?.id || "");
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllRead.mutate(user.id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <NotificationSkeleton />
      </div>
    );
  }

  const notificationsList = notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="default">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notificationsList.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {notificationsList.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
