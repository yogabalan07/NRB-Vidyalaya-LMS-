import { useMemo } from "react";
import { Award, ExternalLink, Hash, Calendar, GraduationCap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCertificates, useCourses } from "@/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function CertificatesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-9 w-36" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StudentCertificatesPage() {
  const { user } = useAuth();
  const { data: certificates, isLoading: certsLoading } = useCertificates(
    user?.id || ""
  );
  const { data: courses } = useCourses();

  const courseMap = useMemo(() => {
    const map = new Map<string, string>();
    (courses || []).forEach((c) => map.set(c.id, c.title));
    return map;
  }, [courses]);

  const certificatesList = certificates || [];

  if (certsLoading) {
    return <CertificatesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            View and verify your course completion certificates
          </p>
        </div>
        {certificatesList.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" />
            {certificatesList.length} earned
          </Badge>
        )}
      </div>

      {certificatesList.length === 0 ? (
        <EmptyState
          icon={<Award className="h-12 w-12" />}
          title="No certificates yet"
          description="Complete courses to earn certificates. They will appear here."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificatesList.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="border-b bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {courseMap.get(cert.courseId) || "Course Certificate"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Course Completion Certificate
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Verified</Badge>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">
                      {user?.fullName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Certificate No:</span>
                    <span className="font-mono font-medium">
                      {cert.certificateNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Issued:</span>
                    <span>{formatDate(cert.issuedAt)}</span>
                  </div>
                </div>

                {cert.verificationUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    asChild
                  >
                    <a
                      href={cert.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Verify Certificate
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
