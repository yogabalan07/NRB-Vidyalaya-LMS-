import { useState, useCallback } from "react";
import {
  useCourses,
  useAdminMaterials,
  useCreateAdminMaterial,
  useUpdateAdminMaterial,
  useDeleteAdminMaterial,
} from "@/hooks";
import { storageService } from "@/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Search,
  FileText,
  Image,
  File,
  Plus,
  Edit,
  Trash2,
  Eye,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  FolderOpen,
} from "lucide-react";
import type { StudyMaterial } from "@/types/admin";

const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx",
  "txt", "png", "jpg", "jpeg", "zip",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getFileIcon(name?: string) {
  if (!name) return <File className="h-4 w-4" />;
  const ext = name.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext || ""))
    return <Image className="h-4 w-4" />;
  if (["pdf", "doc", "docx", "txt"].includes(ext || ""))
    return <FileText className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
}

function validateFile(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return `File type .${ext} is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds 50MB limit`;
  }
  return null;
}

interface MaterialFormData {
  courseId: string;
  title: string;
  description: string;
  driveUrl: string;
}

const EMPTY_FORM: MaterialFormData = {
  courseId: "",
  title: "",
  description: "",
  driveUrl: "",
};

export function AdminMaterialsPage() {
  const { data: courses } = useCourses();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<StudyMaterial | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: response, isLoading } = useAdminMaterials({
    page,
    limit,
    search: debouncedSearch,
    courseId: courseFilter,
  });

  const createMaterial = useCreateAdminMaterial();
  const updateMaterial = useUpdateAdminMaterial();
  const deleteMaterial = useDeleteAdminMaterial();

  const materials = response?.data || [];
  const pagination = response?.pagination;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const openCreateForm = () => {
    setEditingMaterial(null);
    setFormData(EMPTY_FORM);
    setSelectedFile(null);
    setFormError(null);
    setFormSuccess(null);
    setShowForm(true);
  };

  const openEditForm = (material: StudyMaterial) => {
    setEditingMaterial(material);
    setFormData({
      courseId: material.courseId,
      title: material.title,
      description: material.description || "",
      driveUrl: material.driveUrl || "",
    });
    setSelectedFile(null);
    setFormError(null);
    setFormSuccess(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingMaterial(null);
    setFormData(EMPTY_FORM);
    setSelectedFile(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.courseId || !formData.title) {
      setFormError("Course and title are required");
      return;
    }

    setUploading(true);

    try {
      let filePath: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      let mimeType: string | undefined;

      if (selectedFile) {
        const validationError = validateFile(selectedFile);
        if (validationError) {
          setFormError(validationError);
          setUploading(false);
          return;
        }

        const path = `study-materials/${formData.courseId}/${Date.now()}-${selectedFile.name}`;
        const uploadResult = await storageService.upload("study-materials", path, selectedFile);
        filePath = uploadResult.path;
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
      }

      if (editingMaterial) {
        updateMaterial.mutate(
          {
            id: editingMaterial.id,
            data: {
              courseId: formData.courseId,
              title: formData.title,
              description: formData.description || undefined,
              driveUrl: formData.driveUrl || undefined,
              ...(filePath ? { filePath, fileName, fileSize, mimeType } : {}),
            },
          },
          {
            onSuccess: () => {
              setFormSuccess("Material updated successfully");
              setTimeout(closeForm, 1500);
            },
            onError: (err: Error) => setFormError(err.message),
          }
        );
      } else {
        createMaterial.mutate(
          {
            courseId: formData.courseId,
            title: formData.title,
            description: formData.description || undefined,
            driveUrl: formData.driveUrl || undefined,
            filePath,
            fileName,
            fileSize,
            mimeType,
          },
          {
            onSuccess: () => {
              setFormSuccess("Material created successfully");
              setTimeout(closeForm, 1500);
            },
            onError: (err: Error) => setFormError(err.message),
          }
        );
      }
    } catch {
      setFormError("File upload failed. Ensure the storage bucket exists.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMaterial) return;
    deleteMaterial.mutate(deletingMaterial.id, {
      onSuccess: () => setDeletingMaterial(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Materials</h1>
          <p className="text-muted-foreground">Manage course study materials</p>
        </div>
        <Button onClick={openCreateForm} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={courseFilter}
          onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Courses</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {pagination ? `Showing ${((pagination.page - 1) * pagination.limit) + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} materials` : `${materials.length} material${materials.length !== 1 ? "s" : ""}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <EmptyState
              title="No study materials found"
              description="Add study materials for your courses."
              icon={<FolderOpen className="h-12 w-12" />}
            >
              <Button onClick={openCreateForm} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Add Material
              </Button>
            </EmptyState>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Title</th>
                      <th className="pb-3 font-medium">Description</th>
                      <th className="pb-3 font-medium">File</th>
                      <th className="pb-3 font-medium">Created</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((mat) => (
                      <tr key={mat.id} className="border-b last:border-0">
                        <td className="py-3">
                          <span className="text-muted-foreground">
                            {mat.courseName || "—"}
                          </span>
                        </td>
                        <td className="py-3 font-medium">{mat.title}</td>
                        <td className="py-3 text-muted-foreground max-w-[200px] truncate">
                          {mat.description || "—"}
                        </td>
                        <td className="py-3">
                          {mat.driveUrl ? (
                            <a
                              href={mat.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> Drive
                            </a>
                          ) : mat.fileName ? (
                            <span className="inline-flex items-center gap-1">
                              {getFileIcon(mat.fileName)}
                              <span className="truncate max-w-[100px]">{mat.fileName}</span>
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(mat.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewingMaterial(mat)} title="View">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openEditForm(mat)} title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeletingMaterial(mat)} title="Delete">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {materials.map((mat) => (
                  <div key={mat.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="font-medium">{mat.title}</p>
                        <p className="text-xs text-muted-foreground">{mat.courseName || "No course"}</p>
                      </div>
                    </div>
                    {mat.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{mat.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      {mat.driveUrl && (
                        <a href={mat.driveUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Drive Link
                        </a>
                      )}
                      {mat.fileName && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          {getFileIcon(mat.fileName)} {mat.fileName}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setViewingMaterial(mat)}>
                        <Eye className="h-3 w-3" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditForm(mat)}>
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setDeletingMaterial(mat)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rows:</span>
                    <select
                      className="h-8 rounded border border-input bg-background px-2 text-sm"
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    >
                      {[10, 25, 50, 100].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Form Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">
                {editingMaterial ? "Edit Material" : "Add Material"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {formError && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-md p-3">{formError}</div>
              )}
              {formSuccess && (
                <div className="text-sm text-green-600 bg-green-50 rounded-md p-3">{formSuccess}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="courseId">Course *</Label>
                <select
                  id="courseId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Hindi Grammar - Nouns"
                  minLength={2}
                  maxLength={200}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driveUrl">Google Drive Link</Label>
                <Input
                  id="driveUrl"
                  type="url"
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <Input
                  id="file"
                  type="file"
                  accept={ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",")}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Allowed: {ALLOWED_EXTENSIONS.join(", ")}. Max 50MB.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMaterial.isPending || updateMaterial.isPending || uploading}>
                  {uploading
                    ? "Uploading..."
                    : editingMaterial
                      ? updateMaterial.isPending ? "Saving..." : "Save Changes"
                      : createMaterial.isPending ? "Creating..." : "Create Material"}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Material Dialog */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Material Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewingMaterial(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="border-b pb-2">
                  <span className="text-muted-foreground text-xs">Course</span>
                  <p className="font-medium">{viewingMaterial.courseName || "—"}</p>
                </div>
                <div className="border-b pb-2">
                  <span className="text-muted-foreground text-xs">Title</span>
                  <p className="font-medium">{viewingMaterial.title}</p>
                </div>
                {viewingMaterial.description && (
                  <div className="border-b pb-2">
                    <span className="text-muted-foreground text-xs">Description</span>
                    <p className="whitespace-pre-wrap">{viewingMaterial.description}</p>
                  </div>
                )}
                {viewingMaterial.driveUrl && (
                  <div className="border-b pb-2">
                    <span className="text-muted-foreground text-xs">Google Drive</span>
                    <p>
                      <a
                        href={viewingMaterial.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Open Drive Link
                      </a>
                    </p>
                  </div>
                )}
                {viewingMaterial.fileName && (
                  <div className="border-b pb-2">
                    <span className="text-muted-foreground text-xs">File</span>
                    <p className="flex items-center gap-2">
                      {getFileIcon(viewingMaterial.fileName)}
                      {viewingMaterial.fileName}
                      {viewingMaterial.fileSize && (
                        <span className="text-muted-foreground">
                          ({(viewingMaterial.fileSize / 1024).toFixed(1)} KB)
                        </span>
                      )}
                    </p>
                  </div>
                )}
                <div className="border-b pb-2">
                  <span className="text-muted-foreground text-xs">Created By</span>
                  <p>{viewingMaterial.creatorName || "—"}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(viewingMaterial.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setViewingMaterial(null); openEditForm(viewingMaterial); }}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="outline" onClick={() => setViewingMaterial(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingMaterial}
        title="Delete Material"
        message={`Are you sure you want to delete "${deletingMaterial?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingMaterial(null)}
      />
    </div>
  );
}
