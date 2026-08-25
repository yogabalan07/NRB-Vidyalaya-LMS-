import { useState } from "react";
import { useCourses } from "@/hooks";
import { storageService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Upload,
  FileText,
  Image,
  Film,
  File,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

interface UploadedFile {
  name: string;
  id: string;
  created_at: string;
  url?: string;
}

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || ""))
    return <Image className="h-4 w-4" />;
  if (["mp4", "webm", "avi", "mov"].includes(ext || ""))
    return <Film className="h-4 w-4" />;
  if (["pdf", "doc", "docx", "txt"].includes(ext || ""))
    return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

export function AdminMaterialsPage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const loadFiles = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setError(null);
    try {
      const fileList = await storageService.listFiles(
        "study-materials",
        selectedCourse
      );
      setFiles(fileList);
    } catch {
      setError("Failed to load files. The storage bucket may not be configured yet.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles?.length || !selectedCourse) return;
    setUploading(true);
    setError(null);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (!file) continue;
        const path = `${selectedCourse}/${Date.now()}-${file.name}`;
        await storageService.upload("study-materials", path, file);
      }
      setSelectedFiles(null);
      await loadFiles();
    } catch {
      setError("Upload failed. Ensure the 'study-materials' storage bucket exists in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!selectedCourse) return;
    try {
      await storageService.deleteFile(
        "study-materials",
        `${selectedCourse}/${name}`
      );
      await loadFiles();
    } catch {
      setError("Failed to delete file.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground">
          Upload and manage study materials for courses
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Storage Configuration Required
              </p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                Ensure a storage bucket named{" "}
                <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
                  study-materials
                </code>{" "}
                exists in your Supabase project. Set appropriate RLS policies
                for admin upload access.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-sm">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setFiles([]);
          }}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>Select Files</Label>
              <Input
                type="file"
                multiple
                className="mt-1"
                onChange={(e) => setSelectedFiles(e.target.files)}
              />
            </div>
            <div className="flex gap-2 pt-5">
              <Button
                onClick={handleUpload}
                disabled={!selectedFiles?.length || uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outline" onClick={loadFiles} disabled={loading}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Files
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 rounded bg-muted animate-pulse" />
                  ))}
                </div>
              ) : files.length === 0 ? (
                <EmptyState
                  title="No files uploaded"
                  description="Upload study materials using the form above."
                  icon={<FolderOpen className="h-12 w-12" />}
                />
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(file.name)}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline">
                          {new Date(file.created_at).toLocaleDateString()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
