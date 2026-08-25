import { useState } from "react";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
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
  BookOpen,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Course } from "@/types/course";

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  difficulty: string;
  language: string;
}

const defaultForm: CourseFormData = {
  title: "",
  slug: "",
  description: "",
  short_description: "",
  difficulty: "beginner",
  language: "Hindi",
};

function getDifficultyBadge(difficulty?: string) {
  switch (difficulty) {
    case "advanced":
      return "destructive" as const;
    case "intermediate":
      return "default" as const;
    default:
      return "secondary" as const;
  }
}

export function AdminCoursesPage() {
  const { data: courses, isLoading, error } = useCourses();
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormData>(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (course: Course) => {
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description || "",
      short_description: course.shortDescription || "",
      difficulty: course.difficulty || "beginner",
      language: course.language || "Hindi",
    });
    setEditingId(course.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.slug.trim()) return;

    if (editingId) {
      updateCourse.mutate(
        {
          id: editingId,
          updates: {
            title: form.title,
            description: form.description,
            short_description: form.short_description,
            difficulty: form.difficulty,
          },
        },
        { onSuccess: resetForm }
      );
    } else {
      createCourse.mutate(
        {
          title: form.title,
          slug: form.slug,
          description: form.description,
          short_description: form.short_description,
          difficulty: form.difficulty,
          language: form.language,
        },
        { onSuccess: resetForm }
      );
    }
  };

  const handleTogglePublish = (course: Course) => {
    updateCourse.mutate({
      id: course.id,
      updates: { is_published: !course.isPublished },
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    deleteCourse.mutate(confirmDelete.id, {
      onSuccess: () => setConfirmDelete(null),
    });
  };

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load courses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-muted-foreground">Manage all courses</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{editingId ? "Edit Course" : "Create Course"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug: f.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  placeholder="Course title"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  placeholder="course-slug"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Short Description</Label>
                <Input
                  value={form.short_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      short_description: e.target.value,
                    }))
                  }
                  placeholder="Brief course description"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Full course description"
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.difficulty}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, difficulty: e.target.value }))
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input
                  value={form.language}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, language: e.target.value }))
                  }
                  placeholder="Hindi"
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
                  !form.slug.trim() ||
                  createCourse.isPending ||
                  updateCourse.isPending
                }
              >
                {editingId ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {(courses?.length ?? 0)} course{(courses?.length ?? 0) !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !courses?.length ? (
            <EmptyState
              title="No courses yet"
              description="Create your first course to get started."
              icon={<BookOpen className="h-12 w-12" />}
            >
              <Button onClick={() => { resetForm(); setShowForm(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </EmptyState>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {course.title}
                      </p>
                      <Badge variant={getDifficultyBadge(course.difficulty)}>
                        {course.difficulty || "beginner"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.language} &middot; {course.slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={course.isPublished ? "default" : "outline"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(course)}
                      title={course.isPublished ? "Unpublish" : "Publish"}
                    >
                      {course.isPublished ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(course)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Course"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
