import { useAuth, useCoursesForTeacher } from "@/hooks";
import { storageService } from "@/services";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Upload,
  File,
  Trash2,
  FolderOpen,
  AlertCircle,
} from "lucide-react";

interface StudyFile {
  name: string;
  id: string;
  created_at: string;
  size?: number;
}

export function TeacherMaterialsPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudyFile | null>(null);

  const loadFiles = useCallback(async () => {
    if (!selectedCourseId) {
      setFiles([]);
      return;
    }
    setLoadingFiles(true);
    try {
      const fileList = await storageService.listFiles(
        "study-materials",
        selectedCourseId
      );
      setFiles(fileList);
    } catch (err) {
      console.error("Failed to load files:", err);
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourseId || !user?.id) return;

    setUploading(true);
    try {
      const filePath = `${selectedCourseId}/${Date.now()}_${file.name}`;
      await storageService.upload("study-materials", filePath, file);
      await loadFiles();
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || !selectedCourseId) return;
    try {
      const filePath = `${selectedCourseId}/${deleteTarget.name}`;
      await storageService.deleteFile("study-materials", filePath);
      setDeleteTarget(null);
      await loadFiles();
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Materials</h1>
        <p className="text-muted-foreground">Upload and manage study materials for your courses</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 rounded-md border border-dashed bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            Study materials are stored in Supabase Storage. Make sure the
            "study-materials" bucket exists and has the correct policies.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">Choose a course...</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div className="flex items-center gap-4">
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload File"}
          </Label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <span className="text-sm text-muted-foreground">
            Max file size: 50MB
          </span>
        </div>
      )}

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to manage its study materials."
          icon={<FolderOpen className="h-12 w-12" />}
        />
      ) : loadingFiles ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          title="No materials yet"
          description="Upload study materials like PDFs, slides, or documents."
          icon={<File className="h-12 w-12" />}
        >
          <Label
            htmlFor="file-upload-empty"
            className="cursor-pointer inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="h-4 w-4" />
            Upload First File
          </Label>
          <input
            id="file-upload-empty"
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </EmptyState>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded
          </p>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">File</Badge>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(file)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
