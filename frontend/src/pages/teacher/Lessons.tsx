import { useAuth, useCoursesForTeacher, useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson } from "@/hooks";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Plus, Pencil, Trash2, BookOpen, GripVertical } from "lucide-react";
import type { Lesson } from "@/types/lesson";

interface LessonFormData {
  title: string;
  content: string;
  videoUrl: string;
  durationMinutes: string;
  sortOrder: string;
}

const emptyForm: LessonFormData = {
  title: "",
  content: "",
  videoUrl: "",
  durationMinutes: "",
  sortOrder: "",
};

export function TeacherLessonsPage() {
  const { user } = useAuth();
  const { data: courses } = useCoursesForTeacher(user?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const { data: lessons, isLoading: lessonsLoading } = useLessons(selectedCourseId);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [formData, setFormData] = useState<LessonFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Lesson | null>(null);

  const handleOpenCreate = () => {
    setEditingLesson(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      content: lesson.content || "",
      videoUrl: lesson.videoUrl || "",
      durationMinutes: lesson.durationMinutes?.toString() || "",
      sortOrder: lesson.sortOrder?.toString() || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;

    try {
      const payload = {
        title: formData.title,
        content: formData.content || undefined,
        video_url: formData.videoUrl || undefined,
        duration_minutes: formData.durationMinutes
          ? parseInt(formData.durationMinutes)
          : undefined,
        sort_order: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
      };

      if (editingLesson) {
        await updateLesson.mutateAsync({
          id: editingLesson.id,
          updates: payload,
        });
      } else {
        await createLesson.mutateAsync({
          course_id: selectedCourseId,
          ...payload,
        });
      }
      setShowForm(false);
      setFormData(emptyForm);
      setEditingLesson(null);
    } catch (err) {
      console.error("Failed to save lesson:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLesson.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lessons</h1>
          <p className="text-muted-foreground">Create and manage course lessons</p>
        </div>
        {selectedCourseId && (
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        )}
      </div>

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

      {showForm && selectedCourseId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, sortOrder: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLesson(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLesson.isPending || updateLesson.isPending}
                >
                  {editingLesson ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!selectedCourseId ? (
        <EmptyState
          title="Select a course"
          description="Choose a course above to manage its lessons."
          icon={<BookOpen className="h-12 w-12" />}
        />
      ) : lessonsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !lessons || lessons.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Add your first lesson to this course."
          icon={<BookOpen className="h-12 w-12" />}
        >
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <Badge variant={lesson.isPublished ? "default" : "secondary"}>
                      {lesson.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {lesson.durationMinutes && <span>{lesson.durationMinutes} min</span>}
                    {lesson.videoUrl && <span>Has video</span>}
                    <span>Order: {lesson.sortOrder}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenEdit(lesson)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(lesson)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Lesson"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
