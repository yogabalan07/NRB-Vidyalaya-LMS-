import { useState } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Award,
  Search,
  CheckCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import type { Certificate } from "@/types/certificate";

interface EnrichedCertificate extends Certificate {
  studentName?: string;
  courseName?: string;
}

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<EnrichedCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchNumber, setSearchNumber] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select("*")
        .order("issued_at", { ascending: false });

      if (fetchError) throw fetchError;

      const certs = (data || []) as Certificate[];
      const enriched: EnrichedCertificate[] = [];

      for (const cert of certs) {
        let studentName: string | undefined;
        let courseName: string | undefined;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", cert.userId)
          .single();
        if (profile) studentName = profile.full_name;

        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", cert.courseId)
          .single();
        if (course) courseName = course.title;

        enriched.push({ ...cert, studentName, courseName });
      }

      setCertificates(enriched);
      setLoaded(true);
    } catch {
      setError("Failed to load certificates.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchNumber.trim()) {
      loadAll();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("certificates")
        .select("*")
        .eq("certificate_number", searchNumber.trim())
        .single();

      if (fetchError) throw fetchError;

      const cert = data as Certificate;
      let studentName: string | undefined;
      let courseName: string | undefined;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", cert.userId)
        .single();
      if (profile) studentName = profile.full_name;

      const { data: course } = await supabase
        .from("courses")
        .select("title")
        .eq("id", cert.courseId)
        .single();
      if (course) courseName = course.title;

      setCertificates([{ ...cert, studentName, courseName }]);
      setLoaded(true);
    } catch {
      setError("Certificate not found.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Certificates</h1>
        <p className="text-muted-foreground">View and verify issued certificates</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by certificate number..."
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            className="pl-9"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          Search
        </Button>
        <Button variant="outline" onClick={loadAll} disabled={loading}>
          Load All
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {loaded ? `${certificates.length} certificate${certificates.length !== 1 ? "s" : ""}` : "Certificates"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !loaded ? (
            <EmptyState
              title="Load certificates"
              description="Click 'Load All' to view all certificates or search by number."
              icon={<Award className="h-12 w-12" />}
            />
          ) : certificates.length === 0 ? (
            <EmptyState
              title="No certificates found"
              description="No certificates match your search."
              icon={<Award className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-medium">
                        {cert.certificateNumber}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span>{cert.studentName || cert.userId.slice(0, 8)}</span>
                      {" \u00b7 "}
                      <span>{cert.courseName || cert.courseId.slice(0, 8)}</span>
                      {" \u00b7 "}
                      <span>
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Copy certificate number"
                      onClick={() => handleCopy(cert.certificateNumber)}
                    >
                      <Copy
                        className={`h-3 w-3 ${
                          copied === cert.certificateNumber
                            ? "text-green-600"
                            : ""
                        }`}
                      />
                    </Button>
                    {cert.verificationUrl && (
                      <a
                        href={cert.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
