import { useQuery } from "@tanstack/react-query";
import { Bell, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { supabase } from "@/services/supabase";
import type { Notification } from "@/types/notification";

function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,user_id,title,message,type,is_read,created_at")
        .eq("type", "ANNOUNCEMENT")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((row: Record<string, unknown>) => ({
        id: row.id as string,
        userId: row.user_id as string,
        title: row.title as string,
        message: row.message as string,
        type: row.type as string,
        isRead: row.is_read as boolean,
        createdAt: row.created_at as string,
      })) as Notification[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

function AnnouncementSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/6" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AnnouncementsPage() {
  const { data: announcements, isLoading, error } = useAnnouncements();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-nrb-950 via-nrb-900 to-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white lg:text-5xl">
            Announcements
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Stay updated with the latest news and important updates from NRB Vidyalaya.
          </p>
        </div>
      </section>

      {/* Announcements List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {isLoading ? (
            <AnnouncementSkeleton />
          ) : error ? (
            <EmptyState
              title="Failed to load announcements"
              description="Something went wrong. Please try again later."
              icon={<Bell className="h-12 w-12" />}
            />
          ) : announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        Announcement
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.message}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No announcements yet"
              description="There are no announcements at this time. Check back later for updates."
              icon={<Bell className="h-12 w-12" />}
            />
          )}
        </div>
      </section>
    </div>
  );
}
