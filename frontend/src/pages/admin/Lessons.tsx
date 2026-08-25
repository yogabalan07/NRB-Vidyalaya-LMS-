import { useState } from "react";
import {
  useCourses,
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import type { Lesson } from "@/types/lesson";

interface LessonFormData {
  course_id: string;
  title: string;
  content: string;
  video_url: string;
  duration_minutes: number;
  sort_order: number;
}

const defaultForm: LessonFormData = {
  course_id: "",
  title: "",
  content: "",
  video_url: "",
  duration_minutes: 0,
  sort_order: 0,
};

export function AdminLessonsPage() {
  const { data: courses } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState("");
  const { data: lessons, isLoading } = useLessons(selectedCourse);
  const createLesson = useCreateLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonFormData>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<Lesson | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ ...defaultForm, course_id: selectedCourse });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (lesson: Lesson) => {
    setForm({
      course_id: lesson.courseId,
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.videoUrl || "",
      duration_minutes: lesson.durationMinutes || 0,
      sort_order: lesson.sortOrder,
    });
    setEditingId(lesson.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.course_id) return;

    if (editingId) {
      updateLesson.mutate(
        {
          id: editingId,
          updates: {
            title: form.title,
            content: form.content,
            video_url: form.video_url || undefined,
            duration_minutes: form.duration_minutes || undefined,
            sort_order: form.sort_order,
          },
        },
        { onSuccess: resetForm }
      );
    } else {
      createLesson.mutate(
        {
          course_id: form.course_id,
          title: form.title,
          content: form.content || undefined,
          video_url: form.video_url || undefined,
          duration_minutes: form.duration_minutes || undefined,
          sort_order: form.sort_order || undefined,
        },
        { onSuccess: resetForm }
      );
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteLesson.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lessons</h1>
          <p className="text-muted-foreground">Manage lessons across courses</p>
        </div>
        {selectedCourse && (
          <Button
            onClick={() => {
              setForm({ ...defaultForm, course_id: selectedCourse });
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Lesson
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <Label>Select Course</Label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setShowForm(false);
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

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Edit Lesson" : "New Lesson"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Lesson title"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Content</Label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Lesson content (supports markdown)"
                />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  value={form.video_url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, video_url: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={form.duration_minutes || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      duration_minutes: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  !form.title.trim() ||
                  !form.course_id ||
                  createLesson.isPending ||
                  updateLesson.isPending
                }
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {lessons?.length ?? 0} lesson{(lessons?.length ?? 0) !== 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 rounded bg-muted animate-pulse" />
                ))}
              </div>
            ) : !lessons?.length ? (
              <EmptyState
                title="No lessons yet"
                description="Add your first lesson to this course."
                icon={<FileText className="h-12 w-12" />}
              />
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-lg border">
                    <div
                      className="flex items-center justify-between gap-4 p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedId(
                          expandedId === lesson.id ? null : lesson.id
                        )
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                          {lesson.sortOrder}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {lesson.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lesson.durationMinutes}m
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant={lesson.isPublished ? "default" : "outline"}>
                          {lesson.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(lesson);
                          }}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(lesson);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                        {expandedId === lesson.id ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    {expandedId === lesson.id && lesson.content && (
                      <div className="border-t p-3 text-sm text-muted-foreground">
                        <p className="whitespace-pre-wrap line-clamp-4">
                          {lesson.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Lesson"
        message={`Are you sure you want to delete "${confirmDelete?.title}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
