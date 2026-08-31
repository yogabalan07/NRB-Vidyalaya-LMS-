import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { adminService } from "@/services";
import type { StorageStats, StorageBucketStats } from "@/types/admin";
import {
  HardDrive,
  RefreshCw,
  AlertTriangle,
  Info,
  FolderOpen,
} from "lucide-react";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

function getWarningLevel(
  percentage: number
): "normal" | "warning" | "strong" | "critical" {
  if (percentage >= 95) return "critical";
  if (percentage >= 85) return "strong";
  if (percentage >= 70) return "warning";
  return "normal";
}

function getWarningColor(level: "normal" | "warning" | "strong" | "critical") {
  switch (level) {
    case "critical":
      return "text-red-600 dark:text-red-400";
    case "strong":
      return "text-orange-600 dark:text-orange-400";
    case "warning":
      return "text-yellow-600 dark:text-yellow-400";
    default:
      return "text-muted-foreground";
  }
}

function getProgressBarColor(
  level: "normal" | "warning" | "strong" | "critical"
) {
  switch (level) {
    case "critical":
      return "bg-red-500";
    case "strong":
      return "bg-orange-500";
    case "warning":
      return "bg-yellow-500";
    default:
      return "bg-primary";
  }
}

function getWarningMessage(level: "normal" | "warning" | "strong" | "critical") {
  switch (level) {
    case "critical":
      return "Critical: Storage is almost full. Immediate action required.";
    case "strong":
      return "Warning: Storage usage is high. Consider cleaning up unused files.";
    case "warning":
      return "Notice: Storage usage is above 70%. Monitor usage closely.";
    default:
      return null;
  }
}

interface StorageUsageProps {
  className?: string;
}

export function StorageUsage({ className }: StorageUsageProps) {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getStorageStats();
      setStats(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load storage information"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading storage usage...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-destructive">
              <AlertTriangle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold">
              Unable to load storage information
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {error || "An unexpected error occurred."}
            </p>
            <Button
              onClick={fetchStats}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const usedPercent = stats.usedPercentage ?? 0;
  const warningLevel = getWarningLevel(usedPercent);
  const warningMessage = getWarningMessage(warningLevel);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning banner */}
        {warningMessage && (
          <div
            className={`flex items-start gap-3 rounded-lg border p-4 ${
              warningLevel === "critical"
                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                : warningLevel === "strong"
                  ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                  : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
            }`}
          >
            <AlertTriangle
              className={`mt-0.5 h-4 w-4 shrink-0 ${getWarningColor(warningLevel)}`}
            />
            <p
              className={`text-sm ${getWarningColor(warningLevel)}`}
            >
              {warningMessage}
            </p>
          </div>
        )}

        {/* Main storage card */}
        <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Storage Usage
            </span>
            <span
              className={`text-2xl font-bold ${getWarningColor(warningLevel)}`}
            >
              {usedPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative mb-6 h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressBarColor(warningLevel)}`}
              style={{ width: `${Math.min(usedPercent, 100)}%` }}
            >
              <div
                className="absolute inset-0 animate-pulse rounded-full opacity-20"
                style={{
                  width: `${Math.min(usedPercent, 100)}%`,
                  animation:
                    warningLevel === "critical"
                      ? "pulse 1.5s ease-in-out infinite"
                      : undefined,
                }}
              />
            </div>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                width: `${Math.min(usedPercent, 100)}%`,
                background:
                  "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.1) 8px, rgba(255,255,255,0.1) 16px)",
              }}
            />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Used
            </p>
            <p className="mt-1 text-xl font-semibold">
              {formatBytes(stats.usedBytes)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Remaining
            </p>
            <p className="mt-1 text-xl font-semibold">
              {stats.remainingBytes !== null
                ? formatBytes(stats.remainingBytes)
                : "N/A"}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="mt-1 text-xl font-semibold">
              {stats.totalBytes !== null
                ? formatBytes(stats.totalBytes)
                : "N/A"}
            </p>
          </div>
          </div>
        </div>

        {/* Quota notice */}
        {!stats.quotaAvailable && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Storage quota is estimated based on the Supabase free tier (1 GB).
              Actual quota may vary based on your plan. Upgrade your Supabase
              plan for accurate quota information.
            </p>
          </div>
        )}

        {/* Storage by bucket */}
        {stats.buckets.length > 0 && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="h-4 w-4" />
              Storage by Bucket
            </h4>
            <div className="space-y-3">
              {stats.buckets
                .sort((a: StorageBucketStats, b: StorageBucketStats) => b.usedBytes - a.usedBytes)
                .map((bucket: StorageBucketStats) => (
                  <div
                    key={bucket.bucketName}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                        <FolderOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {bucket.bucketName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {bucket.fileCount} file{bucket.fileCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatBytes(bucket.usedBytes)}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Refresh button */}
        <div className="flex justify-end">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Storage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
